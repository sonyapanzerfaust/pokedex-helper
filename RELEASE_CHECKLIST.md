# Owner release checklist

- [x] Owner approved the Pokédex Helper name and unofficial-project disclaimer.
- [x] Record MIT for original application code, CC0 for original artwork and separate upstream notices.
- [ ] Review the exact source tarball and its .files.txt manifest. Use a fresh repository made from the reviewed archive. The earlier private Git history contains previously tracked sprite assets and a research archive.
- [ ] Review the ZIP, SHA-256, bundled notices and clean first-run behavior. The release source list excludes ROMs, BIOS, SAVs, personal backups, browser profiles, emulator binaries, diagnostic logs, downloaded research, local tools and old sprite sheets.
- [ ] Run a real in-game save and resume in both managed emulators, verify the profile chosen and observe Platinum registration.
- [ ] Test trade and Pal Park behavior on the intended hardware or emulator setup. Record any limitations in the release notes.
- [ ] Approve the final version, binaries, source and release notes before creating a public remote or uploading files.

## Asset inventory

All paths below are relative to runtime/resources/app/art. Route stage IDs select plates in field-art.js. Section thumbnails remain visible when collapsed. The campaign and current-stage summaries follow the active route. The search empty state uses grassland.

| File | Examples in the route |
| --- | --- |
| grassland.svg | Twinleaf, Solaceon and evolution goals |
| woodland.svg | Floaroma to Eterna and HG/SS |
| cave.svg | Victory Road and Pearl |
| coast.svg | Pastoria, Canalave and FireRed/LeafGreen |
| mountain.svg | Spear Pillar and Diamond |
| snow.svg | Snowpoint approach |
| volcano.svg | Emerald and Stark Mountain postgame |
| ruins.svg | Old Chateau, legendary postgame and historical events |

symbols.svg contains grass, cave, water, fishing, honey, headbutt, evolution, egg, trade, gift, special, event, sync, backup, restore, launch, route, settings, upload and download. Their consumers are acquisition rows, synchronization status, sidebar actions and the backup history. notebook.svg appears in the sidebar. notebook.ico supplies the Windows window and EXE icon at 16, 24, 32, 48, 64, 128 and 256 pixels.
