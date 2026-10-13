'use strict';
const assert=require('node:assert/strict');
const M=require('../src/core.js');
function ready(c){let s=M.initial(c);const act=a=>{s=M.reduce(c,s,a);};['report','identity'].forEach(id=>act({type:'read',id}));c.movers.forEach(id=>act({type:'select',id}));act({type:'move'});act({type:'address',value:c.newAddress});act({type:'mode',value:c.mode});if(c.mode==='new')act({type:'head',id:c.head});c.movers.filter(id=>id!==c.head).forEach(id=>act({type:'relation',id,value:c.relations[id]}));return s;}
let tests=0;
function test(label,fn){fn();tests++;console.log('PASS '+label);}
for(const c of M.cases){
  test(c.id+' correct mover/head/relationship combination',()=>{const s=ready(c),review=M.evaluate(c,s);assert.equal(review.valid,true);assert.equal(M.canSubmit(c,s,review),true);assert.deepEqual(c.movers.slice().sort(),s.moved.slice().sort());});
  test(c.id+' rejects wrong unit and stale review',()=>{const s=ready(c),review=M.evaluate(c,s),bad=M.reduce(c,s,{type:'address',value:'모퉁이로 12 · 201호'});assert.equal(M.canSubmit(c,bad,review),false);assert(M.evaluate(c,bad).errors.some(e=>e.target==='address'));assert.equal(s.address,c.newAddress);});
  test(c.id+' returning mover clears their relationship and review',()=>{const s=ready(c),id=c.movers[0],bad=M.reduce(c,s,{type:'return',id});assert(!bad.moved.includes(id));assert.equal(bad.relations[id],undefined);assert.equal(M.evaluate(c,bad).valid,false);if(s.head===id)assert.equal(bad.head,'');assert(s.moved.includes(id));});
  test(c.id+' confirmation materials must be read',()=>{const s=ready(c);s.read=['report'];assert(M.evaluate(c,s).errors.some(e=>e.target==='documents'));});
}
test('partial move leaves original head at previous residence',()=>{const c=M.cases[1],s=ready(c);assert(!s.moved.includes(c.oldHead));const bad=M.reduce(c,M.reduce(c,s,{type:'select',id:c.oldHead}),{type:'move'});assert(M.evaluate(c,bad).errors.some(e=>e.target==='people'));});
test('head change clears previous self relation',()=>{const c=M.cases[1],s=ready(c),changed=M.reduce(c,s,{type:'head',id:'bo'});assert.equal(changed.relations.bo,'본인');assert.equal(changed.relations.ga,undefined);assert(M.evaluate(c,changed).errors.some(e=>e.target==='head'));});
test('clearing head resets self relation',()=>{const c=M.cases[1],s=ready(c),changed=M.reduce(c,s,{type:'head',id:''});assert.equal(changed.head,'');assert.equal(changed.relations.ga,undefined);assert.equal(M.evaluate(c,changed).valid,false);});
test('relationship uses the destination head as its reference',()=>{const c=M.cases[1],s=ready(c),changed=M.reduce(c,s,{type:'relation',id:'bo',value:'자녀'});assert(M.evaluate(c,changed).errors.some(e=>e.target==='relations'));assert.equal(s.relations.bo,'형제자매');});
test('mode changes invalidate relationship draft and review',()=>{const c=M.cases[2],s=ready(c),changed=M.reduce(c,s,{type:'mode',value:'new'});assert.equal(changed.head,'');assert.deepEqual(changed.relations,{});assert.equal(M.canSubmit(c,changed,M.evaluate(c,s)),false);});
test('duplicate reading and unchanged mode are idempotent',()=>{const c=M.cases[1],s=ready(c);assert.strictEqual(M.reduce(c,s,{type:'read',id:'report'}),s);assert.strictEqual(M.reduce(c,s,{type:'mode',value:s.mode}),s);});
test('moved people cannot be selected a second time',()=>{const c=M.cases[1],s=ready(c);assert.strictEqual(M.reduce(c,s,{type:'select',id:'ga'}),s);});
test('unknown action never changes the state',()=>{const c=M.cases[0],s=M.initial(c);assert.strictEqual(M.reduce(c,s,{type:'nonsense'}),s);assert.strictEqual(M.reduce(c,s,{type:'select',id:'unknown'}),s);});
console.log(`${tests} tests passed.`);
