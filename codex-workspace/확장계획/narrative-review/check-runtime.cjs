const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const here = __dirname;
const html = fs.readFileSync(path.join(here, 'candidate/index.html'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(here, '../../docs/narrative/narrative_data.json'), 'utf8'));
const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
scripts.forEach((m, i) => new vm.Script(m[2], {filename: `inline-${i + 1}.js`}));
const context = vm.createContext({module: {exports: {}}});
const start = html.indexOf('const Narrative=');
const marker = "if(typeof module!=='undefined')module.exports=Week;";
const end = html.indexOf(marker, start) + marker.length;
assert(end > start);
new vm.Script(html.slice(start, end)).runInContext(context);
const week = context.module.exports;
assert.equal(week.DAYS[0].news.headline, data.days['1'].news.headline);
assert.equal(week.NPCS.miru.quote, data.characters.miru.profile.habit);
assert.equal(week.NPCS.garam.quote, data.characters.garam.profile.habit);
assert.equal(week.NPCS.sora.win, data.characters.sora.win);
for (let i = 0; i < 15; i++) {
  assert.equal(week.DAYS[i].news.headline, data.days[String(i + 1)].news.headline);
  assert.equal(week.DAYS[i].news.rule, data.days[String(i + 1)].news.rule);
  assert.equal(week.DAYS[i].talk[1], data.days[String(i + 1)].talk.line);
}
const result = {status: 'PASS', inlineScriptsParsed: scripts.length,
  checked: ['all inline JS syntax', 'Week uses revised 15-day news headline/rule/talk', 'NPC habits and completion lines read revised data'],
  limitations: ['DOM rendering and actual mobile wrapping not tested']};
fs.writeFileSync(path.join(here, 'runtime-validation.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
