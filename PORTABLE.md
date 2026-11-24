# Pokédex Helper for Windows and Linux x64

On Linux, extract the tar.gz into a writable folder and run ./PokedexHelper.

On Windows, extract the entire ZIP into a writable local folder and launch PokedexHelper.exe. Keep the Electron runtime files and resources together. Setup accepts your own ROMs and battery saves. Installing or updating an emulator requires an internet connection. Previously installed components work offline.

## Bring an earlier library

Close the previous Helper, melonDS and mGBA first. On first launch, **Copy library** copies the library recorded by the previous Helper, the previous profile settings, route progress and historical backup archive. Wait for the main window before unplugging the drive. Import can take several minutes. After interruption, launch from the same folder and confirm the retry. The previous installation remains usable. **Start with an empty library** starts a separate collection.

The executable locates its sibling **data** folder. Inside it, **library** holds games, save profiles, emulators, backups, legacy-backups, config and library logs. Keeping the library together lets the application publish a verified migration with a single directory rename. Chromium data is separate under **cache**. **logs** contains application and crash logs. Settings → Application shows the current library path.

## Move or update

1. Close the Helper and both emulators. Back up the entire data folder.
2. To move computers or drives, copy the entire extracted application folder, including data. Launch from its new location.
3. To update, extract the new ZIP into a **new empty folder**. Copy your existing data into that folder while both versions are closed. A clean ZIP contains only an empty data directory.
4. Open the new version and check your progress before retiring the previous folder. If the update is incomplete, use the intact previous copy, or extract a fresh ZIP and copy your backed-up data again.

Keep the data and executable on the same writable drive. If the drive is unavailable, reconnect it and reopen the original executable. After an initialization failure, keep the staging directory and retry. Do not merge two initialized libraries or run emulators from a folder while moving it.

## Owner smoke check

- Confirm the displayed data location, language, Platinum Caught count and a known manual or deferred task.
- Select each Emerald profile, then check its active save and backup history.
- Launch Platinum, save in game, close melonDS and check synchronization.
- Create a backup. Move a disposable copy of the distribution, then restore the backup in that copy and reopen the game.
- Launch mGBA from the moved folder and check the active Emerald profile. Keep the original until both games resume correctly.

If the folder is read-only, close both emulators and copy the whole folder to writable local storage. Unicode characters and spaces are supported. If a launch fails, check the configured component and its library log before changing paths. For source-mode startup see BUILDING.md.
