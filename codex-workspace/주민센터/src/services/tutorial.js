(function(root){
  'use strict';
  const node=typeof module!=='undefined'&&module.exports,E=node?require('../engine/resolve.js'):root.MoveInEngine;
  const id='resident-center:tutorial-family';
  const c={id,visitId:id,contentVersion:1,rulesVersion:1,title:'두 사람의 첫 독립 주소',subtitle:'첫 접수 · 관계 추론',resident:'ga',people:[{id:'chae',name:'김채림',adult:true,palette:3},{id:'ga',name:'이가온',adult:true,palette:0},{id:'bo',name:'이보람',adult:true,palette:2}],existing:[],before:{address:'나무길 8 · 101호',headId:'chae',memberIds:['chae','ga','bo'],relationByPerson:{chae:'본인',ga:'자녀',bo:'자녀'},active:true},addresses:[{id:'family-home',label:'모퉁이로 12 · 202호',existing:[]}],expected:{moverIds:['ga','bo'],addressId:'family-home',mode:'new',headId:'ga',relations:{ga:'본인',bo:'형제자매'},outcome:'registered'},questions:[],followupReasons:[],requiredFacts:['request','ledger','headrequest'],documents:[
    {id:'story',title:'주민의 말 · 이번 이사',status:'provided',check:false,factIds:['request'],lines:['“보람이랑 저는 이번에 새집으로 이사를 마쳤어요. 어머니는 나무길 집에 그대로 계세요.”','“새 주소는 모퉁이로 12, 202호예요.”']},
    {id:'ledger',title:'이전 집의 주소 기록',status:'provided',check:false,factIds:['ledger'],lines:['나무길 8 · 101호의 기록입니다. 기준 사람은 김채림입니다.']},
    {id:'request',title:'주민의 부탁 · 새집 기록',status:'provided',check:false,factIds:['headrequest'],lines:['“새집에서는 제 이름, 이가온을 기준으로 함께 사는 사람을 적어 주세요.”','두 사람이 새로 구성하는 집의 기록입니다.']}],ending:'어머니 주소는 그대로고, 저희 둘만 새집으로 바뀌었네요. 감사합니다.'};
  function create(){let s=E.createSession(c);for(const a of [{type:'SET_ADDRESS',value:'family-home'},{type:'SET_HOUSEHOLD_MODE',value:'new'},{type:'OPEN_DOCUMENT',id:'story'}])s=E.dispatch(c,s,a).session;s.undo=[];return {version:1,active:true,session:s,reason:'',hintLevel:0,attempted:false};}
  function validate(t,recordCheck){if(!t||t.version!==1||typeof t.active!=='boolean'||!['','new-head','copy','order'].includes(t.reason)||!Number.isInteger(t.hintLevel)||t.hintLevel<0||t.hintLevel>2||typeof t.attempted!=='boolean'||!E.validateSession(c,t.session))return false;const s=t.session;if(s.undo.length||s.redo.length||!['intake','composing','review','resolved'].includes(s.view.phase)||s.view.selectionIds.length||s.draft.addressId!=='family-home'||s.draft.householdMode!=='new'||s.draft.disposition!=='registered'||s.draft.followupReasonIds.length)return false;if(s.status==='editing')return s.record===null;return t.reason==='new-head'&&E.review(c,s).valid&&!!recordCheck?.(c,s.record);}
  function review(t){const r=E.review(c,t.session);const messages={people:['이번에 주소가 바뀐 사람의 범위를 주민의 말과 대조해 주세요.','story'],head:['새집의 기준 사람을 주민의 부탁과 대조해 주세요.','request'],relations:['선택한 관계가 지금 기준 사람과의 관계인가요? 이전 기록의 연결을 확인해 주세요.','ledger']};r.issues=r.issues.map(i=>{const m=messages[i.target];return {target:i.target,message:m?.[0]||'판단의 근거 자료를 열어 확인해 주세요.',source:m?.[1]||(i.source==='report'?'story':i.source)};});if(t.reason!=='new-head')r.issues.push({target:'reason',message:'관계를 적은 이유를 선택하고 지금 기준과 일치하는지 확인해 주세요.'});r.valid=!r.issues.length;return r;}
  function act(t,a){const reject=reason=>({accepted:false,state:t,reason});if(!t||t.session.status==='resolved')return reject('완료 기록은 변경할 수 없습니다.');const n=E.clone(t),s=n.session,d=s.draft;const dispatch=x=>{const r=E.dispatch(c,n.session,x);if(!r.accepted)throw Error(r.reason);n.session=r.session;};try{
    let edit=false;
    if(a.type==='MOVE'){if(!c.people.some(p=>p.id===a.id))return reject('사람을 확인해 주세요.');if(d.moverIds.includes(a.id))dispatch({type:'RETURN_PERSON',id:a.id});else{dispatch({type:'SELECT_PERSON',id:a.id});dispatch({type:'MOVE_SELECTED'});}for(const personId of Object.keys(n.session.draft.relationByPerson))if(personId!==n.session.draft.destinationHeadId)dispatch({type:'SET_RELATION',id:personId,value:''});dispatch({type:'SET_PHASE',value:'composing'});edit=true;}
    else if(a.type==='HEAD'){dispatch({type:'SET_DESTINATION_HEAD',id:a.id});edit=s.draft.destinationHeadId!==a.id;}
    else if(a.type==='RELATION'){dispatch({type:'SET_RELATION',id:a.id,value:a.value});edit=d.relationByPerson[a.id]!==a.value;}
    else if(a.type==='REASON'){if(!['new-head','copy','order'].includes(a.value))return reject('판단 이유를 확인해 주세요.');n.reason=a.value;n.attempted=false;}
    else if(a.type==='PHASE'){if(!['intake','composing','review'].includes(a.value))return reject('장면을 확인해 주세요.');dispatch({type:'SET_PHASE',value:a.value});n.attempted=false;}
    else if(a.type==='READ'){const phase=n.session.view.phase;dispatch({type:'OPEN_DOCUMENT',id:a.id});dispatch({type:'SET_PHASE',value:phase});}
    else if(a.type==='HELP')n.hintLevel=Math.min(2,n.hintLevel+1);
    else if(a.type==='CONFIRM'){n.attempted=true;const r=review(n);if(r.valid){const resolved=E.resolve(c,n.session,E.review(c,n.session));if(!resolved.accepted)return reject(resolved.reason);n.session=resolved.session;}}
    else return reject('지원하지 않는 행동입니다.');
    if(edit){n.reason='';n.attempted=false;}n.session.undo=[];n.session.redo=[];return {accepted:true,state:n,reason:''};
  }catch(error){return reject(error.message);}}
  const api={case:c,create,validate,review,act};if(node)module.exports=api;else root.MoveInTutorial=api;
})(typeof globalThis!=='undefined'?globalThis:this);
