# Changelog

## 1.2.1

1. Исправлена ошибка при чтении сейвов GBA из mGBA. Helper принимает файлы с данными часов и сохраняет их при импорте и восстановлении. Emerald также можно запустить без импортированного сейва.
2. Добавлен автоапдейтер для Windows и Linux. Helper проверяет новые версии на GitHub Releases и после подтверждения обновляет приложение, сохраняя папку `data`.

## 1.2.0

- Sort the language selector by native name within Latin, Cyrillic and Japanese scripts.
- Ship Windows and Linux x64 portable archives with sibling data directories.

- Translate onboarding, settings, backups, navigation, menus and diagnostics
  into Japanese, French, Italian, German and Spanish.
- Share the language registry between setup, settings and native dialogs.
- Localize the walkthrough, story checklist and all 544 encounter locations.
- Preserve route/progress identifiers across languages and validate coverage,
  placeholders, plural forms, packaging and all seven interface languages.

## 1.1.1

### New sidebar section: Requirements and rules

- Open **Requirements and rules** between **Backups** and **Export** in the sidebar. Its document icon is also visible in compact mode. A short introduction in first-time setup points players to the full guide.
- Separate lists cover physical consoles, PC emulators and the games used for the 493-species Platinum route. The guide explains when two FireRed copies can replace LeafGreen and how optional Emerald-to-Emerald or FireRed-to-FireRed trades can reduce Pal Park batches.
- Numbered rules explain when the route allows restoring historical gifts or unavailable communication requirements. Dedicated notes cover Mythical distributions, the Pokémon Ranger route to Manaphy and Phione, and Spiritomb’s local Underground interaction counter.
- The entire section and setup summary are available in English and Russian.

## 1.1.0

### Major Fixes

- **Pokédex search.** Search for a displayed number such as `#185` to find Sudowoodo directly. When a search or filter returns no matches, **Show all tasks** restores the route and returns keyboard focus to search.
- **Route filters and sections.** Matching sections open automatically. **Expand all** and **Collapse all** now work during search, reflect the visible sections, and preserve your usual section choices when you leave the filter.
- **Catch instructions on small screens.** The primary method now wraps in full at high zoom. At a 540-pixel window width and 150% scale, this restores previously clipped text in 63 Russian rows and 22 English rows. The compact catch descriptions, expanded alternatives and three-line story checkpoints from 1.0.2 are preserved.
- **Save diagnostics.** Automatic tracking now exposes the cause of a SAV read error. The last-known-data notice appears only when the affected game has a cached snapshot. Diagnostics hide again once the errors clear.
- **Game and emulator launch.** The game launch button checks that both the ROM and emulator executable are available. The emulator settings page also disables standalone launch when its executable is missing.
- **Backups and profiles.** If a profile cannot load, the page shows the error and a retry button. Outdated backup controls no longer start operations for the previous view. The game and profile selectors retain keyboard focus when refreshed.
- **Keyboard navigation and accessibility.** Route updates restore focus to the task control or section heading. Preference selectors retain focus after a change. The route filter has an accessible name, and the setup and acquisition dialogs expose their titles to assistive technology.
- **Russian and English UI.** Search recovery, section controls, PC box names and the SAV source label are localized in both languages.

## 1.0.2

- Made descriptions more readable

## 1.0.1

- Fixed a Windows launcher bug that could reset melonDS keyboard bindings.
