(function(root){
  'use strict';
  const E=typeof module!=='undefined'&&module.exports?require('./session.js'):root.MoveInEngine;
  function dispatch(c,s,a){
    const reject=reason=>({accepted:false,session:s,reason});
    if(!a||!E.validateSession(c,s))return reject('상태 또는 행동을 확인해 주세요.');
    if(s.status==='resolved')return reject('완료 기록은 변경할 수 없습니다. 연습으로 다시 열어 주세요.');
    const n=E.clone(s),d=n.draft,k=n.knowledge,v=n.view;let edit=false,knowledge=false;
    const validPerson=id=>c.people.some(p=>p.id===id);
    switch(a.type){
      case 'SELECT_PERSON':if(!validPerson(a.id)||d.moverIds.includes(a.id))return reject('선택할 수 없는 사람입니다.');v.selectionIds=v.selectionIds.includes(a.id)?v.selectionIds.filter(id=>id!==a.id):[...v.selectionIds,a.id];break;
      case 'SWITCH_BOARD':if(!['before','after'].includes(a.value))return reject('세대판이 없습니다.');v.boardTab=a.value;break;
      case 'SET_PHASE':if(!['intake','moving','composing','review'].includes(a.value))return reject('단계가 없습니다.');v.phase=a.value;break;
      case 'OPEN_DOCUMENT':{const doc=c.documents.find(x=>x.id===a.id);if(!doc)return reject('자료가 없습니다.');if(!k.seenDocumentIds.includes(a.id))k.seenDocumentIds.push(a.id);if(!doc.check&&doc.status==='provided'){for(const f of doc.factIds)if(!k.verifiedFactIds.includes(f)){k.verifiedFactIds.push(f);knowledge=true;}}break;}
      case 'VERIFY_EVIDENCE':{const doc=c.documents.find(x=>x.id===a.id);if(!doc||!doc.check||doc.status!=='provided'||!k.seenDocumentIds.includes(a.id))return reject('제시된 자료를 먼저 열어 확인해 주세요.');for(const f of doc.factIds)if(!k.verifiedFactIds.includes(f)){k.verifiedFactIds.push(f);knowledge=true;}break;}
      case 'ASK_QUESTION':{const q=c.questions.find(x=>x.id===a.id);if(!q)return reject('질문이 없습니다.');if(!k.answeredQuestionIds.includes(q.id))k.answeredQuestionIds.push(q.id);for(const f of q.factIds)if(!k.verifiedFactIds.includes(f)){k.verifiedFactIds.push(f);knowledge=true;}break;}
      case 'MOVE_SELECTED':if(!v.selectionIds.length)return reject('옮길 사람을 선택해 주세요.');d.moverIds=[...new Set([...d.moverIds,...v.selectionIds])];v.selectionIds=[];v.boardTab='after';v.phase='composing';edit=true;break;
      case 'RETURN_PERSON':if(!d.moverIds.includes(a.id))return reject('이미 이전 집에 있습니다.');d.moverIds=d.moverIds.filter(id=>id!==a.id);delete d.relationByPerson[a.id];if(d.destinationHeadId===a.id){d.destinationHeadId='';d.relationByPerson={};}edit=true;break;
      case 'SET_ADDRESS':if(a.value!==''&&!c.addresses.some(x=>x.id===a.value))return reject('주소 후보가 없습니다.');if(d.addressId===a.value)break;d.addressId=a.value;if(d.householdMode==='join'){d.householdMode='';d.destinationHeadId='';d.relationByPerson={};}edit=true;break;
      case 'SET_HOUSEHOLD_MODE':{if(!['new','join'].includes(a.value))return reject('세대 구성을 선택해 주세요.');const dest=c.addresses.find(x=>x.id===d.addressId);if(a.value==='join'&&!dest?.existing.length)return reject('선택한 주소에 편입할 기존 세대가 없습니다.');if(d.householdMode===a.value)break;d.householdMode=a.value;d.destinationHeadId=a.value==='join'?dest.existing[0].id:'';d.relationByPerson={};edit=true;break;}
      case 'SET_DESTINATION_HEAD':if(d.householdMode!=='new'||(a.id!==''&&!d.moverIds.includes(a.id)))return reject('이 사람을 새 세대주로 지정할 수 없습니다.');if(d.destinationHeadId===a.id)break;d.destinationHeadId=a.id;d.relationByPerson=a.id?{[a.id]:'본인'}:{};edit=true;break;
      case 'SET_RELATION':if(!d.moverIds.includes(a.id)||a.id===d.destinationHeadId||!d.destinationHeadId||!['배우자','자녀','부모','형제자매','동거인',''].includes(a.value))return reject('세대주를 정한 뒤 관계를 선택해 주세요.');if(a.value)d.relationByPerson[a.id]=a.value;else delete d.relationByPerson[a.id];edit=true;break;
      case 'SET_DISPOSITION':if(!['registered','followup_requested'].includes(a.value))return reject('처리 방법이 없습니다.');d.disposition=a.value;edit=true;break;
      case 'SET_FOLLOWUP_REASON':if(!c.followupReasons.some(x=>x.id===a.id))return reject('안내 항목이 없습니다.');d.followupReasonIds=[a.id];edit=true;break;
      case 'UNDO':case 'REDO':{const from=a.type==='UNDO'?n.undo:n.redo,to=a.type==='UNDO'?n.redo:n.undo;if(!from.length)return reject('이전 편집이 없습니다.');to.push(E.clone(d));n.draft=from.pop();n.draft.revision=s.draft.revision+1;n.view.selectionIds=[];if(n.view.phase==='review')n.view.phase='composing';if(to.length>30)to.shift();return {accepted:true,session:n,reason:''};}
      default:return reject('지원하지 않는 행동입니다.');
    }
    const oldDraft=E.clone(s.draft);oldDraft.revision=d.revision;
    if(edit&&JSON.stringify(oldDraft)!==JSON.stringify(d)){n.undo.push(E.clone(s.draft));if(n.undo.length>30)n.undo.shift();n.redo=[];d.revision++;if(v.phase==='review')v.phase='composing';}
    if(knowledge){k.revision++;if(v.phase==='review')v.phase='composing';}
    if(!E.validateSession(c,n))return reject('변경할 수 없는 기록입니다.');
    return {accepted:true,session:n,reason:''};
  }
  E.dispatch=dispatch;if(typeof module!=='undefined'&&module.exports)module.exports=E;
})(typeof globalThis!=='undefined'?globalThis:this);
