/* Independent E01 presentation. The four supplied puzzle proposals contribute no code or rules. */
(() => {
 'use strict';
 const E = window.E01Episode;
 const $ = id => document.getElementById(id);
 let state = E.initialState(), history = [], selected = null, touched = new Set(), errors = new Set();
 let note = '제작 카드에 20칩을 놓고, 남는 칩으로 지원을 골라보세요.', bad = false;
 const icons = {
 print: '<svg viewBox="0 0 130 110" aria-hidden="true"><path d="M19 35h85v60H19z" fill="#c9c9a5" stroke="#5d7350" stroke-width="3"/><path d="M25 29h85v60H25z" fill="#e9e5c8" stroke="#5d7350" stroke-width="3"/><path d="M31 22h85v60H31z" fill="#fffaf0" stroke="#5d7350" stroke-width="3"/><path d="M42 34h62v8H42z" fill="#7e9c64"/><path d="M42 51h38M42 60h53M42 68h45" stroke="#a8b998" stroke-width="4"/><circle cx="105" cy="83" r="18" fill="#edc45c" stroke="#a77829" stroke-width="2"/><path d="m96 83 6 6 12-14" fill="none" stroke="#886122" stroke-width="4"/></svg>',
 stand: '<svg viewBox="0 0 80 60" aria-hidden="true"><path d="M31 41 21 56M49 41 59 56" stroke="#6a704f" stroke-width="4"/><rect x="13" y="7" width="54" height="38" rx="3" fill="#edf3d5" stroke="#66834e" stroke-width="3"/><path d="M23 17h32M23 24h22M23 31h28" stroke="#89a767" stroke-width="3"/><rect x="33" y="35" width="14" height="8" fill="#d6a93c"/></svg>',
 delivery: '<svg viewBox="0 0 80 60" aria-hidden="true"><path d="M6 17h42v30H6z" fill="#9db8c7" stroke="#557385" stroke-width="3"/><path d="M48 27h15l11 11v9H48z" fill="#b9cbd3" stroke="#557385" stroke-width="3"/><path d="M53 30h8l7 8H53z" fill="#f3eddc"/><circle cx="20" cy="48" r="7" fill="#475b57"/><circle cx="62" cy="48" r="7" fill="#475b57"/><path d="M16 27h20M16 33h15" stroke="#f3eddc" stroke-width="3"/></svg>',
  proof: '<svg viewBox="0 0 80 60" aria-hidden="true"><path d="M16 6h38v47H16z" fill="#fffaf0" stroke="#8c9b80" stroke-width="3"/><path d="M24 18h20M24 26h17M24 34h20" stroke="#abb793" stroke-width="3"/><circle cx="54" cy="37" r="12" fill="#e1eac9dd" stroke="#618257" stroke-width="3"/><path d="m62 46 11 10" stroke="#618257" stroke-width="5"/><path d="m48 37 4 4 8-9" stroke="#638052" stroke-width="2" fill="none"/></svg>',
  clip:'<svg class="paperclip" viewBox="0 0 20 30" aria-hidden="true"><path d="M14 12v10a6 6 0 0 1-12 0V7a5 5 0 0 1 10 0v14a3 3 0 0 1-6 0V9" fill="none" stroke="#84938b" stroke-width="2.3" stroke-linecap="round"/></svg>'
 };
 // Estimate data is shared by the number picker and the attachment picker.
 const records = {
  plan: [{name:'지난달 배부계획',date:'9월 3일 · 보관함',value:150},{name:'이번 사업 배부계획',date:'10월 11일 · 팀장 전달',value:200}],
  estimate: [{name:'인쇄소 견적서',date:'10월 10일 · 접수',unit:1000,version:1},{name:'인쇄소 견적서',date:'10월 11일 · 재접수',unit:1100,version:2}],
  notice: [{name:'창구 운영 공지',date:'9월 1일 · 시행',hours:'09:00–17:00',version:1},{name:'창구 운영 공지',date:'10월 1일 · 시행',hours:'09:00–18:00',version:2}],
  specimen: [{name:'인쇄 규격 견본',date:'10월 10일 · 보관본',hours:'09:00–17:00',version:1},{name:'인쇄 규격 견본',date:'10월 11일 · 전달본',hours:'09:00–18:00',version:2}]
 };
 const fieldNames = {quantity:'제작 수량',unit:'제작 단가',version:'운영시간',estimate:'붙임 · 견적서',specimen:'붙임 · 규격 견본'};
 const values = {quantity:()=>`${state.document.quantity}부`,unit:()=>`${state.document.unit.toLocaleString()}원`,version:()=>state.document.version===2?'09:00–18:00':'09:00–17:00'};
 if(new URLSearchParams(location.search).get('scene') === 'document') {
  state.chips=22; state.options=['stand']; state.priceRaised=true; state.lockedBudget=true; state.stage=1; state.highest=1;
  note='지난 기안문을 이번 사업에 맞게 고쳐요. 바꿀 칸을 눌러보세요.';
 }
 function stash() { history.push({state:JSON.parse(JSON.stringify(state)),touched:[...touched],note}); }
 function dispatch(action) {
  const result = E.apply(state,action);
  if(result.ok && result.state.revision!==state.revision) stash();
  state=result.state; note=result.message; bad=!result.ok; render();
  if(result.ok) { $('board').classList.remove('flash'); void $('board').offsetWidth; $('board').classList.add('flash'); }
 }
 function notify(message,isError=false) { note=message;bad=isError;render();if(isError){$('message').classList.add('shake');} }
 function chipsMarkup(n) {
  if(!n) return '<span class="ghost">10</span><span class="ghost">10</span><small style="color:#8c8c69;font-size:10px">비어 있음</small>';
  let html='';for(let i=0;i<Math.floor(n/10);i++) html+='<span class="coin stack" aria-label="10칩 묶음">10</span>';
  if(n%10)html+=`<span class="coin" aria-label="${n%10}칩">${n%10}</span>`;
  return html;
 }
 function budgetHTML() {
  const reserve=E.totals(state).reserve, support=E.optionCost(state)/10000, required=state.priceRaised?22:20, need=required-state.chips;
  return `<div class="budget-scene">
   <div class="budget-hud" aria-label="예산 배정 현황"><div>총 예산<strong>26<em>칩</em></strong></div><div>배정<strong>${state.chips+support}<em>칩</em></strong></div><div class="free">미배정<strong>${reserve}<em>칩</em></strong></div></div>
   <div class="allocation-bar" aria-hidden="true"><i class="printing" style="width:${state.chips/26*100}%"></i><i class="support" style="width:${support/26*100}%"></i><i class="free" style="width:${reserve/26*100}%"></i></div>
   <div class="desk-label">오늘의 필수 사업 <span>1칩 = 10,000원</span></div>
   <div class="printing-card" id="print-card"><div class="print-art">${icons.print}<div class="quantity-tag">목표 200부</div></div><div class="print-work"><h2>이용 안내 홍보물</h2><div class="meta">${state.priceRaised?'인쇄소 재견적 · 부당 1,100원':'첫 견적 · 부당 1,000원'}</div><div class="chip-piles">${chipsMarkup(state.chips)}</div><div class="print-controls">${state.chips===0?'<button class="allocate" data-action="base" draggable="true">20칩 놓기 ↓</button>':`<button data-action="minus" aria-label="제작 예산 1칩 돌려놓기">−</button><button data-action="plus" aria-label="제작 예산 1칩 더 놓기">+</button><b class="print-count">${state.chips}<span> / ${required}칩</span></b>`}</div></div></div>
   <div class="reserve-box"><span class="reserve-icon" aria-hidden="true">▱</span><div><b>남겨둔 예산</b><small>돌발 상황에 꺼내 쓸 수 있어요.</small></div><span class="reserve-num">${reserve}<small style="display:inline">칩</small></span></div>
   <div class="desk-label">선택 지원 <span>누르면 배정 · 다시 누르면 회수</span></div>
   <div class="support-deck">${Object.entries(E.options).map(([id,o])=>`<button class="support-card ${state.options.includes(id)?'chosen':''}" data-option="${id}" aria-pressed="${state.options.includes(id)}" aria-label="${o.name} ${o.cost/10000}칩 ${state.options.includes(id)?'배정 취소':'배정'}"><span class="cost-tag">${o.cost/10000}칩</span>${icons[id]}<b>${o.name}</b><span class="effect">${{stand:'창구에 안내판 설치',delivery:'배송 카트 이용',proof:'비교 교정지 제공'}[id]}</span><span class="select-state">${state.options.includes(id)?'✓ 배정됨 · 회수':'＋ 선택하기'}</span></button>`).join('')}</div>
   ${state.priceRaised?`<div class="quote-note ${need>reserve?'bad':''}"><span class="phone-icon" aria-hidden="true">☎</span><div class="quote-copy"><b>${need>0?'인쇄소: “단가가 올랐어요!”':'재견적 반영 완료'}</b><p>${need>0?`제작비 +${need}칩 · ${need>reserve?'지원 카드를 회수해 칩을 확보해요.':'남긴 예산에서 옮길 수 있어요.'}`:need<0?'제작비를 22칩으로 맞춰주세요.':'홍보물 200부 · 제작 22칩 준비 완료'}</p></div>${need>0?`<button data-action="topup" ${need>reserve?'disabled':''} aria-label="남긴 예산에서 제작에 ${need}칩 옮기기">${need}칩 옮기기</button>`:''}</div>`:'<div class="quote-note"><span class="phone-icon" aria-hidden="true">☎</span><div class="quote-copy"><b>인쇄소가 최종 견적을 보내준대요.</b><p>제작비를 배정하고 아래에서 견적을 확인하세요.</p></div></div>'}
  </div>`;
 }
 function fieldHTML(field,label) {
  const cls=[touched.has(field)?'touched':'',selected===field?'active':'',errors.has(field)?'bad':''].join(' ');
  return `<div class="edit-row"><label id="label-${field}">${label}</label><button class="field ${cls}" data-field="${field}" aria-labelledby="label-${field}" aria-expanded="${selected===field}" aria-controls="evidence-dock"><span>${values[field]()}</span><small>${selected===field?'자료 닫기':errors.has(field)?'! 다시 확인':touched.has(field)?'↗ 가져옴':'✎ 수정'}</small></button></div>`;
 }
 function attachHTML(field,name) {
  const version=state.document[field],cls=[touched.has(field)?'touched':'',selected===field?'active':'',errors.has(field)?'bad':''].join(' ');
  return `<button class="attachment ${cls}" data-field="${field}" aria-label="붙임 ${name} 교체" aria-expanded="${selected===field}" aria-controls="evidence-dock">${icons.clip}<span>${name}<small>${version===2?'10/11 전달본':'10/10 보관본'} · ${selected===field?'닫기':errors.has(field)?'! 확인':'교체 ↗'}</small></span></button>`;
 }
 function dockHTML() {
  if(!selected) return '<div class="dock-heading"><span>▱ 참고자료 서류함</span></div><p class="dock-help">공문의 점선 칸을 누르면 관련 자료가 펼쳐져요.</p><div class="source-index"><span>배부계획</span><span>견적서</span><span>운영 공지</span><span>규격 견본</span></div>';
  const key={quantity:'plan',unit:'estimate',version:'notice',estimate:'estimate',specimen:'specimen'}[selected];
  const rows=records[key];
  return `<div class="dock-heading"><span>공문 · ${fieldNames[selected]}에 가져오기</span></div><div class="source-choices">${rows.map((r,i)=>{
   const value=selected==='quantity'?r.value:selected==='unit'?r.unit:r.version;
   const copy=selected==='quantity'?`${r.value}부`:selected==='unit'?`${r.unit.toLocaleString()}원`:selected==='estimate'?`200부 × ${r.unit.toLocaleString()}원`:r.hours;
   return `<button class="source" data-source="${value}" data-source-index="${i}" aria-label="${r.name} ${r.date} ${copy} 가져오기"><b>${r.name}</b><small>${r.date}</small><span class="value">${copy}</span><span class="use">${['estimate','specimen'].includes(selected)?'클립으로 묶기':'이 값 가져오기'} ↗</span></button>`;
  }).join('')}</div>`;
 }
 function docHTML() {
  return `<div class="doc-scene"><div class="desk-mat"><article class="paper" aria-label="홍보물 제작 계획 기안문"><div class="paper-header"><span class="doc-mark">공</span><b>모서리구청</b><small>생활보장과</small></div><div class="approval-strip" aria-label="결재란"><span class="own">담당<br>작성 중</span><span>협조<br>다음 단계</span><span>계장<br>다음 단계</span><span>과장<br>다음 단계</span></div><div class="doc-to">수신　내부결재</div><h2 class="doc-title">제목　창구 이용 안내 홍보물 제작 계획</h2><p class="doc-line">주민 안내를 위해 다음과 같이 제작하고자 합니다.</p>${fieldHTML('quantity','1. 수량')}${fieldHTML('unit','2. 단가')}${fieldHTML('version','3. 시간')}<div class="calc-line">산출기초　${state.document.quantity}부 × ${state.document.unit.toLocaleString()}원 = <b>${(state.document.quantity*state.document.unit).toLocaleString()}원</b></div><div class="attachments-label"><span>붙임 <small>· 종이를 바꿔 끼워요</small></span><small>${[...touched].filter(f=>['estimate','specimen'].includes(f)).length} / 2 교체</small></div><div class="attachment-row">${attachHTML('estimate','견적서')}${attachHTML('specimen','규격 견본')}</div><div class="paper-end">각 1부.　끝.</div></article></div><aside class="evidence-dock" id="evidence-dock" aria-label="공문 관련 참고자료">${dockHTML()}</aside></div>`;
 }
 function completedHTML() {
  return `<div class="complete-scene"><div class="stars" aria-hidden="true">★ ★ ★</div><h2>첫 서류철, 준비 완료!</h2><div class="folder"><div class="folder-label">홍보물 제작 계획<div class="seal">담당 확인</div>200부 · 220,000원</div></div><p>예산을 옮기고, 지난 공문을 고쳐<br>오늘의 제작 서류철을 완성했어요.</p><div class="result-tags"><span>제작 22칩</span>${state.options.map(id=>`<span>${E.options[id].name}</span>`).join('')}<span>남긴 예산 ${E.totals(state).reserve}칩</span><span>최신 붙임 2장</span></div><span class="next-label">다음 업무 · 서류철을 들고 결재자 찾아가기</span><p>이 시안은 1·2번까지 체험할 수 있어요.</p></div>`;
 }
 function render() {
  $('title').textContent=['예산 쟁탈전','공문 작업대','서류철 완성'][Math.min(state.stage,2)];
  $('stage-tag').textContent=state.stage===2?'1·2 완료':`${state.stage+1} / 8`;
  document.querySelectorAll('.chapter-track i').forEach((x,i)=>x.classList.toggle('active',i<=Math.min(state.stage,1)));
  $('brief').innerHTML=`<span class="speech-icon" aria-hidden="true">${state.stage===0?'₩':state.stage===1?'✎':'✓'}</span><span>${state.stage===0?'제작 <b>200부</b>를 준비하고, 남는 칩으로 지원을 골라요.':state.stage===1?'공문의 <b>바꿀 칸</b>을 누르고, 참고자료를 가져오세요.':'담당 확인 도장! 다음은 결재 작전이에요.'}</span>`;
  const boardScroll=$('board').scrollTop;
  $('board').innerHTML=state.stage===0?budgetHTML():state.stage===1?docHTML():completedHTML();
  $('board').scrollTop=boardScroll;
  $('message').textContent=note; $('message').className='message'+(bad?' error':'');
  $('primary').textContent=state.stage===0?(state.priceRaised?'계획 확정 → 공문':'☎ 최종 견적 확인'):state.stage===1?'✓ 기안 완료 · 도장 찍기':'전체 8단계 목업 보기 ↗';
  $('undo').disabled=!history.length||state.stage===2;$('hint').disabled=state.stage===2;
  $('board').querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>boardAction(b.dataset.action)));
  $('board').querySelectorAll('[data-option]').forEach(b=>b.addEventListener('click',()=>dispatch({type:'option',id:b.dataset.option})));
  $('board').querySelectorAll('[data-field]').forEach(b=>b.addEventListener('click',()=>{
   if(selected===b.dataset.field){selected=null;render();return;}
   selected=b.dataset.field;bad=false;note=`${fieldNames[selected]}을 선택했어요. 아래 자료를 비교해 가져오세요.`;render();
   $('board').querySelector(`[data-source]`).focus({preventScroll:true});
   // Low-height displays scroll only the board, keeping the action bar visible.
   const dock=$('evidence-dock'),board=$('board');if(dock.getBoundingClientRect().bottom>board.getBoundingClientRect().bottom)board.scrollTop+=dock.getBoundingClientRect().bottom-board.getBoundingClientRect().bottom+6;
  }));
  $('board').querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>{
   const field=selected,result=E.apply(state,{type:'documentSet',field,value:Number(b.dataset.source)});
   if(!result.ok){notify(result.message,true);return;}
   stash();state=result.state;touched.add(field);errors.delete(field);selected=null;bad=false;
   note=`${fieldNames[field]}에 자료를 가져왔어요. 다른 칸도 확인해요.`;render();
   const target=$('board').querySelector(`[data-field="${field}"]`);if(target)target.focus({preventScroll:true});
  }));
  const base=$('board').querySelector('[data-action="base"]'),target=$('print-card');
  if(base&&target){base.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain','E01-20chips');e.dataTransfer.effectAllowed='move';});target.addEventListener('dragover',e=>e.preventDefault());target.addEventListener('drop',e=>{e.preventDefault();if(e.dataTransfer.getData('text/plain')==='E01-20chips')boardAction('base');});}
 }
 function boardAction(action) {
  if(action==='close'){selected=null;render();return;}
  const delta={base:20,plus:1,minus:-1,topup:22-state.chips}[action];
  if(delta!==undefined)dispatch({type:'chips',delta});
 }
 function primary() {
  if(state.stage===2){location.href='E01_체험목업.html';return;}
  const evaluated=E.evaluate(state);
  if(!evaluated.valid) {
   if(state.stage===1) {
    errors=new Set(Object.keys(fieldNames).filter(field=>state.document[field]!==({quantity:200,unit:1100,version:2,estimate:2,specimen:2}[field])));
    selected=null;
    notify(`${errors.size}곳을 다시 확인해요. 빨간 메모가 붙은 칸을 눌러 자료를 비교하세요.`,true);
    $('board').scrollTop=0;
   } else notify(`제작비 ${state.priceRaised?22:20}칩을 준비해요. 지금은 ${state.chips}칩이에요.`,true);
   return;
  }
  if(state.stage===0&&!state.priceRaised){dispatch({type:'quote'});return;}
  // Evaluate + check + commit are one user action; state-rule verification remains intact.
  const checked=E.apply(state,{type:'check'});
  const committed=E.apply(checked.state,{type:state.stage===0?'budgetCommit':'documentCommit'});
  if(!committed.ok){notify(committed.message,true);return;}
  state=committed.state;history=[];selected=null;errors.clear();touched.clear();bad=false;
  note=state.stage===1?'지난 공문이 올라왔어요. 날짜가 다른 자료들을 비교해 고쳐주세요.':'예산 편성과 기안을 마쳤어요. 담당 확인 도장이 서류철에 남았어요.';
  render();$('board').scrollTop=0;$('title').setAttribute('tabindex','-1');$('title').focus({preventScroll:true});
 }
 $('primary').addEventListener('click',primary);
 $('undo').addEventListener('click',()=>{const previous=history.pop();if(!previous)return;state=previous.state;touched=new Set(previous.touched);selected=null;errors.clear();bad=false;note='마지막 조작을 되돌렸어요.';render();});
 $('hint').addEventListener('click',()=>{
  if(state.stage===0){const required=state.priceRaised?22:20;notify(state.chips!==required?(state.priceRaised&&E.totals(state).reserve<required-state.chips?'지원 카드를 다시 눌러 칩을 회수하면, 제작비에 옮길 수 있어요.':`제작 카드에 ${required-state.chips>0?`${required-state.chips}칩을 더 놓아`:`${state.chips-required}칩을 돌려놓아`}주세요.`):state.priceRaised?'지원 선택을 마쳤다면 계획을 확정하세요. 남긴 칩도 괜찮아요.':'지원은 필수가 아니에요. 선택을 마쳤다면 최종 견적을 확인하세요.');}
  else {const field=Object.keys(fieldNames).find(f=>state.document[f]!==({quantity:200,unit:1100,version:2,estimate:2,specimen:2}[f]));if(field){selected=field;notify(`${fieldNames[field]}부터 살펴봐요. 같은 종류의 자료도 날짜와 내용이 달라요.`);}else notify('공문과 붙임이 준비됐어요. 기안을 완료해 담당 확인 도장을 찍으세요.');}
 });
 $('restart').addEventListener('click',()=>{$('reset-dialog').showModal();$('reset-cancel').focus();});
 $('reset-cancel').addEventListener('click',()=>$('reset-dialog').close());
 $('reset-confirm').addEventListener('click',()=>{state=E.initialState();history=[];selected=null;touched.clear();errors.clear();bad=false;note='제작 카드에 20칩을 놓고, 남는 칩으로 지원을 골라보세요.';$('reset-dialog').close();render();});
 render();
})();
