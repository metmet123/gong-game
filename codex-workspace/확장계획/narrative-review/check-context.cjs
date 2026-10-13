// Run the actual text renderers with in-memory elements; never touch a user's save.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const here=__dirname,html=fs.readFileSync(here+'/candidate/index.html','utf8');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const c=vm.createContext({module:{exports:{}},console});
vm.runInContext(scripts[0],c);vm.runInContext(scripts[1],c);
function fn(name){
 const a=scripts[4].indexOf(`function ${name}(`);
 if(a<0){const p=scripts[4].indexOf(`const ${name}=`);assert(p>=0,name);return scripts[4].slice(p,scripts[4].indexOf('\n',p));}
 for(let b=scripts[4].indexOf('}',a);b>=0;b=scripts[4].indexOf('}',b+1)){
   const code=scripts[4].slice(a,b+1);try{new vm.Script(code);return code;}catch{}
 }
 throw Error(name);
}
const elements={};c.element=id=>elements[id]??=({innerHTML:'',textContent:'',click(){}});
vm.runInContext(`
const $=id=>element(id),NP=Week.NPCS,LV=Core.LEVELS.filter(l=>!l.extra);
let S={};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const dow=d=>['月','火','水','木','金'][(d-1)%5];
const tDone=t=>S.tasks[t.key]?.s==='done';
const starHTML=n=>'★'.repeat(n);
const ledgerName=k=>k;
const talkHTML=ls=>(ls||[]).map(x=>NP[x.who]?.name+': '+x.line).join('<br>');
function renderRank(){}
const MENUS=['식단'],FORECAST=['예보'],SENIOR=['','통과','통과','통과'];
${fn('dayTasks')}
${fn('convId')}
${fn('taskName')}
${fn('dayTalk')}
const dayNews=d=>Week.DAYS[d-1].news;
${fn('yesterdayResult')}
${fn('doneTasks')}
${fn('doneOf')}
function dayTaskByKey(k){return Week.DAYS.flatMap((_,i)=>dayTasks(i+1)).find(t=>t.key===k);}
${fn('relCount')}
${fn('relLevel')}
const ACH=Object.values(Week.ACH_TEXT).map(x=>[x.id,x.name,x.desc]);
${fn('renderNews')}
${fn('renderRecords')}
`,c);
const run=s=>vm.runInContext(s,c);
let morningChecks=0;
for(let day=1;day<=15;day++){
 run(`S={day:${day},quarter:1,tasks:{},ledger:{},best:{},practice:{},friend:{},decor:[],ach:[]};renderNews();renderRecords();`);
 const expected=run(`Week.DAYS[${day-1}].news`);
 assert.equal(elements['news-head'].textContent,expected.headline);
 assert.equal(elements['news-rule'].textContent,expected.rule);
 expected.body.forEach(s=>assert(elements['news-prev'].innerHTML.includes(s)));
 const current=run(`Week.DEX.events[${day}].summary`);
 assert(elements['records-body'].innerHTML.includes(current));
 if(day<15)assert(!elements['records-body'].innerHTML.includes(run(`Week.DEX.events[${day+1}].summary`)));
 assert(elements['records-body'].innerHTML.includes('관련 업무:'));
 assert(elements['records-body'].innerHTML.includes('장식용 트로피'));
 morningChecks++;
}
run(`S={day:9,quarter:1,tasks:{},best:{}};renderNews();`);
assert(!elements['news-prev'].innerHTML.includes('감사'));
run(`const col=dayTasks(8).find(t=>t.collab);S.tasks[col.key]={s:'done',a:0};S.friend={recycling:1};renderNews();`);
assert(elements['news-prev'].innerHTML.includes(run(`Week.DEPT.recycling.friend[1]`)));
run(`S={day:2,quarter:1,tasks:{d1t1:{s:'done',a:1}},best:{}};renderNews();`);
assert(elements['news-prev'].innerHTML.includes('해법을 참고해 마쳤어요.'));
run(`S={day:1,quarter:2,tasks:{},best:{}};renderNews();`);
assert.equal(elements['news-rule'].textContent,run('Narrative.nextQuarter.day1News.rule'));
assert(elements['news-prev'].innerHTML.includes('같은 15일 업무'));
assert.equal(run("Core.LEVELS.find(l=>l.id==='L3').fixed.find(x=>x.id==='A').need.copy"),false);
assert.equal(run("Core.LEVELS.find(l=>l.id==='L6').fixed.find(x=>x.id==='C').need.copy"),true);
let expandedScenes=0;
if(fs.existsSync(here+'/character-expansion/before_data.json')){
 const keys=run('Object.keys(Narrative.characters)');
 for(const key of keys){
  for(const [count,level] of [[0,0],[1,1],[3,2],[5,3]]){
   run(`S={day:15,quarter:1,tasks:{},ledger:{},best:{},practice:{},friend:{},decor:[],ach:[],relBase:{${key}:${count}}};renderRecords();`);
   const profile=run(`Narrative.characters.${key}.profile`);
   assert.equal(run(`relLevel('${key}')`),level);
   assert(elements['records-body'].innerHTML.includes(profile.likes)===!!level);
   assert(elements['records-body'].innerHTML.includes(profile.dislikes)===(level>=2));
   const ep=run(`Narrative.characters.${key}.rel[3]`);
   ep.forEach(x=>assert(elements['records-body'].innerHTML.includes(x.line)===(level>=3)));
   if(level>=3)Object.values(profile.relations).forEach(x=>assert(elements['records-body'].innerHTML.includes(x)));
   if(level)expandedScenes++;
  }
 }
}
const report={status:'PASS',morningRendererScenarios:morningChecks,additionalScenarios:['optional request skipped/completed','assisted result','quarter 2 first-day briefing','L3/L6 original-copy destinations'],mode:'Actual renderNews/renderRecords with in-memory DOM elements and real Core/Week/Puzzles data',limitations:['Browser layout and mobile wrapping not tested','Not a full gameplay playthrough']};
if(expandedScenes)report.expandedRelationshipSceneChecks=expandedScenes;
fs.writeFileSync(here+'/context-review/render-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
