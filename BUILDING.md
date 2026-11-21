# Build the Windows portable candidate

Use Windows x86_64, Node.js 26.13.1 (tested), Windows PowerShell with Add-Type, and the Windows tar utility. Run commands from the project root. The desktop app and packaging scripts use Node built-ins. There is no project npm install step. The build downloads the pinned Electron 45.3.3 Windows x64 archive and verifies its SHA-256 against the official release checksum list.

## Develop

With Node and npm installed, run `npm exec --yes --package=electron@45.3.3 -- electron runtime/resources/app` in a terminal. This first invocation downloads the development runtime. The bootstrap keeps source-mode data in .development/data. The portable binary uses its own adjacent data folder.

## Verify and package

```powershell
node scripts/verify.cjs
node scripts/library-checks.cjs
node scripts/recovery-checks.cjs
node scripts/portable-checks.cjs
node scripts/build.cjs win32-x64
node scripts/build.cjs source
```

The portable ZIP, unpacked folder, source tarball, exact source file list and SHA-256 sidecars are written under dist. The source package is assembled from scripts/release-files.cjs. An existing unpacked folder is preserved. Building pins the runtime and source selection. ZIP timestamps and platform archiving details can change the checksum between independent builds.

An offline build can set POKEDEX_RUNTIME_CACHE to a directory containing the official x64 ZIP named electron-x64.zip and the corresponding SHASUMS256.txt. Interface validation uses a disposable Electron profile. Run scripts/interface-checks.cjs with the development Electron executable. It writes actual window captures into docs/screenshots. Run scripts/portable-package-check.ps1 with -Archive and the ZIP path to test extracted startup and relocation through a temporary Windows drive mapping. Real-ROM checks are optional and use private local inputs.
