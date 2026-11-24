'use strict';
// Navigation and status labels only; walkthrough prose uses the English pack.
globalThis.dexGuideLocales = {};
(() => {
  const rows = [
    ['story','ストーリー','Histoire','Storia','Handlung','Historia'],
    ['transfer','転送','Transfert','Trasferimento','Übertragung','Transferencia'],
    ['task','タスク','Tâche','Attività','Aufgabe','Tarea'],
    ['method','方法','Méthode','Metodo','Methode','Método'],
    ['morning','朝','Matin','Mattina','Morgens','Mañana'],
    ['day','昼','Jour','Giorno','Tagsüber','Día'],
    ['night','夜','Nuit','Notte','Nachts','Noche'],
    ['available','利用可能','Disponible','Disponibile','Verfügbar','Disponible'],
    ['registered','Platinumに登録済み','Enregistré dans Platinum','Registrato in Platinum','In Platinum registriert','Registrado en Platinum'],
    ['requires','必要条件','Prérequis','Prerequisiti','Voraussetzungen','Requisitos'],
    ['alternative','別の方法','Autres méthodes','Metodi alternativi','Alternative Methoden','Métodos alternativos'],
    ['historical','旧ルートのタスク記録','Tâche conservée de l’ancien parcours','Attività conservata dal percorso precedente','Aufgabenmarkierung aus früherer Route','Marca guardada de la ruta anterior'],
    ['deferred','後回し','Reporté','Rimandato','Zurückgestellt','Pospuesto'],
    ['skip','スキップ','Reporter','Rimanda','Überspringen','Omitir'],
    ['restore','元の試行に戻す','Rétablir la tentative initiale','Ripristina il tentativo iniziale','Ursprünglichen Versuch wiederherstellen','Restaurar intento original'],
    ['all','全時間帯','Toute la journée','A qualsiasi ora','Jederzeit','A cualquier hora'],
    ['unknown','遭遇率未確認','Taux de rencontre non confirmé','Probabilità d’incontro non confermata','Begegnungsrate unbestätigt','Probabilidad de encuentro sin confirmar'],
    ['treeGroup','木のグループ','Groupe d’arbres','Gruppo di alberi','Baumgruppe','Grupo de árboles'],
    ['sameVersion','同じ場所と方法','Même lieu et même méthode','Stesso luogo e metodo','Gleicher Ort und gleiche Methode','Mismo lugar y método'],
    ['versionOnly','この表の対象：','Ce tableau s’applique à','Questa tabella si applica a','Diese Tabelle gilt für','Esta tabla se aplica a'],
    ['slot','手持ちの位置','emplacement dans l’équipe','posizione in squadra','Teamplatz','posición del equipo'],
    ['sourceRegistered','進化元は登録済み。個体と進化条件を確認してください。','Espèce de départ enregistrée ; vérifiez le Pokémon et les conditions d’évolution.','Specie di origine registrata; verifica il Pokémon e le condizioni di evoluzione.','Ausgangsart registriert; Pokémon und Entwicklungsbedingungen prüfen.','Especie de origen registrada; comprueba el Pokémon y las condiciones de evolución.'],
    ['sourceMissing','進化元の登録待ち','Espèce de départ non enregistrée','Specie di origine non registrata','Ausgangsart noch nicht registriert','Especie de origen pendiente de registro'],
    ['localSource','転送元の手持ちかPCで進化元を確認','Vérifiez le Pokémon de départ dans l’équipe ou le PC du jeu source','Controlla il Pokémon di origine nella squadra o nel PC del gioco di origine','Ausgangs-Pokémon im Team oder PC des Quellspiels prüfen','Comprueba el Pokémon de origen en el equipo o PC del juego de origen'],
    ['swarmHeading','今日の大量発生','Rapport des apparitions massives du jour','Rapporto delle comparse massicce del giorno','Täglicher Schwarmbericht','Informe diario de apariciones masivas'],
    ['sourcePresent','手持ちかPCに進化元がいます。残りの進化条件を確認してください。','Pokémon de départ présent dans l’équipe ou le PC ; vérifiez les autres conditions d’évolution.','Pokémon di origine presente nella squadra o nel PC; verifica le altre condizioni di evoluzione.','Ausgangs-Pokémon im Team oder PC vorhanden; übrige Entwicklungsbedingungen prüfen.','Pokémon de origen presente en el equipo o PC; comprueba las demás condiciones de evolución.'],
    ['sourceAbsent','直近の手持ち・PC記録に進化元がいません。','Pokémon de départ absent du dernier relevé de l’équipe et du PC.','Pokémon di origine assente dall’ultima lettura di squadra e PC.','Ausgangs-Pokémon fehlt im letzten Team- und PC-Abbild.','Pokémon de origen ausente de la última lectura del equipo y PC.'],
    ['scale','表示倍率','Échelle de l’interface','Scala dell’interfaccia','Oberflächenskalierung','Escala de la interfaz'],
    ['resetScale','115%に戻す','Rétablir à 115 %','Ripristina al 115%','Auf 115 % zurücksetzen','Restablecer al 115 %'],
    ['compact','サイドバーの幅を切り替え','Changer la largeur du panneau latéral','Cambia larghezza della barra laterale','Seitenleistenbreite umschalten','Cambiar ancho de la barra lateral'],
    ['current','現在の段階へ移動','Aller à l’étape actuelle','Vai alla fase attuale','Zum aktuellen Abschnitt','Ir a la etapa actual'],
    ['objective','次の目標','Prochain objectif','Prossimo obiettivo','Nächstes Ziel','Próximo objetivo'],
    ['jump','タスクを表示','Afficher la tâche','Mostra attività','Aufgabe anzeigen','Mostrar tarea'],
    ['none','確認済みの目標はまだありません','Aucun objectif confirmé pour le moment','Nessun obiettivo confermato','Noch kein bestätigtes Ziel','Todavía no hay un objetivo confirmado'],
    ['availableNow','現在利用可能','Disponible maintenant','Disponibile ora','Jetzt verfügbar','Disponible ahora'],
    ['deferFilter','後回し','Reportés','Rimandati','Zurückgestellt','Pospuestos'],
    ['unchecked','未登録','Non enregistré','Non registrato','Nicht registriert','Sin registrar'],
    ['syncOk','セーブ同期済み','Sauvegarde synchronisée','Salvataggio sincronizzato','Spielstand synchronisiert','Partida sincronizada'],
    ['syncWait','Platinumのセーブ待ち','En attente de la sauvegarde Platinum','In attesa del salvataggio Platinum','Warte auf Platinum-Spielstand','Esperando partida de Platinum'],
    ['syncError','セーブ診断を確認','Consultez le diagnostic de sauvegarde','Controlla la diagnostica del salvataggio','Spielstanddiagnose prüfen','Consulta el diagnóstico de la partida'],
    ['manualMode','手動記録','Suivi manuel','Registrazione manuale','Manuelle Erfassung','Registro manual'],
    ['campaign','Sinnohフィールドガイド','Guide de terrain de Sinnoh','Guida di Sinnoh','Sinnoh-Feldführer','Guía de campo de Sinnoh'],
    ['routeNav','攻略ルート','Parcours de jeu','Percorso di gioco','Spielroute','Ruta de juego']
  ];
  for(const [column,language] of ['ja','fr','it','de','es'].entries())
    globalThis.dexGuideLocales[language]=Object.fromEntries(rows.map(([key,...values])=>['@ui.'+key,values[column]]));
})();
