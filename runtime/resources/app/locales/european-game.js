'use strict';
(() => {
  const languages = ['fr', 'it', 'de', 'es'];
  const terms = globalThis.europeanTerms;
  const escape = key => key.replace(/[.*+?^${()|[\]\\]/g, '\\$&');
  const keys = Object.keys(terms).sort((a, b) => b.length - a.length);
  const pattern = new RegExp('(?<![\\p{L}\\d])(?:(?:(?:Sinnoh|Hoenn|Kanto|Johto) )?Route[ -]\\d+|' + keys.map(escape).join('|') + ')(?![\\p{L}\\d])', 'gu');
  const routeNames = ['Route', 'Percorso', 'Route', 'Ruta'];
  const normalized = new Map(keys.map(key => [key.toLowerCase().replace(/[.’']/g, ''), key]));
  globalThis.europeanGameText = (value, language) => {
    const column = languages.indexOf(language);
    if (column < 0 || typeof value !== 'string' || /^(?:[A-Za-z]:[\\/]|[\\/]|https?:)/.test(value)) return value;
    return value.replace(pattern, key => {
      const route = key.match(/Route[ -](\d+)$/);
      return route ? routeNames[column] + ' ' + route[1] : terms[key][column];
    });
  };
  globalThis.europeanIdentifier = (value, language) => {
    const name = value.replace(/-/g, ' ');
    const key = normalized.get(name.toLowerCase().replace(/[.’']/g, ''));
    return globalThis.europeanGameText(key ?? name.replace(/\b\w/g, c => c.toUpperCase()), language);
  };
  const conditions = {
    'level-up': ['montée de niveau', 'aumento di livello', 'Levelaufstieg', 'subida de nivel'],
    trade: ['échange', 'scambio', 'Tausch', 'intercambio'],
    day: ['de jour', 'di giorno', 'tagsüber', 'de día'],
    night: ['de nuit', 'di notte', 'nachts', 'de noche'],
    'friendship ≥ 220': ['bonheur ≥ 220', 'amicizia ≥ 220', 'Freundschaft ≥ 220', 'amistad ≥ 220'],
    'in party: remoraid': ['avec Rémoraid dans l’équipe', 'con Remoraid in squadra', 'mit Remoraid im Team', 'con Remoraid en el equipo'],
    'branch depends on the hidden personality value of Wurmple': [
      'branche déterminée par la valeur de personnalité cachée de Chenipotte',
      'ramo determinato dal valore di personalità nascosto di Wurmple',
      'Entwicklung abhängig vom verborgenen Persönlichkeitswert von Waumpel',
      'rama determinada por el valor de personalidad oculto de Wurmple'
    ]
  };
  const encounters = {
    "encounter.outbreak_of_this_species_announced": ["apparition massive de cette espèce annoncée","sciame di questa specie annunciato","Schwarm dieser Art angekündigt","aparición masiva de esta especie anunciada"],
    "encounter.normal_table_outside_an_outbreak": ["rencontres habituelles hors apparition massive","incontri normali fuori dagli sciami","normale Begegnungen ohne Schwarm","encuentros habituales sin aparición masiva"],
    "encounter.shaking_pok_radar_patch": ["herbes qui bougent avec le Poké Radar","erba che si muove con il Poké Radar","wackelndes Gras beim Einsatz des Pokéradars","hierba que se agita con el Poké Radar"],
    "encounter.ordinary_grass_without_pok_radar": ["herbes ordinaires sans Poké Radar","erba normale senza Poké Radar","normales Gras ohne Pokéradar","hierba normal sin Poké Radar"],
    "encounter.day": ["journée","giorno","tagsüber","día"],
    "encounter.morning": ["matin","mattina","morgens","mañana"],
    "encounter.night": ["nuit","notte","nachts","noche"],
    "encounter.normal_radio": ["radio ordinaire","radio normale","normales Radioprogramm","radio normal"],
    "encounter.hoenn_sound_on_wednesdays_after_the_national_dex": ["musique de Hoenn le mercredi après le Pokédex National","musica di Hoenn il mercoledì dopo il Pokédex Nazionale","Hoenn-Musik mittwochs nach Erhalt des Nationalen Pokédex","música de Hoenn los miércoles tras obtener la Pokédex Nacional"],
    "encounter.sinnoh_sound_on_thursdays_after_the_national_dex": ["musique de Sinnoh le jeudi après le Pokédex National","musica di Sinnoh il giovedì dopo il Pokédex Nazionale","Sinnoh-Musik donnerstags nach Erhalt des Nationalen Pokédex","música de Sinnoh los jueves tras obtener la Pokédex Nacional"],
    "encounter.backlot_named_this_species_today_or_yesterday": ["le propriétaire du manoir a cité cette espèce aujourd’hui ou hier","il proprietario della villa ha nominato questa specie oggi o ieri","der Besitzer des Landhauses hat diese Art heute oder gestern erwähnt","el dueño de la mansión mencionó esta especie hoy o ayer"],
    "encounter.regular_garden_table": ["rencontres habituelles du jardin","incontri normali nel giardino","normale Begegnungen im Garten","encuentros habituales del jardín"],
    "encounter.bug_catching_contest_on_tuesdays_thursdays_and_saturdays": ["Concours de Capture d’insecte les mardis, jeudis et samedis","Gara Pigliamosche il martedì, giovedì e sabato","Käferturnier dienstags, donnerstags und samstags","Concurso de Captura de Bichos los martes, jueves y sábados"],
    "encounter.outside_the_contest": ["hors concours","fuori gara","außerhalb des Turniers","fuera del concurso"],
    "encounter.common_tree_group": ["groupe d’arbres communs","gruppo di alberi comuni","häufige Baumgruppe","grupo de árboles comunes"],
    "encounter.rare_tree_group": ["groupe d’arbres rares","gruppo di alberi rari","seltene Baumgruppe","grupo de árboles raros"],
    "encounter.special_hidden_tree": ["arbre caché spécial","albero nascosto speciale","besonderer versteckter Baum","árbol oculto especial"],
    "encounter.answer_the_elder_correctly_in_dragon_s_den": ["répondre correctement au sage dans l’Antre du Dragon","rispondi correttamente all’anziano nella Tana del Drago","beantworte die Fragen des Ältesten in der Drachenhöhle richtig","responde correctamente al anciano en la Guarida Dragón"],
    "encounter.bring_a_compatible_event_arceus": ["amener un Arceus événementiel compatible","porta un Arceus evento compatibile","bringe ein kompatibles Event-Arceus mit","lleva un Arceus de evento compatible"],
    "encounter.receive_a_kanto_starter_from_oak": ["recevoir un premier Pokémon de Kanto du Prof. Chen","ricevi un primo Pokémon di Kanto dal Prof. Oak","hole dir ein Kanto-Starter-Pokémon von Professor Eich","recibe un Pokémon inicial de Kanto del Profesor Oak"],
    "encounter.bring_all_three_regis_in_the_party": ["avoir les trois golems dans l’équipe","porta tutti e tre i Regi in squadra","nimm alle drei Regis ins Team","lleva a los tres Regis en el equipo"],
    "encounter.after_battling_snorlax_on_route_11_and_beating": ["après avoir combattu Ronflex sur la Route 11 et remporté de nouveau la Ligue","dopo aver affrontato Snorlax sul Percorso 11 e vinto di nuovo la Lega","nach dem Kampf gegen Relaxo auf Route 11 und dem erneuten Sieg in der Liga","tras luchar contra Snorlax en la Ruta 11 y volver a ganar la Liga"],
    "encounter.speak_to_cynthia_s_grandmother_in_celestic_town": ["parler à la grand-mère de Cynthia à Célestia","parla con la nonna di Camilla a Memoride","sprich in Elyses mit Cynthias Großmutter","habla con la abuela de Cintia en Pueblo Caelestis"],
    "encounter.talk_to_other_players_32_times_underground": ["parler 32 fois à d’autres joueurs dans le Souterrain","parla 32 volte con altri giocatori nei Sotterranei","sprich im Untergrund 32-mal mit anderen Spielern","habla 32 veces con otros jugadores en el Subsuelo"],
    "encounter.giratina_escaped_in_the_distortion_world": ["Giratina s’est échappé dans le Monde Distorsion","Giratina è fuggito nel Mondo Distorto","Giratina ist in der Zerrwelt entkommen","Giratina escapó en el Mundo Distorsión"],
    "encounter.awaken_the_beasts_at_burned_tower": ["réveiller les fauves à la Tour Cendrée","risveglia le bestie alla Torre Bruciata","wecke die Bestien in der Turmruine","despierta a las bestias en la Torre Quemada"],
    "encounter.defeat_the_upgraded_league": ["battre la Ligue renforcée","batti la Lega potenziata","besiege die verstärkte Liga","vence a la Liga reforzada"],
    "encounter.finish_the_team_galactic_story_on_mt_coronet": ["terminer l’épisode de la Team Galaxie au Mont Couronné","completa la storia del Team Galassia sul Monte Corona","schließe die Geschichte um Team Galaktik am Kraterberg ab","completa la historia del Equipo Galaxia en el Monte Corona"],
    "encounter.defeat_red_on_mt_silver": ["battre Red au Mont Argenté","sconfiggi Rosso sul Monte Argento","besiege Rot auf dem Silberberg","derrota a Rojo en el Monte Plateado"],
    "encounter.defeat_team_galactic_with_riley_on_iron_island": ["vaincre la Team Galaxie avec Armand sur l’Île de Fer","sconfiggi il Team Galassia con Marisio sull’Isola Ferrosa","besiege Team Galaktik mit Urs auf der Eiseninsel","derrota al Equipo Galaxia con Quinoa en Isla Hierro"],
    "encounter.before_the_national_dex": ["avant le Pokédex National","prima del Pokédex Nazionale","vor Erhalt des Nationalen Pokédex","antes de obtener la Pokédex Nacional"],
    "encounter.wake_eldritch_s_son_with_the_lunar_wing": ["réveiller le fils du marin avec la Lun’Aile","sveglia il figlio del marinaio con l’Alalunare","wecke den Sohn des Seemanns mit der Lunarfeder","despierta al hijo del marinero con la Pluma Lunar"],
    "encounter.defeat_jupiter_in_eterna": ["vaincre Jupiter à Vestigion","sconfiggi Giovia a Evopoli","besiege Jupiter in Ewigenau","derrota a Ceres en Ciudad Vetusta"],
    "encounter.free_valley_windworks_from_mars": ["vaincre Mars aux Éoliennes","sconfiggi Martes all’Impianto Turbine","besiege Mars im Windkraftwerk","derrota a Venus en el Valle Eólico"],
    "encounter.enter_the_hall_of_fame": ["entrer au Panthéon","entra nella Sala d’Onore","ziehe in die Ruhmeshalle ein","entra en el Hall de la Fama"],
    "encounter.obtain_the_national_dex": ["obtenir le Pokédex National","ottieni il Pokédex Nazionale","erhalte den Nationalen Pokédex","consigue la Pokédex Nacional"],
    "encounter.after_visiting_pal_park_speak_to_oak_in": ["après le Parc des Amis, parler au Prof. Chen à Vestigion","dopo la visita al Parco Amici, parla con il Prof. Oak a Evopoli","sprich nach dem Besuch im Park der Freunde mit Professor Eich in Ewigenau","tras visitar el Parque Compi, habla con el Profesor Oak en Ciudad Vetusta"],
    "encounter.get_the_tm_from_clair_after_dragon_s": ["récupérer la CT auprès de Sandra après l’Antre du Dragon","ritira la MT da Sandra dopo la Tana del Drago","hole dir nach der Drachenhöhle die TM von Sandra","recoge la MT de Débora tras la Guarida Dragón"],
    "encounter.return_the_machine_part_to_the_power_plant": ["rapporter la pièce à la Centrale","riporta il pezzo alla Centrale Elettrica","bringe die Spule ins Kraftwerk zurück","devuelve la pieza a la Central de Energía"],
    "encounter.retrieve_copycat_s_doll_and_meet_steven_outside": ["récupérer la poupée de la Copieuse et rencontrer Pierre devant le fan-club de Carmin sur Mer","recupera la bambola della Copiona e incontra Rocco fuori dal Fan Club di Aranciopoli","hole die Puppe der Nachahmerin und triff Troy vor dem Fanclub in Orania City","recupera el muñeco de la Copiona y encuentra a Máximo fuera del club de fans de Ciudad Carmín"],
    "encounter.get_the_zephyr_badge": ["obtenir le Badge Zéphyr","ottieni la Medaglia Zefiro","erhalte den Flügelorden","consigue la Medalla Céfiro"],
    "encounter.lead_pok_mon_has_high_friendship": ["premier Pokémon de l’équipe avec un bonheur élevé","primo Pokémon in squadra con amicizia alta","erstes Pokémon im Team mit hoher Freundschaft","primer Pokémon del equipo con amistad alta"],
    "encounter.regular_marsh_table": ["rencontres habituelles du marais","incontri normali nella palude","normale Begegnungen im Moor","encuentros habituales del pantano"],
    "encounter.slot_2_empty": ["port GBA vide","slot GBA vuoto","GBA-Schacht leer","ranura GBA vacía"],
    "encounter.no_active_blocks": ["aucun bloc actif","nessun blocco attivo","keine aktiven Blöcke","ningún bloque activo"],
    "encounter.choose_blue_when_speaking_to_mom_after_the": ["choisir bleu en parlant à Maman après la Ligue","scegli blu parlando con la mamma dopo la Lega","wähle nach der Liga im Gespräch mit deiner Mutter Blau","elige azul al hablar con mamá después de la Liga"],
    "encounter.choose_red_when_speaking_to_mom_after_the": ["choisir rouge en parlant à Maman après la Ligue","scegli rosso parlando con la mamma dopo la Lega","wähle nach der Liga im Gespräch mit deiner Mutter Rot","elige rojo al hablar con mamá después de la Liga"],
    "encounter.friday": ["vendredi","venerdì","Freitag","viernes"],
    "encounter.saturday": ["samedi","sabato","Samstag","sábado"],
    "encounter.thursday": ["jeudi","giovedì","Donnerstag","jueves"],
    "encounter.tuesday": ["mardi","martedì","Dienstag","martes"],
    "encounter.at_least": ["au moins ","almeno ","mindestens ","al menos "],
    "encounter.block_points_of_type": [" points de blocs de type "," punti blocco di tipo "," Blockpunkte vom Typ "," puntos de bloques de tipo "],
    "encounter.in_this_area": [" dans cette zone"," in quest’area"," in diesem Gebiet"," en esta zona"],
    "encounter.daily_area_rotation": ["rotation quotidienne des zones, ","rotazione giornaliera delle aree, ","täglich wechselndes Gebiet, ","rotación diaria de zonas, "],
    "encounter.of_32_species_selection_slots": [" sur 32 emplacements de sélection"," su 32 posizioni per la selezione delle specie"," von 32 Plätzen für die Artenauswahl"," de 32 posiciones de selección de especies"],
    "encounter.honey_tree_group": ["arbre à Miel, groupe ","albero del miele, gruppo ","Honigbaum, Gruppe ","árbol de miel, grupo "],
    "encounter.cartridge": ["cartouche ","cartuccia ","Spielmodul ","cartucho "],
    "encounter.in_slot_2": [" dans le port GBA"," nello slot GBA"," im GBA-Schacht"," en la ranura GBA"],
    "encounter.offer": ["proposer ","offri ","biete ","ofrece "],
    "encounter.requires": ["nécessite ","richiede ","benötigt ","requiere "],
    "encounter.game_corner_coins": [" jetons du Casino"," gettoni della Sala Giochi"," Münzen der Spielhalle"," fichas del Casino"],
    "encounter.starter": ["premier Pokémon · ","primo Pokémon · ","Starter-Pokémon · ","Pokémon inicial · "],
    "encounter.indoors": ["En intérieur","Al chiuso","Innenbereich","En interiores"],
    "encounter.roaming_grass": ["Itinérant · herbes","Vagante · erba","Wanderpokémon · Gras","Errante · hierba"],
    "encounter.roaming_water": ["Itinérant · eau","Vagante · acqua","Wanderpokémon · Wasser","Errante · agua"],
    "encounter.fishing_on_a_special_tile": ["Pêche sur une case spéciale","Pesca in una casella speciale","Angeln auf einem besonderen Feld","Pesca en una casilla especial"],
    "encounter.game": ["Jeu ","Gioco ","Spiel ","Juego "],
    "encounter.unconfirmed": ["Non confirmé","Non confermato","Unbestätigt","Sin confirmar"],
    "encounter.lv": ["Niv. ","Liv. ","Lv. ","Nv. "],
  };
  for (const [column, language] of languages.entries()) {
    const dict = globalThis.dexLocales[language];
    for (const [key, translations] of Object.entries(encounters)) dict[key] = translations[column];
    for (const [key, english] of Object.entries(globalThis.dexLocales.en)) {
      if (key.startsWith('method.') && terms[english]) dict[key] = terms[english][column];
      if (!key.startsWith('evolution.')) continue;
      const [species, details] = english.split(' → ');
      if (!details) continue;
      const parts = details.split(', ').map(part => {
        if (conditions[part]) return conditions[part][column];
        if (part.startsWith('Lv. ')) return ['Niv. ', 'Liv. ', 'Lv. ', 'Nv. '][column] + part.slice(4);
        const [action, argument] = part.split(' ');
        if (action === 'hold' || action === 'know') {
          const labels = action === 'hold' ? ['objet tenu', 'strumento tenuto', 'getragenes Item', 'objeto equipado']
            : ['capacité connue', 'mossa conosciuta', 'erlernte Attacke', 'movimiento aprendido'];
          return labels[column] + ' · ' + globalThis.europeanIdentifier(argument, language);
        }
        return part;
      });
      dict[key] = globalThis.europeanIdentifier(species, language) + ' → ' + parts.join(', ');
    }
  }
})();
