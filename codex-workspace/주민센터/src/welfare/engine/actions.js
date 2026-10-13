(function(root){'use strict';const node=typeof module!=='undefined'&&module.exports,E=node?require('./resolve.js'):root.WelfareEngine;
 function dispatch(c,s,a){const reject=message=>({accepted:false,state:s,issues:[{code:'rejected',message}]}),n=E.clone(s),d=n.draft,k=n.knowledge;let kind='view';
 if(!a||typeof a.type!=='string')return reject('조작 내용을 확인할 수 없어요.');
 if(s.status==='resolved'&&!['SWITCH_TAB','SELECT_PERSON','OPEN_SOURCE','TOGGLE_LIST'].includes(a.type))return reject('완료 기록은 바뀌지 않습니다. 다시 풀기는 체험으로 열어 주세요.');
 if(a.type==='OPEN_SOURCE'){if(!E.available(c,s,a.id))return reject('질문으로 먼저 확인할 자료입니다.');n.view.sourceId=a.id;if(s.status!=='resolved'&&!k.readSourceIds.includes(a.id)){k.readSourceIds.push(a.id);kind='knowledge';}}
 else if(a.type==='PIN_STATEMENT'){const e=E.evidence(c,a.id);if(!e||!E.available(c,s,e.source.id)||!k.readSourceIds.includes(e.source.id))return reject('자료를 먼저 읽어 주세요.');const at=k.pinnedStatementIds.indexOf(a.id);if(at<0)k.pinnedStatementIds.push(a.id);else{k.pinnedStatementIds.splice(at,1);for(const ids of Object.values(d.evidenceByClaim)){const i=ids.indexOf(a.id);if(i>=0)ids.splice(i,1);}d.priorityEvidence=d.priorityEvidence.filter(id=>id!==a.id);if(d.cooperationNote?.evidenceIds.includes(a.id))d.cooperationNote.evidenceIds=d.cooperationNote.evidenceIds.filter(id=>id!==a.id);d.revision++;}kind='knowledge';}
 else if(a.type==='ASK_QUESTION'){const q=c.questions.find(q=>q.id===a.id);if(!q||!E.questionReady(c,s,q))return reject('먼저 필요한 질문과 연락 동의 원문을 확인·보관해 주세요.');if(k.askedQuestionIds.includes(a.id))return {accepted:true,state:s,issues:[]};k.askedQuestionIds.push(a.id);if(!(s.options.agencyPending&&q.pendingText))n.view.sourceId=q.answerSourceId;kind='knowledge';}
 else if(a.type==='SET_CLAIM'){const cl=c.claimDefinitions.find(x=>x.id===a.id);if(!cl||(!cl.choices.includes(a.value)&&a.value!==''))return reject('이 판단의 선택지가 아닙니다.');d.claimsById[a.id]=a.value;kind='draft';}
 else if(a.type==='ATTACH_EVIDENCE'){if(!c.claimDefinitions.some(x=>x.id===a.id)||!E.usable(c,s,a.evidenceId))return reject('읽고 보관한 근거를 골라 주세요.');const ids=d.evidenceByClaim[a.id]||(d.evidenceByClaim[a.id]=[]),at=ids.indexOf(a.evidenceId);if(at>=0)ids.splice(at,1);else{if(ids.length>=2)return reject('판단 하나에는 근거 두 개까지 연결할 수 있어요.');ids.push(a.evidenceId);}kind='draft';}
 else if(a.type==='SET_PLAN'){if(!c.plans.some(x=>x.id===a.id))return reject('이 사건의 연결 계획이 아닙니다.');const at=d.plans.indexOf(a.id);if(at>=0)d.plans.splice(at,1);else d.plans.push(a.id);kind='draft';}
 else if(a.type==='SET_FOLLOWUP'){if(a.id!==''&&!c.followups.some(x=>x.id===a.id))return reject('확인 계획을 골라 주세요.');d.followup=a.id;kind='draft';}
 else if(a.type==='SET_PRIORITY'){if(!c.priorities?.some(x=>x.id===a.id))return reject('우선순위를 확인해 주세요.');d.priority=a.id;kind='draft';}
 else if(a.type==='PRIORITY_EVIDENCE'){if(!E.usable(c,s,a.id))return reject('보관한 근거를 선택해 주세요.');d.priorityEvidence=d.priorityEvidence.includes(a.id)?[]:[a.id];kind='draft';}
 else if(a.type==='SET_CONTACT_NOTE'){if(c.shortId!=='W01'||!E.usable(c,s,'E07'))return reject('전화 연락의 근거를 먼저 확인해 주세요.');d.cooperationNote=a.enabled?{personId:'P2',kind:'phone-contact',evidenceIds:['E07']}:null;kind='draft';}
 else if(a.type==='SWITCH_TAB'){if(!['source','relation','plan'].includes(a.value))return reject('화면을 선택해 주세요.');n.view.tab=a.value;}
 else if(a.type==='SELECT_PERSON'){if(!c.people.some(x=>x.id===a.id))return reject('인물을 선택해 주세요.');n.view.selectedPersonId=a.id;}
 else if(a.type==='TOGGLE_LIST')n.view.list=!n.view.list;
 else if(a.type==='HELP'){if(n.hintsSeen.length<3)n.hintsSeen.push(n.hintsSeen.length+1);}
 else if(a.type==='REVIEW'){n.review=E.review(c,s);}
 else if(a.type==='CONFIRM')return E.resolve(c,s,s.review);
 else return reject('지원하지 않는 조작입니다.');
 if(kind==='draft')d.revision++;if(kind==='knowledge')k.revision++;if(kind!=='view')n.review=null;n.revision++;return {accepted:true,state:n,issues:[]};
 }
 Object.assign(E,{dispatch});if(node)module.exports=E;
})(globalThis);
