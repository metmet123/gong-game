(function(root){'use strict';
 const node=typeof module!=='undefined'&&module.exports,D=node?require('../data/cases.js'):root.WelfareData;
 const clone=x=>JSON.parse(JSON.stringify(x)), unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
 function createSession(c,options={}){return {caseId:c.id,contentVersion:1,status:'editing',revision:0,options:{agencyPending:c.shortId==='W02'&&options.agencyPending===true},knowledge:{readSourceIds:[],pinnedStatementIds:[],askedQuestionIds:[],revision:0},draft:{claimsById:{},evidenceByClaim:{},plans:[],followup:'',priority:'',priorityEvidence:[],cooperationNote:null,revision:0},view:{tab:'source',sourceId:c.sources.find(x=>x.initiallyAvailable).id,selectedPersonId:c.people[0].id,list:false,scrollByTab:{}},review:null,record:null,hintsSeen:[]};}
 function available(c,s,id){const source=c.sources.find(x=>x.id===id);return !!source&&(source.initiallyAvailable||c.questions.some(q=>q.answerSourceId===id&&s.knowledge.askedQuestionIds.includes(q.id)&&!(s.options.agencyPending&&q.pendingText)));}
 function evidence(c,id){for(const source of c.sources){const statement=source.statements.find(x=>x.id===id);if(statement)return {source,statement};}return null;}
 function usable(c,s,id){const e=evidence(c,id);return !!e&&available(c,s,e.source.id)&&s.knowledge.readSourceIds.includes(e.source.id)&&s.knowledge.pinnedStatementIds.includes(id);}
 function questionReady(c,s,q){return q.prerequisites.every(p=>{const [kind,id]=p.split(':');return kind==='question'?s.knowledge.askedQuestionIds.includes(id):usable(c,s,id);});}
 function fingerprint(s){return JSON.stringify([s.caseId,s.contentVersion,s.options,s.knowledge,s.draft]);}
 const api={D,clone,unique,createSession,available,evidence,usable,questionReady,fingerprint};if(node)module.exports=api;else root.WelfareEngine=api;
})(globalThis);
