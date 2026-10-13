(function(root){
  'use strict';
  const E=typeof module!=='undefined'&&module.exports?require('./actions.js'):root.MoveInEngine;
  function review(c,s){
    const issues=[],add=(target,message,source='report')=>issues.push({target,message,source});
    if(!E.validateSession(c,s))return {valid:false,issues:[{target:'record',message:'기록을 복원할 수 없습니다. 이 접수를 다시 열어 주세요.'}]};
    const d=s.draft,k=s.knowledge,expected=c.expected;
    if(d.disposition==='followup_requested'){
      if(!c.pending)add('disposition','현재 사례는 자료가 갖춰지거나 질문으로 확인할 수 있습니다. 필요한 내용을 확인하고 전입 처리를 선택해 주세요.');
      else if(!k.seenDocumentIds.includes('headcheck'))add('documents','전입지 세대주 확인 자료의 준비 상태를 먼저 살펴봐 주세요.','headcheck');
      if(!k.verifiedFactIds.includes('request'))add('documents','신고 내용을 읽고 어떤 방문인지 확인해 주세요.');
      if(d.followupReasonIds.length!==1||d.followupReasonIds[0]!=='headcheck')add('followup','이번 방문에서 부족한 확인 항목을 안내 사유로 선택해 주세요.','headcheck');
    }else{
      if(!k.verifiedFactIds.includes('request'))add('documents','자료철에서 신고 내용을 읽어 주세요.');
      if(c.addressQuestion&&!k.verifiedFactIds.includes('address'))add('questions','상세주소가 아직 확인되지 않았습니다. 주민에게 정확한 호수를 질문해 주세요.','address');
      if(!d.moverIds.length)add('people','이사 전 세대판에서 이동할 사람을 선택해 옮겨 주세요.');
      else if(c.people.some(p=>d.moverIds.includes(p.id)!==expected.moverIds.includes(p.id)))add('people','이동하는 사람과 남는 사람이 신고 내용과 다릅니다. 주민의 설명을 다시 확인해 주세요.');
      if(!d.addressId)add('address','새 주소와 상세주소를 선택해 주세요.');
      else if(d.addressId!==expected.addressId&&(!c.addressQuestion||k.verifiedFactIds.includes('address')))add('address','선택한 상세주소가 확인된 내용과 다릅니다. 자료나 질문 답변을 확인해 주세요.',c.addressQuestion?'address':'report');
      if(!d.householdMode)add('mode','새 세대 구성 또는 기존 세대 편입을 선택해 주세요.');
      else if(d.householdMode!==expected.mode)add('mode','선택한 세대 구성 방식이 주민의 요청과 다릅니다.');
      if(!d.destinationHeadId)add('head','이사 후 세대주를 지정해 주세요.');
      else if(d.destinationHeadId!==expected.headId)add('head','이사 후 세대주가 주민의 요청과 다릅니다.');
      if(d.destinationHeadId){for(const id of d.moverIds){if(!d.relationByPerson[id])add('relations',`${c.people.find(p=>p.id===id).name}의 세대주와의 관계를 선택해 주세요.`);else if(expected.relations[id]&&d.relationByPerson[id]!==expected.relations[id])add('relations',`${c.people.find(p=>p.id===id).name}의 관계는 이사 후 세대주를 기준으로 확인해 주세요.`);}}
      for(const fact of c.requiredFacts.filter(f=>!['request','address'].includes(f))){if(!k.verifiedFactIds.includes(fact)){const doc=c.documents.find(x=>x.factIds.includes(fact));add('documents',doc?.status==='missing'?'이번 사례의 전입지 세대주 확인 자료가 아직 없습니다. 보완 안내로 오늘의 접수를 마칠 수 있습니다.':`${doc?.title||'필요한 자료'}의 준비 상태를 자료창에서 확인해 주세요.`,doc?.id);}}
    }
    return {valid:!issues.length,issues,caseId:c.id,visitId:c.visitId,contentVersion:c.contentVersion,rulesVersion:c.rulesVersion,draftRevision:d.revision,knowledgeRevision:k.revision,outcome:d.disposition};
  }
  E.review=review;if(typeof module!=='undefined'&&module.exports)module.exports=E;
})(typeof globalThis!=='undefined'?globalThis:this);
