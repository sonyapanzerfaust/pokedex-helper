# Localization

The application language is independent of the ROM language. The primary campaign
still targets Pokémon Platinum USA; choosing Japanese does not add support for
Japanese saves, ROMs, or regional event distributions.

| Language | Code | Interface | Walkthrough prose |
| --- | --- | --- | --- |
| English | en | Complete | Complete |
| Russian | ru | Complete | Complete |
| Japanese | ja | Complete | Complete |
| French | fr | Complete | Complete |
| Italian | it | Complete | Complete |
| German | de | Complete | Complete |
| Spanish | es | Complete | Complete |

The five new packs cover onboarding, settings, backup management, navigation,
filters, progress labels and guide controls. French, Italian, German and Spanish
include encounter conditions, location labels and application diagnostics. Operating-system error codes, paths and external program output retain their original spelling.
Japanese uses in-game species, game and location names for display while retaining USA-game progress identifiers. Japanese nomenclature comes from the PKHeX species and Gen III/IV location tables and PokéAPI item and move names. Walkthrough prose is translated for this project.
Translations have not yet had native-speaker review.

## Implementation

`runtime/resources/app/locale-registry.js` is the shared list of selectable packs.
`locale-loader.cjs` loads the same dictionaries for native dialogs and guide data.
The renderer loads the registry and interface dictionaries with local script tags.
`locales/interface.js` resolves reviewed source strings to the existing stable UI
keys, including duplicates. `locales/guide-interface.js` holds the guide controls.
Missing keys fall back per message to English; English plural rules apply when
the local plural message is absent. English and Russian full packs remain intact.

Translate prose separately in `locales/approved-<code>.json`, load it through
`locale-loader.cjs`, and verify coverage against the English walkthrough.
Never translate task IDs, species IDs, preference keys, paths or progress keys.
Preserve interpolation placeholders and spacing in concatenated fragments.
New files must be included in `.gitignore` exceptions and `scripts/release-files.cjs`.

## Validation

Run `node scripts/verify.cjs`. Locale checks enforce existing full-pack parity,
complete core-interface coverage, placeholders, guide controls, plural rendering
and the release resource list. Interface checks exercise all seven languages at
two widths and five scales, navigate the settings tabs and backups, and verify
that the selected language survives reload. Set `POKEDEX_UI_NO_CAPTURES=1` to keep
published screenshots unchanged during regression checks.

Native-speaker review is pending.

European packs use the species, location, item and move tables from PKHeX. Bulbapedia provides additional nomenclature, including the [French species list](https://bulbapedia.bulbagarden.net/wiki/List_of_French_Pok%C3%A9mon_names), [German species list](https://bulbapedia.bulbagarden.net/wiki/List_of_German_Pok%C3%A9mon_names), and character name tables such as [Professor Rowan](https://bulbapedia.bulbagarden.net/wiki/Professor_Rowan). Spanish follows the European releases. Encounter locations use the PKHeX Gen III/IV location tables and PokeAPI identifiers. Area and floor labels are translated separately. The walkthrough text is authored for this helper. Missing interface translations fall back to English per key.
