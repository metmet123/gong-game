(function () {
  'use strict';
  const M=window.MoveIn, $=id=>document.getElementById(id);
  let c=M.cases[1], state=M.initial(c), history=[], review=null, board='before', completed=false;
  const esc=x=>String(x).replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
  const name=id=>[...c.people,...c.existing].find(p=>p.id===id)?.name||'미지정';
  const palettes=[['#493d32','#6c8461'],['#433b35','#af966d'],['#634737','#718e99'],['#514437','#9d7773']];
  function person(p){const [hair,shirt]=palettes[p.palette];return `<svg viewBox="0 0 16 24" aria-hidden="true" shape-rendering="crispEdges"><path fill="${hair}" d="M5 1h6v1h2v7H3V3h2z"/><path fill="#e5bb97" d="M4 5h8v6h-1v2H5v-2H4z"/><path fill="${hair}" d="M4 3h8v3H9V5H4z"/><path fill="#423d35" d="M5 7h1v1H5zm5 0h1v1h-1z"/><path fill="#c68f79" d="M7 10h2v1H7z"/><path fill="#e5bb97" d="M7 12h2v3H7zM2 16h2v5H2zm10 0h2v5h-2z"/><path fill="${shirt}" d="M5 14h6v1h2v4H3v-4h2zM4 18h8v3H4z"/><path fill="#4a5448" d="M4 21h3v2H4zm5 0h3v2H9z"/><path fill="#353e35" d="M3 23h4v1H3zm6 0h4v1H9z"/></svg>`;}
  function apply(a){const next=M.reduce(c,state,a);if(next===state)return;history.push(M.clone(state));state=next;review=null;completed=false;render();}
  function summary(){return state.moved.length?`${state.moved.map(name).join(' · ')} ${state.moved.length}명 이동 예정`:'아직 이동 대상이 없습니다.';}
  function reviewRows(){return `<div class="review-grid"><span>이동자</span><b>${esc(state.moved.map(name).join(', '))}</b><span>남는 사람</span><b>${esc(c.people.filter(p=>!state.moved.includes(p.id)).map(p=>p.name).join(', ')||'없음 · 세대 전체 이동')}</b><span>새 주소</span><b>${esc(state.address)}</b><span>세대 구성</span><b>${state.mode==='new'?'새 세대 구성':'기존 세대 편입'}</b><span>새 세대주</span><b>${esc(name(state.head))}</b><span>세대주와 관계</span><b>${state.moved.map(id=>`${esc(name(id))} (${esc(state.relations[id]||'미선택')})`).join('<br>')}</b></div>`;}
  function instruction(){if(state.read.length<2)return '먼저 자료철을 열어 주민의 신고 내용을 읽어 주세요.';if(!state.moved.length)return '이사하는 사람만 선택해 새 주소의 세대로 옮겨 주세요.';if(!state.address)return '이사 후 세대판에서 새 주소와 호수를 선택해 주세요.';if(!state.mode)return '새 세대를 구성할지, 기존 세대에 들어갈지 선택해 주세요.';if(!state.head)return '이사 후 세대주를 지정해 주세요.';if(state.moved.some(id=>!state.relations[id]))return '이동한 사람과 이사 후 세대주의 관계를 기록해 주세요.';return review?.valid?'검토한 내용이 맞으면 전입 처리하기를 눌러 주세요.':'작성한 초안을 변경사항 확인으로 검토해 주세요.';}
  function render(){
    const active=document.activeElement;
    const focusSelector=active?.id?`#${active.id}`:active?.dataset.select?`[data-select="${active.dataset.select}"]`:active?.dataset.case?`[data-case="${active.dataset.case}"]`:active?.dataset.relation?`[data-relation="${active.dataset.relation}"]`:null;
    $('case-nav').innerHTML=M.cases.map(x=>`<button class="case-tab ${x.id===c.id?'active':''}" data-case="${x.id}" aria-pressed="${x.id===c.id}"><span class="case-num">${x.tag}</span><span><b>${x.title}</b><small>${x.subtitle}</small></span><span class="case-arrow">↗</span></button>`).join('');
    $('case-subtitle').textContent=c.subtitle;$('desk-title').textContent=c.title;$('ticket-no').textContent=`M-${c.tag.padStart(3,'0')}`;
    $('resident-name').textContent=c.resident;$('resident-speech').textContent=c.speech;$('resident-portrait').innerHTML=person(c.people.find(p=>p.name===c.resident));
    $('facts').innerHTML=c.facts.map(x=>`<li>${esc(x)}</li>`).join('');
    $('read-count').textContent=`${state.read.length} / 2`;
    ['report','identity'].forEach(id=>{const el=$(`mark-${id}`);el.textContent=state.read.includes(id)?'읽음 ✓':'열기 ↗';el.classList.toggle('read',state.read.includes(id));});
    $('old-address').textContent=c.oldAddress;$('old-head').textContent=`세대주 ${name(c.oldHead)}`;
    const remaining=c.people.filter(p=>!state.moved.includes(p.id));
    $('old-count').textContent=`${remaining.length}명 남음`;
    $('before-people').innerHTML=remaining.map(p=>`<button class="person-card ${state.selection.includes(p.id)?'selected':''}" data-select="${p.id}" aria-pressed="${state.selection.includes(p.id)}" aria-label="${p.name} 이동 대상 선택">${person(p)}<span><b>${p.name}</b><small>${p.detail}</small></span><span class="selector">✓</span></button>`).join('');
    $('empty-old').hidden=remaining.length>0;$('move-btn').disabled=!state.selection.length;
    $('move-btn').innerHTML=`${state.selection.length?`선택한 ${state.selection.length}명 옮기기`:'선택한 사람 옮기기'} <span>→</span>`;
    $('selection-note').textContent=state.selection.length?`${state.selection.map(name).join(', ')} 선택 중`:'사람 카드를 눌러 이동 대상을 선택하세요.';
    const existing=state.mode==='join'?c.existing:[];
    $('new-count').textContent=`${state.moved.length+existing.length}명 예정`;
    $('new-address').value=state.address;
    document.querySelectorAll('[data-mode]').forEach(btn=>{btn.classList.toggle('active',state.mode===btn.dataset.mode);btn.setAttribute('aria-pressed',state.mode===btn.dataset.mode);});
    $('new-household-label').innerHTML=`${state.mode==='join'?'전입지의 기존 세대':state.mode==='new'?'새로 구성할 세대':'이동 예정인 사람'} <span>${completed?'처리 완료':'미확정'}</span>`;
    document.querySelector('#after-board .board-title small').textContent=completed?'시안 안에서 처리한 기록':'아직 확정되지 않은 초안';
    document.querySelector('.draft-label').textContent=completed?'처리 완료 · 시안 기록':'초안 · 자동 저장 없음';
    $('after-people').innerHTML=existing.map(p=>`<div class="person-card existing-person">${person(p)}<span><b>${p.name}</b><small>기존 세대주 · 그대로 유지</small></span><span class="lock">기존 기록</span></div>`).join('')+state.moved.map(id=>{const p=c.people.find(p=>p.id===id);return `<div class="person-card after-person">${person(p)}<span><b>${p.name}</b><small>${state.relations[id]?`세대주와 관계 · ${esc(state.relations[id])}`:'세대주와 관계 · 미선택'}</small></span>${id===state.head?'<span class="head-tag">세대주</span>':''}<button class="return-btn" data-return="${id}" aria-label="${p.name} 이사 전 세대로 돌리기" title="이사 전 세대로 돌리기">↶</button></div>`;}).join('');
    $('empty-new').hidden=state.moved.length+existing.length>0;
    const headOptions=state.mode==='new'?state.moved.map(id=>({id,name:name(id)})):existing;
    $('head-select').innerHTML='<option value="">세대주를 지정하세요</option>'+headOptions.map(p=>`<option value="${p.id}">${p.name}${state.mode==='join'?' · 유지':''}</option>`).join('');
    $('head-select').value=state.head;$('head-select').disabled=!state.mode||state.mode==='join'||!headOptions.length;
    const relations=['배우자','자녀','부모','형제자매','동거인'];
    $('relations').innerHTML=state.moved.filter(id=>id!==state.head).map(id=>`<label for="rel-${id}"><span>${name(id)}의 관계</span><select id="rel-${id}" data-relation="${id}" aria-label="${name(id)}의 이사 후 세대주와의 관계"><option value="">관계를 선택하세요</option>${relations.map(r=>`<option value="${r}" ${state.relations[id]===r?'selected':''}>${r}</option>`).join('')}</select></label>`).join('');
    $('change-summary').textContent=summary();$('first-action').textContent=instruction();$('undo-btn').disabled=!history.length;
    $('action-note').textContent=review?.valid?'검토 완료 · 처리하면 이번 사례가 끝납니다.':'확인 전까지는 모두 수정 가능한 초안입니다.';
    $('check-btn').hidden=!!review?.valid;$('submit-btn').hidden=!review?.valid;$('submit-btn').disabled=false;
    $('submit-btn').innerHTML=`${completed?'완료 결과 보기':'전입 처리하기'} <span>✓</span>`;
    renderFeedback();setBoard(board);
    const current=completed?3:review?.valid?2:state.read.length===2?1:0;
    ['read','edit','review','finish'].forEach((id,i)=>{$(`step-${id}`).classList.toggle('current',i===current);$(`step-${id}`).classList.toggle('done',i<current);});
    if(focusSelector){const restored=document.querySelector(focusSelector);if(restored&&!restored.disabled&&restored.getClientRects().length)restored.focus({preventScroll:true});}
  }
  function renderFeedback(){const el=$('feedback');el.hidden=!review;el.classList.toggle('valid',!!review?.valid);if(!review){el.innerHTML='';return;}el.innerHTML=review.valid?`<h3>✓ 변경사항을 확인했습니다.</h3>${reviewRows()}<p class="review-hint">처리하기 전까지는 초안입니다. 내용을 바꾸면 다시 검토합니다.</p>`:`<h3>초안에서 ${review.errors.length}곳을 다시 확인해 주세요.</h3><ul>${review.errors.map(e=>`<li><button data-target="${e.target}">${esc(e.message)} ↗</button></li>`).join('')}</ul>`;}
  function setBoard(value){board=value;document.querySelectorAll('[data-board]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.board===board);btn.setAttribute('aria-pressed',btn.dataset.board===board);});$('before-board').classList.toggle('mobile-hidden',board!=='before');$('after-board').classList.toggle('mobile-hidden',board!=='after');}
  function start(id){c=M.cases.find(x=>x.id===id);state=M.initial(c);history=[];review=null;completed=false;board='before';render();}
  function openInfo(type){$('dialog-eyebrow').textContent=type==='help'?'업무 안내 · 조작 시안':'자료철 · 가상 사례';
    const help='<h2>한 번의 이사를 기록하는 일</h2><ol><li>자료철 두 개를 열어 내용을 읽습니다.</li><li>이사 전 세대에서 이동할 사람을 선택하고 옮깁니다.</li><li>새 주소, 세대 구성, 세대주와의 관계를 정합니다.</li><li>변경사항을 확인하고 전입 처리합니다.</li></ol><p>관계는 <b>이사 후 세대주를 기준</b>으로 기록합니다. 잘못 옮긴 사람은 ↶ 버튼으로 돌리고, 되돌리기로 이전 조작을 취소할 수 있습니다.</p><p class="legal-note">시안의 모든 인물은 성인입니다. 실제 접수에는 신고 자격·본인 및 전입자 확인·서명·위임 등 사례별 절차가 추가로 필요합니다. 이 시안은 이사 전후 세대 구성 조작에 집중합니다.</p>';
    const report=`<h2>전입신고 내용</h2><div class="paper-record"><div class="review-grid"><span>신고인</span><b>${c.resident}</b><span>이전 주소</span><b>${c.oldAddress}</b><span>새 주소</span><b>${c.newAddress}</b><span>전입자</span><b>${c.movers.map(name).join(', ')}</b><span>세대 구성</span><b>${c.mode==='new'?'새 세대 구성':'기존 세대 편입'}</b><span>이사 후 세대주</span><b>${name(c.head)}</b></div></div><ul>${c.facts.map(f=>`<li>${f}</li>`).join('')}</ul><p class="legal-note">실제 신고서를 그대로 옮긴 화면이 아닌, 퍼즐에 필요한 항목을 요약한 가상 신고 내용입니다.</p>`;
    const identity=`<h2>제시된 확인 자료</h2><p>이 시안에서는 아래 자료가 갖춰진 가상 사례를 다룹니다.</p><ul>${c.evidence.map(f=>`<li>${f}</li>`).join('')}<li>등장인물 모두 성인입니다.</li></ul><p class="legal-note">‘읽음’은 자료를 열어 보았다는 표시입니다. 실제 본인 확인이나 세대주 확인을 수행했다는 뜻은 아닙니다. 신분증 번호·주민등록번호를 입력하거나 저장하지 않습니다.</p>`;
    if(type!=='help')apply({type:'read',id:type});$('dialog-body').innerHTML=type==='help'?help:type==='report'?report:identity;$('dialog-done').textContent=type==='help'?'알겠어요 · 작업대로':'읽었어요 · 작업대로';$('info-dialog').showModal();
  }
  function finish(){if(completed){$('result-dialog').showModal();return;}if(!M.canSubmit(c,state,review))return;completed=true;render();$('result-body').innerHTML=`<div class="result-seal" aria-hidden="true">✓</div><div class="result-title"><span class="overline">MOVE COMPLETED · ${c.tag}</span><h2>새 주소에 도착했습니다.</h2></div>${reviewRows()}<p class="result-quote">“${c.ending}”</p><div class="result-actions"><button data-result="back">완료 기록 보기</button><button class="next" data-result="next">다음 주민 만나기 →</button></div><p class="result-note">이 시안 안에서만 처리되었습니다. 실제 행정 기록과 연결되지 않습니다.</p>`;$('result-dialog').showModal();}
  document.addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn)return;
    if(btn.dataset.case){start(btn.dataset.case);return;}
    if(btn.dataset.select){apply({type:'select',id:btn.dataset.select});return;}
    if(btn.dataset.return){apply({type:'return',id:btn.dataset.return});return;}
    if(btn.dataset.mode){apply({type:'mode',value:btn.dataset.mode});return;}
    if(btn.dataset.doc){openInfo(btn.dataset.doc);return;}
    if(btn.dataset.board){setBoard(btn.dataset.board);return;}
    if(btn.dataset.target){const t=btn.dataset.target;setBoard(t==='people'?'before':'after');const el=$(t==='people'?'before-board':t);el.scrollIntoView({block:'center',behavior:'smooth'});document.querySelectorAll('.target-flash').forEach(x=>x.classList.remove('target-flash'));el.classList.add('target-flash');const field=el.querySelector('button:not(:disabled), select:not(:disabled)');if(field)field.focus({preventScroll:true});return;}
    if(btn.dataset.result){$('result-dialog').close();if(btn.dataset.result==='next'){const i=M.cases.indexOf(c);start(M.cases[(i+1)%M.cases.length].id);$('desk-title').scrollIntoView({block:'start',behavior:'smooth'});}return;}
    if(btn.id==='move-btn'){apply({type:'move'});setBoard('after');if(matchMedia('(max-width:540px)').matches)$('after-board').scrollIntoView({block:'start',behavior:'smooth'});}
    else if(btn.id==='undo-btn'&&history.length){state=history.pop();review=null;completed=false;render();}
    else if(btn.id==='reset-btn')start(c.id);
    else if(btn.id==='help-btn')openInfo('help');
    else if(btn.id==='dialog-close'||btn.id==='dialog-done')$('info-dialog').close();
    else if(btn.id==='check-btn'){review=M.evaluate(c,state);render();$('feedback').scrollIntoView({block:'center',behavior:'smooth'});}
    else if(btn.id==='submit-btn')finish();
  });
  document.addEventListener('change',e=>{if(e.target.id==='new-address')apply({type:'address',value:e.target.value});else if(e.target.id==='head-select')apply({type:'head',id:e.target.value});else if(e.target.dataset.relation)apply({type:'relation',id:e.target.dataset.relation,value:e.target.value});});
  document.addEventListener('pointerdown',()=>document.querySelectorAll('.target-flash').forEach(x=>x.classList.remove('target-flash')));
  render();
})();
