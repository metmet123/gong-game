(function(root){'use strict';const node=typeof module!=='undefined'&&module.exports,E=node?require('./session.js'):root.WelfareEngine;
 function review(c,s){const issues=[],d=s.draft;const add=(code,target,message)=>issues.push({code,target,message});const paths=s.options.agencyPending&&c.pendingPath?[c.pendingPath]:c.acceptedPaths;
 // Accepted paths describe combinations, rather than accepting a correct label without its source.
 const path=paths[0];for(const cl of c.claimDefinitions){const v=d.claimsById[cl.id],needed=path.claims[cl.id];if(!v){if(needed)add('incomplete',cl.id,cl.label+'를 직접 판단해 주세요.');continue;}const ids=d.evidenceByClaim[cl.id]||[];if(!ids.length)add('missing-evidence',cl.id,cl.label+'의 근거를 연결해 주세요.');else if(ids.some(id=>!E.usable(c,s,id)))add('inaccessible-evidence',cl.id,'읽고 보관한 원문만 판단의 근거로 사용할 수 있어요.');
 if(needed&&v!==needed.value)add('contradicts-source',cl.id,'선택한 판단이 자료의 대상과 현재 시점에 맞는지 비교해 주세요.');
 if(needed&&ids.length&&!needed.evidenceAnyOf.some(group=>group.every(id=>ids.includes(id))&&ids.every(id=>group.includes(id))))add('unsupported-evidence',cl.id,(['W01','W02','W03'].includes(c.shortId)?'이 원문이 해당 판단을 뒷받침하는지 확인해 주세요. 과거 기록은 현재 상황의 근거와 구분합니다.':'연결한 원문이 이 판단의 대상·시점·도움 범위를 모두 뒷받침하는지 확인해 주세요.'));
 }
 if(c.shortId==='W01'&&!d.claimsById.C3){const n=d.cooperationNote;if(!n||n.personId!=='P2'||n.kind!=='phone-contact'||JSON.stringify(n.evidenceIds)!==JSON.stringify(['E07'])||!E.usable(c,s,'E07'))add('missing-contact','C3','전화 연락 여부는 관계 카드 또는 협력 메모에 근거와 함께 남겨 주세요.');else{const i=issues.findIndex(x=>x.target==='C3'&&x.code==='incomplete');if(i>=0)issues.splice(i,1);}}
 if(d.plans.length!==path.plans.length||!path.plans.every(id=>d.plans.includes(id)))add('unsupported-plan','plan','확인한 문제에 필요한 상담 연결을 선택해 주세요. 제공 확정이나 근거 없는 종결은 상담 인계와 다릅니다.');
 for(const id of d.plans){const p=c.plans.find(x=>x.id===id);if(!p||p.evidenceIds.some(e=>!E.usable(c,s,e)))add('plan-evidence','plan','연결할 문제·주민 동의·상담 창구의 원문을 읽고 보관해 주세요.');}
 if(d.followup!==path.followup)add('followup','plan','확인이 끝난 부분과 남은 부분을 나누어, 담당 직원의 다음 근무일 확인을 기록해 주세요.');
 if(path.priority&&(d.priority!==path.priority||JSON.stringify(d.priorityEvidence)!==JSON.stringify(path.priorityEvidence)||d.priorityEvidence.some(e=>!E.usable(c,s,e))))add('priority','plan','주민이 말한 기한과 선호를 근거로 우선 연결할 상담을 정해 주세요.');
 if(s.options.agencyPending&&!s.knowledge.askedQuestionIds.includes('Q03'))add('pending-unrequested','source','기관에 먼저 기간 확인을 요청하고, 답변 대기를 인계해 주세요.');
 return {status:issues.length?(issues.some(x=>['incomplete','missing-evidence','missing-contact','followup'].includes(x.code))?'incomplete':'needs-check'):'ready',issues,fingerprint:E.fingerprint(s)};
 }
 Object.assign(E,{review});if(node)module.exports=E;
})(globalThis);
