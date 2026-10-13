const assert = require('node:assert/strict');
const M = require('../../src/leaflet-a/model.js');
let checks=0;function check(name,fn){fn();checks++;console.log('PASS',name);}
function draft(id){const s=M.initial();s.inspect=id;s.selected=id;for(const scene of ['map','stand']){s.scene=scene;const r=M.capture(s);s.attachments[r.kind]=r.id;}return s;}
check('only one candidate satisfies actual properties',()=>assert.deepEqual(M.samples.filter(s=>Object.values(M.conditions(s)).every(Boolean)).map(s=>s.id),['s4']));
for(const [id,slot] of [['s1','map'],['s2','stand'],['s3','map']])check(id+' fails at correct attachment',()=>assert.equal(M.evaluate(draft(id)).issues[0].slot,slot));
check('early valid solution without wrong candidate visits',()=>assert.equal(M.complete(draft('s4')).ok,true));
check('missing evidence does not judge candidate',()=>{const s=M.initial();s.selected='s4';assert.equal(M.evaluate(s).issues.length,2);});
check('wrong candidate evidence cannot pass',()=>{const s=draft('s4');s.records[0].candidate='s2';assert.equal(M.evaluate(s).ok,false);});
check('wrong environment cannot pass',()=>{const s=draft('s4');s.records[1].environment='other';assert.equal(M.evaluate(s).ok,false);});
check('stale content version cannot pass',()=>{const s=draft('s4');s.records[0].version='old';assert.equal(M.evaluate(s).ok,false);});
check('capturing duplicate does not add record',()=>{const s=draft('s4');M.capture(s);assert.equal(s.records.length,2);});
check('investigation independent from selection and immutable record',()=>{const s=draft('s4'),r=JSON.stringify(s.records);s.inspect='s2';s.scene='front';assert.equal(s.selected,'s4');assert.equal(JSON.stringify(s.records),r);});
check('review correction preserves records',()=>{const s=draft('s2');M.complete(s);s.inspect='s4';s.selected='s4';M.changeDraft(s);assert.equal(s.review.stale,true);for(const scene of ['map','stand']){s.scene=scene;const r=M.capture(s);s.attachments[r.kind]=r.id;}assert.equal(M.complete(s).ok,true);assert.equal(s.records.length,4);});
check('restore preserves result identity and attempt',()=>{const s=draft('s4');M.complete(s);const r=M.restore(JSON.parse(JSON.stringify(s)));assert.deepEqual(r.result,s.result);M.complete(r);assert.equal(r.result.resultId,s.result.resultId);});
check('invalid result rejected and bad attachment recovered locally',()=>{const s=draft('s4');M.complete(s);s.records.pop();const r=M.restore(s);assert.equal(r.result,null);assert.equal(r.records.length,1);assert.equal(r.attachments.stand,null);});
check('invalid scene restored safely',()=>{const s=draft('s4');s.scene='partially-inserted';assert.equal(M.restore(s).scene,'front');});
check('old content starts clean independent attempt',()=>{const s=draft('s4');s.version='old';assert.equal(M.restore(s).records.length,0);});
check('blank scene cannot create evidence',()=>assert.equal(M.capture(M.initial()),null));
check('shuffled candidate display order survives restore',()=>{const s=M.initial();assert.equal(new Set(s.order).size,4);assert.deepEqual(M.restore(s).order,s.order);});
console.log(checks+' checks passed');
