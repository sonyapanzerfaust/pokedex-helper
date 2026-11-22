# Pokédex Helper 1.0.0 — Windows portable

Stable release, promoted from 1.0.0-rc.1 with the melonDS configuration persistence fix.

- Preserve existing custom keyboard, controller, hotkey, display, audio and firmware preferences when preparing portable melonDS settings.
- Preserve portable configuration resources when registering an updated melonDS release.
- Keep verified, immutable recovery copies before configuration migration or save-profile path changes.
- Add disposable configuration and launcher regression tests.

Extract into a writable folder. When updating an existing portable installation, retain its entire `data` folder; do not replace it with the empty folder in the download. ROMs, saves, personal settings and emulators are not bundled. The prior v1.0.0-rc.1 release is retained.

Validation: automated configuration, launcher-process-stub, library, recovery and relocation tests; source and Windows x64 packaging. Actual melonDS GUI persistence across direct/Helper launches still requires the manual checklist in `docs/melonds-config-regression.md`; no claim is made that an unavailable owner's configuration was recovered.
