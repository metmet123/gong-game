(() => {
  'use strict';
  const M = LeafletA, app = document.querySelector('#app'), dialog = document.querySelector('#viewer');
  let state = M.initial(), saveFailed = false, toastTimer, animationTimer;
  try { state = M.restore(JSON.parse(localStorage.getItem(M.STORAGE))); } catch { saveFailed = true; }
  const labels = {front:'접힌 앞면',back:'접힌 뒷면',inside:'펼친 안쪽',outside:'펼친 바깥쪽',map:'본관 안내도와 지도 대조',stand:'안내대 비치 · 정상 방향으로 끝까지'};
  const number = id => M.sample(id)?.number || '—';
  const button = (action,text,extra='') => `<button data-action="${action}" ${extra}>${text}</button>`;
  function mapSVG(map, title) {
    if (!map) return `<div class="qr-only"><svg viewBox="0 0 100 100" role="img" aria-label="QR 그림. 게임에서 스캔하지 않습니다"><rect width="100" height="100" fill="white"/><path d="M5 5h28v28H5zM67 5h28v28H67zM5 67h28v28H5z" fill="none" stroke="#263c3d" stroke-width="7"/><path d="M42 8v25h12V15h9M43 45h20v15H45v20h16v15M77 45h16v14H75v32h18M8 45h22v11H9M40 89v7" fill="none" stroke="#263c3d" stroke-width="9"/></svg><b>스마트폰으로</b><p>QR에 접속하여<br>길을 확인해 주세요</p></div>`;
    const [rx,ry]=map.reception,[sx,sy]=map.stairs;
    return `<svg class="floor-map" viewBox="0 0 240 250" role="img" aria-label="${title}. 입구 아래, 노란 기둥 중앙, 접수창구 ${rx>50?'오른쪽':'왼쪽'}, 계단 ${sx<50?'왼쪽':'오른쪽'}. 입구에서 기둥을 지나 접수창구로 향하는 길"><rect x="8" y="8" width="224" height="232" rx="9" fill="#f4f1e5" stroke="#a6b6af" stroke-width="2"/><path d="M120 224V126H${rx*2.2+10}" fill="none" stroke="#568b81" stroke-width="6" stroke-dasharray="9 5"/><path d="M${rx*2.2+10} 126l${rx>50?'-9':'9'} -6v12z" fill="#568b81"/><rect x="101" y="110" width="38" height="36" rx="5" fill="#e8c54b" stroke="#9c7e29"/><text x="120" y="103" text-anchor="middle" font-size="14" fill="#263c3d">기둥</text><rect x="${rx*2.2-22}" y="${ry*2.15-5}" width="64" height="38" rx="4" fill="#d0e4dc" stroke="#5e847a"/><text x="${rx*2.2+10}" y="${ry*2.15+18}" text-anchor="middle" font-size="14" fill="#263c3d">접수창구</text><rect x="${sx*2.2-15}" y="${sy*2.15-8}" width="58" height="38" rx="4" fill="#e2dfd4" stroke="#a5a697"/><text x="${sx*2.2+14}" y="${sy*2.15+15}" text-anchor="middle" font-size="14" fill="#263c3d">계단</text><rect x="92" y="215" width="56" height="25" fill="#fffdf3" stroke="#5e847a"/><text x="120" y="233" text-anchor="middle" font-size="14" fill="#263c3d">입구</text></svg>`;
  }
  function cover(s,mounted=false) {
    return `<div class="brochure-wrap"><div class="brochure" role="img" aria-label="견본 ${s.number} 앞면. 전화번호는 종이 하단에서 ${s.phoneBottom}에서 ${s.phoneTop}밀리미터에 인쇄됨${mounted ? (M.conditions(s).phone ? '. 안내대 앞턱 위에 전화번호 전체가 보임' : '. 안내대 앞턱 뒤로 전화번호가 가려짐') : ''}"><div class="cover-content"><div class="symbol">✦</div><h3>복지 상담<br>안내</h3><p>도움이 필요한 순간,<br>함께 길을 찾겠습니다.</p><div class="cover-lines"></div></div><div class="phone" style="bottom:${s.phoneBottom/210*100}%;height:${(s.phoneTop-s.phoneBottom)/210*100}%">02-000-2000</div></div>${mounted?'<div class="stand-lip" aria-hidden="true">복지 상담 안내</div>':''}</div>`;
  }
  function sceneHTML(id,scene) {
    const s=M.sample(id); if(!s) return '<div class="empty-bench"><b>먼저 견본을 골라 주세요.</b><p>펼쳐서 길 안내를 살펴보고,<br>안내대에 넣어 실제 사용 모습을 확인하세요.</p></div>';
    if(scene==='front'||scene==='stand') return cover(s,scene==='stand')+(scene==='stand'?'<p class="stand-caption">불투명 앞턱 40mm · 종이를 끝까지 꽂은 상태</p>':'');
    if(scene==='back') return '<div class="brochure-wrap"><div class="brochure folded-back"><h3>상담 전 확인하세요</h3><p>운영 시간<br>평일 09:00–18:00</p><hr><p>본관 1층 접수창구에서 상담을 신청할 수 있습니다.</p><p class="small">게임용 홍보물 견본</p></div></div>';
    if(scene==='map') return `<div class="comparison"><div class="map-card"><h3>기준 · 본관 1층 안내도</h3>${mapSVG(M.reference,'본관 기준 지도')}</div><div class="map-card"><h3>견본 ${s.number} · 찾아오시는 길</h3>${mapSVG(s.map,'견본 지도')}</div></div>`;
    if(scene==='inside') return `<div class="spread"><div><h3>복지 상담 안내</h3><p>어려움을 함께 나누고<br>필요한 지원을 찾습니다.</p></div><div class="map-panel"><h3>찾아오시는 길</h3>${mapSVG(s.map,'견본 지도')}</div></div>`;
    return `<div class="spread"><div><h3>상담 전 확인하세요</h3><p>평일 09:00–18:00</p></div><div><h3>생활 속 도움이 필요할 때</h3><p>본관 1층에서 만나요.</p></div><div>${cover(s)}</div></div>`;
  }
  function issue(slot) { return (state.review?.issues || []).filter(i=>i.slot===slot).map(i=>`<div class="error">${state.review.stale?'수정됨 · 재검토 필요<br>':''}${i.text}</div>`).join(''); }
  function slot(kind,title) {
    const r=state.records.find(r=>r.id===state.attachments[kind]);
    return `<div class="slot ${r?'filled':''}" id="slot-${kind}"><div class="slot-head"><strong>${title}</strong>${r?button('detach','해제',`data-kind="${kind}" ${state.result?'disabled':''}`):''}</div>${r?`<p>견본 ${number(r.candidate)} · ${labels[r.scene]}</p>${r.candidate!==state.selected?'<p class="small">선정 견본과 번호가 다릅니다.</p>':''}${button('view-record','기록 펼쳐 보기',`data-id="${r.id}"`)}`:'<p class="small">시험에서 관찰을 남긴 뒤 이곳에 붙여 주세요.</p>'}${issue(kind)}</div>`;
  }
  function render() {
    const keyboardFocus=document.activeElement?.matches(':focus-visible');
    const focused=keyboardFocus?document.activeElement?.dataset?.action:null, focusedId=keyboardFocus?document.activeElement?.dataset?.id:null;
    const stage=state.result?4:(state.review?.issues?.length?3:(state.scene==='map'?2:1));
    const stageMeta={1:{num:'01',title:'시작',copy:'홍보물을 꼼꼼히 확인하고, 적합한 견본을 선정하세요.',tip:'견본을 눌러 펼쳐 보고 안내대에 넣어 보세요.'},2:{num:'02',title:'지도 대조',copy:'견본의 안내 내용이 기준과 같은지 지도를 대조해 보세요.',tip:'기준 지도와 견본 지도를 같은 방향으로 놓고 비교하세요.'},3:{num:'03',title:'반려 · 수정',copy:'문제를 확인하고, 필요한 부분을 수정해 보세요.',tip:'한 가지 단서만 맞아도 전체 조건을 충족하지 않을 수 있습니다.'},4:{num:'04',title:'선정 완료',copy:'적합한 견본을 선정했습니다.',tip:'선정 검토가 끝났습니다. 다음은 제작 업무입니다.'}}[stage];
    const checklist=[['paper','종이 안내'],['route','본관 동선'],['phone','비치 시 전화 확인']];
    const selected=M.sample(state.selected||state.inspect), inspected=M.sample(state.inspect);
    const recordThumb=(kind)=>{const r=state.records.find(x=>x.id===state.attachments[kind]);return r?`<div class="clip-thumb"><span>견본 ${number(r.candidate)}</span><div>${sceneHTML(r.candidate,r.scene)}</div><small>${kind==='map'?'지도 대조':'비치 상태'}</small></div>`:'<div class="clip-empty">붙임<br>대기</div>';};
    const evidenceControls=['map','stand'].map(kind=>state.records.filter(r=>r.kind===kind).map(r=>button('attach',state.attachments[kind]===r.id?'붙임 완료':`${kind==='map'?'지도':'비치'} 기록 붙이기 · 견본 ${number(r.candidate)}`,`data-id="${r.id}" ${state.result||state.attachments[kind]===r.id?'disabled':''}`)+button('view-record','기록 보기',`data-id="${r.id}"`)).join('')).join('');
    const sampleCards=[...M.samples].map(s=>`<button class="desk-sample ${state.inspect===s.id?'active':''}" data-action="inspect" data-id="${s.id}" aria-pressed="${state.inspect===s.id}"><span class="sample-art art-${s.number}"><i>✦</i><b>${s.number===4?'시민의<br>일상이<br>더 가까이':s.number===3?'방문이<br>더 편리한<br>시청입니다':s.number===2?'시민과<br>이어지는<br>행정서비스':'함께하는<br>더 나은 하루'}</b><em>복지 상담 안내</em></span><strong>견본 ${s.number}</strong></button>`).join('');
    const doc=`<div class="clipboard"><div class="clip-top"><span>생활보장과</span><b>홍보물 제작계획</b></div><div class="doc-fields"><span>문서번호</span><i>생활보장-A01</i><span>작성일</span><i>2026.10.11</i><span>담당자</span><i>복지 안내 담당</i><span>제목</span><i>본관 안내 홍보물 제작</i><span>내용</span><i class="lines"></i></div><h3>검토 항목</h3><div class="review-grid"><span>선정 견본</span><div class="review-slot">${state.selected?`견본 ${number(state.selected)}`:'□'}</div><span>지도 대조</span><div class="review-slot">${recordThumb('map')}</div><span>관찰 기록</span><div class="review-slots">${recordThumb('map')}${recordThumb('stand')}</div><span>선정 검토</span><div class="review-stamp">${state.result?'선정 검토':'□'}</div></div><div class="evidence-controls">${evidenceControls}</div>${state.review?.issues?.length?`<div class="sticky-error">${state.review.issues.map(i=>i.text).join('<br>')}</div>`:''}${state.result?'<div class="doc-success">선정 검토 완료</div>':''}<div class="doc-actions">${state.result?button('export','결과 저장'):button('review','검토 요청')}</div></div>`;
    const memo=`<aside class="memo"><h3>업무 메모</h3>${checklist.map(([key,text])=>`<label><span class="memo-box ${state.result||((key==='paper'||key==='route')&&selected?.map)||''}">${state.result?'✓':''}</span>${text}</label>`).join('')}<div class="memo-note">꼼꼼한 확인이<br>좋은 안내를<br>만듭니다.</div></aside>`;
    const stageButtons=stage===1?(state.inspect?`<div class="stage-actions stage-actions-context">${button('fold','펼치기')}${button('stand','안내대에 넣기')}${button('map','지도 대조')}${button('capture','관찰 남기기')}${button('select','이 견본 선택')}</div>`:''):stage===2?`<div class="stage-actions">${button('fold','펼치기')}${button('map','지도 대조','class="selected-action"')}${button('capture','관찰 남기기','class="primary"')}</div>`:stage===3?`<div class="stage-actions">${button('stand','꺼내기','class="primary"')}${button('inspect','다른 견본 보기','data-id="cycle"')}</div>`:`<div class="stage-actions">${button('export','결과 보기','class="primary"')}${button('replay','다시 연습')}</div>`;
    const desk=stage===2?`<div class="map-scene"><div class="paper-tag">견본 ${number(state.inspect||'s3')}</div><div class="map-spread"><div><h4>방문이 더 편리한 시청입니다</h4>${mapSVG(M.sample(state.inspect||'s3')?.map,'견본 지도')}</div><div><h4>본관 1층 (기준 지도)</h4>${mapSVG(M.reference,'본관 기준 지도')}</div></div></div>`:stage===3?`<div class="stand-scene"><div class="paper-tag">견본 ${number(state.selected||state.inspect||'s2')} (비치 상태)</div>${cover(M.sample(state.selected||state.inspect||'s2'),true)}<div class="error-note">전화번호가<br>가려집니다</div></div>`:stage===4?`<div class="stand-scene complete-scene"><div class="paper-tag">견본 ${number(state.selected||'s4')} (비치 상태)</div>${cover(M.sample(state.selected||'s4'),true)}<div class="visible-phone">상담 전화 02-000-2000</div></div>`:`<div class="start-scene"><div class="paper-tag">견본을 골라 주세요.</div><div class="desk-samples">${sampleCards}</div></div>`;
    app.innerHTML=`<div class="desk-app stage-${stage}"><header class="stage-header"><div class="stage-id">${stageMeta.num}</div><h1>${stageMeta.title}</h1><p>${stageMeta.copy}</p><span>${stageMeta.tip}</span></header><main class="desk-layout">${memo}<section class="desk-document" id="document" aria-label="홍보물 제작계획 공문">${doc}</section><section class="desk-scene" id="trial" aria-label="견본 시험 장면">${desk}<div class="desk-caption">${stage===1?'':stage===2?'':stage===3?'':'좋은 안내가 시민을 더 가까이 만듭니다.'}</div>${stageButtons}</section></main></div>`;
    if(focused){const candidates=[...app.querySelectorAll('button[data-action]')]; candidates.find(b=>b.dataset.action===focused&&(!focusedId||b.dataset.id===focusedId))?.focus({preventScroll:true});}
  }
  function toast(text) { clearTimeout(toastTimer); document.querySelector('#notice').textContent=text; toastTimer=setTimeout(()=>document.querySelector('#notice').textContent='',3500); }
  function save() { try { localStorage.setItem(M.STORAGE,JSON.stringify(state)); } catch { if(!saveFailed) toast('이 브라우저에서는 저장할 수 없습니다. 현재 화면에서 계속 플레이할 수 있어요.'); saveFailed=true; } }
  function sound() { if(state.muted)return;try{const ctx=new(window.AudioContext||window.webkitAudioContext)(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=state.result?440:220;g.gain.setValueAtTime(.04,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.14);o.start();o.stop(ctx.currentTime+.15);o.onended=()=>ctx.close();}catch{} }
  function animate() { if(state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches)return;app.classList.remove('motion');void app.offsetWidth;app.classList.add('motion');clearTimeout(animationTimer);animationTimer=setTimeout(()=>app.classList.remove('motion'),300); }
  function show(title,html) { document.querySelector('#viewer-content').innerHTML=`<h2>${title}</h2>${html}`;dialog.showModal(); }
  document.querySelector('#close-viewer').onclick=()=>dialog.close();
  app.addEventListener('click',event=> {
    const b=event.target.closest('button[data-action]');if(!b||b.disabled)return;
    const a=b.dataset.action,id=b.dataset.id;
    const locked=!!state.result;
    if(locked&&['select','attach','detach','delete','review'].includes(a))return;
    if(a==='inspect'){if(id==='cycle'){const ids=M.samples.map(s=>s.id);const current=ids.indexOf(state.selected||state.inspect);state.inspect=ids[(current+1+ids.length)%ids.length];if(state.review?.issues?.length){state.selected=state.inspect;M.changeDraft(state);}}else state.inspect=id;state.scene='front';}
    if(a==='start'){state.tab='trial';}
    if(a==='tab'){state.tab=b.dataset.tab;}
    if(a==='fold'){state.scene=['inside','outside','map'].includes(state.scene)?'front':'inside';}
    if(a==='flip'){state.scene=state.scene==='front'?'back':state.scene==='back'?'front':['inside','map'].includes(state.scene)?'outside':state.scene==='outside'?'inside':'back';}
    if(a==='map'){state.scene='map';}
    if(a==='stand'){state.scene=state.scene==='stand'?'front':'stand';}
    if(a==='capture'){const before=state.records.length,r=M.capture(state);if(r){toast(before===state.records.length?'같은 장면의 기록이 이미 보관되어 있습니다.':`견본 ${number(r.candidate)} 관찰을 남겼습니다. 아래 보관함에서 공문에 붙여 주세요.`);sound();}}
    if(a==='select'){state.selected=state.inspect;M.changeDraft(state);toast(`견본 ${number(state.selected)}을 선정했습니다. 이 견본의 두 기록을 붙여 주세요.`);}
    if(a==='attach'){const r=state.records.find(r=>r.id===id);if(r&&r.kind!=='face'){state.attachments[r.kind]=r.id;M.changeDraft(state);toast(`${r.kind==='map'?'지도':'안내대'} 기록을 공문에 붙였습니다.`);sound();}}
    if(a==='detach'){state.attachments[b.dataset.kind]=null;M.changeDraft(state);toast('붙임을 해제했습니다. 보관함 기록은 남아 있습니다.');}
    if(a==='delete'){const attached=Object.values(state.attachments).includes(id);if(attached&&!confirm('이 기록을 삭제하면 공문의 해당 붙임도 해제됩니다. 삭제할까요?'))return;state.records=state.records.filter(r=>r.id!==id);for(const k of ['map','stand'])if(state.attachments[k]===id)state.attachments[k]=null;if(attached)M.changeDraft(state);}
    if(a==='mark'){if(b.dataset.mark)state.marks[state.inspect]=b.dataset.mark;else delete state.marks[state.inspect];}
    if(a==='review'){const review=M.complete(state);state.tab='document';toast(review.ok?'선정 검토 완료! 확인한 견본과 근거가 공문에 남았습니다.':'반려 메모를 확인하고 해당 붙임만 수정해 주세요.');sound();}
    if(a==='help'){state.help=!state.help;state.tab='trial';}
    if(a==='sound')state.muted=!state.muted;
    if(a==='motion')state.reduced=!state.reduced;
    if(a==='view-map'){show('본관 1층 안내도',`<div class="map-card" style="max-width:500px;margin:auto">${mapSVG(M.reference,'본관 기준 지도')}</div>`);return;}
    if(a==='view-scene'){show(`견본 ${number(state.inspect)} · ${labels[state.scene]}`,`<div class="bench">${sceneHTML(state.inspect,state.scene)}</div>`);return;}
    if(a==='view-record'){const r=state.records.find(r=>r.id===id);if(r)show(`보관 기록 · 견본 ${number(r.candidate)} · ${labels[r.scene]}`,`<div class="bench">${sceneHTML(r.candidate,r.scene)}</div><p class="small">기록 당시의 견본과 시험 장면입니다.</p>`);return;}
    if(a==='export'){const blob=new Blob([JSON.stringify(state.result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='life-support-leaflet-a-result.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
    if(a==='replay'){if(!confirm('새 시도를 시작할까요? 현재 공문은 완료 기록으로 보관됩니다.'))return;try{localStorage.setItem(M.STORAGE+':last-completed',JSON.stringify(state));}catch{}const settings={muted:state.muted,reduced:state.reduced};state={...M.initial(),...settings};toast('새 시도를 시작했습니다.');}
    save();render();if(['inspect','fold','flip','map','stand'].includes(a))animate();
    if(['tab','start','review','help'].includes(a)&&matchMedia('(max-width:899px)').matches)window.scrollTo({top:0,behavior:state.reduced?'instant':'smooth'});
  });
  render();
  if(saveFailed)toast('저장 기록을 읽지 못했습니다. 현재 화면에서 플레이할 수 있습니다.');
})();
