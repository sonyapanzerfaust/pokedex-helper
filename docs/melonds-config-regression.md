# melonDS configuration persistence regression

## Cause and fix

melonDS 1.1 `pathInit()` prefers `<executable>/portable` over the executable directory. The Helper created that directory during extraction and launch without first carrying forward an adjacent `melonDS.toml`/legacy `melonDS.ini`. An upgrade also selected a newly extracted release directory without transferring the preceding release's portable settings. Consequently settings could be ignored in a second profile rather than erased from the original file. Working directory remains the executable directory; no configuration-directory environment override is supplied.

`melonds-config.cjs` now prepares that directory before component registration and launch: an existing portable profile always wins; otherwise adjacent configuration or the preceding release's portable resources are copied and verified. Original files remain untouched. Content-addressed recovery copies are kept in the library's `config/melonds-config-recovery` directory and never overwritten. A new installation still lets melonDS generate its own defaults. The existing profile save-path selection is preserved; before its narrow TOML rewrite, the complete original configuration is backed up. Keyboard, joystick, graphics, audio and firmware preferences are not regenerated. No changes to ROMs, battery saves, route data, save profiles or battery-backup history.

Upstream: https://github.com/melonDS-emu/melonDS/blob/1.1/src/frontend/qt_sdl/main.cpp (pathInit), Config.cpp (TOML/legacy INI). No TOML-to-INI conversion is attempted. Existing portable settings are authoritative when adjacent and portable profiles both exist: this fix does not guess which set of historical controls the owner intended.

## Automated validation

Run `node scripts/melonds-config-checks.cjs`. Disposable fixtures cover custom keys/hotkeys, joystick, screen layout, audio and firmware preferences; initial migration and immutable recovery; four repeated preparations; conflicting adjacent defaults; upgrading resources; fresh installation; legacy INI; relocation; and no game/save writes. The real managed launcher is exercised through three process-stub launches, asserting executable, cwd, arguments and unchanged custom settings. These are not GUI tests.

Library, recovery, portable-copy checks and source package build passed. `node scripts/verify.cjs` is blocked by the existing ORDERED_ROUTE.json byte-hash mismatch caused by CRLF checkout (`core.autocrlf=true`); the HEAD blob matches the expected hash. The route was not modified to hide this unrelated failure. Interface checks require Electron, which is not installed in the source checkout.

## Manual checks still required

No melonDS executable or live TOML was available in the accessible installation folders. No claim is made that the owner's historical bindings were recovered or that real emulator launches passed.

On a disposable complete portable copy only:

1. Directly launch the installed melonDS; set nondefault A/B/hotkeys and screen layout; close normally and reopen. Record executable, cwd, arguments, config path and relevant environment; compare TOML before/after.
2. Launch the same binary through Helper. Confirm all values, change audio, close normally and repeat at least three times.
3. Alternate direct / Helper / direct / Helper with normal closes, comparing all configured values.
4. Close both and relocate the disposable complete installation; repeat both launch paths.
5. Update the disposable emulator, verifying original settings and the recovery copy. Verify fresh-install defaults separately.
6. With disposable Platinum ROM/SAV, verify launch, repeated-launch protection, active save profile and unchanged SAV hash when no in-game save is performed.

No public release is created by this fix.
