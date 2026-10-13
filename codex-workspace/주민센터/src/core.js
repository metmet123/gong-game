(function (root) {
  'use strict';
  const cases = [
    { id: 'all', title: '함께 옮기는 집', subtitle: '세대 전체 이동', tag: '01', resident: '서유진',
      speech: '저희 세 사람 모두 이사했어요. 세대주는 그대로 저예요. 새집은 모퉁이로 12, 202호입니다.',
      oldAddress: '나무길 8 · 101호', newAddress: '모퉁이로 12 · 202호',
      oldHead: 'yu', people: [{ id:'yu', name:'서유진', detail:'신고인 · 성인', palette:0 }, {id:'min', name:'박민재', detail:'배우자 · 성인', palette:1}, {id:'sol', name:'박해솔', detail:'자녀 · 성인', palette:2}],
      movers:['yu','min','sol'], mode:'new', head:'yu', relations:{yu:'본인',min:'배우자',sol:'자녀'}, existing:[],
      facts:['세대원 3명 모두 이동합니다.','새 주소에는 편입할 기존 세대가 없습니다.','기존 세대주 서유진이 그대로 세대주입니다.'],
      evidence:['신고인과 전입자 확인 자료가 준비되어 있습니다.','신고 내용에는 세 사람과 새 상세주소가 기재되어 있습니다.'], ending:'새집 주소로 세 사람 모두 잘 옮겨졌네요. 감사합니다.' },
    { id:'part', title:'첫 독립, 둘이 함께', subtitle:'세대 일부 이동', tag:'02', resident:'이가온',
      speech:'저와 동생 보람만 이사했어요. 어머니 채림은 원래 집에 계세요. 새 세대주는 저고, 주소는 모퉁이로 12, 202호예요.',
      oldAddress:'나무길 8 · 101호', newAddress:'모퉁이로 12 · 202호', oldHead:'chae',
      people:[{id:'chae',name:'김채림',detail:'기존 세대주 · 성인',palette:3},{id:'ga',name:'이가온',detail:'신고인 · 성인',palette:0},{id:'bo',name:'이보람',detail:'가온의 동생 · 성인',palette:2}],
      movers:['ga','bo'], mode:'new', head:'ga', relations:{ga:'본인',bo:'형제자매'}, existing:[],
      facts:['가온과 보람만 이동합니다.','김채림은 기존 주소의 세대주로 남습니다.','새 세대주는 이가온, 보람은 가온의 동생입니다.'],
      evidence:['이번 신고에 필요한 전입자 확인 자료가 모두 준비되어 있습니다.','신고인과 상세주소 확인 자료가 준비되어 있습니다.'], ending:'이제 정말 저희 집 주소가 생겼네요. 이삿짐 정리하러 가야겠어요.' },
    { id:'join', title:'친구의 집으로', subtitle:'기존 세대에 편입', tag:'03', resident:'문다온',
      speech:'저만 친구 은오네 세대로 들어가요. 은오가 계속 세대주예요. 모퉁이로 12, 202호이고, 저희는 가족관계는 아니에요.',
      oldAddress:'나무길 8 · 101호', newAddress:'모퉁이로 12 · 202호',oldHead:'jun',
      people:[{id:'jun',name:'문준서',detail:'기존 세대주 · 성인',palette:1},{id:'da',name:'문다온',detail:'신고인 · 성인',palette:2}],
      movers:['da'],mode:'join',head:'eun',relations:{da:'동거인'},
      existing:[{id:'eun',name:'최은오',detail:'전입지 세대주 · 성인',palette:3}],
      facts:['문다온 한 사람만 이동합니다.','최은오의 기존 세대로 편입합니다.','은오가 세대주를 유지하며 다온은 동거인으로 기록합니다.'],
      evidence:['전입자와 전입지 세대주 관련 확인 자료가 준비되어 있습니다.','신고 내용에는 기존 세대 편입과 상세주소가 기재되어 있습니다.'],ending:'은오랑 같은 세대로 잘 등록됐군요. 오늘 저녁은 제가 사야겠어요.' }
  ];
  const clone = x => JSON.parse(JSON.stringify(x));
  function initial(c) { return {caseId:c.id,moved:[],selection:[],address:'',mode:'',head:'',relations:{},read:[],revision:0}; }
  function reduce(c,s,a) {
    const n=clone(s);
    if(a.type==='select' && c.people.some(p=>p.id===a.id) && !s.moved.includes(a.id)) n.selection=n.selection.includes(a.id)?n.selection.filter(id=>id!==a.id):n.selection.concat(a.id);
    else if(a.type==='move') {n.moved=[...new Set(n.moved.concat(n.selection))];n.selection=[];}
    else if(a.type==='return') {n.moved=n.moved.filter(id=>id!==a.id);delete n.relations[a.id];if(n.head===a.id)n.head='';}
    else if(a.type==='address')n.address=a.value;
    else if(a.type==='mode' && ['new','join'].includes(a.value)){if(n.mode===a.value)return s;n.mode=a.value;n.head=a.value==='join'&&c.existing.length?c.existing[0].id:'';n.relations={};}
    else if(a.type==='head' && n.mode==='new' && (!a.id||n.moved.includes(a.id))){n.head=a.id;for(const id of n.moved)if(n.relations[id]==='본인')delete n.relations[id];if(a.id)n.relations[a.id]='본인';}
    else if(a.type==='relation' && n.moved.includes(a.id) && a.id!==n.head)n.relations[a.id]=a.value;
    else if(a.type==='read' && ['report','identity'].includes(a.id))n.read=[...new Set(n.read.concat(a.id))];
    else return s;
    if(JSON.stringify(n)===JSON.stringify(s))return s;
    n.revision=s.revision+1;return n;
  }
  function evaluate(c,s) {
    const errors=[];const add=(target,message)=>errors.push({target,message});
    if(!s.moved.length)add('people','이동하는 사람을 선택해 주세요.');
    if(!s.address)add('address','새 주소와 호수를 선택해 주세요.');
    if(!s.mode)add('mode','새 세대를 구성할지, 기존 세대에 편입할지 선택해 주세요.');
    if(!s.head)add('head','이사 후 세대주를 지정해 주세요.');
    for(const p of c.people){const moved=s.moved.includes(p.id),wanted=c.movers.includes(p.id);if(moved!==wanted)add('people',`${p.name}${moved?'도 이동 예정입니다. 이번 신고에서는 기존 주소에 남습니다.':'도 이동하는 사람입니다. 새 주소의 세대로 옮겨 주세요.'}`);}
    if(s.address&&s.address!==c.newAddress)add('address','신고한 상세주소는 202호입니다. 새 주소를 다시 확인해 주세요.');
    if(s.mode&&s.mode!==c.mode)add('mode',c.mode==='join'?'이번 신고는 최은오의 기존 세대로 편입하는 신고입니다.':'이번 신고는 새 주소에 새로운 세대를 구성합니다.');
    if(s.mode==='join'&&!c.existing.length)add('mode','이 주소에는 이번 신고에서 편입할 기존 세대가 없습니다.');
    if(s.head&&s.head!==c.head)add('head','주민의 설명과 이사 후 세대주가 다릅니다. 요청 메모를 확인해 주세요.');
    for(const id of s.moved){if(!s.relations[id])add('relations',`${c.people.find(p=>p.id===id).name}의 이사 후 세대주와의 관계를 선택해 주세요.`);else if(c.relations[id]&&s.relations[id]!==c.relations[id])add('relations',`${c.people.find(p=>p.id===id).name}의 관계 기록을 확인해 주세요.`);}
    if(!s.read.includes('report')||!s.read.includes('identity'))add('documents','자료철의 신고 내용과 확인 자료를 모두 열어 살펴봐 주세요.');
    return {valid:errors.length===0,errors,revision:s.revision};
  }
  function canSubmit(c,s,review) {return !!review && review.valid && review.revision===s.revision && evaluate(c,s).valid;}
  const api={cases,initial,reduce,evaluate,canSubmit,clone};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MoveIn=api;
})(typeof globalThis!=='undefined'?globalThis:this);
