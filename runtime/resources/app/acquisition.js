'use strict';

// Only encounter fields enter these formatters. Research notes and access instructions
// remain available to checkpoint authors without becoming part of a catch description.
function acquisitionView(guide, language, methods) {
  const words = guide.words[language];
  const term = value => words['@catch.' + value] ?? words[value] ?? value;
  const join = parts => [...new Set(parts.filter(Boolean))].join(' · ');
  const name = id => guide.species[id].name;
  function place(value) {
    return (term(value) || '').replace(/(?:Sinnoh )?Route (\d+)/g, (_, n) => term('Route') + ' ' + n)
      .replace(/Iron Island|Great Marsh/g, term).replace(/ • /g, ' · ');
  }
  function rates(rate) {
    if (!rate) return '';
    const entries = Object.entries(rate);
    if (!entries.length) return '';
    if (new Set(Object.values(rate)).size === 1) return entries[0][1] + '%';
    return entries.filter(([,n])=>n>0).map(([period, n]) => term('@ui.' + period) + ' ' + n + '%').join(' / ');
  }
  function evolutionRows(id) {
    return (methods[id]?.evolution || []).map(line => {
      const [parent, rule] = line.split(' → ');
      const parts = rule.split(', ').map(token => {
        const level = token.match(/^ур\. (\d+)$/);
        if (level) return term('Level') + ' ' + level[1];
        const item = token.match(/^(держать|знать|использовать|в команде) (.+)$/);
        if (item) {
          const title = item[2].split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');
          return [term(item[1]),term(title==='Up Grade'?'Upgrade':title)].filter(Boolean).join(' ');
        }
        return term(token);
      });
      if (parts.length > 1 && ['use-item','shed'].includes(rule.split(', ')[0])) parts.shift();
      if (rule.startsWith('level-up, ур.')) parts.shift();
      const source = parent[0].toUpperCase() + parent.slice(1);
      return {location:'', method:term(guide.methods.Evolution), icon:'evolution',
        conditions:[source + ' → ' + name(id), parts.join(', ')]};
    });
  }
  function evolution(id) {
    return evolutionRows(id).map(row=>join(row.conditions));
  }
  function format(record, id) {
    const req = record.requirements || record;
    const method = record.method;
    if (method === 'Evolution') return evolution(id).join(' / ');
    const parents = (req.requires_species || []).map(name);
    const items = (req.items || []).map(term);
    let location = record.location;
    if (method === 'Honey Trees' && record.game === 'Platinum' && record.id) location = id === 446 ? 'Sinnoh' : 'Floaroma Meadow';
    if ([252,255].includes(id) && method==='Gift') location='Route 101';
    if (method === 'Fossil') location = 'Oreburgh Mining Museum';
    const group = req.group;
    const showGroup = group && !['Special','Fishing','Surfing',method,req.area].includes(group) && !group.startsWith('Catch/entry');
    const conditionKey = '@catch.' + method + '.' + id;
    const condition = words[conditionKey];
    const displayMethod = method==='Great Marsh' ? 'Tall Grass' : method;
    const detail = [place(location), term(req.area), method==='Gift Egg' && condition ? '' : term(guide.methods[displayMethod] || displayMethod),
      showGroup && term(group), condition];
    if (method === 'Honey Trees') detail.push(term('Honey window'));
    if (method === 'In-game Trade' && parents.length) detail.push(term('Offer') + ' ' + parents.join(' / '));
    if (method === 'Egg') detail.push(parents.join(' + '));
    if (method === 'Static Encounter' && parents.length) detail.push(term('Party') + ' ' + parents.join(', '));
    if (['Egg','Event','Static Encounter'].includes(method)) detail.push(...items.filter(i => i !== method && i !== req.rod));
    if(method==='Tile fishing')detail.push(term(record.game==='Emerald'?'sixTiles':'fourTiles'));
    if(method==='Tile fishing' || method==='Great Marsh'){
      const raw = method==='Tile fishing' ? 'feebas-tile-fishing' : 'walk';
      const table = methods[id]?.encounters.find(e=>e.game===record.game.toLowerCase() && e.method===raw && (method==='Tile fishing' || e.conditions.startsWith('great-marsh-daily-slot-')));
      if(table)detail.push(table.slots.reduce((sum,s)=>sum+Number(s.weight),0)+'%');
    }
    if(method==='Event' && !items.length)detail.push(term('historicalCard'));
    detail.push(rates(req.rate || req.rarity_percent));
    return join(detail);
  }
  function tablePlace(slug) {
    const [base,area] = slug.split(' ');
    const title = text=>text.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    return join([place(title(base)), area && (words['@area.'+area] || title(area))]);
  }
  function rows(record, id) {
    const req=record.requirements||record, method=record.method;
    if(method==='Evolution')return evolutionRows(id);
    const local=value=>words[value]??guide.words.en[value]??value;
    const parents=(req.requires_species||[]).map(name);
    const groups=['Special','Fishing','Surfing',method,req.area];
    const conditions=[
      req.group&&!groups.includes(req.group)&&!req.group.startsWith('Catch/entry')&&term(req.group),
      words['@catch.'+method+'.'+id]??guide.words.en['@catch.'+method+'.'+id],
      ...(['In-game Trade','Egg','Static Encounter'].includes(method)?parents:[]),
      ...(method==='Honey Trees'?[term('Honey window')]:[]),
      ...(method==='Tile fishing'?[term(record.game==='Emerald'?'sixTiles':'fourTiles')]:[]),
      ...(method==='Event'&&!req.items?.length?[term('historicalCard')]:[]),
      ...(req.items||[]).filter(item=>item!==req.rod&&item!==method).map(item=>term(local(item))),
      ...(req.hm||[]).map(item=>term(local(item)))
    ].filter(Boolean);
    const chanceBasis=local(req.rate_basis||req.probability_basis);
    if(method==='Tile fishing'||method==='Great Marsh'||(method==='Honey Trees'&&!req.rate&&!req.rarity_percent))
      if(chanceBasis&&chanceBasis!==guide.words.en['@task.get.387.requirements.rate_basis'])conditions.push(chanceBasis);
    const location=method==='Fossil'?'Oreburgh Mining Museum':local(record.location);
    const base={location:join([place(location),term(req.area)]),
      method:term(guide.methods[method]||method),methodId:method, conditions:[...new Set(conditions)],
      level:record.level||req.level, chanceBasis};
    const rates=Object.entries(req.rate||req.rarity_percent||{}).filter(([,n])=>n>0);
    return rates.length?rates.map(([period,chance])=>({...base,time:period==='all'?'':period,chance:chance+'%'})):[base];
  }
  return {format, evolution, evolutionRows, rows, term, place, tablePlace};
}
if (typeof module !== 'undefined') module.exports = acquisitionView;
