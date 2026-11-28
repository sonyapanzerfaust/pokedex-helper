'use strict';

const languages = ['en','ru','ja','fr','it','de','es'];
const messages = {
  "@section.emerald.description": [
    "Use Mudkip in the main Hoenn save. After opening the Regi caves, use Pal Park to transfer the listed Pokémon in any order.",
    "Пройди Хоэнн с Mudkip. После открытия пещер Regi перенеси указанных покемонов через Pal Park в удобном порядке.",
    "ホウエンの本編はミズゴロウで進めます。レジ系の遺跡を開けたら、一覧のポケモンをパルパークで好きな順に送ります。",
    "Partez avec Gobou. Une fois les grottes des golems ouvertes, envoyez les Pokémon de la liste au Parc des Amis dans l’ordre de votre choix.",
    "Inizia con Mudkip. Aperte le grotte dei Regi, trasferisci i Pokémon elencati al Parco Amici nell’ordine che preferisci.",
    "Beginne mit Hydropi. Sobald die Regi-Höhlen offen sind, übertrage die gelisteten Pokémon in beliebiger Reihenfolge im Park der Freunde.",
    "Empieza con Mudkip. Tras abrir las cuevas de los Regis, transfiere los Pokémon de la lista por el Parque Compi en el orden que quieras."
  ],
  "@section.heartgold.description": [
    "Main Johto and Kanto run. Catch Latias and Ho-Oh, then trade the listed Pokémon to Platinum.",
    "Основной маршрут Джото и Канто. Поймай Latias и Ho-Oh, затем обменяй указанных покемонов в Platinum.",
    "ジョウトとカントーのメインルートです。ラティアスとホウオウを捕まえ、一覧のポケモンをプラチナに交換で送ります。",
    "Parcours principal de Johto et de Kanto. Capturez Latias et Ho-Oh, puis échangez les Pokémon indiqués vers Platine.",
    "Percorso principale di Johto e Kanto. Cattura Latias e Ho-Oh, poi scambia i Pokémon elencati con Platino.",
    "Hauptroute durch Johto und Kanto. Fange Latias und Ho-Oh und tausche die gelisteten Pokémon nach Platin.",
    "Ruta principal de Johto y Kanto. Captura a Latias y Ho-Oh y pasa los Pokémon indicados a Platino por intercambio."
  ],
  "@section.soulsilver.description": [
    "Choose Chikorita. Finish the Johto story through Lugia and trade the remaining exclusives to Platinum.",
    "Выбери Chikorita. Пройди сюжет Джото до Lugia и обменяй оставшихся эксклюзивов в Platinum.",
    "チコリータを選び、ルギアまで進めます。残りの限定ポケモンをプラチナに交換で送ります。",
    "Choisissez Germignon. Avancez dans Johto jusqu’à Lugia et échangez les exclusivités restantes vers Platine.",
    "Scegli Chikorita. Avanza a Johto fino a Lugia e scambia le esclusive restanti con Platino.",
    "Wähle Endivie. Spiele Johto bis Lugia und tausche die übrigen exklusiven Pokémon nach Platin.",
    "Elige a Chikorita. Avanza por Johto hasta Lugia e intercambia los Pokémon exclusivos restantes a Platino."
  ],
  "@revision.transfer": [
    "Transfer to Platinum",
    "Перенос в Platinum",
    "プラチナへ送る",
    "Transfert vers Platine",
    "Trasferimento a Platino",
    "Übertragung nach Platin",
    "Transferencia a Platino"
  ],
  "@revision.waiting": [
    "Awaiting transfer to Platinum",
    "Ожидает переноса в Platinum",
    "プラチナへの転送待ち",
    "En attente de transfert vers Platine",
    "In attesa di trasferimento a Platino",
    "Wartet auf Übertragung nach Platin",
    "Pendiente de transferir a Platino"
  ],
  "@revision.reserved": [
    "Keep in Emerald until the Regi caves are open",
    "Оставь в Emerald до открытия пещер Regi",
    "レジ系の遺跡を開けるまでエメラルドに残す",
    "À garder dans Émeraude jusqu’à l’ouverture des grottes des golems",
    "Tieni in Smeraldo fino all’apertura delle grotte dei Regi",
    "Bis zur Öffnung der Regi-Höhlen in Smaragd behalten",
    "Conservar en Esmeralda hasta abrir las cuevas de los Regis"
  ],
  "@revision.markObtained": [
    "Mark obtained in Emerald",
    "Отметить получение в Emerald",
    "エメラルドで入手済みにする",
    "Marquer comme obtenu dans Émeraude",
    "Segna come ottenuto in Smeraldo",
    "In Smaragd als erhalten markieren",
    "Marcar como obtenido en Esmeralda"
  ],
  "@revision.palPark": [
    "After obtaining the National Pokédex in Platinum, migrate through Pal Park on Route 221 and save Platinum. Choose the order and groups in-game.",
    "После получения National Dex в Platinum перенеси покемонов через Pal Park на Route 221 и сохрани Platinum. Порядок и состав групп выбери в игре.",
    "プラチナで全国図鑑を入手したら、221ばんどうろのパルパークで送ってレポートを書きます。順番と組み合わせはゲーム内で選べます。",
    "Après avoir obtenu le Pokédex national dans Platine, transférez les Pokémon au Parc des Amis, Route 221, puis sauvegardez. Choisissez vos groupes et leur ordre en jeu.",
    "Ottenuto il Pokédex Nazionale in Platino, trasferisci i Pokémon al Parco Amici sul Percorso 221 e salva. Scegli in gioco ordine e gruppi.",
    "Übertrage die Pokémon nach Erhalt des Nationalen Pokédex in Platin im Park der Freunde auf Route 221 und speichere Platin. Reihenfolge und Gruppen wählst du im Spiel.",
    "Tras conseguir la Pokédex Nacional en Platino, transfiere los Pokémon por el Parque Compi de la Ruta 221 y guarda. Elige el orden y los grupos en el juego."
  ],
  "@revision.unionRoom": [
    "Use the Union Room and save both games after trading. Trade unevolved starters first. You can trade as you go.",
    "Обменивай через Union Room и сохраняй обе игры. Стартеров сначала передай в базовой форме. Обмен можно делать по ходу маршрута.",
    "ユニオンルームで交換し、両方のレポートを書きます。最初のポケモンは進化前に交換し、ほかは入手した順に送れます。",
    "Échangez dans la Salle Union et sauvegardez les deux jeux. Envoyez les starters avant de les faire évoluer. Vous pouvez échanger au fil du parcours.",
    "Usa la Sala Contatto e salva entrambe le partite. Scambia gli iniziali prima di farli evolvere. Puoi scambiare man mano che avanzi.",
    "Tausche im Konnex-Klub und speichere beide Spiele. Tausche die Starter vor ihrer Entwicklung. Du kannst unterwegs jederzeit tauschen.",
    "Usa la Sala Unión y guarda ambas partidas. Intercambia los iniciales antes de evolucionarlos. Puedes hacerlo durante el recorrido."
  ],
  "@revision.wailmer": [
    "Needed to evolve into Wailord and open the Regi caves. Keep one Wailmer for Platinum and evolve the other at level 40.",
    "Необходим для эволюции в Wailord и открытия пещер Regi. Одного Wailmer оставь для Platinum, второго доведи до 40-го уровня.",
    "レジ系の遺跡を開けるにはホエルオーが必要です。ホエルコを1匹プラチナ用に残し、もう1匹をレベル40で進化させます。",
    "Faites évoluer un Wailmer au niveau 40 en Wailord pour ouvrir les grottes des golems. Gardez l’autre pour Platine.",
    "Fai evolvere un Wailmer al livello 40 in Wailord per aprire le grotte dei Regi. Conserva l’altro per Platino.",
    "Entwickle ein Wailmer auf Level 40 zu Wailord, um die Regi-Höhlen zu öffnen. Behalte das andere für Platin.",
    "Evoluciona a un Wailmer al nivel 40 en Wailord para abrir las cuevas de los Regis. Guarda el otro para Platino."
  ],
  "@revision.evolveWailmer": [
    "Evolve one Wailmer at level 40. Put Wailord first in the party at Sealed Chamber and keep it in Emerald until the caves open.",
    "Доведи одного Wailmer до 40-го уровня. Поставь Wailord первым в команде в Sealed Chamber и оставь его в Emerald до открытия пещер.",
    "ホエルコを1匹レベル40で進化させます。おふれのせきしつではホエルオーを先頭に置き、遺跡が開くまでエメラルドに残します。",
    "Faites évoluer un Wailmer au niveau 40. Placez Wailord en tête au Sanctuaire et gardez-le dans Émeraude jusqu’à l’ouverture des grottes.",
    "Fai evolvere un Wailmer al livello 40. Metti Wailord per primo nella Sala Incisa e tienilo in Smeraldo finché non si aprono le grotte.",
    "Entwickle ein Wailmer auf Level 40. Setze Wailord in der Siegelkammer an die Spitze und behalte es bis zur Öffnung der Höhlen in Smaragd.",
    "Evoluciona a un Wailmer al nivel 40. Pon a Wailord primero en la Cámara Sellada y déjalo en Esmeralda hasta abrir las cuevas."
  ],
  "@revision.holdRegi": [
    "Put Relicanth last in the party at Sealed Chamber. Keep it in Emerald until the Regi caves open, then transfer it to Platinum.",
    "Поставь Relicanth последним в команде в Sealed Chamber. Оставь его в Emerald до открытия пещер Regi, затем перенеси в Platinum.",
    "おふれのせきしつではジーランスを手持ちの最後に置きます。遺跡が開いたらプラチナへ送ります。",
    "Placez Relicanth en dernier au Sanctuaire. Gardez-le dans Émeraude jusqu’à l’ouverture des grottes, puis envoyez-le dans Platine.",
    "Metti Relicanth per ultimo nella Sala Incisa. Tienilo in Smeraldo fino all’apertura delle grotte, poi trasferiscilo a Platino.",
    "Setze Relicanth in der Siegelkammer ans Ende des Teams. Übertrage es erst nach Öffnung der Höhlen nach Platin.",
    "Pon a Relicanth al final del equipo en la Cámara Sellada. Déjalo en Esmeralda hasta abrir las cuevas y pásalo a Platino."
  ],
  "@revision.platinumWailord": [
    "Receive Wailord from Emerald through Pal Park after opening the Regi caves. The Route 230 encounter is an alternative for this Pokédex entry.",
    "Перенеси Wailord из Emerald через Pal Park после открытия пещер Regi. Если запись ещё не закрыта, его также можно поймать на Route 230.",
    "レジ系の遺跡が開いたら、ホエルオーをパルパークでプラチナに送ります。230ばんどうろで捕まえて登録することもできます。",
    "Après l’ouverture des grottes, envoyez Wailord depuis Émeraude au Parc des Amis. Vous pouvez aussi le capturer sur la Route 230 pour l’inscrire au Pokédex.",
    "Dopo l’apertura delle grotte, trasferisci Wailord da Smeraldo al Parco Amici. Puoi anche catturarlo sul Percorso 230 per registrarlo.",
    "Übertrage Wailord nach der Öffnung der Regi-Höhlen im Park der Freunde aus Smaragd. Alternativ kannst du es auf Route 230 für den Pokédex fangen.",
    "Tras abrir las cuevas, transfiere a Wailord desde Esmeralda por el Parque Compi. También puedes capturarlo en la Ruta 230 para registrarlo."
  ],
  "@revision.openRegi": [
    "Dive on Route 134. Use Dig at the first inscription. Read the last inscription with Wailord first and Relicanth last. The earthquake opens all three Regi caves.",
    "Нырни на Route 134. Используй Dig у первой надписи. Прочти последнюю надпись с Wailord первым и Relicanth последним в команде. Землетрясение откроет все три пещеры Regi.",
    "134ばんすいどうでダイビングし、最初の点字の前であなをほるを使います。ホエルオーを先頭、ジーランスを最後にして奥の点字を読むと、地震で3つの遺跡が開きます。",
    "Plongez sur la Route 134 et utilisez Tunnel devant la première inscription. Lisez la dernière avec Wailord en tête et Relicanth en dernier. Le séisme ouvre les trois grottes.",
    "Usa Sub sul Percorso 134 e Fossa davanti alla prima iscrizione. Leggi l’ultima con Wailord per primo e Relicanth per ultimo. La scossa apre tutte e tre le grotte.",
    "Tauche auf Route 134 und setze Schaufler vor der ersten Inschrift ein. Lies die letzte Inschrift mit Wailord an der Spitze und Relicanth am Ende. Das Beben öffnet alle drei Höhlen.",
    "Usa Buceo en la Ruta 134 y Excavar ante la primera inscripción. Lee la última con Wailord primero y Relicanth último. El terremoto abre las tres cuevas."
  ],
  "@revision.emeraldDive": [
    "After beating Tate & Liza and clearing the Mossdeep Space Center, receive HM08 Dive from Steven. Use the Good Rod from Route 118 for Wailmer.",
    "Победи Tate и Liza, освободи Mossdeep Space Center и получи у Steven HM08 Dive. Для Wailmer используй Good Rod с Route 118.",
    "フウとランに勝ち、トクサネうちゅうセンターの事件を解決したらダイゴからひでんマシン08（ダイビング）を受け取ります。ホエルコには118ばんどうろのいいつりざおを使います。",
    "Battez Lévy et Tatia et libérez le Centre Spatial d’Algatia pour recevoir la CS08 Plongée de Pierre. Pêchez Wailmer avec la Super Canne de la Route 118.",
    "Batti Tell & Pat e libera il Centro Spaziale di Verdeazzupoli per ricevere MN08 Sub da Rocco. Pesca Wailmer con l’Amo Buono del Percorso 118.",
    "Besiege Ben und Svenja und befreie das Raumfahrtzentrum von Moosbach City. Hol VM08 Taucher bei Troy und fange Wailmer mit der Profiangel von Route 118.",
    "Derrota a Vito y Leti y libera el Centro Espacial de Algaria para recibir MO08 Buceo de Máximo. Pesca a Wailmer con la Caña Buena de la Ruta 118."
  ],
  "@revision.emeraldPost": [
    "Enter the Hall of Fame and choose blue on the TV to release Latios. Finish the Safari Zone expansion and Steven’s gift before transferring.",
    "Войди в Hall of Fame и выбери синий цвет в разговоре у телевизора, чтобы выпустить Latios. Перед переносом загляни в новые зоны Safari Zone и забери подарок Steven.",
    "殿堂入り後、テレビを見て「あお」を選ぶとラティオスが出現します。追加のサファリゾーンとダイゴからのプレゼントも済ませてから送ります。",
    "Après le Panthéon, choisissez bleu devant la télé pour libérer Latios. Visitez l’extension du Parc Safari et prenez le cadeau de Pierre avant le transfert.",
    "Dopo la Sala d’Onore scegli blu alla TV per liberare Latios. Visita l’area extra della Zona Safari e ritira il regalo di Rocco prima del trasferimento.",
    "Wähle nach der Ruhmeshalle am Fernseher Blau für Latios. Besuche die erweiterte Safari-Zone und hole Troys Geschenk vor der Übertragung.",
    "Tras el Hall de la Fama, elige azul en la tele para liberar a Latios. Visita la ampliación de la Zona Safari y recoge el regalo de Máximo antes de transferir."
  ],
  "@revision.get.377": [
    "Desert Ruins. Read the inscription, move two steps left and two down, and use Rock Smash.",
    "Desert Ruins. Прочти надпись, сделай два шага влево и два вниз, затем используй Rock Smash.",
    "さばくいせき。点字を読み、左に2歩、下に2歩進んでいわくだきを使います。",
    "Ruines Désert. Lisez l’inscription, faites deux pas à gauche et deux vers le bas, puis utilisez Éclate-Roc.",
    "Rovine Sabbiose. Leggi l’iscrizione, fai due passi a sinistra e due in basso, poi usa Spaccaroccia.",
    "Wüstenruine. Lies die Inschrift, gehe zwei Schritte nach links und zwei nach unten und setze Zertrümmerer ein.",
    "Ruinas Desierto. Lee la inscripción, da dos pasos a la izquierda y dos hacia abajo y usa Golpe Roca."
  ],
  "@revision.get.378": [
    "Island Cave. Read the inscription and make one clockwise lap along the wall.",
    "Island Cave. Прочти надпись и обойди комнату по часовой стрелке вдоль стены.",
    "こじまのよこあな。点字を読み、壁沿いに時計回りで部屋を1周します。",
    "Grotte de l’Îlot. Lisez l’inscription et faites le tour de la salle dans le sens horaire, le long du mur.",
    "Grotta Insulare. Leggi l’iscrizione e fai un giro in senso orario seguendo la parete.",
    "Inselhöhle. Lies die Inschrift und gehe im Uhrzeigersinn einmal an der Wand entlang.",
    "Cueva Insular. Lee la inscripción y da una vuelta en sentido horario pegado a la pared."
  ],
  "@revision.get.379": [
    "Ancient Tomb. Read the inscription and use Flash in the middle of the room.",
    "Ancient Tomb. Прочти надпись и используй Flash в центре комнаты.",
    "こだいづか。点字を読み、部屋の中央でフラッシュを使います。",
    "Tombeau Antique. Lisez l’inscription et utilisez Flash au centre de la pièce.",
    "Tomba Antica. Leggi l’iscrizione e usa Flash al centro della sala.",
    "Grabmal. Lies die Inschrift und setze Blitz in der Raummitte ein.",
    "Tumba Antigua. Lee la inscripción y usa Destello en el centro de la sala."
  ],
  "@revision.emeraldDig": [
    "Cross Fiery Path and visit Fallarbor. Get TM28 Dig from the Fossil Maniac’s brother on Route 114. Clear Mt. Chimney and take Jagged Pass to Lavaridge.",
    "Пройди Fiery Path и Fallarbor. Забери TM28 Dig у брата Fossil Maniac на Route 114. Зачисти Mt. Chimney и спустись через Jagged Pass в Lavaridge.",
    "ほのおのぬけみちからハジツゲタウンへ。114ばんどうろのかせきマニアの弟からわざマシン28を受け取り、えんとつやまからデコボコさんどうを通ってフエンへ。",
    "Traversez le Chemin Ardent jusqu’à Autéquia. Prenez la CT28 auprès du frère du Maniaque des Fossiles sur la Route 114. Passez par le Mont Chimnée et le Sentier Sinuroc jusqu’à Vermilava.",
    "Attraversa il Cammino Ardente fino a Brunifoglia. Prendi la MT28 dal fratello del Maniaco dei Fossili sul Percorso 114. Supera il Monte Camino e scendi dal Passo Selvaggio a Cuordilava.",
    "Durchquere den Feurigen Pfad nach Laubwechselfeld. Hole TM28 beim Bruder des Fossilmaniacs auf Route 114. Ziehe vom Schlotberg über den Steilpass nach Bad Lavastadt.",
    "Cruza la Senda Ígnea hasta Pueblo Pardal. Consigue la MT28 del hermano del Fosilmaníaco en la Ruta 114. Pasa por el Monte Cenizo y el Desfiladero hacia Pueblo Lavacalda."
  ],
  "@revision.open.johto.start": [
    "Choose Totodile in New Bark Town. Visit Mr. Pokémon, return to Elm and catch a second Pokémon to unlock trading. Use a separate short HeartGold save for Cyndaquil.",
    "Выбери Totodile в New Bark Town. Посети Mr. Pokémon, вернись к Elm и поймай второго покемона для обмена. Cyndaquil возьми в отдельном коротком сейве HeartGold.",
    "ワカバタウンでワニノコを選びます。ポケモンじいさんの家からウツギのもとへ戻り、2匹目を捕まえて交換を解放します。ヒノアラシにはハートゴールドの別データを使います。",
    "Choisissez Kaiminus à Bourg Geon. Visitez M. Pokémon, revenez voir Orme et capturez un deuxième Pokémon pour débloquer l’échange. Prenez Héricendre sur une sauvegarde HeartGold séparée.",
    "Scegli Totodile a Borgo Foglianova. Visita Mr. Pokémon, torna da Elm e cattura un secondo Pokémon per sbloccare gli scambi. Usa un salvataggio HeartGold separato per Cyndaquil.",
    "Wähle Karnimani in Neuborkia. Besuche Mr. Pokémon, kehre zu Lind zurück und fange ein zweites Pokémon zum Tauschen. Nutze für Feurigel einen separaten HeartGold-Spielstand.",
    "Elige a Totodile en Pueblo Primavera. Visita al Sr. Pokémon, vuelve con Elm y captura un segundo Pokémon para intercambiar. Usa otra partida de HeartGold para Cyndaquil."
  ],
  "@revision.extraStarter": [
    "Choose this starter on a separate short save. After returning to Elm with the Mystery Egg, catch a second Pokémon and trade the starter before evolving it.",
    "Выбери этого стартера в отдельном коротком сейве. Верни Mystery Egg профессору Elm, поймай второго покемона и передай стартера до эволюции.",
    "別データでこのポケモンを選びます。ふしぎなタマゴをウツギに届け、2匹目を捕まえてから進化前に交換します。",
    "Choisissez ce starter sur une sauvegarde séparée. Rapportez l’Œuf Mystère à Orme, capturez un deuxième Pokémon et échangez le starter avant son évolution.",
    "Scegli questo iniziale su un salvataggio separato. Porta l’Uovo Misterioso a Elm, cattura un secondo Pokémon e scambia l’iniziale prima di evolverlo.",
    "Wähle diesen Starter in einem separaten Spielstand. Bringe Lind das Rätsel-Ei, fange ein zweites Pokémon und tausche den Starter vor der Entwicklung.",
    "Elige este inicial en otra partida. Lleva el Huevo Misterioso a Elm, captura un segundo Pokémon e intercambia el inicial antes de que evolucione."
  ],
  "@revision.mainStarter": [
    "Starter for the main HeartGold save. Register its base form in Platinum before evolving it, or breed it later and trade the offspring.",
    "Стартер основного сейва HeartGold. Зарегистрируй базовую форму в Platinum до эволюции или позже выведи и передай потомство.",
    "ハートゴールド本編の最初のポケモンです。進化前にプラチナへ登録するか、後でタマゴからかえした個体を送ります。",
    "Starter de la partie HeartGold principale. Inscrivez sa forme de base dans Platine avant de le faire évoluer, ou échangez une progéniture plus tard.",
    "Iniziale della partita HeartGold principale. Registra la forma base in Platino prima dell’evoluzione oppure scambia un esemplare nato da un Uovo.",
    "Starter des Hauptspielstands von HeartGold. Registriere seine Grundform vor der Entwicklung in Platin oder tausche später einen Nachkommen.",
    "Inicial de la partida principal de HeartGold. Registra su forma básica en Platino antes de evolucionarlo o intercambia una cría más adelante."
  ],
  "@revision.open.johto.headbutt": [
    "Beat Bugsy, catch both Farfetch’d and get Cut. Learn Headbutt in Ilex Forest. Beat Whitney to get the SquirtBottle and clear Sudowoodo on Route 36, then visit the Burned Tower.",
    "Победи Bugsy, верни обоих Farfetch’d и получи Cut. Выучи Headbutt в Ilex Forest. Победи Whitney, получи SquirtBottle и освободи Route 36 от Sudowoodo. Затем загляни в Burned Tower.",
    "ツクシに勝ち、カモネギ2羽を連れ戻していあいぎりを入手。ウバメのもりでずつきを覚えます。アカネに勝ってゼニガメじょうろをもらい、36ばんどうろのウソッキーをどかして、やけたとうへ。",
    "Battez Hector, ramenez les deux Canarticho et obtenez Coupe. Apprenez Coup d’Boule au Bois aux Chênes. Battez Blanche, récupérez le Carapuce à O et dégagez la Route 36 avant de visiter la Tour Cendrée.",
    "Batti Raffaello, riporta i due Farfetch’d e ottieni Taglio. Impara Bottintesta nel Bosco di Lecci. Batti Chiara, prendi lo Squirtbottiglia e libera il Percorso 36, poi visita la Torre Bruciata.",
    "Besiege Kai, bringe beide Porenta zurück und hole Zerschneider. Lerne Kopfnuss im Steineichenwald. Besiege Bianka, hole die Schiggykanne und räume Route 36 frei. Besuche den Bronzeturm.",
    "Derrota a Antón, reúne a los dos Farfetch’d y consigue Corte. Aprende Golpe Cabeza en el Encinar. Derrota a Blanca, consigue el Regador y despeja la Ruta 36. Visita la Torre Quemada."
  ],
  "@revision.open.johto.coast": [
    "Beat Morty to use Surf. Get the SecretPotion in Cianwood, heal Amphy, clear Team Rocket at Mahogany and take back the Goldenrod Radio Tower. The director gives you the Rainbow Wing.",
    "Победи Morty, чтобы использовать Surf. Забери SecretPotion в Cianwood и вылечи Amphy. Разберись с Team Rocket в Mahogany и освободи Goldenrod Radio Tower. Директор отдаст Rainbow Wing.",
    "マツバに勝ってなみのりを解放。タンバでひでんのくすりを入手し、アカリを治します。チョウジとコガネラジオとうのロケット団を倒し、局長からにじいろのはねを受け取ります。",
    "Battez Mortimer pour utiliser Surf. Prenez la Potionsecret à Irisia, soignez Pharamp et chassez la Team Rocket d’Acajou et de la Tour Radio de Doublonville. Le directeur vous donne l’Arcenci’Aile.",
    "Batti Angelo per usare Surf. Prendi la Pozione Segreta a Fiorlisopoli, cura Amphy e scaccia il Team Rocket da Mogania e dalla Torre Radio di Fiordoropoli. Il direttore ti dà l’Ala d’Iride.",
    "Besiege Jens für Surfer. Hole den Geheimtrank in Anemonia City, heile Amphi und vertreibe Team Rocket aus Mahagonia City und dem Radioturm. Vom Intendanten erhältst du die Buntschwinge.",
    "Derrota a Morti para usar Surf. Consigue la Poción Secreta en Ciudad Orquídea, cura a Amphy y expulsa al Team Rocket de Pueblo Caoba y la Torre Radio. El director te da el Ala Arcoíris."
  ],
  "@revision.hoOh": [
    "After Clair and Dragon’s Den, visit Elm and defeat the five Kimono Girls in Ecruteak for the Clear Bell. Bring it and the Rainbow Wing to the Bell Tower to catch Ho-Oh.",
    "После Clair и Dragon’s Den зайди к Elm и победи пятерых Kimono Girls в Ecruteak за Clear Bell. С ним и Rainbow Wing поднимись в Bell Tower и поймай Ho-Oh.",
    "イブキとりゅうのあなを終え、ウツギに会います。エンジュでまいこはん5人に勝ってとうめいなスズを受け取り、にじいろのはねと一緒にスズのとうへ持って行きます。",
    "Après Sandra et l’Antre du Dragon, voyez Orme et battez les cinq danseuses de Rosalia pour obtenir le Glas Transparent. Allez à la Tour Carillon avec l’Arcenci’Aile pour capturer Ho-Oh.",
    "Dopo Sandra e la Tana del Drago, visita Elm e batti le cinque Kimono Girl ad Amarantopoli per la Campana Chiara. Portala con l’Ala d’Iride alla Torre Campana per catturare Ho-Oh.",
    "Besuche nach Sandra und der Drachenhöhle Lind. Besiege die fünf Kimono-Girls für die Klarglocke. Gehe mit ihr und der Buntschwinge zum Glockenturm und fange Ho-Oh.",
    "Tras Débora y la Guarida Dragón, visita a Elm y derrota a las cinco Chicas Kimono para obtener la Campana Clara. Llévala con el Ala Arcoíris a la Torre Campana para capturar a Ho-Oh."
  ],
  "@milestone.open.heartgold.league": [
    "Beat the Pokémon League",
    "Пройди Лигу покемонов",
    "ポケモンリーグに勝つ",
    "Remporter la Ligue Pokémon",
    "Vinci la Lega Pokémon",
    "Pokémon-Liga bezwingen",
    "Supera la Liga Pokémon"
  ],
  "@revision.open.heartgold.league": [
    "Use Waterfall on Route 27, cross Victory Road and defeat the Elite Four and Lance at Indigo Plateau.",
    "Используй Waterfall на Route 27, пройди Victory Road и победи Elite Four и Lance на Indigo Plateau.",
    "27ばんどうろでたきのぼりを使い、チャンピオンロードを抜けて、セキエイこうげんで四天王とワタルに勝ちます。",
    "Utilisez Cascade sur la Route 27, traversez la Route Victoire et battez le Conseil 4 et Peter au Plateau Indigo.",
    "Usa Cascata sul Percorso 27, attraversa la Via Vittoria e sconfiggi i Superquattro e Lance all’Altopiano Blu.",
    "Nutze Kaskade auf Route 27, durchquere die Siegesstraße und besiege die Top Vier und Siegfried auf dem Indigo Plateau.",
    "Usa Cascada en la Ruta 27, cruza la Calle Victoria y derrota al Alto Mando y a Lance en la Meseta Añil."
  ],
  "@revision.open.johto.late": [
    "After the League, collect the S.S. Ticket from Elm. Get the National Pokédex from Oak at Olivine Port. Complete Baoba’s two tests and wait for the call that unlocks Safari Zone blocks.",
    "После Лиги забери S.S. Ticket у Elm и National Dex у Oak в порту Olivine. Пройди два испытания Baoba и дождись звонка, открывающего блоки Safari Zone.",
    "殿堂入り後、ウツギからふねのチケットを、アサギ港のオーキドから全国図鑑を受け取ります。バオバの試験を2つ終え、ブロック解放の電話を待ちます。",
    "Après la Ligue, prenez le Passe Bateau chez Orme et le Pokédex national auprès de Chen au port d’Oliville. Terminez les deux épreuves de Baoba et attendez son appel pour les blocs du Parc Safari.",
    "Dopo la Lega ritira il Biglietto Nave da Elm e il Pokédex Nazionale da Oak al porto di Olivinopoli. Completa le due prove di Baoba e attendi la chiamata per sbloccare gli oggetti della Zona Safari.",
    "Hole nach der Liga das Bootsticket bei Lind und den Nationalen Pokédex bei Eich im Hafen von Oliviana City. Schließe Baobas zwei Prüfungen ab und warte auf seinen Anruf zu den Blöcken.",
    "Tras la Liga, recoge el Ticket Barco de Elm y la Pokédex Nacional de Oak en el puerto de Ciudad Olivo. Supera las dos pruebas de Baoba y espera su llamada para desbloquear los bloques de la Zona Safari."
  ],
  "@revision.open.kanto.power": [
    "Take the S.S. Aqua to Vermilion. Return the stolen Machine Part to the Power Plant. Get the EXPN Card at Lavender and use the Poké Flute station to wake Snorlax. Pick up the Super Rod on Route 12.",
    "На S.S. Aqua доберись до Vermilion. Верни украденную Machine Part на Power Plant. Забери EXPN Card в Lavender и разбуди Snorlax станцией Poké Flute. Забери Super Rod на Route 12.",
    "アクアごうでクチバへ行きます。はつでんしょへきかいのぶひんを返し、シオンでかくちょうカードを受け取ります。ポケモンのふえでカビゴンを起こし、12ばんどうろですごいつりざおを入手します。",
    "Prenez l’Aquaria jusqu’à Carmin sur Mer. Rapportez la Partie M. à la Centrale, obtenez le Coupon EXPN à Lavanville et réveillez Ronflex avec la Poké Flûte à la radio. Prenez la Méga Canne sur la Route 12.",
    "Prendi la M/N Acqua per Aranciopoli. Riporta il Pezzo Macchina alla Centrale, ottieni la Scheda Espansione a Lavandonia e sveglia Snorlax con la stazione Poké Flauto. Prendi il Super Amo sul Percorso 12.",
    "Fahre mit der M.S. Aqua nach Orania City. Bringe die Spule ins Kraftwerk zurück, hole das Zusatz-Set in Lavandia und wecke Relaxo mit der Pokéflöte im Radio. Hole die Superangel auf Route 12.",
    "Viaja en el S.S. Aqua a Ciudad Carmín. Devuelve la Maquinaria a la Central, consigue la Tarjeta Expansión en Pueblo Lavanda y despierta a Snorlax con la emisora Poké Flauta. Recoge la Supercaña en la Ruta 12."
  ],
  "@revision.latias": [
    "Restore the Power Plant. Speak to Copycat in Saffron City, then pick up the Lost Item at the Pokémon Fan Club in Vermilion. Steven appears when you exit. Follow Latias with the Pokégear map in Kanto.",
    "Восстанови Power Plant. Поговори с Copycat в Saffron, затем забери Lost Item в Pokémon Fan Club в Vermilion. На выходе появится Steven. Отслеживай Latias в Канто по карте Pokégear.",
    "はつでんしょ復旧後、ヤマブキのものまねむすめに会います。クチバのポケモンだいすきクラブでおとしものを受け取り、外に出るとダイゴが現れます。ポケギアの地図でカントーのラティアスを追います。",
    "Réparez la Centrale. Parlez à la Copieuse à Safrania et récupérez l’Objet Perdu au Fan Club Pokémon de Carmin sur Mer. Pierre apparaît à la sortie. Suivez Latias sur la carte du Pokématos au Kanto.",
    "Ripara la Centrale. Parla con Copiona a Zafferanopoli e ritira lo Strumento Perso al Pokémon Fan Club di Aranciopoli. Rocco appare all’uscita. Segui Latias con la mappa del Pokégear a Kanto.",
    "Repariere das Kraftwerk. Sprich mit der Nachahmerin in Saffronia City und hole die Fundsache im Pokémon-Fanclub von Orania City. Beim Hinausgehen erscheint Troy. Verfolge Latias mit der Karte des PokéCom in Kanto.",
    "Repara la Central. Habla con Copiona en Ciudad Azafrán y recoge el Objeto Perdido en el Club de Fans de Ciudad Carmín. Máximo aparece al salir. Sigue a Latias por Kanto en el mapa del Pokégear."
  ],
  "@revision.open.kanto.silver": [
    "Collect all eight Kanto badges. Show all 16 badges to Oak in Pallet Town for HM08 Rock Climb and access to Mt. Silver. Finish the remaining encounters in Kanto and Mt. Silver.",
    "Собери восемь значков Канто. Покажи Oak в Pallet Town все 16 значков, получи HM08 Rock Climb и доступ к Mt. Silver. Закрой оставшиеся встречи в Канто и на Mt. Silver.",
    "カントーのバッジを8個集めます。マサラタウンのオーキドに16個見せ、ロッククライムとシロガネやまへの許可を得て残りを捕まえます。",
    "Obtenez les huit badges de Kanto. Montrez les 16 badges à Chen à Bourg Palette pour obtenir Escalade et accéder au Mont Argenté. Terminez les rencontres restantes.",
    "Raccogli le otto Medaglie di Kanto. Mostra tutte e 16 a Oak a Biancavilla per Scalaroccia e l’accesso al Monte Argento. Completa gli incontri rimanenti.",
    "Sammle die acht Kanto-Orden und zeige Eich in Alabastia alle 16. Du erhältst Kraxler und Zutritt zum Silberberg. Fange die übrigen Pokémon in Kanto und am Silberberg.",
    "Consigue las ocho medallas de Kanto y muestra las 16 a Oak en Pueblo Paleta para obtener Treparrocas y entrar en el Monte Plateado. Completa los encuentros restantes."
  ],
  "@catch.Thunder Stone": [
    "Thunderstone",
    "Thunderstone",
    "かみなりのいし",
    "Pierre Foudre",
    "Pietratuono",
    "Donnerstein",
    "Piedra Trueno"
  ],
  "@catch.Upgrade": [
    "Up-Grade",
    "Up-Grade",
    "アップグレード",
    "Améliorator",
    "Upgrade",
    "Up-Grade",
    "Mejora"
  ],
  "@catch.Deep Sea Tooth": [
    "DeepSeaTooth",
    "DeepSeaTooth",
    "しんかいのキバ",
    "Dent Océan",
    "Dente Abissi",
    "Abysszahn",
    "Diente Marino"
  ],
  "@catch.Deep Sea Scale": [
    "DeepSeaScale",
    "DeepSeaScale",
    "しんかいのウロコ",
    "Écaille Océan",
    "Squama Abissi",
    "Abyssplatte",
    "Escama Marina"
  ],
  "@revision.violetTitle": [
    "Open Route 32",
    "Открой Route 32",
    "32ばんどうろへ",
    "Ouvrir la Route 32",
    "Apri il Percorso 32",
    "Route 32 öffnen",
    "Abre la Ruta 32"
  ],
  "@revision.violet": [
    "Climb Sprout Tower, then beat Falkner in Violet City for the Zephyr Badge. Pick up the Egg at the Poké Mart to continue along Route 32.",
    "Поднимись в Sprout Tower и победи Falkner в Violet City за Zephyr Badge. Забери яйцо в Poké Mart и продолжай по Route 32.",
    "マダツボミのとうを攻略し、キキョウでハヤトに勝ってウイングバッジを入手します。フレンドリィショップでタマゴを受け取り、32ばんどうろへ進みます。",
    "Montez la Tour Chétiflor, puis battez Albert à Mauville pour le Badge Zéphyr. Prenez l’Œuf à la Boutique Pokémon pour poursuivre sur la Route 32.",
    "Sali sulla Torre Sprout e batti Valerio a Violapoli per la Medaglia Zefiro. Ritira l’Uovo al Pokémon Market e prosegui sul Percorso 32.",
    "Steige auf den Knofensa-Turm und besiege Falk in Viola City für den Flügelorden. Hole das Ei im Pokémon-Markt ab und gehe auf Route 32 weiter.",
    "Sube a la Torre Bellsprout y derrota a Pegaso en Ciudad Malva para conseguir la Medalla Céfiro. Recoge el Huevo en la Tienda Pokémon y sigue por la Ruta 32."
  ],
  "@revision.emeraldFieldMoves": [
    "Take the Devon Letter to Dewford. Get HM05 Flash from the hiker at Granite Cave’s entrance and deliver the letter to Steven. Continue through Slateport to Mauville. Get HM06 Rock Smash from the man in the southeastern house and beat Wattson to use it in the field.",
    "Отвези Devon Letter в Dewford. Возьми HM05 Flash у туриста у входа в Granite Cave и передай письмо Steven. Через Slateport доберись до Mauville, возьми HM06 Rock Smash у мужчины в юго-восточном доме и победи Wattson, чтобы использовать его вне боя.",
    "ムロへ行き、いしのどうくつの入口の山男からフラッシュをもらい、ダイゴに手紙を届けます。カイナを経由してキンセツ南東の家でいわくだきを入手し、テッセンに勝ってフィールドで使えるようにします。",
    "Portez la lettre à Myokara. Prenez Flash au Montagnard à l’entrée de la Grotte Granite et livrez la lettre à Pierre. Passez par Poivressel jusqu’à Lavandia, prenez Éclate-Roc dans la maison au sud-est et battez Voltère pour l’utiliser sur le terrain.",
    "Porta la lettera a Bluruvia. Prendi Flash dal Montanaro all’ingresso della Grotta Pietrosa e consegna la lettera a Rocco. Passa da Porto Selcepoli fino a Ciclamipoli, prendi Spaccaroccia nella casa a sud-est e batti Walter per usarla fuori dalla lotta.",
    "Bringe den Brief nach Faustauhaven. Nimm Blitz vom Wanderer am Eingang der Granithöhle und bringe Troy den Brief. Reise über Graphitport City nach Malvenfroh City. Hole Zertrümmerer im südöstlichen Haus und besiege Walter für den Einsatz außerhalb von Kämpfen.",
    "Lleva la carta a Pueblo Azuliza. Consigue Destello del Montañero en la entrada de la Cueva Granito y entrega la carta a Máximo. Pasa por Ciudad Portual hacia Ciudad Malvalona, consigue Golpe Roca en la casa del sureste y derrota a Erico para usarlo fuera del combate."
  ],
  "@milestone.open.soulsilver.start": [
    "Start in New Bark Town",
    "Начни в New Bark Town",
    "ワカバタウンで出発",
    "Partir de Bourg Geon",
    "Parti da Borgo Foglianova",
    "In Neuborkia starten",
    "Empieza en Pueblo Primavera"
  ],
  "@revision.open.soulsilver.start": [
    "Choose Chikorita. Visit Mr. Pokémon, take the Mystery Egg back to Elm and catch a second Pokémon for Union Room trades. Register Chikorita in Platinum before evolving it or breed its line later.",
    "Выбери Chikorita. Посети Mr. Pokémon, верни Mystery Egg профессору Elm и поймай второго покемона для Union Room. Передай Chikorita в Platinum до эволюции или позже выведи потомство.",
    "チコリータを選び、ポケモンじいさんからのタマゴをウツギに届けます。2匹目を捕まえてユニオンルームで交換します。進化前の個体か、後でタマゴからかえした個体を送ります。",
    "Choisissez Germignon. Rapportez l’Œuf Mystère à Orme et capturez un deuxième Pokémon pour la Salle Union. Envoyez Germignon avant son évolution ou échangez un petit issu d’un Œuf plus tard.",
    "Scegli Chikorita. Riporta l’Uovo Misterioso a Elm e cattura un secondo Pokémon per la Sala Contatto. Registra Chikorita prima di farlo evolvere oppure scambia un esemplare nato da un Uovo.",
    "Wähle Endivie. Bringe Lind das Rätsel-Ei und fange ein zweites Pokémon für den Konnex-Klub. Tausche Endivie vor seiner Entwicklung oder züchte später ein Exemplar.",
    "Elige a Chikorita. Devuelve el Huevo Misterioso a Elm y captura un segundo Pokémon para la Sala Unión. Intercambia a Chikorita antes de evolucionarlo o cría otro más adelante."
  ],
  "@milestone.open.soulsilver.ilex": [
    "Open Ilex Forest",
    "Открой Ilex Forest",
    "ウバメのもりを通る",
    "Ouvrir le Bois aux Chênes",
    "Apri il Bosco di Lecci",
    "Steineichenwald öffnen",
    "Abre el Encinar"
  ],
  "@revision.open.soulsilver.ilex": [
    "Beat Falkner, cross Union Cave and clear Slowpoke Well. Beat Bugsy and return both Farfetch’d to get Cut. Use it to enter Ilex Forest for Weedle.",
    "Победи Falkner, пройди Union Cave и зачисти Slowpoke Well. Победи Bugsy и верни обоих Farfetch’d за Cut. Используй его, чтобы пройти в Ilex Forest за Weedle.",
    "ハヤトに勝ち、つながりのどうくつとヤドンのいどを通ります。ツクシに勝ち、カモネギ2羽を戻していあいぎりを入手し、森でビードルを捕まえます。",
    "Battez Albert, traversez les Caves Jumelles et libérez le Puits Ramoloss. Battez Hector et ramenez les deux Canarticho pour obtenir Coupe et attraper Aspicot au Bois aux Chênes.",
    "Batti Valerio, attraversa la Grotta di Mezzo e libera il Pozzo Slowpoke. Batti Raffaello e riporta i due Farfetch’d per Taglio. Usalo per catturare Weedle nel Bosco di Lecci.",
    "Besiege Falk, durchquere die Einheitshöhle und säubere den Flegmon-Brunnen. Besiege Kai und bringe beide Porenta zurück. Nutze Zerschneider, um Hornliu im Steineichenwald zu fangen.",
    "Derrota a Pegaso, cruza la Cueva Unión y libera el Pozo Slowpoke. Derrota a Antón y devuelve a los dos Farfetch’d para conseguir Corte y capturar a Weedle en el Encinar."
  ],
  "@milestone.open.soulsilver.coast": [
    "Reach Route 38",
    "Доберись до Route 38",
    "38ばんどうろへ",
    "Atteindre la Route 38",
    "Raggiungi il Percorso 38",
    "Route 38 erreichen",
    "Llega a la Ruta 38"
  ],
  "@revision.open.soulsilver.coast": [
    "Beat Whitney and get the SquirtBottle for Sudowoodo. Go through Ecruteak to Route 38 for Meowth.",
    "Победи Whitney и получи SquirtBottle для Sudowoodo. Через Ecruteak выйди на Route 38 за Meowth.",
    "アカネに勝ち、ゼニガメじょうろでウソッキーをどかします。エンジュを経由して38ばんどうろでニャースを捕まえます。",
    "Battez Blanche et prenez le Carapuce à O pour Simularbre. Traversez Rosalia jusqu’à la Route 38 pour capturer Miaouss.",
    "Batti Chiara e prendi lo Squirtbottiglia per Sudowoodo. Passa da Amarantopoli al Percorso 38 per Meowth.",
    "Besiege Bianka und hole die Schiggykanne für Mogelbaum. Gehe über Teak City auf Route 38 für Mauzi.",
    "Derrota a Blanca y consigue el Regador para Sudowoodo. Cruza Ciudad Iris hacia la Ruta 38 para capturar a Meowth."
  ],
  "@milestone.open.soulsilver.ice": [
    "Open Ice Path",
    "Открой Ice Path",
    "こおりのぬけみちへ",
    "Ouvrir la Route de Glace",
    "Apri la Via Gelata",
    "Eispfad öffnen",
    "Abre la Ruta Helada"
  ],
  "@revision.open.soulsilver.ice": [
    "Use Surf after Morty. Heal Amphy and beat Chuck, Jasmine and Pryce. Clear the Rocket Hideout in Mahogany and retake the Goldenrod Radio Tower. Take the Silver Wing from the director. Enter Ice Path from Route 44 and catch Delibird.",
    "После Morty используй Surf. Вылечи Amphy и победи Chuck, Jasmine и Pryce. Зачисти базу Rocket в Mahogany и освободи Goldenrod Radio Tower. Забери Silver Wing у директора. Войди в Ice Path с Route 44 и поймай Delibird.",
    "マツバに勝ってなみのりを解放。アカリを治し、シジマ・ミカン・ヤナギに勝ちます。チョウジのアジトとラジオとうのロケット団を倒し、局長からぎんいろのはねを受け取ります。44ばんどうろ側からこおりのぬけみちに入りデリバードを捕まえます。",
    "Utilisez Surf après Mortimer. Soignez Pharamp et battez Chuck, Jasmine et Frédo. Libérez le Repaire Rocket et la Tour Radio. Prenez l’Aile Argentée auprès du directeur. Entrez sur la Route de Glace par la Route 44 pour Cadoizo.",
    "Usa Surf dopo Angelo. Cura Amphy e batti Furio, Jasmine e Alfredo. Libera il Rifugio Rocket e la Torre Radio, poi prendi l’Aladargento dal direttore. Entra nella Via Gelata dal Percorso 44 per Delibird.",
    "Nutze nach Jens Surfer. Heile Amphi und besiege Hartwig, Jasmin und Norbert. Räume das Rocket-Versteck und den Radioturm. Hole den Silberflügel beim Intendanten. Betritt den Eispfad von Route 44 für Botogel.",
    "Usa Surf tras Morti. Cura a Amphy y derrota a Aníbal, Yasmina y Fredo. Libera la Guarida Rocket y la Torre Radio. Recoge el Ala Plateada del director. Entra en la Ruta Helada desde la Ruta 44 para capturar a Delibird."
  ],
  "@milestone.open.soulsilver.lugia": [
    "Unlock Lugia",
    "Открой доступ к Lugia",
    "ルギアを呼び出す準備",
    "Débloquer Lugia",
    "Sblocca Lugia",
    "Lugia freischalten",
    "Desbloquea a Lugia"
  ],
  "@revision.open.soulsilver.lugia": [
    "Beat Clair and complete Dragon’s Den. Visit Elm, then defeat the five Kimono Girls in Ecruteak for the Tidal Bell. Bring Surf, Whirlpool and the Silver Wing to the Whirl Islands.",
    "Победи Clair и пройди Dragon’s Den. Зайди к Elm, затем победи пятерых Kimono Girls в Ecruteak за Tidal Bell. Возьми Silver Wing и покемонов с Surf и Whirlpool на Whirl Islands.",
    "イブキとりゅうのあなを終え、ウツギと話します。まいこはん5人に勝ってうみなりのスズを入手し、ぎんいろのはねとなみのり・うずしおを準備してうずまきじまへ。",
    "Battez Sandra et terminez l’Antre du Dragon. Voyez Orme, puis battez les cinq danseuses de Rosalia pour le Glas Tempête. Emportez Surf, Siphon et l’Aile Argentée aux Tourb’Îles.",
    "Batti Sandra e completa la Tana del Drago. Visita Elm e batti le cinque Kimono Girl per la Campana Onda. Porta Surf, Mulinello e l’Aladargento alle Isole Vorticose.",
    "Besiege Sandra und schließe die Drachenhöhle ab. Besuche Lind und besiege die fünf Kimono-Girls für die Flutglocke. Nimm Surfer, Whirlpool und den Silberflügel zu den Strudelinseln mit.",
    "Derrota a Débora y completa la Guarida Dragón. Visita a Elm y vence a las cinco Chicas Kimono para obtener la Campana Oleaje. Lleva Surf, Torbellino y el Ala Plateada a las Islas Remolino."
  ],
  "@revision.lugia": [
    "Enter the northeast Whirl Island and descend to the waterfall. Watch the ceremony and catch Lugia. Once traded, the SoulSilver route is complete.",
    "Войди через северо-восточный остров и спустись к водопаду. После церемонии поймай Lugia. После обмена маршрут SoulSilver завершён.",
    "北東の島から入り滝まで下ります。儀式の後にルギアを捕まえ、交換したらソウルシルバーのルートは完了です。",
    "Entrez par l’île du nord-est et descendez à la cascade. Après la cérémonie, capturez Lugia. L’échange termine le parcours SoulSilver.",
    "Entra dall’isola a nord-est e scendi alla cascata. Dopo la cerimonia cattura Lugia. Lo scambio conclude il percorso SoulSilver.",
    "Betritt die nordöstliche Insel und steige zum Wasserfall hinab. Fange Lugia nach der Zeremonie. Der Tausch schließt die SoulSilver-Route ab.",
    "Entra por la isla del noreste y baja hasta la cascada. Tras la ceremonia, captura a Lugia. El intercambio completa la ruta de SoulSilver."
  ],
  "@revision.copies.gloom": [
    "Keep or raise two Gloom for Vileplume and Bellossom.",
    "Оставь или вырасти двух Gloom для Vileplume и Bellossom.",
    "ラフレシア用とキレイハナ用にクサイハナを2匹用意します。",
    "Prévoyez deux Ortide pour Rafflesia et Joliflor.",
    "Prepara due Gloom per Vileplume e Bellossom.",
    "Halte zwei Duflor für Giflor und Blubella bereit.",
    "Prepara dos Gloom para Vileplume y Bellossom."
  ],
  "@revision.copies.poliwhirl": [
    "Use two Poliwhirl for Poliwrath and Politoed. Poliwhirl can also be caught directly.",
    "Для Poliwrath и Politoed нужны два Poliwhirl. Их можно поймать уже в этой форме.",
    "ニョロボン用とニョロトノ用にニョロゾを2匹直接捕まえられます。",
    "Prévoyez deux Têtarte pour Tartard et Tarpaud. Vous pouvez les capturer directement.",
    "Servono due Poliwhirl per Poliwrath e Politoed. Puoi catturarli direttamente.",
    "Nutze zwei Quaputzi für Quappo und Quaxo. Du kannst Quaputzi direkt fangen.",
    "Usa dos Poliwhirl para Poliwrath y Politoed. Puedes capturarlos directamente."
  ],
  "@revision.copies.eevee": [
    "One gift and six offspring cover the seven Gen IV evolutions. Register the gift first, then breed with Ditto before evolving it.",
    "Подарочный Eevee и шесть детёнышей закроют семь эволюций IV поколения. Зарегистрируй подарок и скрести с Ditto до эволюции.",
    "もらったイーブイ1匹とタマゴ6匹で第4世代の7種に進化できます。先に登録し、進化前にメタモンと預けます。",
    "Le cadeau et six petits couvrent les sept évolutions de la 4e génération. Inscrivez le cadeau, puis élevez-le avec Métamorph avant de le faire évoluer.",
    "Il regalo e sei cuccioli coprono le sette evoluzioni di quarta generazione. Registra il regalo e poi usa Ditto prima di farlo evolvere.",
    "Das Geschenk und sechs Nachkommen decken sieben Entwicklungen der vierten Generation ab. Registriere das Geschenk und züchte mit Ditto vor der Entwicklung.",
    "El regalo y seis crías cubren las siete evoluciones de cuarta generación. Registra el regalo y críalo con Ditto antes de evolucionarlo."
  ],
  "@revision.copies.tyrogue": [
    "Defeat Kiyo in Mt. Mortar with a free party slot. Register Tyrogue, evolve it into any Hitmon, then breed that Hitmon with Ditto for the other two branches.",
    "Победи Kiyo в Mt. Mortar со свободным местом в команде. Зарегистрируй Tyrogue, эволюционируй его в любого Hitmon и скрести того с Ditto для двух оставшихся веток.",
    "手持ちを1枠空けてスリバチやまのキヨに勝ちます。バルキーを登録してから進化させ、その進化形をメタモンと預けて残り2匹を用意します。",
    "Battez Kiyo au Mont Creuset avec une place libre. Inscrivez Debugant, faites-le évoluer, puis confiez sa forme évoluée à la Pension avec Métamorph pour les deux autres branches.",
    "Batti Kiyo al Monte Scodella con un posto libero. Registra Tyrogue, fallo evolvere e usa la forma evoluta con Ditto per ottenere gli altri due esemplari.",
    "Besiege Kiyo im Kesselberg mit einem freien Platz. Registriere Rabauz, entwickle es und gib die entwickelte Form mit Ditto für die anderen beiden Zweige in die Pension.",
    "Derrota a Kiyo en el Monte Mortero con un hueco libre. Registra a Tyrogue, evolúcionalo y cría su forma evolucionada con Ditto para las otras dos ramas."
  ],
  "@revision.copies.ralts": [
    "One Ralts is enough when you catch both Kirlia. A male Ralts can instead supply the male Kirlia for Gallade.",
    "Хватит одного Ralts, если поймаешь обеих Kirlia. Самец Ralts может заменить поимку самца Kirlia для Gallade.",
    "キルリアを2匹捕まえるならラルトスは1匹で十分です。オスのラルトスを育ててエルレイド用にしても構いません。",
    "Un Tarsal suffit si vous capturez deux Kirlia. Un Tarsal mâle peut aussi donner le Kirlia destiné à Gallame.",
    "Basta un Ralts se catturi entrambi i Kirlia. Un Ralts maschio può diventare il Kirlia per Gallade.",
    "Ein Trasla genügt, wenn du beide Kirlia fängst. Ein männliches Trasla kann das Kirlia für Galagladi liefern.",
    "Basta un Ralts si capturas dos Kirlia. Un Ralts macho también puede dar el Kirlia para Gallade."
  ],
  "@revision.copies.kirlia": [
    "Reserve one male for Gallade. The other Kirlia can be either sex for Gardevoir.",
    "Одного самца оставь для Gallade. Для Gardevoir подойдёт Kirlia любого пола.",
    "エルレイド用にオスを1匹確保します。サーナイト用は性別を問いません。",
    "Réservez un mâle pour Gallame. L’autre Kirlia peut être des deux sexes pour Gardevoir.",
    "Riserva un maschio per Gallade. Per Gardevoir va bene un Kirlia di qualsiasi sesso.",
    "Ein Männchen für Galagladi reservieren. Für Guardevoir sind beide Geschlechter möglich.",
    "Reserva un macho para Gallade. Para Gardevoir sirve un Kirlia de cualquier sexo."
  ],
  "@revision.copies.nincada": [
    "One Nincada yields both evolutions at level 20. Leave one free party slot and an ordinary Poké Ball in the bag.",
    "Одна Nincada даёт обе эволюции на 20-м уровне. Оставь свободное место в команде и обычный Poké Ball в сумке.",
    "ツチニン1匹からレベル20で両方を入手できます。手持ちを1枠空け、バッグにモンスターボールを1個入れておきます。",
    "Un Ningale donne les deux évolutions au niveau 20. Gardez une place libre et une Poké Ball ordinaire dans le Sac.",
    "Un Nincada dà entrambe le evoluzioni al livello 20. Tieni un posto libero e una Poké Ball normale nella Borsa.",
    "Ein Nincada ergibt auf Level 20 beide Entwicklungen. Halte einen Platz im Team und einen normalen Pokéball im Beutel frei.",
    "Un Nincada da ambas evoluciones al nivel 20. Deja un hueco en el equipo y una Poké Ball normal en la Bolsa."
  ],
  "@revision.copies.snorunt": [
    "Reserve one female for Froslass. Either sex can evolve into Glalie.",
    "Одну самку оставь для Froslass. Для Glalie подойдёт любой пол.",
    "ユキメノコ用にメスを1匹確保します。オニゴーリ用は性別を問いません。",
    "Réservez une femelle pour Momartik. Oniglali accepte les deux sexes.",
    "Riserva una femmina per Froslass. Per Glalie va bene qualsiasi sesso.",
    "Reserviere ein Weibchen für Frosdedje. Für Firnontor sind beide Geschlechter möglich.",
    "Reserva una hembra para Froslass. Para Glalie sirve cualquier sexo."
  ],
  "@revision.copies.clamperl": [
    "Transfer both before evolving them. Trade one holding Deep Sea Tooth and the other holding Deep Sea Scale.",
    "Перенеси обеих Clamperl до эволюции. Одну обменяй с Deep Sea Tooth, вторую с Deep Sea Scale.",
    "パールルを2匹進化前に送ります。しんかいのキバとしんかいのウロコをそれぞれ持たせて交換します。",
    "Transférez les deux Coquiperl avant leur évolution. Échangez l’un avec la Dent Océan et l’autre avec l’Écaille Océan.",
    "Trasferisci entrambi i Clamperl prima di evolverli. Scambiane uno con il Dente Abissi e l’altro con la Squama Abissi.",
    "Übertrage beide Perlu vor der Entwicklung. Tausche eines mit Abysszahn und das andere mit Abyssplatte.",
    "Transfiere ambos Clamperl antes de evolucionarlos. Intercambia uno con Diente Marino y el otro con Escama Marina."
  ],
  "@revision.copies.burmy": [
    "Catch one female for Wormadam and one male for Mothim. Any cloak counts for the National Pokédex.",
    "Поймай самку для Wormadam и самца для Mothim. Для National Dex подойдёт любой плащ.",
    "ミノマダム用にメス、ガーメイル用にオスを1匹ずつ捕まえます。全国図鑑ではどのミノでも登録できます。",
    "Capturez une femelle pour Cheniselle et un mâle pour Papilord. Toute cape compte pour le Pokédex national.",
    "Cattura una femmina per Wormadam e un maschio per Mothim. Qualsiasi manto vale per il Pokédex Nazionale.",
    "Fange ein Weibchen für Burmadame und ein Männchen für Moterpel. Für den Nationalen Pokédex genügt jeder Umhang.",
    "Captura una hembra para Wormadam y un macho para Mothim. Cualquier tronco cuenta para la Pokédex Nacional."
  ],
  "@revision.copies.wurmple": [
    "Register one Wurmple. Catch Silcoon and Cascoon separately in Eterna Forest to avoid relying on Wurmple’s hidden evolution branch.",
    "Зарегистрируй одну Wurmple. Silcoon и Cascoon поймай отдельно в Eterna Forest, чтобы не зависеть от скрытой ветки эволюции Wurmple.",
    "ケムッソは1匹登録します。進化先に頼らず、ハクタイのもりでカラサリスとマユルドを別々に捕まえます。",
    "Inscrivez un Chenipotte. Capturez Armulys et Blindalys séparément dans la Forêt de Vestigion afin d’éviter le choix d’évolution caché.",
    "Registra un Wurmple. Cattura Silcoon e Cascoon separatamente nel Bosco Evopoli per evitare il ramo evolutivo nascosto.",
    "Registriere ein Waumpel. Fange Schaloko und Panekon getrennt im Ewigwald, damit du nicht von Waumpels verdecktem Entwicklungszweig abhängst.",
    "Registra un Wurmple. Captura a Silcoon y Cascoon por separado en el Bosque Vetusto para evitar depender de la rama oculta."
  ],
  "@revision.tradeRegistered": [
    "Register the offered Pokémon before trading it. Its evolved form has a separate catch later in the route.",
    "Зарегистрируй покемона перед тем, как отдать его в обмен. Его эволюцию можно поймать отдельно дальше по маршруту.",
    "交換に出すポケモンを先に登録します。進化形は後で別に捕まえます。",
    "Inscrivez le Pokémon avant de l’échanger. Sa forme évoluée se capture séparément plus tard.",
    "Registra il Pokémon prima di scambiarlo. La forma evoluta si cattura separatamente più avanti.",
    "Registriere das Pokémon vor dem Tausch. Seine Entwicklung fängst du später separat.",
    "Registra al Pokémon antes de intercambiarlo. Su forma evolucionada se captura por separado más adelante."
  ],
  "@revision.itemLine": [
    "{item} ×{count} → {targets}.",
    "{item} ×{count} → {targets}.",
    "{item} ×{count} → {targets}。",
    "{item} ×{count} → {targets}.",
    "{item} ×{count} → {targets}.",
    "{item} ×{count} → {targets}.",
    "{item} ×{count} → {targets}."
  ],
  "@revision.item.mine": [
    "Dig for it in {place} with the Explorer Kit.",
    "Выкопай в {place} с Explorer Kit.",
    "たんけんセットで{place}へ行き、発掘します。",
    "Creusez dans {place} avec l’Explorakit.",
    "Scava in {place} con l’Esplorokit.",
    "Grabe im Gebiet {place} mit dem Forschersack danach.",
    "Excava en {place} con el Kit de Exploración."
  ],
  "@revision.item.pickup": [
    "Pick it up at {place}.",
    "Подбери в локации {place}.",
    "{place}で落ちている道具を拾います。",
    "Ramassez-le à {place}.",
    "Raccoglilo a {place}.",
    "Hebe es bei {place} auf.",
    "Recógelo en {place}."
  ],
  "@revision.item.lastRoom": [
    "Pick it up in the last room of {place}.",
    "Подбери в последней комнате {place}.",
    "{place}の最後の部屋で拾います。",
    "Ramassez-le dans la dernière salle à {place}.",
    "Raccoglilo nell’ultima stanza di {place}.",
    "Hebe es im letzten Raum von {place} auf.",
    "Recógelo en la última sala de {place}."
  ],
  "@revision.item.dowsing": [
    "Use the Dowsing Machine at {place}.",
    "Используй Dowsing Machine в локации {place}.",
    "{place}でダウジングマシンを使います。",
    "Utilisez le Radar à Objet à {place}.",
    "Usa il Ricerca Strumenti a {place}.",
    "Nutze den Itemradar bei {place}.",
    "Usa el Zahorí en {place}."
  ],
  "@revision.item.climbDowsing": [
    "Use Rock Climb, then the Dowsing Machine at {place}.",
    "Используй Rock Climb, затем Dowsing Machine в локации {place}.",
    "{place}でロッククライムを使い、ダウジングマシンで探します。",
    "Utilisez Escalade puis le Radar à Objet à {place}.",
    "Usa Scalaroccia e poi il Ricerca Strumenti a {place}.",
    "Nutze Kraxler und dann den Itemradar bei {place}.",
    "Usa Treparrocas y después el Zahorí en {place}."
  ],
  "@revision.item.climbPickup": [
    "Reach it with Rock Climb at {place}.",
    "Доберись до предмета с Rock Climb в локации {place}.",
    "{place}でロッククライムを使って拾います。",
    "Utilisez Escalade pour l’atteindre à {place}.",
    "Raggiungilo con Scalaroccia a {place}.",
    "Erreiche es mit Kraxler bei {place}.",
    "Alcánzalo con Treparrocas en {place}."
  ],
  "@revision.item.surfPickup": [
    "Reach it with Surf at {place}.",
    "Доберись до предмета с Surf в локации {place}.",
    "{place}でなみのりを使って拾います。",
    "Utilisez Surf pour l’atteindre à {place}.",
    "Raggiungilo con Surf a {place}.",
    "Erreiche es mit Surfer bei {place}.",
    "Alcánzalo con Surf en {place}."
  ],
  "@revision.item.strengthPickup": [
    "Use Strength to reach it at {place}.",
    "Используй Strength, чтобы добраться до предмета в локации {place}.",
    "{place}でかいりきを使って拾います。",
    "Utilisez Force pour l’atteindre à {place}.",
    "Usa Forza per raggiungerlo a {place}.",
    "Nutze Stärke, um es bei {place} zu erreichen.",
    "Usa Fuerza para alcanzarlo en {place}."
  ],
  "@revision.item.warehouse": [
    "Pick it up after Looker opens {place} with the Storage Key during the Veilstone raid.",
    "Подбери в {place}, после того как Looker откроет склад своим Storage Key во время штурма базы в Veilstone.",
    "トバリでハンサムがそうこのカギで{place}を開けたあとに拾います。",
    "Ramassez-le après que Beladonis a ouvert {place} avec la Clé Stockage lors de l’assaut à Voilaroc.",
    "Raccoglilo dopo che Bellocchio apre {place} con la Depochiave durante l’assalto a Rupepoli.",
    "Hebe es auf, nachdem LeBelle das Gebäude {place} in Schleiede mit dem Lagerschlüssel geöffnet hat.",
    "Recógelo después de que Handsome abra {place} con la Llave Almacén durante el asalto de Ciudad Rocavelo."
  ],
  "@revision.item.byron": [
    "Receive it from Byron in the house at {place} after the National Pokédex.",
    "После получения National Dex забери у Byron в доме на {place}.",
    "全国図鑑を入手したら{place}の家でトウガンから受け取ります。",
    "Après le Pokédex national, recevez-le de Charles dans la maison à {place}.",
    "Ottenuto il Pokédex Nazionale, ritiralo da Ferruccio nella casa di {place}.",
    "Hole es nach Erhalt des Nationalen Pokédex bei Adam im Haus auf {place}.",
    "Con la Pokédex Nacional, pídeselo a Acerón en la casa de {place}."
  ],
  "@revision.item.seafoamTooth": [
    "Surf to the Seafoam Islands on {place}. Use the Dowsing Machine to the right of Blaine’s Gym entrance.",
    "Доберись с Surf до Seafoam Islands на {place}. Используй Dowsing Machine справа от входа в зал Blaine.",
    "{place}からなみのりでふたごじまへ。カツラのジムの入口右側でダウジングマシンを使います。",
    "Rejoignez les Îles Écume avec Surf sur la {place}. Utilisez le Radar à Objet à droite de l’entrée de l’Arène d’Auguste.",
    "Usa Surf per arrivare alle Isole Spumarine sul {place}. Usa il Ricerca Strumenti a destra dell’ingresso della Palestra di Blaine.",
    "Surfe auf {place} zu den Seeschauminseln. Nutze den Itemradar rechts vom Eingang zu Pyros Arena.",
    "Usa Surf para llegar a las Islas Espuma en la {place}. Usa el Zahorí a la derecha de la entrada al Gimnasio de Blaine."
  ],
  "@revision.item.seafoamScale": [
    "Surf north of the Seafoam Islands on {place}. Use the Dowsing Machine near Swimmer Luis.",
    "Используй Surf к северу от Seafoam Islands на {place}. Ищи Dowsing Machine возле пловца Luis.",
    "{place}のふたごじま北側までなみのりで進み、かいパンやろうの近くをダウジングマシンで調べます。",
    "Surfez au nord des Îles Écume sur la {place} et utilisez le Radar à Objet près du Nageur Luis.",
    "Usa Surf a nord delle Isole Spumarine sul {place} e il Ricerca Strumenti vicino al nuotatore Luis.",
    "Surfe auf {place} nördlich der Seeschauminseln und nutze den Itemradar beim Schwimmer Luis.",
    "Usa Surf al norte de las Islas Espuma en la {place} y el Zahorí cerca del nadador Luis."
  ],
  "@revision.item.well": [
    "Use Surf and Strength in {place} and speak to the man on B2F.",
    "Используй Surf и Strength в {place}, затем поговори с мужчиной на B2F.",
    "{place}でなみのりとかいりきを使い、地下2階の男性から受け取ります。",
    "Utilisez Surf et Force à {place}, puis parlez à l’homme au deuxième sous-sol.",
    "Usa Surf e Forza a {place}, poi parla all’uomo al secondo piano interrato.",
    "Nutze Surfer und Stärke bei {place} und sprich im zweiten Untergeschoss mit dem Mann.",
    "Usa Surf y Fuerza en {place} y habla con el hombre en el segundo sótano."
  ],
  "@revision.item.dragonScale": [
    "Enter {place} through the middle entrance and use Surf and Waterfall to reach the upper cave.",
    "Войди в {place} через центральный вход. Используй Surf и Waterfall, чтобы попасть в верхнюю пещеру.",
    "{place}の中央の入口から入り、なみのりとたきのぼりで上層へ行きます。",
    "Entrez à {place} par l’entrée centrale. Utilisez Surf et Cascade pour atteindre la grotte supérieure.",
    "Entra a {place} dall’ingresso centrale e usa Surf e Cascata per raggiungere la grotta superiore.",
    "Betritt {place} durch den mittleren Eingang und nutze Surfer und Kaskade für die obere Höhle.",
    "Entra en {place} por la entrada central y usa Surf y Cascada para llegar a la cueva superior."
  ],
  "@revision.item.reusable": [
    "Give it to the breeding parent. Reuse it after getting the Egg.",
    "Дай родителю при разведении. После получения яйца предмет можно использовать снова.",
    "タマゴの親に持たせます。タマゴを入手しても道具は残ります。",
    "Donnez-le au parent. L’objet reste utilisable après avoir obtenu l’Œuf.",
    "Dallo al genitore. Puoi riutilizzarlo dopo aver ottenuto l’Uovo.",
    "Gib es dem Elternteil. Nach Erhalt des Eis bleibt es erhalten.",
    "Dáselo al progenitor. Puedes volver a usarlo después de conseguir el Huevo."
  ],
  "@revision.item.trade": [
    "Send it to Platinum as a held item in a Union Room trade.",
    "Передай предмет в Platinum на покемоне через Union Room.",
    "ユニオンルームで持たせたポケモンをプラチナに送ります。",
    "Faites-le tenir par un Pokémon et échangez-le vers Platine dans la Salle Union.",
    "Fallo tenere a un Pokémon e scambialo con Platino nella Sala Contatto.",
    "Lass es ein Pokémon tragen und tausche es im Konnex-Klub nach Platin.",
    "Equípalo en un Pokémon e intercámbialo a Platino en la Sala Unión."
  ],
  "@ui.table.location": [
    "Location",
    "Локация",
    "場所",
    "Lieu",
    "Luogo",
    "Ort",
    "Lugar"
  ],
  "@ui.table.method": [
    "Method",
    "Способ",
    "方法",
    "Méthode",
    "Metodo",
    "Methode",
    "Método"
  ],
  "@ui.table.time": [
    "Time",
    "Время",
    "時間帯",
    "Moment",
    "Orario",
    "Zeit",
    "Hora"
  ],
  "@ui.table.conditions": [
    "Conditions",
    "Условия",
    "条件",
    "Conditions",
    "Condizioni",
    "Bedingungen",
    "Condiciones"
  ],
  "@ui.table.rate": [
    "Rate",
    "Шанс",
    "割合",
    "Taux",
    "Tasso",
    "Anteil",
    "Tasa"
  ],
  "@ui.table.level": [
    "Level",
    "Уровень",
    "レベル",
    "Niv.",
    "Livello",
    "Level",
    "Nivel"
  ],
  "@ui.table.slots": [
    "Slot weight",
    "Вес слотов",
    "枠の重み",
    "Poids des créneaux",
    "Peso slot",
    "Slot-Gewicht",
    "Peso de ranuras"
  ],
  "@ui.table.slotExplanation": [
    "Sum of the listed slot weights. The overall encounter chance can depend on other conditions.",
    "Сумма весов указанных слотов. Фактическая вероятность встречи может зависеть от других условий.",
    "掲載枠の重みの合計です。実際の出現率はほかの条件にも左右されます。",
    "Somme des poids des créneaux affichés. Le taux de rencontre total peut dépendre d’autres conditions.",
    "Somma dei pesi degli slot elencati. La probabilità effettiva può dipendere da altre condizioni.",
    "Summe der angezeigten Slot-Gewichte. Die tatsächliche Begegnungschance kann von weiteren Bedingungen abhängen.",
    "Suma del peso de las ranuras listadas. La probabilidad real puede depender de otras condiciones."
  ],
  "@ui.table.guide": [
    "Guide methods",
    "Способы из маршрута",
    "攻略の入手方法",
    "Méthodes du guide",
    "Metodi della guida",
    "Methoden der Route",
    "Métodos de la guía"
  ],
  "@ui.table.encounters": [
    "Encounter data",
    "Данные встреч",
    "出現データ",
    "Données de rencontre",
    "Dati degli incontri",
    "Begegnungsdaten",
    "Datos de encuentros"
  ]
};

function loadRouteRevisions(words) {
  for (const [key, cells] of Object.entries(messages)) {
    if(cells.length!==languages.length||cells.some(cell=>!cell))throw Error('Incomplete route translation: '+key);
    languages.forEach((language,index)=>{words[language][key]=cells[index]});
  }
}

module.exports=loadRouteRevisions;
