'use strict';
// Explicit publication boundary. Add new files here after review.
const art=['grassland.svg','woodland.svg','cave.svg','coast.svg','mountain.svg','snow.svg','volcano.svg','ruins.svg','symbols.svg','notebook.svg','notebook.ico'];
const desktop=[
  'index.html','encounter.js','style.css','field-art.js','renderer.js','management-ui.js','management-words.js','save.js','approved.js','approved-data.json','methods.json','catalog.json','i18n.js','pokeapi-LICENSE.txt',
  'package.json','portable.cjs','bootstrap.cjs','main.cjs','components.cjs','library.cjs','managed.cjs','melonds-config.cjs','recovery.cjs','save-management.cjs','component-hashes.json','preload.cjs',
  ...['en.js','ru.js','approved-en.json','approved-ru.json'].map(f=>'locales/'+f),...art.map(f=>'art/'+f)
];
const docs=['README.md','BUILDING.md','PORTABLE.md','PRIVACY.md','THIRD_PARTY_NOTICES.md','CHANGELOG.md','RELEASE_CHECKLIST.md','LICENSE','RELEASE-NOTES.md'];
const source=[
  '.gitignore','.gitattributes','docs/melonds-config-regression.md','.github/workflows/build.yml',...docs,
  ...['route','campaigns','settings','backups'].map(f=>'docs/screenshots/'+f+'.png'),
  ...['ORDERED_ROUTE','NATIONAL_DEX_493','DEFERRED_ENCOUNTERS'].map(f=>'route-research/'+f+'.json'),
  ...[...desktop,'route.js'].map(f=>'runtime/resources/app/'+f),
  ...['release-files.cjs','build.cjs','embed-icon.ps1','verify.cjs','approved-checks.cjs','locale-checks.cjs','save-checks.cjs','library-checks.cjs','recovery-checks.cjs','portable-checks.cjs','portable-package-check.ps1','interface-checks.cjs','smoke.cjs','launch-copy-check.cjs','melonds-config-checks.cjs'].map(f=>'scripts/'+f)
];
module.exports={desktop,source};
