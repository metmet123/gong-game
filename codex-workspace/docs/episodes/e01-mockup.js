(function () {
  'use strict';
  const E = window.E01Episode;
  const SAVE = 'gong-e01-independent-mockup-v2';
  const el = id => document.getElementById(id);
  const money = n => n.toLocaleString('ko-KR') + '원';
  let state = E.initialState(), gallery = false, history = [], selected = null, box = 1, lastMessage = '권한솔: 오늘 홍보물 200부를 제작해서 세 곳에 나눠 주세요. 우선 제작 예산부터 잡아 봅시다.', lastError = false;
  try { const saved = JSON.parse(localStorage.getItem(SAVE)); if (saved?.version === 2 && Number.isInteger(saved.stage) && saved.stage >= 0 && saved.stage <= 7) { state = saved; lastMessage = '중단했던 사업을 이어서 진행합니다.'; } } catch { /* Storage is optional in a file preview. */ }
  const icons = {
    print: '<rect x="19" y="15" width="58" height="45" rx="3" fill="#fffdf2" stroke="#76916b" stroke-width="3"/><rect x="28" y="7" width="58" height="45" rx="3" fill="#fffdf2" stroke="#76916b" stroke-width="3"/><path d="M40 20h35M40 28h25M40 37h35" stroke="#73915b" stroke-width="4"/><rect x="48" y="45" width="16" height="12" fill="#cba856"/>',
    stand: '<path d="M31 9h37v42H31z" fill="#d8e8b5" stroke="#5f8057" stroke-width="4"/><path d="M35 16h29v24H35z" fill="#fffdf1"/><path d="M35 50l-9 17M63 50l9 17" stroke="#5f8057" stroke-width="5"/><path d="M41 24h17M41 31h17" stroke="#719465" stroke-width="3"/>',
    delivery: '<path d="M19 50h62M75 51V25h13" stroke="#58784e" stroke-width="5" fill="none"/><rect x="23" y="23" width="39" height="25" fill="#cda567" stroke="#94744b" stroke-width="3"/><path d="M41 25v20" stroke="#f2d398" stroke-width="5"/><circle cx="28" cy="59" r="6" fill="#4f5d4a"/><circle cx="75" cy="59" r="6" fill="#4f5d4a"/>',
    proof: '<path d="M28 9h44v49H28z" fill="#fffdf0" stroke="#789263" stroke-width="3"/><path d="M36 20h25M36 29h20M36 38h24" stroke="#81996f" stroke-width="3"/><path d="M54 43l7 7 20-25" stroke="#b65d49" stroke-width="4" fill="none"/>',
    printer: '<path d="M28 9h45v25H28z" fill="#fffdf0" stroke="#7a9070" stroke-width="3"/><rect x="17" y="29" width="67" height="25" rx="4" fill="#a8b6a2" stroke="#637b5c" stroke-width="3"/><path d="M29 43h43v24H29z" fill="#fffdf0" stroke="#7a9070" stroke-width="3"/><circle cx="75" cy="36" r="3" fill="#dceba8"/>',
    desk: '<rect x="15" y="35" width="73" height="16" rx="3" fill="#c1a075" stroke="#8e734f" stroke-width="3"/><path d="M22 50v17M80 50v17" stroke="#8e734f" stroke-width="5"/><rect x="39" y="10" width="33" height="24" rx="2" fill="#bcd0b0" stroke="#567d68" stroke-width="3"/><path d="M55 34v5" stroke="#567d68" stroke-width="4"/><rect x="23" y="27" width="12" height="9" fill="#fffdf0"/>',
    house: '<path d="M18 29L50 8l32 21v34H18z" fill="#e5dbc0" stroke="#6d845c" stroke-width="3"/><rect x="31" y="34" width="15" height="14" fill="#bfd3a6"/><rect x="55" y="34" width="15" height="28" fill="#8da67d"/>',
    box: '<path d="M22 20l28-9 28 9v39l-28 9-28-9z" fill="#cfa66e" stroke="#9b764b" stroke-width="3"/><path d="M22 20l28 9 28-9M50 29v39" stroke="#9b764b" stroke-width="3"/><path d="M42 15l28 9v12" stroke="#f4d79d" stroke-width="5"/>',
    person: '<circle cx="50" cy="23" r="13" fill="#e9c3a0"/><path d="M36 23q-4-24 18-17 12 2 10 18l-6-9-22 8z" fill="#405247"/><path d="M31 61V46q3-15 19-15t19 15v15" fill="#8da887" stroke="#4d725d" stroke-width="3"/><path d="M43 59v9M58 59v9" stroke="#3d5147" stroke-width="7"/>'
  };
  const graphic = type => '<svg viewBox="0 0 100 75" aria-hidden="true">' + (icons[type] || icons.print) + '</svg>';
  const button = (text, attrs = '', cls = '') => '<button type="button" class="' + cls + '" ' + attrs + '>' + text + '</button>';
  const stamp = (name, signed) => '<span class="stamp ' + (signed ? 'signed' : '') + '">' + name + '<br>' + (signed ? '확인' : '대기') + '</span>';
  const stamps = () => '<div class="stamps">' + ['own', 'cooperation', 'chief', 'director'].map((key, i) => stamp(['담당', '협조', '계장', '과장'][i], state.approvals[key])).join('') + '</div>';
  const mission = [
    '사업 카드에 예산을 배치하세요. 남겨둔 예비 칩으로 돌발 상황에 대응할 수 있어요.',
    '자료를 선택하고 공문의 해당 칸을 누르세요. 지난 사업의 수량·단가·운영시간이 섞여 있어요.',
    '서류철을 들고 담당자를 방문하세요. 협조와 출력 준비를 마치면 계장이 돌아와요.',
    '상자를 열고 샘플을 확인하세요. 실제로 사용할 수 있는 정상 홍보물 200부가 필요해요.',
    '자료를 골라 지급 서류철에 넣으세요. 같은 계약의 발주·청구·검수를 연결해야 해요.',
    '“20부만 받았어요.” 기록·사람·물건을 조사해 빠진 40부의 행방을 찾으세요.',
    '집계표에는 제작비 44만 원? 기록을 실제 지급과 연결해 차이가 생긴 이유를 밝혀내세요.',
    '편성한 사업과 해결한 업무가 사무실에 남았어요.'
  ];
  const notebooks = [
    ['칩을 놓으면 사업이 움직여요', ['제작 카드의 +10칩을 두 번 누르세요.', '선택 사업을 고르고 견적을 확인하세요.', '상승한 제작비 2칩을 추가하세요. 부족하면 선택 사업을 빼세요.', '작업 확인 뒤 사업을 확정하세요.'], '예산 26칩 · 제작 최종 22칩 · 수량 고정 200부'],
    ['서류를 고치는 순서', ['왼쪽 자료에서 가져올 숫자나 문구를 선택하세요.', '오른쪽 공문의 수량·단가·운영시간 칸을 누르세요.', '최신 견적과 견본을 선택해 붙임도 교체하세요.', '작업 확인 뒤 서류철을 묶으세요.'], '200부 × 1,100원 · 최신본 v2 · 붙임 2종'],
    ['서류철과 함께 움직이세요', ['협조 담당자와 프린터를 방문하세요. 순서는 자유예요.', '프린터에서 견적 v2와 견본 v2를 챙기세요.', '계장 다음 과장에게 서류철을 전달하세요.', '도장이 모두 찍히면 발주하세요.'], '준비가 끝나면 계장 복귀 · 실제 시간 대기 없음'],
    ['수량보다 내용부터', ['상자를 열고 묶음을 눌러 샘플을 확인하세요.', '같은 표지 선택으로 묶음을 함께 옮길 수 있어요.', '정상은 18:00, 구버전은 17:00예요.', '보완 40부를 교체받고 새 상자도 확인하세요.'], '정상 160 + 교체 40 = 200부 · 추가비용 0원'],
    ['돈이 움직이는 순간', ['발주서·청구서·검수조서를 선택하세요.', '각 자료를 오른쪽의 맞는 칸에 넣으세요.', '청구서 금액과 계약번호를 확인하세요.', '작업 확인 뒤 지급을 실행하세요.'], '제작비 220,000원 1회 지급 · 배송비는 배부 완료 후'],
    ['민원은 현장에서 풀어요', ['배부대장과 수령증을 읽으세요.', '담당자에게 묻고 보관실의 B-02를 확인하세요.', '원인 메모를 쓰고 40부를 B분점으로 옮기세요.', '수령증을 받은 뒤 확인하고 회신하세요.'], '창구 80 / A분점 60 / B분점 60 · 보관 0'],
    ['같은 금액만으로는 부족해요', ['집계행 R1을 선택하고 지급확인증을 누르세요.', 'R2도 같은 지급확인증에 연결하세요.', '오류 원인을 고르고 집계행 하나에 제외 메모를 붙이세요.', '작업 확인 뒤 결산보고를 결재받으세요.'], '제작 지급은 1회 · 집계행만 하나 제외'],
    ['오늘 남긴 것', ['안내 홍보물 v2가 게시판에 붙었어요.', '세 곳이 총 200부를 받았어요.', '민원 회신과 결산보고가 도감에 꽂혔어요.', '다른 사업을 선택해 다시 플레이할 수 있어요.'], '전체 지출과 잔액 합계 260,000원']
  ];
  const commitLabels = ['사업 확정 → 기안', '서류철 묶기 → 결재', '발주 → 납품 확인', '검수 확정 → 지급', '지급 실행 → 배부', '민원 회신 → 결산', '결산보고 결재', '다른 사업으로 다시 시작'];
  const commitTypes = ['budgetCommit', 'documentCommit', 'approvalCommit', 'inspectionCommit', 'paymentCommit', 'complaintCommit', 'settlementCommit'];
  function save() { if (!gallery) { try { localStorage.setItem(SAVE, JSON.stringify(state)); } catch { lastMessage += ' 저장을 사용할 수 없어 현재 화면에서만 진행합니다.'; } } }
  function act(action) {
    const before = state, result = E.apply(state, action);
    const irreversible = action.type.endsWith('Commit') || ['quote', 'visit', 'print', 'replace', 'pickup', 'deliver', 'receipt'].includes(action.type);
    if (result.ok && result.state.revision !== before.revision) { if (irreversible) history = []; else history.push(before); }
    state = result.state; lastMessage = result.message; lastError = !result.ok;
    if (state.stage !== before.stage) { selected = null; box = 1; history = []; }
    save(); render();
  }
  function selection(kind, value) { selected = { kind, value }; lastError = false; lastMessage = '선택: ' + selectionLabel() + '. 옮길 위치를 눌러 주세요.'; render(); }
  function selectionLabel() {
    if (!selected) return '없음';
    if (selected.kind === 'document') return documentSources[selected.value].label;
    if (selected.kind === 'payment') return paymentSources[selected.value].label;
    if (selected.kind === 'row') return selected.value;
    return '홍보물 ' + selected.value.length * 10 + '부';
  }
  function renderBudget() {
    const t = E.totals(state), need = state.priceRaised ? 22 : 20;
    return '<div class="board"><div class="board-label">올해의 사업 덱</div><div class="grid2"><div class="task-card selected"><div class="card-illustration">' + graphic('print') + '</div><small>필수 사업 · 제작 200부</small><h3>이용 안내 홍보물</h3><div class="cost">' + state.chips + ' <small>/ ' + need + '칩</small></div><div class="chips">' + Array.from({ length: need }, (_, i) => '<span class="chip ' + (i < state.chips ? 'used' : 'empty') + '"></span>').join('') + '</div><div class="chip-buttons">' + button('+10칩', 'data-action="chips" data-delta="10"') + button('+1칩', 'data-action="chips" data-delta="1"') + button('−1칩', 'data-action="chips" data-delta="-1"') + '</div></div><div class="reserve-tray"><small>아직 쓰지 않은 예산</small><h3>예비 칩 트레이</h3><div class="cost">' + t.reserve + '칩</div><div class="chips">' + Array.from({ length: Math.max(0, t.reserve) }, () => '<span class="chip"></span>').join('') + '</div><p style="font-size:12px;margin-top:15px">1칩 = 10,000원<br>남겨둔 칩은 견적이 바뀌면 옮길 수 있어요.</p></div></div><div class="grid3 option-cards">' + Object.entries(E.options).map(([id, option]) => '<div class="task-card ' + (state.options.includes(id) ? 'selected' : '') + '"><div class="card-illustration">' + graphic(id) + '</div><h3>' + option.name + '</h3><p>' + option.effect + '</p><div class="cost">' + option.cost / 10000 + '칩</div>' + button(state.options.includes(id) ? '칩 돌려놓기' : '사업 활성화', 'data-action="option" data-id="' + id + '"') + '</div>').join('') + '</div>' + (state.priceRaised ? '<div class="event-card"><strong>인쇄소에서 새 견적이 왔어요!</strong>단가 1,000원 → 1,100원 · 제작비 20칩 → 22칩<br>200부 목표는 그대로예요. 예비 칩이나 선택 사업을 조정하세요.</div>' : '<div class="event-card"><strong>첫 계획을 세웠나요?</strong>제작 20칩을 배치한 뒤 최신 견적을 확인하세요.</div>' + button('인쇄소 견적 확인', 'data-action="quote"', 'primary')) + '</div>';
  }
  const documentSources = {
    quantity: { label: '배부계획 · 200부', detail: '창구 80 + A분점 60 + B분점 60', field: 'quantity', value: 200 },
    unit: { label: '견적 v2 · 1,100원', detail: '200부 제작비 220,000원', field: 'unit', value: 1100 },
    version: { label: '최신 공지 · 18:00', detail: '창구 운영시간 09:00~18:00', field: 'version', value: 2 },
    estimate: { label: '견적서 v2 · 붙임', detail: '이용 안내 홍보물 / 계약 PRINT-E01', field: 'estimate', value: 2 },
    specimen: { label: '규격 견본 v2 · 붙임', detail: 'A5 양면 / 최신 운영시간', field: 'specimen', value: 2 },
    old: { label: '이전 사업 견적 v1', detail: '150부 / 단가 1,000원 / 미채택', field: 'unit', value: 1000 }
  };
  function renderDocument() {
    const d = state.document;
    const field = (key, label, stale) => button(label, 'data-target="document" data-field="' + key + '"', 'field ' + (stale ? 'stale' : ''));
    return '<div class="desk"><p class="workspace-caption">선택한 자료: <b>' + selectionLabel() + '</b></p><div class="document-desk"><div class="supplies">' + Object.entries(documentSources).map(([id, source]) => button('<b>' + source.label + '</b><small>' + source.detail + '</small>', 'data-select="document" data-id="' + id + '"', 'supply ' + (id === 'old' ? 'outdated ' : '') + (selected?.value === id ? 'selected' : ''))).join('') + '</div><div class="official"><div class="org">모서리구청</div><div class="doc-meta">생활보장과 · 수신 내부결재 · 지난 문서에서 복사한 초안</div><h2>생활보장과 이용 안내 홍보물 제작계획</h2><div class="doc-line">1. 목적: 이용 안내와 배부 정보 제공</div><div class="doc-line">2. 제작: ' + field('quantity', d.quantity + '부', d.quantity !== 200) + ' · A5 양면</div><div class="doc-line">3. 운영시간: ' + field('version', '09:00~' + (d.version === 2 ? '18:00' : '17:00'), d.version !== 2) + '</div><div class="doc-line">4. 배부: 창구 80 / A분점 60 / B분점 60</div><div class="doc-line">5. 선택 사업: ' + (state.options.map(id => E.options[id].name).join(' · ') || '없음') + '</div><div class="doc-line">산출: ' + d.quantity + '부 × ' + field('unit', money(d.unit), d.unit !== 1100) + '<br><b>제작비 ' + money(d.quantity * d.unit) + '</b><br>선택 사업 ' + money(E.optionCost(state)) + '</div><div class="attachments">붙임 1. ' + field('estimate', '견적서 v' + d.estimate + ' 📎', d.estimate !== 2) + '<br>붙임 2. ' + field('specimen', '규격 견본 v' + d.specimen + ' 📎', d.specimen !== 2) + '<br>붙임 3. 배부계획 200부 📎</div>' + stamps() + '</div></div></div>';
  }
  const stations = [
    { id: 'desk', name: '내 자리', sub: '서류철 확인', art: 'desk', x: 7, y: 50 },
    { id: 'cooperation', name: '나소라', sub: '안내 내용 협조', art: 'person', x: 7, y: 16 },
    { id: 'printer', name: '공용 프린터', sub: '최신본 출력', art: 'printer', x: 38, y: 50 },
    { id: 'chief', name: '권한솔 계장', sub: '준비 완료 후 복귀', art: 'person', x: 38, y: 16 },
    { id: 'director', name: '정윤서 과장', sub: '계장 결재 필요', art: 'person', x: 70, y: 16 }
  ];
  function renderApproval() {
    const current = stations.find(s => s.id === state.location) || stations[0];
    const ready = state.approvals.cooperation && state.printed.length === 2;
    return '<div class="office"><div class="wall">생활보장과 · 서류철을 들고 자리를 방문하세요</div>' + stations.map(s => button('<span class="station-art">' + graphic(s.art) + '</span><b>' + s.name + '</b><small>' + (s.id === 'chief' ? (ready ? '자리로 돌아왔어요' : '회의 중 · 준비 먼저') : s.sub) + '</small>', 'data-action="visit" data-id="' + s.id + '" style="left:' + s.x + '%;top:' + s.y + '%"', 'station ' + ((s.id === 'cooperation' && state.approvals.cooperation) || (s.id === 'chief' && state.approvals.chief) || (s.id === 'director' && state.approvals.director) ? 'ready' : ''))).join('') + '<div class="player" style="left:' + (current.x + 8) + '%;top:' + (current.y + 22) + '%"><svg viewBox="0 0 36 58" aria-label="서류철을 든 주인공"><circle cx="17" cy="12" r="9" fill="#edcaa9"/><path d="M7 12Q5 0 18 2t9 13l-7-7z" fill="#3f5147"/><path d="M8 28q10-10 19 0v19H8z" fill="#577e6a"/><path d="M11 46v10M23 46v10" stroke="#344b41" stroke-width="6"/><rect x="22" y="29" width="12" height="15" rx="2" fill="#d6b277" stroke="#8c7048"/></svg></div><div class="office-road">종이를 챙겨서 도장을 채우기</div><div class="office-shelf">기록 책장 ▥ ▥ ▥</div><div class="office-plant">🌿</div></div><div class="folder-strip"><b>내 서류철</b><span>최신 출력물 ' + state.printed.length + ' / 2</span>' + stamps() + '</div>' + (state.location === 'printer' ? '<div class="printer-tray"><h3>출력함 · 종이를 골라 서류철에 넣으세요</h3><div class="printer-papers">' + [['estimate-v2', '홍보물 견적 v2', '220,000원 / 우리 사업'], ['estimate-v1', '홍보물 견적 v1', '200,000원 / 구버전'], ['specimen-v2', '규격 견본 v2', 'A5 양면 / 18:00'], ['other', '다른 사업 견적', '220,000원 / 교육사업']].map(([id, title, sub]) => button(title + '<br><small>' + sub + '</small>' + (state.printed.includes(id) ? '<br>📎 서류철에 넣음' : ''), 'data-action="print" data-id="' + id + '"', state.printed.includes(id) ? 'collected' : '')).join('') + '</div></div>' : '<div class="event-card"><strong>' + (state.options.includes('proof') ? '교정 지원 활성화 · 나소라가 비교 교정지를 준비했어요.' : '협조와 출력은 어느 순서로 준비해도 좋아요.') + '</strong>프린터에서 최신본을 챙기고 담당자의 결재 조건을 확인하세요.</div>');
  }
  function renderInspection() {
    const inv = E.inventory(state), items = state.bundles.filter(b => b.box === box && b.status !== 'returned'), chosen = selected?.kind === 'bundle' ? selected.value : [];
    const sample = chosen.length ? state.bundles.find(b => b.id === chosen[0]) : null;
    return '<div class="desk"><div class="board-label">납품 상자 · 클릭해서 열기</div><div class="box-row">' + [...new Set(state.bundles.filter(b => b.status !== 'returned').map(b => b.box))].map(n => button('상자 ' + n + '<br><small>' + (n === 5 ? '교체본 40부' : '50부') + '</small>', 'data-box="' + n + '"', 'box-button ' + (box === n ? 'open' : ''))).join('') + '</div><div class="bundle-area"><h3>상자 ' + box + ' · 묶음을 누르면 샘플이 펼쳐져요</h3><div class="bundles">' + items.map(b => button('이용 안내<br><b>10부</b><br><small>' + (b.inspected ? 'v' + b.version + ' · ' : '') + ({ unknown: '미확인', good: '정상', bad: '보완' }[b.status]) + '</small>', 'data-bundle="' + b.id + '"', 'bundle ' + b.status + ' ' + (chosen.includes(b.id) ? 'selected' : ''))).join('') + '</div></div>' + (sample ? '<div class="sample-preview"><div><small>선택한 묶음 · ' + chosen.length * 10 + '부</small><strong>운영시간 09:00~' + (sample.version === 2 ? '18:00' : '17:00') + '</strong>A5 · 양면 · 안내문 v' + sample.version + '</div><div><small>승인 시안 v2</small><strong>09:00~18:00</strong>최신 견본과 나란히 비교</div>' + button('이 상자의 같은 표지 선택', 'data-same="true"') + '</div>' : '<div class="sample-preview">상자 안의 묶음을 눌러 샘플을 확인하세요. 표지와 운영시간을 비교합니다.</div>') + '<div class="bins"><div class="bin"><span>정상 구역</span><strong>' + inv.good + '부</strong>' + button('선택 묶음 넣기', 'data-classify="good"') + '</div><div class="bin bad-bin"><span>보완 구역</span><strong>' + inv.bad + '부</strong>' + button('선택 묶음 넣기', 'data-classify="bad"') + '</div></div><div class="stats-small"><span>미확인 ' + inv.unknown + '부</span><span>현재 보유 ' + inv.held + '부</span><span>반품 ' + state.returned + '부</span></div><div class="event-card"><strong>' + (state.replacement ? '40부 반품 → 교체본 40부 도착' : '잘못 인쇄한 운영시간은 무료로 보완받아요.') + '</strong>정상본 160부에 교체본 40부를 더하면 정상 200부입니다.</div>' + button(state.replacement ? '교체 완료 · 새 상자를 검수하세요' : '구버전 40부 무료 교체 요청', 'data-action="replace" ' + (state.replacement ? 'disabled' : '')) + '</div>';
  }
  const paymentSources = {
    contract: { label: '발주서', detail: 'PRINT-E01 · 제작 200부 · 220,000원' },
    'invoice-v2': { label: '최종 청구서 v2', detail: 'PRINT-E01 · 청구 220,000원' },
    inspection: { label: '검수조서', detail: 'PRINT-E01 · 정상 200부 · 보완 완료' },
    'invoice-v1': { label: '이전 청구서 v1', detail: 'PRINT-E01 · 청구 200,000원 · 미채택' }
  };
  function renderPayment() {
    return '<div class="desk"><p class="workspace-caption">선택한 증빙: <b>' + selectionLabel() + '</b></p><div class="payment-layout"><div class="supplies">' + Object.entries(paymentSources).map(([id, source]) => button('<b>' + source.label + '</b><small>' + source.detail + '</small>', 'data-select="payment" data-id="' + id + '"', 'supply ' + (selected?.value === id ? 'selected' : '') + (id === 'invoice-v1' ? ' outdated' : ''))).join('') + '</div><div class="paper"><h2>지급 서류철</h2><p style="font-size:12px">계약번호 PRINT-E01로 증빙을 연결합니다.</p>' + [['contract', '① 무엇을 주문했나요?'], ['invoice', '② 얼마를 청구했나요?'], ['inspection', '③ 제대로 받았나요?']].map(([slot, title]) => button('<b>' + title + '</b>' + (state.paymentSlots[slot] ? paymentSources[state.paymentSlots[slot]].label + '<br>' + paymentSources[state.paymentSlots[slot]].detail : '선택한 증빙을 여기에 넣으세요'), 'data-slot="' + slot + '"', 'slot ' + (state.paymentSlots[slot] ? 'filled' : ''))).join('') + '<div class="payment-receipt">이번 제작 지급<strong>220,000원</strong>' + (state.options.includes('delivery') ? '<small>배송비 30,000원은 실제 배부 완료 뒤 지급합니다.</small>' : '<small>선택 사업 ' + money(E.optionCost(state)) + '도 완료 증빙으로 함께 지급합니다.</small>') + '</div></div></div></div>';
  }
  const clues = {
    register: { title: '배부대장 확인', detail: 'B분점 60부 수령 완료로 적혀 있어요.' },
    receipt: { title: 'B분점 수령증 확인', detail: '실제 수령 20부. 계획보다 40부 부족해요.' },
    testimony: { title: '담당자에게 질문', detail: '“B-02는 보관실에 두었고 분점에는 아직 안 넘겼어요.”' },
    holding: { title: '보관실 조사', detail: '라벨 B-02 / B분점행 / 40부 / 전달 대기' }
  };
  function renderComplaint() {
    const d = state.distribution, delivery = state.options.includes('delivery');
    return '<div class="event-card"><strong>연미루의 연락</strong>“B분점에서는 20부만 받았다고 해요. 기록에는 60부인데요?”</div><div class="complaint-map"><div class="place">' + graphic('house') + '<b>생활보장과 창구</b><strong>' + d.counter + '<small> / 80부</small></strong>' + (state.carrying ? button('여기로 전달', 'data-deliver="counter"') : '') + '</div><div class="place">' + graphic('house') + '<b>A분점</b><strong>' + d.branchA + '<small> / 60부</small></strong>' + (state.carrying ? button('여기로 전달', 'data-deliver="branchA"') : '') + '</div><div class="place holding">' + graphic(delivery ? 'delivery' : 'box') + '<b>' + (delivery ? '1층 배송 보관실' : '2층 공용 보관실') + '</b><strong>' + (state.carrying ? '운반 중' : d.holding + '부') + '</strong>' + button('B-02 가져오기', 'data-action="pickup" ' + (d.holding === 0 || state.carrying ? 'disabled' : '')) + '</div><div class="place ' + (d.branchB < 60 ? 'missing' : '') + '">' + graphic('house') + '<b>B분점</b><strong>' + d.branchB + '<small> / 60부</small></strong>' + (state.carrying ? button('40부 전달하기', 'data-deliver="branchB"', 'primary') : button(state.receipt ? '✓ 60부 수령 확인' : '최종 수령증 받기', 'data-action="receipt" ' + (state.receipt ? 'disabled' : ''))) + '</div><div class="route-label">' + (state.carrying ? (delivery ? '배송 기사' : '주인공') + '가 B-02 40부를 운반하고 있어요. 목적지를 선택하세요.' : '창구 80 + A분점 60 + B분점 ' + d.branchB + ' + 보관 ' + d.holding + ' = 200부') + '</div></div><div class="clue-strip">' + Object.entries(clues).map(([id, clue]) => button('<b>' + (state.clues.includes(id) ? '✓ ' : '🔎 ') + clue.title + '</b><small>' + (state.clues.includes(id) ? clue.detail : '눌러서 조사하고 사건철에 기록') + '</small>', 'data-action="clue" data-id="' + id + '"', 'clue ' + (state.clues.includes(id) ? 'found' : ''))).join('') + '</div><div class="cause-form"><label for="complaint-cause">단서를 연결해 원인 메모 작성</label><select id="complaint-cause"><option value="">원인을 선택하세요</option><option value="intermediate" ' + (state.complaintCause === 'intermediate' ? 'selected' : '') + '>중간 보관 40부를 분점 수령으로 잘못 기록했다</option><option value="shortage" ' + (state.complaintCause === 'shortage' ? 'selected' : '') + '>인쇄소에서 홍보물 40부를 덜 만들었다</option><option value="lost" ' + (state.complaintCause === 'lost' ? 'selected' : '') + '>누군가 홍보물 40부를 분실했다</option></select><small>회신 내용: 기록 오류 확인 → B-02 40부 전달 → 최종 60부 수령 확인</small></div>';
  }
  function renderSettlement() {
    const total = (state.excluded ? 220000 : 440000) + E.optionCost(state);
    return '<div class="case-board"><div class="board-label">사라진 22만 원 · 집계행을 선택하고 근거를 연결하세요</div><div class="rows">' + ['R1', 'R2'].map((row, i) => button('<small>' + (i ? '가져오기 기록' : '수동 입력 기록') + '</small><b>' + row + ' · 220,000원</b><small>지급번호 PAY-E01-PRINT</small>' + (state.excluded === row ? '<span class="exclusion">중복 집계 제외 메모</span>' : ''), 'data-select="row" data-id="' + row + '"', 'evidence-row ' + (selected?.value === row ? 'selected ' : '') + (state.excluded === row ? 'excluded' : ''))).join('') + '</div><div class="evidence-links">' + ['R1', 'R2'].map(row => '<span>' + (state.links[row] === 'PAY-E01-PRINT' ? '↓ 같은 거래 · 지급 1회 확인' : state.links[row] ? '↓ 취소 초안에 연결됨' : '↓ 근거 미연결') + '</span>').join('') + '</div>' + button('<b>지급확인증 P1 · 실제 지급 220,000원</b><small>PAY-E01-PRINT / 지급 완료 1회<br>앞서 지급한 바로 그 거래입니다.</small>', 'data-link="PAY-E01-PRINT"', 'actual-payment') + button('취소요청 초안 C1 · 220,000원 / 미실행', 'data-link="CANCEL-DRAFT"', 'cancel-note') + '<div class="exclude-actions">' + button('R1에 집계 제외 메모', 'data-exclude="R1"') + button('R2에 집계 제외 메모', 'data-exclude="R2"') + button('메모 떼기', 'data-exclude=""') + '</div></div><div class="cause-form"><label for="settlement-cause">조사 결과를 보고서에 넣으세요</label><select id="settlement-cause"><option value="">오류 원인을 선택하세요</option><option value="duplicate" ' + (state.settlementCause === 'duplicate' ? 'selected' : '') + '>같은 지급 1건을 집계표에 두 번 반영했다</option><option value="doublePayment" ' + (state.settlementCause === 'doublePayment' ? 'selected' : '') + '>인쇄소에 실제로 두 번 지급했다</option><option value="cancel" ' + (state.settlementCause === 'cancel' ? 'selected' : '') + '>취소한 지급을 환불받지 못했다</option></select></div><div class="settlement-report"><h3>결산보고 공문 · 수정안</h3><div class="report-grid"><div>집계표 총집행<strong>' + money(total) + '</strong></div><div>집계표 잔액<strong>' + money(260000 - total) + '</strong></div><div>실제 총지급<strong>' + money(E.totals(state).paid) + '</strong></div><div>실제 잔액<strong>' + money(E.totals(state).remaining) + '</strong></div></div><p style="font-size:12px;margin:12px 0 0">정상 홍보물 200부 배부 · 민원 회신 완료<br>집계 제외 메모가 실제 지급을 취소하지 않습니다.</p></div>';
  }
  function renderResult() {
    const option = state.options[0], t = E.totals(state);
    return '<div class="result-board"><div class="result-hero"><div class="completion-seal">완료</div><h2>홍보물 200부, 오늘 안에 끝냈습니다!</h2><p style="font-size:13px">총지출 ' + money(t.paid) + ' · 잔액 ' + money(t.remaining) + '<br>세 곳 수령 확인 · 민원 회신 · 결산 결재</p></div><div class="noticeboard"><div class="poster"><span>모서리구청 생활보장과</span><strong>이용 안내</strong><div class="poster-art">' + graphic('house') + '</div><span>09:00~18:00</span><span>안내문 v2 · 배부 200부</span></div><div class="reward-object">' + graphic(option || 'print') + '<b>' + (option ? E.options[option].name : '안내 홍보물') + '</b><p>' + ({ stand: '창구에 새 거치대가 놓였어요.', delivery: '배송 확인 스티커가 기록에 남았어요.', proof: '교정 견본이 도감에 꽂혔어요.' }[option] || '게시판에 최신 안내문이 붙었어요.') + '</p></div></div><div class="dialogue"><b>백단비</b>“22만 원은 사라진 게 아니라, 두 번 적힌 거였네요.”</div><div class="dialogue"><b>B분점 회신</b>“이제 안내문 60부를 모두 받았어요. 감사합니다.”</div><div class="doc-library"><span>📁 제작계획</span><span>📁 검수조서</span><span>📁 민원 회신</span><span>📁 결산보고</span></div></div><details class="event-history"><summary>내가 처리한 업무 기록</summary><ul>' + state.log.map(item => '<li>' + item.message + '</li>').join('') + '</ul></details>';
  }
  const renders = [renderBudget, renderDocument, renderApproval, renderInspection, renderPayment, renderComplaint, renderSettlement, renderResult];
  function render() {
    const t = E.totals(state), [title, steps, condition] = notebooks[state.stage], readonly = state.stage < state.highest;
    el('chapter').textContent = 'EPISODE 01 / ' + String(state.stage + 1).padStart(2, '0') + ' OF 08';
    el('scene-title').textContent = E.stages[state.stage]; el('mission').textContent = mission[state.stage];
    el('status').innerHTML = '<span>사업 예산<strong>260,000원</strong></span><span>실제 지급<strong>' + money(t.paid) + '</strong></span><span>남은 돈<strong>' + money(t.remaining) + '</strong></span><span>선택 사업<strong>' + (state.options.map(id => E.options[id].name).join(' · ') || '없음') + '</strong></span>';
    el('stages').innerHTML = E.stages.map((name, i) => button('<span class="step-no">' + (i < state.highest ? '✓' : String(i + 1).padStart(2, '0')) + '</span>' + name, 'data-stage="' + i + '" ' + (!gallery && i > state.highest ? 'disabled' : '') + ' aria-current="' + (i === state.stage ? 'step' : 'false') + '"', i === state.stage ? 'active' : '')).join('');
    el('scene').innerHTML = renders[state.stage]();
    el('notebook').innerHTML = '<div><h2>' + title + '</h2><span class="note-stamp">' + (readonly ? '완료한 장면 다시 보기' : '현재 작업 ' + (state.stage + 1) + ' / 8') + '</span></div><ol>' + steps.map(step => '<li>' + step + '</li>').join('') + '</ol><div class="extra-note"><p><b>완료 조건</b><br>' + condition + '</p>' + (state.options.includes('proof') && [1, 3].includes(state.stage) ? '<p>📋 교정지: v1 17:00 → v2 18:00<br>사전 교정에서 확인한 내용을 다시 비교하세요.</p>' : '') + '</div>';
    el('feedback').textContent = lastMessage; el('feedback').className = 'feedback ' + (lastError ? 'error' : '');
    el('preview-banner').hidden = !gallery;
    el('play-mode').classList.toggle('primary', !gallery); el('gallery-mode').classList.toggle('primary', gallery);
    el('commit').textContent = commitLabels[state.stage];
    el('commit').disabled = state.stage !== 7 && (readonly || state.checked?.stage !== state.stage || state.checked?.revision !== state.revision || (state.stage === 0 && !state.priceRaised));
    el('check').hidden = state.stage === 7; el('check').disabled = readonly;
    el('undo').disabled = history.length === 0 || readonly || state.stage === 7;
    if (readonly) el('scene').querySelectorAll('button,select').forEach(control => { control.disabled = true; });
  }
  el('scene').addEventListener('click', event => {
    const target = event.target.closest('button'); if (!target || target.disabled) return;
    const d = target.dataset;
    if (d.select) selection(d.select, d.id);
    else if (d.target === 'document') {
      const source = selected?.kind === 'document' ? documentSources[selected.value] : null;
      if (!source || source.field !== d.field) { lastMessage = '먼저 이 칸에 맞는 자료를 왼쪽에서 선택하세요.'; lastError = true; render(); }
      else { act({ type: 'documentSet', field: d.field, value: source.value }); selected = null; render(); }
    } else if (d.action) act({ type: d.action, ...(d.id ? { id: d.id } : {}), ...(d.delta ? { delta: Number(d.delta) } : {}) });
    else if (d.box) { box = Number(d.box); selected = null; render(); }
    else if (d.bundle) { act({ type: 'inspect', ids: [d.bundle] }); selected = { kind: 'bundle', value: [d.bundle] }; render(); }
    else if (d.same) {
      const sample = selected?.kind === 'bundle' ? state.bundles.find(b => b.id === selected.value[0]) : null;
      if (sample) { const ids = state.bundles.filter(b => b.box === box && b.version === sample.version && b.status !== 'returned').map(b => b.id); act({ type: 'inspect', ids }); selected = { kind: 'bundle', value: ids }; render(); }
    } else if (d.classify) { act({ type: 'classify', ids: selected?.kind === 'bundle' ? selected.value : [], status: d.classify }); selected = null; render(); }
    else if (d.slot) { act({ type: 'paymentSlot', slot: d.slot, id: selected?.kind === 'payment' ? selected.value : '' }); selected = null; render(); }
    else if (d.deliver) act({ type: 'deliver', id: d.deliver });
    else if (d.link) { act({ type: 'link', row: selected?.kind === 'row' ? selected.value : '', target: d.link }); selected = null; render(); }
    else if ('exclude' in d) act({ type: 'exclude', row: d.exclude });
  });
  el('scene').addEventListener('change', event => {
    if (event.target.id === 'complaint-cause') act({ type: 'complaintCause', value: event.target.value });
    if (event.target.id === 'settlement-cause') act({ type: 'settlementCause', value: event.target.value });
  });
  el('stages').addEventListener('click', event => {
    const target = event.target.closest('[data-stage]'); if (!target || target.disabled) return;
    const stage = Number(target.dataset.stage); selected = null; box = 1; history = [];
    if (gallery) { state = E.previewState(stage); lastMessage = '이 장면부터 직접 체험할 수 있어요. 수첩의 순서대로 눌러 보세요.'; lastError = false; render(); }
    else act({ type: 'navigate', stage });
  });
  function reset() { gallery = false; state = E.initialState(); selected = null; history = []; box = 1; lastError = false; lastMessage = '새 사업을 시작합니다. 제작 카드에 예산 20칩을 놓아 주세요.'; save(); render(); }
  el('play-mode').addEventListener('click', reset);
  el('gallery-mode').addEventListener('click', () => { gallery = true; state = E.previewState(state.stage); selected = null; history = []; lastMessage = '왼쪽에서 주요 화면을 자유롭게 골라 체험하세요.'; lastError = false; render(); });
  el('check').addEventListener('click', () => act({ type: 'check' }));
  el('commit').addEventListener('click', () => { if (state.stage === 7) reset(); else act({ type: commitTypes[state.stage] }); });
  el('undo').addEventListener('click', () => { if (history.length) { state = history.pop(); state.checked = null; selected = null; lastMessage = '마지막 편집을 되돌렸어요. 실행이 끝난 지급·인계는 유지됩니다.'; lastError = false; save(); render(); } });
  el('hint').addEventListener('click', () => { const result = E.evaluate(state); lastMessage = result.errors[0] || (state.stage === 0 && !state.priceRaised ? '제작 20칩을 준비했어요. 인쇄소 견적을 확인하세요.' : notebooks[state.stage][1][0]); lastError = false; render(); });
  render();
})();
