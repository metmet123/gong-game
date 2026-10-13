const assert=require('node:assert/strict');
const G=require('./game-core.js');
let checks=0;
function answer(p){return p.errors||p.expected||(p.type==='memory'?Object.fromEntries(p.fields.map(f=>[f.key,f.answer])):p.type==='sequence'?p.target:p.answer);}
for(let day=1;day<=100;day++){
 for(const task of G.tasks(day))for(const difficulty of ['easy','normal','hard']){
  const p=G.generate(task,difficulty),correct=answer(p);
  assert.ok(G.evaluate(p,correct).ok,`${task.id} ${task.type} ${difficulty} correct answer rejected`);
  assert.deepEqual(p,G.generate(task,difficulty),'Problem changes for the same seed');
  if(p.type==='compare'){
   const actual=p.submitted.filter((f,i)=>f.value!==p.originals[i].value).map(f=>f.key);
   assert.deepEqual([...actual].sort(),[...p.errors].sort());
   assert.equal(G.evaluate(p,[]).ok,false);
   const falsePositive=p.originals.find(f=>!p.errors.includes(f.key));assert.equal(G.evaluate(p,[...correct,falsePositive.key]).ok,false);
  }
  if(p.type==='sort'){
   const latest=p.depts.map(dept=>p.files.filter(f=>f.dept===dept&&f.year===p.year&&f.approved).sort((a,b)=>b.version-a.version)[0].id);
   assert.deepEqual([...p.expected].sort(),latest.sort());assert.equal(G.evaluate(p,[]).ok,false);
  }
  if(p.type==='memory'){
   p.fields.forEach(f=>assert.equal(new Set(f.options).size,f.options.length));
   assert.equal(G.evaluate(p,{}).incomplete,true);
   const bad={...correct};bad[p.fields[0].key]='wrong';assert.equal(G.evaluate(p,bad).ok,false);
  }
  if(p.type==='sequence'){
   assert.equal(G.evaluate(p,[...p.target].reverse()).ok,false);
   if(difficulty==='hard')assert.equal(G.evaluate(p,['collect','filter','dedup','sum','submit']).ok,true,'Commutative cleaning steps rejected');
   const corrupt={...p,tests:p.tests.map((t,i)=>i?{...t,expected:999}:t)};assert.equal(G.evaluate(corrupt,p.target).ok,false,'Second input is not being validated');
  }
  if(p.type==='route'){assert.ok(p.options.includes(p.answer));assert.equal(G.evaluate(p,'').incomplete,true);assert.equal(G.evaluate(p,p.options.find(o=>o!==p.answer)).ok,false);}
  checks++;
 }
}
let s=G.blank();s.started=true;
assert.equal(G.endDay(s),false,'Premature retirement allowed');
for(let day=1;day<=5;day++){
 assert.equal(s.day,day);
 for(const task of G.tasks(day)){
  s.startedTasks[task.id]='normal';const p=G.generate(task,'normal');assert.ok(G.evaluate(p,answer(p)).ok);
  const reward=G.complete(s,task,{difficulty:'normal',time:20});assert.equal(reward.score,100);
  const snapshot=JSON.stringify(s);assert.equal(G.complete(s,task),null,'Duplicate reward');assert.equal(JSON.stringify(s),snapshot);
  s=G.validateSave(JSON.parse(JSON.stringify(s)));
 }
 assert.equal(G.todayRecords(s).length,4);const report=G.endDay(s);assert.equal(report.perfect,4);assert.equal(s.energy,100);
 s=G.validateSave(JSON.parse(JSON.stringify(s)));
}
assert.equal(s.xp,300);assert.equal(s.coins,505);assert.equal(s.day,6);assert.equal(Object.values(s.stats).reduce((a,x)=>a+x.cleared,0),20);
assert.equal(G.buyTool(s,'auto'),true);const after=s.coins;assert.equal(G.buyTool(s,'auto'),false);assert.equal(s.coins,after);
assert.equal(G.buyTool(G.blank(),'preview'),false,'Level requirement bypassed');
assert.equal(G.buyDecor(s,'plant'),true);assert.equal(G.buyDecor(s,'plant'),false);s=G.validateSave(JSON.parse(JSON.stringify(s)));
const bad=JSON.parse(JSON.stringify(s));bad.settings.difficulty='invalid';assert.throws(()=>G.validateSave(bad));
const negative=JSON.parse(JSON.stringify(s));negative.coins=-2;assert.throws(()=>G.validateSave(negative));
const fakeStats=JSON.parse(JSON.stringify(s));fakeStats.stats.sort.cleared=99999;assert.notEqual(G.validateSave(fakeStats).stats.sort.cleared,99999);
const penalty=G.blank(),task=G.tasks(1)[0];penalty.wrong[task.id]=2;assert.equal(G.complete(penalty,task).score,80);
const learning=G.blank();assert.equal(G.complete(learning,task,{assisted:true}).score,60);assert.equal(learning.xp,15);assert.equal(learning.coins,50);
console.log(`PASS: ${checks} deterministic puzzle variants, correct/incorrect judgments, commutative automation, 5-day campaign, duplicate-reward guards, restore, purchases, and import validation.`);
