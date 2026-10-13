(function(root){'use strict';const node=typeof module!=='undefined'&&module.exports,E=node?require('../engine/actions.js'):root.WelfareEngine,D=E.D;
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=x=>Number.isSafeInteger(x)&&x>=0;
 const ids=(a,allowed)=>E.unique(a)&&a.length<=allowed.length&&a.every(x=>allowed.includes(x));
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function validateSession(c,s){try{if(!obj(s)||s.caseId!==c.id||s.contentVersion!==1||!['editing','resolved'].includes(s.status)||!int(s.revision)||!obj(s.options)||typeof s.options.agencyPending!=='boolean'||s.options.agencyPending&&c.shortId!=='W02')return false;const k=s.knowledge,d=s.draft,v=s.view;
 if(!obj(k)||!obj(d)||!obj(v)||!int(k.revision)||!int(d.revision)||!ids(k.readSourceIds,c.sources.map(x=>x.id))||!ids(k.pinnedStatementIds,c.sources.flatMap(x=>x.statements.map(e=>e.id)))||!ids(k.askedQuestionIds,c.questions.map(x=>x.id)))return false;
 if(k.readSourceIds.some(id=>!E.available(c,s,id))||k.pinnedStatementIds.some(id=>!E.usable(c,s,id)))return false;
 // Validate the historical question order. Consent may be unpinned later, but its source must have been read.
 const seen=[];for(const id of k.askedQuestionIds){const q=c.questions.find(x=>x.id===id);if(q.prerequisites.some(p=>{const [type,x]=p.split(':');return type==='question'?!seen.includes(x):!k.readSourceIds.includes(E.evidence(c,x)?.source.id)||!E.available(c,{...s,knowledge:{...k,askedQuestionIds:seen}},E.evidence(c,x)?.source.id);} ))return false;seen.push(id);}
 if(!obj(d.claimsById)||!obj(d.evidenceByClaim)||Object.keys(d.claimsById).some(id=>!c.claimDefinitions.some(cl=>cl.id===id&&(cl.choices.includes(d.claimsById[id])||d.claimsById[id]==='')))||Object.entries(d.evidenceByClaim).some(([id,a])=>!c.claimDefinitions.some(cl=>cl.id===id)||!E.unique(a)||a.length>2||a.some(x=>!E.usable(c,s,x))))return false;
 if(!ids(d.plans,c.plans.map(x=>x.id))||!['',...c.followups.map(x=>x.id)].includes(d.followup)||!['',...(c.priorities||[]).map(x=>x.id)].includes(d.priority)||!E.unique(d.priorityEvidence)||d.priorityEvidence.length>1||d.priorityEvidence.some(x=>!E.usable(c,s,x)))return false;
 if(d.cooperationNote!==null&&(c.shortId!=='W01'||d.cooperationNote.personId!=='P2'||d.cooperationNote.kind!=='phone-contact'||!E.unique(d.cooperationNote.evidenceIds)||d.cooperationNote.evidenceIds.some(x=>x!=='E07'||!E.usable(c,s,x))))return false;
 if(!['source','relation','plan'].includes(v.tab)||!c.sources.some(x=>x.id===v.sourceId)||!E.available(c,s,v.sourceId)||!c.people.some(x=>x.id===v.selectedPersonId)||typeof v.list!=='boolean'||!obj(v.scrollByTab)||Object.entries(v.scrollByTab).some(([key,val])=>!['source','relation','plan'].includes(key)||!Number.isFinite(val)||val<0||val>100000)||!ids(s.hintsSeen,[1,2,3]))return false;
 if(s.review!==null&&!equal(s.review,E.review(c,s)))return false;
 if(s.status==='editing')return s.record===null;
 return E.review(c,s).status==='ready'&&equal(s.record,E.record(c,s));
 }catch(e){return false;}}
 function validRecord(c,r){try{if(!r?.snapshot)return false;const s=E.createSession(c,r.snapshot.options);s.knowledge=E.clone(r.snapshot.knowledge);s.draft=E.clone(r.snapshot.draft);s.view.sourceId=c.sources.find(x=>E.available(c,s,x.id)).id;s.status='resolved';s.record=E.clone(r);s.review=E.review(c,s);return validateSession(c,s);}catch(e){return false;}}
 function blank(){return {version:1,active:null,drafts:{},records:{},items:[],shiftIndex:1,seenReplyIds:[]};}
 function validate(w){try{if(!obj(w)||w.version!==1||!obj(w.drafts)||!obj(w.records)||!int(w.shiftIndex)||w.shiftIndex<1||w.shiftIndex>D.cases.length+1)return false;const keys=Object.keys(w.records);if(!ids(keys,D.cases.map(c=>c.shortId)))return false;for(const c of D.cases){if(w.records[c.shortId]&&!validRecord(c,w.records[c.shortId]))return false;}
 if(Object.entries(w.drafts).some(([id,s])=>D.get(id)?.shortId!==id||!validateSession(D.get(id),s)||s.status!=='editing'||w.records[id]))return false;
 if(w.active!==null&&(!D.get(w.active)||!w.drafts[w.active]&&!w.records[w.active]))return false;
 if(!ids(w.items,D.cases.map(c=>c.itemId))||!equal(w.items,D.cases.filter(c=>w.records[c.shortId]).map(c=>c.itemId)))return false;
 if(!ids(w.seenReplyIds,D.cases.map(c=>c.epilogue.eventId))||w.seenReplyIds.some(id=>!w.records[D.cases.find(c=>c.epilogue.eventId===id).shortId])||w.shiftIndex!==w.seenReplyIds.length+1)return false;
 return true;}catch(e){return false;}}
 function complete(w,s){const c=D.get(s.caseId);if(!validateSession(c,s)||s.status!=='resolved'||w.records[c.shortId])return null;const n=E.clone(w);n.records[c.shortId]=s.record;delete n.drafts[c.shortId];n.items=D.cases.filter(x=>n.records[x.shortId]).map(x=>x.itemId);n.active=c.shortId;return validate(n)?n:null;}
 const api={blank,validate,validateSession,validRecord,complete};if(node)module.exports=api;else root.WelfareStorage=api;
})(globalThis);
