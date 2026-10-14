(function (root) {
  'use strict';
  const VERSION = 'intro-1';
  const STORAGE = 'gong-game:life-support:leaflet-a:v1';
  const reference = { entrance: [50,95], pillar: [50,50], reception: [80,55], stairs: [20,25] };
  const samples = [
    { id: 's1', number: 1, map: null, phoneBottom: 55, phoneTop: 65 },
    { id: 's2', number: 2, map: {...reference}, phoneBottom: 15, phoneTop: 25 },
    { id: 's3', number: 3, map: { ...reference, reception: [20,55], stairs: [80,25] }, phoneBottom: 55, phoneTop: 65 },
    { id: 's4', number: 4, map: {...reference}, phoneBottom: 55, phoneTop: 65 }
  ];
  const uid = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  function initial() {
    const order=samples.map(s=>s.id);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    return { version: VERSION, attemptId: uid(), order, revision: 0, inspect: null, selected: null, scene: 'front', tab: 'document', records: [], attachments: {map:null, stand:null}, marks: {}, review: null, result: null, help: false, muted: true, reduced: false };
  }
  const sample = id => samples.find(s => s.id === id);
  function capture(state) {
    if (!sample(state.inspect) || !['map','stand','inside','outside'].includes(state.scene)) return null;
    const kind = state.scene === 'map' ? 'map' : state.scene === 'stand' ? 'stand' : 'face';
    const prior = state.records.find(r => r.candidate === state.inspect && r.scene === state.scene && r.version === VERSION);
    if (prior) return prior;
    const record = { id: uid(), candidate: state.inspect, kind, scene: state.scene, environment: kind === 'stand' ? 'lobby40' : null, version: VERSION };
    state.records.push(record); return record;
  }
  function conditions(s) {
    return { paper: !!s.map, route: !!s.map && Object.keys(reference).every(k => JSON.stringify(s.map[k]) === JSON.stringify(reference[k])), phone: s.phoneBottom >= 40 && s.phoneTop <= 210 };
  }
  function evaluate(state) {
    const issues = [];
    if (!sample(state.selected)) issues.push({ slot:'selected', text:'제작할 견본을 공문에 선정해 주세요.' });
    for (const kind of ['map','stand']) {
      const r = state.records.find(r => r.id === state.attachments[kind]);
      if (!r) issues.push({slot:kind,text:kind === 'map' ? '본관 안내도와 견본을 대조한 기록을 붙여 주세요.' : '안내대에 끝까지 꽂은 정면 기록을 붙여 주세요.'});
      else if (r.candidate !== state.selected || r.kind !== kind || r.version !== VERSION || (kind === 'stand' && r.environment !== 'lobby40')) issues.push({slot:kind,text:'선정 견본과 같은 대상·시험 종류의 현재 기록으로 교체해 주세요.'});
    }
    if (issues.length) return {ok:false,issues};
    const c = conditions(sample(state.selected));
    if (!c.paper) issues.push({slot:'map',text:'스마트폰 없이 길을 찾을 수 있는 종이 안내가 필요합니다. QR만으로는 안내할 수 없습니다.'});
    else if (!c.route) issues.push({slot:'map',text:'본관 안내도와 접수창구·계단 위치가 다릅니다. 입구에서 접수창구까지의 동선을 다시 대조해 주세요.'});
    if (!c.phone) issues.push({slot:'stand',text:'안내대 앞턱이 전화번호를 가립니다. 비치된 상태에서 번호 전체가 보여야 합니다.'});
    return {ok:issues.length === 0,issues};
  }
  function changeDraft(state) { state.revision++; if (state.review) state.review.stale = true; }
  function complete(state) {
    const review = evaluate(state); state.review = {...review,stale:false};
    if (review.ok && !state.result) state.result = { resultId:uid(), attemptId:state.attemptId, caseId:'life-support:leaflet-a-intro', contentVersion:VERSION, draftRevision:state.revision, difficulty:'intro', selectedCandidateId:state.selected, selectedSpec:{...sample(state.selected)}, evidenceRefs:{...state.attachments}, satisfiedConditions:['paper-navigation','building-route','mounted-phone'], status:'selection-reviewed' };
    return review;
  }
  function restore(raw) {
    const fresh = initial();
    if (!raw || raw.version !== VERSION || typeof raw.attemptId !== 'string') return fresh;
    const valid = id => !!sample(id);
    if(Array.isArray(raw.order)&&raw.order.length===samples.length&&new Set(raw.order).size===samples.length&&raw.order.every(valid))fresh.order=[...raw.order];
    fresh.attemptId = raw.attemptId; fresh.revision = Number.isInteger(raw.revision) ? raw.revision : 0;
    fresh.inspect = valid(raw.inspect) ? raw.inspect : null; fresh.selected = valid(raw.selected) ? raw.selected : null;
    fresh.scene = ['front','back','inside','outside','map','stand'].includes(raw.scene) ? raw.scene : 'front';
    fresh.tab = ['document','trial','reference'].includes(raw.tab) ? raw.tab : 'document';
    fresh.records = Array.isArray(raw.records) ? raw.records.filter(r => r && typeof r.id === 'string' && valid(r.candidate) && r.version === VERSION && ((r.kind==='map' && r.scene==='map') || (r.kind==='stand' && r.scene==='stand' && r.environment==='lobby40') || (r.kind==='face' && ['inside','outside'].includes(r.scene)))).map(r=>({...r})) : [];
    for (const kind of ['map','stand']) fresh.attachments[kind] = fresh.records.some(r=>r.id===raw.attachments?.[kind] && r.kind===kind) ? raw.attachments[kind] : null;
    for (const s of samples) if (['hold','exclude'].includes(raw.marks?.[s.id])) fresh.marks[s.id]=raw.marks[s.id];
    fresh.help = !!raw.help; fresh.muted = raw.muted !== false; fresh.reduced = !!raw.reduced;
    if (raw.review) fresh.review = {...evaluate(fresh), stale: !!raw.review.stale};
    if (raw.result?.attemptId === fresh.attemptId && raw.result?.selectedCandidateId === fresh.selected && typeof raw.result.resultId === 'string' && evaluate(fresh).ok) fresh.result = {...raw.result};
    return fresh;
  }
  const api = {VERSION,STORAGE,reference,samples,sample,initial,capture,conditions,evaluate,changeDraft,complete,restore};
  root.LeafletA = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
