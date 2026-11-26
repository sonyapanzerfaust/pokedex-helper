'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, execFile } = require('node:child_process');
const { pipeline } = require('node:stream/promises');
const { promisify } = require('node:util');
const { setTimeout: delay } = require('node:timers/promises');
const repo = 'sonyapanzerfaust/pokedex-helper';
const binary = process.platform === 'win32' ? 'PokedexHelper.exe' : 'PokedexHelper';
const stageName = '.pokedex-helper-update';
const marker = 'helper-update-v1.json';

function versionParts(value) {
  const m = /^v?(\d+)\.(\d+)(?:\.(\d+))?$/.exec(value);
  return m && [Number(m[1]), Number(m[2]), Number(m[3] || 0)];
}
function candidate(release, current, platform = process.platform, arch = process.arch) {
  const next = versionParts(release.tag_name), installed = versionParts(current);
  if (release.draft || release.prerelease || !next || !installed) return;
  const delta = next.map((part, i) => part - installed[i]).find(Boolean);
  if (!(delta > 0)) return;
  const version = next.join('.');
  const name = 'Pokedex-Helper-' + version + '-portable-' + platform + '-' + arch + (platform === 'win32' ? '.zip' : '.tar.gz');
  const asset = release.assets.find(a => a.name === name);
  if (!asset || asset.browser_download_url !== 'https://github.com/' + repo + '/releases/download/' + release.tag_name + '/' + name ||
      !/^sha256:[a-f0-9]{64}$/.test(asset.digest) || !(asset.size > 0)) throw Error('Missing verified release asset: ' + name);
  return { version, asset };
}
async function latest(current) {
  const response = await fetch('https://api.github.com/repos/' + repo + '/releases/latest', {signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw Error('GitHub Releases: HTTP ' + response.status);
  return candidate(await response.json(), current);
}
function waitForSpawn(child) {
  return new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
}
function alive(pid) {
  try { process.kill(pid, 0); return true; } catch (error) { return error.code !== 'ESRCH'; }
}
function ownedStage(root) {
  const stage = path.join(root, stageName);
  if (!fs.existsSync(stage)) return;
  if (fs.lstatSync(stage).isSymbolicLink() || !fs.lstatSync(path.join(stage, marker)).isFile()) throw Error('Unexpected update directory: ' + stage);
  const state = JSON.parse(fs.readFileSync(path.join(stage, marker)));
  if (state.root !== root || !Number.isSafeInteger(state.pid) || state.pid <= 0) throw Error('Invalid update state: ' + stage);
  return {stage, state};
}
function cleanup(root) {
  const job = ownedStage(root);
  if (!job || alive(job.state.pid)) return;
  if (fs.existsSync(path.join(job.stage, 'previous')) && !fs.existsSync(path.join(job.stage,'committed'))) throw Error('Interrupted update. Previous application files: ' + path.join(job.stage,'previous'));
  fs.rmSync(job.stage, {recursive:true, force:true});
}
async function prepare(root, update) {
  cleanup(root);
  const stage = path.join(root, stageName);
  fs.mkdirSync(stage);
  try {
    fs.writeFileSync(path.join(stage, marker), JSON.stringify({root, pid:process.pid}));
    const archive = path.join(stage, update.asset.name);
    const response = await fetch(update.asset.browser_download_url, {signal:AbortSignal.timeout(600000)});
    if (!response.ok) throw Error('Download: HTTP ' + response.status);
    const hash = crypto.createHash('sha256');
    await pipeline(response.body, async function* (chunks) {
      for await (const chunk of chunks) { hash.update(chunk); yield chunk; }
    }, fs.createWriteStream(archive, {flags:'wx'}));
    if (fs.statSync(archive).size !== update.asset.size || 'sha256:' + hash.digest('hex') !== update.asset.digest) throw Error('SHA-256 mismatch');
    await promisify(execFile)(process.platform === 'win32' ? 'tar.exe' : 'tar', ['-xf', archive, '-C', stage], {windowsHide:true});
    fs.unlinkSync(archive);
    const source = path.join(stage, 'PokedexHelper');
    const meta = JSON.parse(fs.readFileSync(path.join(source, 'resources/app/package.json')));
    if (meta.name !== 'pokedex-helper' || meta.version !== update.version || !meta.portable) throw Error('Unexpected portable package');
    // Run our current installer under the extracted runtime so Windows can replace the installed executable.
    const worker = path.join(stage, 'install.cjs');
    fs.copyFileSync(__filename, worker);
    const child = spawn(path.join(source, binary), [worker, root, String(process.pid)], {
      env:{...process.env, ELECTRON_RUN_AS_NODE:'1'}, detached:true, windowsHide:true, stdio:'ignore', cwd:stage
    });
    await waitForSpawn(child);
    child.unref();
  } catch (error) { fs.rmSync(stage,{recursive:true,force:true}); throw error; }
}
function replaceFiles(root, source, stage) {
  const incoming = path.join(stage,'incoming'), previous = path.join(stage,'previous');
  const names = fs.readdirSync(source).filter(n => n.toLowerCase() !== 'data');
  if (!names.includes(binary) || !names.includes('resources') || names.includes(stageName)) throw Error('Invalid release layout');
  fs.mkdirSync(incoming);
  for (const name of names) fs.cpSync(path.join(source,name),path.join(incoming,name),{recursive:true,verbatimSymlinks:true});
  fs.mkdirSync(previous);
  const moved = [], installed = [];
  try {
    for (const name of names) {
      const dest = path.join(root,name);
      if (fs.existsSync(dest)) { fs.renameSync(dest,path.join(previous,name)); moved.push(name); }
      fs.renameSync(path.join(incoming,name),dest); installed.push(name);
    }
  } catch (error) {
    for (const name of installed.reverse()) fs.renameSync(path.join(root,name),path.join(incoming,name));
    for (const name of moved.reverse()) fs.renameSync(path.join(previous,name),path.join(root,name));
    fs.rmdirSync(previous);
    throw error;
  }
}
async function install(root,pid) {
  const {stage,state} = ownedStage(root);
  if (state.pid !== pid || stage !== __dirname) throw Error('Invalid installer invocation');
  fs.writeFileSync(path.join(stage,marker),JSON.stringify({root,pid:process.pid}));
  for (let i=0; alive(pid); ++i) { if (i===300) throw Error('Application is still running'); await delay(200); }
  const source = path.join(stage,'PokedexHelper');
  try {
    replaceFiles(root,source,stage);
    fs.writeFileSync(path.join(stage,'committed'),'ok',{flag:'wx'});
  } catch (error) {
    fs.writeFileSync(path.join(root,'helper-update-error.log'),String(error));
    if (fs.existsSync(path.join(stage,'previous'))) throw error;
  }
  const env = {...process.env}; delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(path.join(root,binary),[],{env,detached:true,stdio:'ignore',cwd:root});
  await waitForSpawn(child); child.unref();
}
if (require.main===module) install(process.argv[2],Number(process.argv[3])).catch(e=>{process.stderr.write(String(e));process.exitCode=1});
module.exports={latest,candidate,prepare,cleanup,replaceFiles};
