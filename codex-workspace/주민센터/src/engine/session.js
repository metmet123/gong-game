(function(root){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const unique=a=>new Set(a).size===a.length;
  function createSession(c){return {caseId:c.id,visitId:c.visitId,contentVersion:c.contentVersion,status:'editing',draft:{moverIds:[],addressId:'',householdMode:'',destinationHeadId:'',relationByPerson:{},disposition:'registered',followupReasonIds:[],revision:0},knowledge:{seenDocumentIds:[],answeredQuestionIds:[],verifiedFactIds:[],revision:0},view:{phase:'intake',boardTab:'before',selectionIds:[]},undo:[],redo:[],record:null};}
  function validateCase(c){
    const e=[],add=m=>e.push(m);
    if(!c||typeof c!=='object')return ['case missing'];
    const people=[...(c.people||[]),...(c.existing||[])];
    if(!c.id||!c.visitId||!unique(people.map(p=>p.id)))add('invalid or duplicate people');
    if(people.some(p=>!p.adult||!p.name))add('adult fictional people required');
    if(!c.people?.some(p=>p.id===c.before?.headId))add('source head absent');
    if(!unique(c.addresses?.map(a=>a.id)||[])||!c.addresses?.length)add('addresses invalid');
    if(!c.expected?.moverIds?.length||!unique(c.expected.moverIds)||c.expected.moverIds.some(id=>!c.people.some(p=>p.id===id)))add('movers invalid');
    if(!c.addresses?.some(a=>a.id===c.expected?.addressId))add('destination absent');
    if(!people.some(p=>p.id===c.expected?.headId))add('head absent');
    if(c.before?.relationByPerson?.[c.before.headId]!=='본인')add('source self relation absent');
    if(c.people?.some(p=>!own(c.before.relationByPerson,p.id)))add('source relations incomplete');
    if(c.expected?.moverIds?.some(id=>!c.expected.relations[id]))add('destination relations incomplete');
    if(c.expected?.headId&&c.expected.mode==='new'&&c.expected.relations[c.expected.headId]!=='본인')add('new head self relation invalid');
    if(!unique(c.documents?.map(d=>d.id)||[]))add('document IDs duplicated');
    const exposed=new Set([...(c.documents||[]).flatMap(d=>d.factIds),...(c.questions||[]).flatMap(q=>q.factIds)]);
    if(c.requiredFacts?.some(f=>!exposed.has(f)))add('unexposed required fact');
    return e;
  }
  function validateSession(c,s){
    if(!s||s.caseId!==c.id||s.visitId!==c.visitId||s.contentVersion!==c.contentVersion)return false;
    const d=s.draft,k=s.knowledge,v=s.view;
    if(!d||!k||!v||!['editing','resolved'].includes(s.status))return false;
    const ints=[d.revision,k.revision];if(ints.some(n=>!Number.isSafeInteger(n)||n<0))return false;
    if(!Array.isArray(d.moverIds)||!unique(d.moverIds)||d.moverIds.some(id=>!c.people.some(p=>p.id===id)))return false;
    if(d.addressId!==''&&!c.addresses.some(a=>a.id===d.addressId))return false;
    if(!['','new','join'].includes(d.householdMode)||!['registered','followup_requested'].includes(d.disposition))return false;
    const dest=c.addresses.find(a=>a.id===d.addressId),validHeads=d.householdMode==='join'?(dest?.existing||[]).map(p=>p.id):d.moverIds;
    if(d.destinationHeadId&&!validHeads.includes(d.destinationHeadId))return false;
    if(!d.relationByPerson||typeof d.relationByPerson!=='object'||Array.isArray(d.relationByPerson))return false;
    if(Object.entries(d.relationByPerson).some(([id,r])=>!d.moverIds.includes(id)||!['본인','배우자','자녀','부모','형제자매','동거인'].includes(r)||(r==='본인'&&id!==d.destinationHeadId)))return false;
    if(!Array.isArray(d.followupReasonIds)||!unique(d.followupReasonIds)||d.followupReasonIds.some(id=>!c.followupReasons.some(r=>r.id===id)))return false;
    const known=new Set(c.documents.filter(x=>x.status==='provided').flatMap(x=>x.factIds).concat(c.questions.flatMap(q=>q.factIds)));
    if(!Array.isArray(k.seenDocumentIds)||!unique(k.seenDocumentIds)||k.seenDocumentIds.some(id=>!c.documents.some(x=>x.id===id)))return false;
    if(!Array.isArray(k.answeredQuestionIds)||!unique(k.answeredQuestionIds)||k.answeredQuestionIds.some(id=>!c.questions.some(x=>x.id===id)))return false;
    if(!Array.isArray(k.verifiedFactIds)||!unique(k.verifiedFactIds)||k.verifiedFactIds.some(id=>!known.has(id)))return false;
    const earned=new Set(c.documents.filter(x=>x.status==='provided'&&k.seenDocumentIds.includes(x.id)).flatMap(x=>x.factIds).concat(c.questions.filter(q=>k.answeredQuestionIds.includes(q.id)).flatMap(q=>q.factIds)));
    if(k.verifiedFactIds.some(id=>!earned.has(id)))return false;
    if(!['intake','moving','composing','review','resolved'].includes(v.phase)||!['before','after'].includes(v.boardTab))return false;
    if(!Array.isArray(v.selectionIds)||!unique(v.selectionIds)||v.selectionIds.some(id=>!c.people.some(p=>p.id===id)||d.moverIds.includes(id)))return false;
    if(!Array.isArray(s.undo)||!Array.isArray(s.redo)||s.undo.length>30||s.redo.length>30)return false;
    return true;
  }
  const api={clone,createSession,validateCase,validateSession};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MoveInEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
