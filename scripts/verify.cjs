require('node:child_process').execFileSync(process.execPath,[require.resolve('./update-and-emerald-checks.cjs')],{stdio:'inherit'});
require('./melonds-config-checks.cjs');
require('./save-checks.cjs');
require('./locale-checks.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const app=path.resolve(__dirname,'../runtime/resources/app'),{sections}=require(path.join(app,'catalog.json')),methods=require(path.join(app,'methods.json'));
for(const f of fs.readdirSync(app).filter(n=>/\.(js|cjs)$/.test(n)))new vm.Script(fs.readFileSync(path.join(app,f),'utf8'),{filename:f});
require('./approved-checks.cjs');
const {parse}=require(path.join(app,'save.js'));assert.throws(()=>parse(new Uint8Array(524288)));assert.throws(()=>parse(new Uint8Array(131072)));
for(const file of process.argv.slice(2)){
 const bytes=fs.readFileSync(file),copy=Buffer.from(bytes),p=parse(bytes);assert(bytes.equals(copy));assert(p.caught.every(id=>p.seen.includes(id)));
 console.log(path.basename(file),p.game,p.caught.length,'Caught',p.seen.length,'Seen');
}
console.log('Save fixtures and syntax checks passed.');
