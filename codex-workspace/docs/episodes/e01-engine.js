/* E01-only state and rules. No legacy game modules or save data are read. */
(function (root) {
  'use strict';
  const options = {
    stand: { name: '안내 거치대', cost: 20000, effect: '창구에 안내 거치대가 생겨요.' },
    delivery: { name: '분점 배송', cost: 30000, effect: '배송 기사와 카트를 이용할 수 있어요.' },
    proof: { name: '사전 교정', cost: 40000, effect: '담당자가 비교 교정지를 준비해 줘요.' }
  };
  const stages = ['사업 편성', '공문 작업대', '결재 작전', '납품 검수', '지급 서류철', '민원 조사', '결산 사건 보드', '오늘의 사무실'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const initialState = () => ({
    version: 2, stage: 0, highest: 0, revision: 0, checked: null,
    chips: 0, options: [], priceRaised: false, lockedBudget: false,
    document: { quantity: 150, unit: 1000, version: 1, estimate: 1, specimen: 1 },
    approvals: { own: false, cooperation: false, chief: false, director: false },
    printed: [], location: 'desk', bundles: [], returned: 0, replacement: false,
    paymentSlots: {}, ledger: {}, distribution: null,
    clues: [], complaintCause: '', carrying: false, receipt: false, replied: false,
    links: {}, settlementCause: '', excluded: '', reportSigned: false,
    log: []
  });
  const optionCost = s => s.options.reduce((sum, id) => sum + options[id].cost, 0);
  const reserved = s => 26 - s.chips - optionCost(s) / 10000;
  const spent = s => Object.values(s.ledger).reduce((sum, payment) => sum + payment.amount, 0);
  const totals = s => ({ budget: 260000, planned: s.chips * 10000 + optionCost(s), paid: spent(s), remaining: 260000 - spent(s), reserve: reserved(s) });
  const inventory = s => {
    const counts = { good: 0, bad: 0, unknown: 0, returned: s.returned, held: 0 };
    for (const b of s.bundles) { counts[b.status] += b.quantity; if (b.status !== 'returned') counts.held += b.quantity; }
    // Returned is tracked as a transaction, rather than counted twice from bundle labels.
    counts.returned = s.returned;
    return counts;
  };
  function evaluate(s, stage = s.stage) {
    const errors = [];
    if (stage === 0) {
      if (s.chips !== (s.priceRaised ? 22 : 20)) errors.push('제작 카드에 ' + (s.priceRaised ? 22 : 20) + '칩을 배치하세요.');
      if (reserved(s) < 0) errors.push('예산을 ' + Math.abs(reserved(s)) + '칩 초과했어요. 선택 사업을 조정하세요.');
    } else if (stage === 1) {
      if (s.document.quantity !== 200) errors.push('제작 수량을 배부계획의 200부로 바꾸세요.');
      if (s.document.unit !== 1100) errors.push('산출 단가를 견적 v2의 1,100원으로 바꾸세요.');
      if (s.document.version !== 2) errors.push('운영시간을 최신 공지의 09:00~18:00로 바꾸세요.');
      if (s.document.estimate !== 2 || s.document.specimen !== 2) errors.push('붙임의 견적서와 규격 견본을 모두 v2로 교체하세요.');
    } else if (stage === 2) {
      if (!s.approvals.director) errors.push('협조와 출력 준비를 마치고, 계장 → 과장 순서로 결재받으세요.');
    } else if (stage === 3) {
      const inv = inventory(s);
      if (inv.unknown) errors.push('미확인 묶음 ' + inv.unknown + '부가 있어요. 샘플을 확인하고 분류하세요.');
      if (inv.good !== 200 || inv.bad || s.returned !== 40) errors.push('정상 200부와 구버전 40부 반품·교체를 확인하세요.');
    } else if (stage === 4) {
      if (s.paymentSlots.contract !== 'contract' || s.paymentSlots.invoice !== 'invoice-v2' || s.paymentSlots.inspection !== 'inspection') errors.push('발주서·청구서 v2·검수조서를 각각 맞는 칸에 연결하세요.');
    } else if (stage === 5) {
      if (!['register', 'receipt', 'testimony', 'holding'].every(id => s.clues.includes(id))) errors.push('배부대장·수령증·담당자 진술·보관 묶음을 모두 조사하세요.');
      if (s.complaintCause !== 'intermediate') errors.push('중간 보관을 최종 수령으로 기록한 근거를 연결하세요.');
      if (!s.receipt || s.distribution.branchB !== 60 || s.distribution.holding !== 0) errors.push('보관 중인 B-02 40부를 B분점에 전달하고 수령 확인을 받으세요.');
    } else if (stage === 6) {
      if (s.links.R1 !== 'PAY-E01-PRINT' || s.links.R2 !== 'PAY-E01-PRINT') errors.push('R1과 R2를 같은 지급확인증에 각각 연결하세요.');
      if (s.settlementCause !== 'duplicate') errors.push('실제 지급은 1회예요. 중복 집계를 원인으로 설명하세요.');
      if (!['R1', 'R2'].includes(s.excluded)) errors.push('같은 지급을 반영한 집계행 중 하나만 제외하세요.');
      if (!s.replied || spent(s) !== 220000 + optionCost(s)) errors.push('민원 회신과 선택 사업 지급을 먼저 마치세요.');
    }
    return { valid: errors.length === 0, errors };
  }
  function makeBundles() {
    return Array.from({ length: 20 }, (_, i) => ({ id: 'M' + (i + 1), box: Math.floor(i / 5) + 1, quantity: 10, version: i < 16 ? 2 : 1, status: 'unknown', inspected: false }));
  }
  function apply(state, action) {
    const s = clone(state);
    let message = '', ok = true, mutated = false;
    const deny = msg => { ok = false; message = msg; };
    const edit = () => { mutated = true; s.revision++; s.checked = null; };
    const next = () => { s.stage++; s.highest = Math.max(s.highest, s.stage); edit(); };
    const pay = (id, amount) => {
      if (!s.ledger[id]) { s.ledger[id] = { amount, status: 'paid' }; return true; }
      return false;
    };
    const requiredStage = {
      chips: 0, option: 0, quote: 0, budgetCommit: 0, documentSet: 1, documentCommit: 1,
      visit: 2, print: 2, approvalCommit: 2, inspect: 3, classify: 3, replace: 3, inspectionCommit: 3,
      paymentSlot: 4, paymentCommit: 4, clue: 5, complaintCause: 5, pickup: 5, deliver: 5, receipt: 5, complaintCommit: 5,
      link: 6, settlementCause: 6, exclude: 6, settlementCommit: 6
    };
    if (action.type in requiredStage && requiredStage[action.type] !== s.stage) return { state: s, ok: false, message: '현재 장면에서 가능한 행동을 선택하세요.' };
    if (s.stage < s.highest && action.type !== 'navigate') return { state: s, ok: false, message: '완료한 장면은 기록으로 볼 수 있어요. 진행 중인 장면으로 돌아가세요.' };
    if (action.type === 'check') {
      const result = evaluate(s);
      if (result.valid) { s.checked = { stage: s.stage, revision: s.revision }; message = '준비가 됐어요. 아래 실행 버튼으로 마무리하세요.'; }
      else { s.checked = null; deny(result.errors.join(' ')); }
    } else if (action.type.endsWith('Commit')) {
      if (s.checked?.stage !== s.stage || s.checked?.revision !== s.revision || !evaluate(s).valid) deny('현재 작업을 먼저 확인하세요. 수정 후에는 다시 확인해야 해요.');
      else if (action.type === 'budgetCommit') {
        if (!s.priceRaised) deny('최신 견적을 먼저 확인하세요.');
        else { s.lockedBudget = true; next(); message = '사업을 확정했어요. 지난 기안문을 새 사업에 맞게 고쳐 봅시다.'; }
      } else if (action.type === 'documentCommit') {
        s.approvals.own = true; next(); message = '담당 확인 도장! 서류철을 들고 협조 담당자를 찾아가세요.';
      } else if (action.type === 'approvalCommit') {
        s.bundles = makeBundles(); next(); message = '발주 완료. 홍보물 200부가 네 상자에 도착했어요.';
      } else if (action.type === 'inspectionCommit') { next(); message = '정상본 200부를 확보했어요. 증빙을 연결해 지급합시다.'; }
      else if (action.type === 'paymentCommit') {
        pay('PAY-E01-PRINT', 220000);
        s.options.filter(id => id !== 'delivery').forEach(id => pay('PAY-E01-' + id.toUpperCase(), options[id].cost));
        s.distribution = { counter: 80, branchA: 60, branchB: 20, holding: 40, inTransit: 0 };
        next(); message = '지급 완료. 그런데 B분점에서 “20부만 받았다”는 연락이 왔어요.';
      } else if (action.type === 'complaintCommit') {
        s.replied = true;
        if (s.options.includes('delivery')) pay('PAY-E01-DELIVERY', 30000);
        next(); message = 'B분점에 60부 전달을 확인하고 회신했어요. 이제 결산 기록을 확인하세요.';
      } else if (action.type === 'settlementCommit') {
        s.reportSigned = true; next(); message = '결산 확인 도장! 홍보물 200부 사업을 마쳤어요.';
      }
    } else if (action.type === 'chips') {
      const n = s.chips + action.delta;
      if (!Number.isInteger(action.delta) || n < 0 || n > 26) deny('제작 예산은 0~26칩 안에서 배치하세요.');
      else if (action.delta > 0 && n + optionCost(s) / 10000 > 26) deny('예비 칩이 부족해요. 선택 사업을 빼면 옮길 수 있어요.');
      else { s.chips = n; edit(); message = '예산 칩이 제작 카드로 이동했어요.'; }
    } else if (action.type === 'option') {
      if (!options[action.id]) deny('이 사업은 선택할 수 없어요.');
      else if (s.options.includes(action.id)) { s.options = s.options.filter(id => id !== action.id); edit(); message = '칩을 예비 트레이로 돌려놓았어요.'; }
      else if (reserved(s) < options[action.id].cost / 10000) deny('예비 칩이 부족해요. 다른 사업을 조정하세요.');
      else { s.options.push(action.id); edit(); message = options[action.id].effect; }
    } else if (action.type === 'quote') {
      if (s.priceRaised) deny('최신 견적은 이미 확인했어요. 제작 22칩을 준비하세요.');
      else if (!evaluate(s).valid) deny('제작 20칩을 먼저 준비하고 견적을 확인하세요.');
      else { s.priceRaised = true; edit(); message = '인쇄소 연락: 단가가 1,100원으로 올랐어요. 제작 카드에 2칩을 더 놓으세요.'; }
    } else if (action.type === 'documentSet') {
      const allowed = { quantity: [150, 200], unit: [1000, 1100], version: [1, 2], estimate: [1, 2], specimen: [1, 2] };
      if (!allowed[action.field]?.includes(action.value)) deny('해당 문서 칸에 맞는 자료를 선택하세요.');
      else { s.document[action.field] = action.value; edit(); message = '공문의 해당 위치를 교체했어요.'; }
    } else if (action.type === 'visit') {
      if (!['desk', 'cooperation', 'printer', 'chief', 'director'].includes(action.id)) deny('방문할 자리를 선택하세요.');
      else {
        s.location = action.id;
        if (action.id === 'cooperation') { if (!s.approvals.cooperation) { s.approvals.cooperation = true; edit(); } message = s.options.includes('proof') ? '나소라: 교정지의 최신 운영시간과 일치해요. 협조 확인!' : '나소라: 최신 공지와 배부계획 확인했어요. 협조 도장!'; }
        else if (action.id === 'chief') {
          if (!s.approvals.cooperation || s.printed.length !== 2) deny('권한솔: 협조 확인과 최신 견적·견본 출력이 먼저예요.');
          else { if (!s.approvals.chief) { s.approvals.chief = true; edit(); } message = '권한솔: 준비가 됐군요. 계장 결재!'; }
        } else if (action.id === 'director') {
          if (!s.approvals.chief) deny('정윤서: 계장 결재를 받고 가져와 주세요.');
          else { if (!s.approvals.director) { s.approvals.director = true; edit(); } message = '정윤서: 과장 결재! 인쇄소에 발주할 수 있어요.'; }
        } else message = action.id === 'printer' ? '출력함에서 우리 사업의 최신 견적과 견본을 찾아 서류철에 넣으세요.' : '담당 확인을 마친 서류철을 들고 있어요.';
      }
    } else if (action.type === 'print') {
      if (s.location !== 'printer') deny('프린터에 도착한 뒤 출력물을 챙기세요.');
      else if (!['estimate-v2', 'specimen-v2'].includes(action.id)) deny('이 종이는 구버전 또는 다른 사업이에요. 출력함에 남겨둘게요.');
      else { if (!s.printed.includes(action.id)) { s.printed.push(action.id); edit(); } message = '최신 출력물을 서류철에 클립으로 묶었어요.'; }
    } else if (action.type === 'inspect') {
      const ids = action.ids || [];
      if (!ids.length || ids.some(id => !s.bundles.some(b => b.id === id && b.status !== 'returned'))) deny('상자에서 확인할 묶음을 선택하세요.');
      else { ids.forEach(id => { s.bundles.find(b => b.id === id).inspected = true; }); message = '샘플을 펼쳤어요. 운영시간을 승인 시안과 비교하세요.'; }
    } else if (action.type === 'classify') {
      const bundles = (action.ids || []).map(id => s.bundles.find(b => b.id === id));
      if (!bundles.length || bundles.some(b => !b || !b.inspected || b.status === 'returned')) deny('묶음 샘플을 먼저 펼쳐 확인하세요.');
      else if (!['good', 'bad'].includes(action.status)) deny('정상 또는 보완 구역을 선택하세요.');
      else if (bundles.some(b => (b.version === 2 ? 'good' : 'bad') !== action.status)) deny('운영시간을 다시 비교하세요. v2 18:00는 정상, v1 17:00는 보완 대상이에요.');
      else { bundles.forEach(b => { b.status = action.status; }); edit(); message = '묶음을 ' + (action.status === 'good' ? '정상' : '보완') + ' 구역에 옮겼어요.'; }
    } else if (action.type === 'replace') {
      const inv = inventory(s);
      if (s.replacement) deny('반품과 교체는 이미 한 번 완료됐어요. 교체본을 확인하세요.');
      else if (inv.good !== 160 || inv.bad !== 40 || inv.unknown) deny('정상 160부와 보완 40부를 먼저 분류하세요.');
      else {
        s.bundles.filter(b => b.status === 'bad').forEach(b => { b.status = 'returned'; }); s.returned = 40; s.replacement = true;
        for (let i = 0; i < 4; i++) s.bundles.push({ id: 'N' + (i + 1), box: 5, quantity: 10, version: 2, status: 'unknown', inspected: false });
        edit(); message = '구버전 40부를 돌려보내고 교체본 40부를 받았어요. 추가비용 0원. 새 상자를 확인하세요.';
      }
    } else if (action.type === 'paymentSlot') {
      const matches = { contract: ['contract'], invoice: ['invoice-v1', 'invoice-v2'], inspection: ['inspection'] };
      if (!matches[action.slot]?.includes(action.id)) deny('증빙 종류에 맞는 칸에 넣으세요.');
      else { s.paymentSlots[action.slot] = action.id; edit(); message = '증빙을 지급 서류철에 넣었어요.'; }
    } else if (action.type === 'clue') {
      if (!['register', 'receipt', 'testimony', 'holding'].includes(action.id)) deny('조사 대상을 선택하세요.');
      else { if (!s.clues.includes(action.id)) { s.clues.push(action.id); edit(); } message = '단서를 사건철에 기록했어요.'; }
    } else if (action.type === 'complaintCause') {
      if (!['intermediate', 'shortage', 'lost'].includes(action.value)) deny('기록과 물품으로 확인한 원인을 선택하세요.');
      else { s.complaintCause = action.value; edit(); message = '원인 메모를 작성했어요. 실제 전달까지 확인해야 사건을 닫을 수 있어요.'; }
    } else if (action.type === 'pickup') {
      if (!['register', 'receipt', 'testimony', 'holding'].every(id => s.clues.includes(id)) || s.complaintCause !== 'intermediate') deny('단서 4개로 B-02의 행방과 기록 오류를 먼저 확인하세요.');
      else if (s.carrying || s.distribution.holding === 0) deny('같은 묶음을 두 번 가져갈 수 없어요.');
      else { s.carrying = true; s.distribution.holding = 0; s.distribution.inTransit = 40; edit(); message = 'B-02 40부를 들었어요. B분점으로 가져가세요.'; }
    } else if (action.type === 'deliver') {
      if (!s.carrying) deny('보관실에서 B-02 묶음을 먼저 가져오세요.');
      else if (action.id !== 'branchB') deny('상자 라벨은 B분점행이에요. 목적지를 다시 확인하세요.');
      else { s.carrying = false; s.distribution.holding = 0; s.distribution.inTransit = 0; s.distribution.branchB = 60; edit(); message = 'B분점에 40부를 전달했어요. 담당자의 수령 확인을 받으세요.'; }
    } else if (action.type === 'receipt') {
      if (s.distribution.branchB !== 60 || s.carrying) deny('실제 전달이 먼저예요. 기록만으로 완료할 수 없어요.');
      else { if (!s.receipt) { s.receipt = true; edit(); } message = 'B분점 최종 수령증 60부를 받았어요.'; }
    } else if (action.type === 'link') {
      if (!['R1', 'R2'].includes(action.row) || !['PAY-E01-PRINT', 'CANCEL-DRAFT'].includes(action.target)) deny('집계행과 지급 자료를 선택하세요.');
      else { s.links[action.row] = action.target; edit(); message = '자료를 연결했어요. 거래번호와 실제 지급 상태를 확인하세요.'; }
    } else if (action.type === 'settlementCause') {
      if (!['duplicate', 'doublePayment', 'cancel'].includes(action.value)) deny('조사한 오류 원인을 선택하세요.');
      else { s.settlementCause = action.value; edit(); message = '결산 조사 결과를 작성했어요.'; }
    } else if (action.type === 'exclude') {
      if (!['R1', 'R2', ''].includes(action.row)) deny('제작비의 중복 집계행만 제외할 수 있어요.');
      else { s.excluded = action.row; edit(); message = action.row ? action.row + '에 집계 제외 메모를 붙였어요. 실제 지급은 유지됩니다.' : '집계 제외 메모를 떼었어요.'; }
    } else if (action.type === 'navigate') {
      if (!Number.isInteger(action.stage) || action.stage < 0 || action.stage > s.highest) deny('현재 진행까지의 화면만 볼 수 있어요.');
      else { s.stage = action.stage; s.checked = null; message = '완료한 작업을 다시 살펴보는 중이에요.'; }
    } else deny('지원하지 않는 행동이에요.');
    if (mutated && ok) s.log.push({ stage: state.stage, action: action.type, message });
    return { state: s, ok, message };
  }
  function previewState(stage) {
    let s = initialState();
    const doAction = action => { const result = apply(s, action); if (!result.ok) throw new Error(result.message); s = result.state; };
    const commit = type => { doAction({ type: 'check' }); doAction({ type }); };
    if (stage === 0) return s;
    doAction({ type: 'chips', delta: 20 }); doAction({ type: 'option', id: 'stand' }); doAction({ type: 'quote' }); doAction({ type: 'chips', delta: 2 }); commit('budgetCommit');
    if (stage === 1) return s;
    for (const [field, value] of Object.entries({ quantity: 200, unit: 1100, version: 2, estimate: 2, specimen: 2 })) doAction({ type: 'documentSet', field, value });
    commit('documentCommit'); if (stage === 2) return s;
    doAction({ type: 'visit', id: 'cooperation' }); doAction({ type: 'visit', id: 'printer' });
    doAction({ type: 'print', id: 'estimate-v2' }); doAction({ type: 'print', id: 'specimen-v2' }); doAction({ type: 'visit', id: 'chief' }); doAction({ type: 'visit', id: 'director' }); commit('approvalCommit');
    if (stage === 3) return s;
    for (const version of [2, 1]) { const ids = s.bundles.filter(b => b.version === version).map(b => b.id); doAction({ type: 'inspect', ids }); doAction({ type: 'classify', ids, status: version === 2 ? 'good' : 'bad' }); }
    doAction({ type: 'replace' }); const ids = s.bundles.filter(b => b.box === 5).map(b => b.id); doAction({ type: 'inspect', ids }); doAction({ type: 'classify', ids, status: 'good' }); commit('inspectionCommit');
    if (stage === 4) return s;
    for (const [slot, id] of Object.entries({ contract: 'contract', invoice: 'invoice-v2', inspection: 'inspection' })) doAction({ type: 'paymentSlot', slot, id });
    commit('paymentCommit'); if (stage === 5) return s;
    for (const id of ['register', 'receipt', 'testimony', 'holding']) doAction({ type: 'clue', id }); doAction({ type: 'complaintCause', value: 'intermediate' }); doAction({ type: 'pickup' }); doAction({ type: 'deliver', id: 'branchB' }); doAction({ type: 'receipt' }); commit('complaintCommit');
    if (stage === 6) return s;
    doAction({ type: 'link', row: 'R1', target: 'PAY-E01-PRINT' }); doAction({ type: 'link', row: 'R2', target: 'PAY-E01-PRINT' }); doAction({ type: 'settlementCause', value: 'duplicate' }); doAction({ type: 'exclude', row: 'R2' }); commit('settlementCommit');
    return s;
  }
  const api = { options, stages, initialState, apply, evaluate, totals, inventory, optionCost, previewState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.E01Episode = api;
})(typeof window === 'undefined' ? globalThis : window);
