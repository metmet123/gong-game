/* Deterministic authoring only. Runtime loads levels.json; no puzzle search in the browser. */
const fs=require('fs'),path=require('path'),E=require('./engine');
let seed=12026;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}const int=(a,b)=>a+Math.floor(rand()*(b-a+1)),pick=a=>a[int(0,a.length-1)];
const topics=['사무관리비','행사운영비','시설비','재료비'],funds=['구비','보조금','국비·구비 매칭'];
const sumSpecs=[
 ['normal','영수증이 두 번 왔어요',['duplicate'],'지출','같은 증빙은 한 번만 집계해요. 승인·과목은 이 문제에서 모두 맞아요.'],
 ['normal','금액은 맞는데 과목이 달라요',['topic'],'지출','칸 아래 사업의 예산과목에 맞는 증빙만 남겨요.'],
 ['normal','도장 전에는 이번 집계에서 빼요',['approval'],'지출','기준일까지 승인 완료된 증빙만 이번 지출에 넣어요. 대기 건을 취소하는 것은 아니에요.'],
 ['hard','최종본이 셋입니다',['version','approval'],'지출','같은 증빙의 승인 완료본 중 최신 유효본만 집계해요. 날짜가 최신인 미승인 초안은 제외해요.'],
 ['hard','지급액과 지출액은 달라요',['basis'],'지출','지출결의 총액을 집계해요. 계좌 지급·공제 명세는 대조용이며 다시 더하지 않아요.'],
 ['hard','올해 쓴 돈만 마감하세요',['period','fund'],'결산','2026년 지출과 지정 재원이 맞는 기록만 남겨요. 이월·반납은 지출에 섞지 않아요.']
];
function sumCandidate(spec){
 const [diff,title,rules,phase,ruleText]=spec,n=4,g=Array.from({length:n},()=>Array.from({length:n},()=>pick([20,30,40,50,60,80,90]))),keep=Array.from({length:n*n},()=>rand()<.5);
 if(rules.includes('basis')){g[0]=[100,90,10,pick([20,30,40])];g[1]=[100,90,10,pick([20,30,40])];[0,3,5,6].forEach(i=>keep[i]=true);[1,2,4,7].forEach(i=>keep[i]=false);}
 if(Array.from({length:n},(_,r)=>keep.slice(r*n,r*n+n)).some(a=>a.every(Boolean)||a.every(x=>!x)))return;
 const l={budget:true,kind:'sumgrid',n,g,title,phase,ruleText,rules,year:2026,cutoff:'2026-04-30',unit:'만 원',rows:['인쇄','교육','시설','행사'],cols:['1월','2월','3월','4월']};
 l.rs=g.map((a,r)=>a.reduce((s,v,c)=>s+(keep[r*n+c]?v:0),0));l.cs=Array.from({length:n},(_,c)=>g.reduce((s,a,r)=>s+(keep[r*n+c]?a[c]:0),0));
 if(l.cs.some(v=>v===0))return;
 const excluded=keep.map((x,i)=>x?-1:i).filter(i=>i>=0),included=keep.map((x,i)=>x?i:-1).filter(i=>i>=0);
 l.records=g.flat().map((amount,i)=>({amount,receipt:`증-${i+1}`,revision:1,topic:topics[Math.floor(i/n)],expectedTopic:topics[Math.floor(i/n)],fund:'구비',expectedFund:'구비',approved:true,approvedAt:'2026-03-20',year:2026,category:'지출',basis:'지출결의',note:'사업·금액을 확인한 승인 증빙'}));
 const change=(rule,i)=>{const x=l.records[i];if(rule==='topic')x.topic=topics[(topics.indexOf(x.topic)+1)%topics.length];if(rule==='fund')x.fund='보조금';if(rule==='approval'){x.approved=false;x.approvedAt='2026-05-02';}if(rule==='period'){x.year=pick([2025,2026]);x.category=x.year===2025?'지난 연도 지출':pick(['이월 예정','보조금 반납']);}if(rule==='basis')x.basis=pick(['계좌 지급','공제 명세']);};
 for(const rule of rules){
  if(rule==='duplicate'||rule==='version'){
   const same=[];for(const a of included)for(const b of excluded)if(g.flat()[a]===g.flat()[b])same.push([a,b]);if(!same.length)return;const [a,b]=pick(same);
   l.records[b].receipt=l.records[a].receipt;
   if(rule==='version'){l.records[a].revision=2;l.records[b].revision=1;l.records[b].approvedAt='2026-02-10';l.records[a].approvedAt='2026-03-20';}
  }else if(rule==='basis'){l.records[1].basis='계좌 지급';l.records[2].basis='공제 명세';l.records[1].receipt=l.records[0].receipt;l.records[2].receipt=l.records[0].receipt;l.records[0].note='지출결의 100만 원 = 지급 90만 원 + 공제 10만 원. 명세는 대조용';}
  else{const choices=rule==='approval'&&rules.includes('version')?excluded.filter(i=>l.records.filter(v=>v.receipt===l.records[i].receipt).length===1):excluded;if(!choices.length)return;const count=diff==='hard'?int(1,2):1;for(let k=0;k<count;k++)change(rule,pick(choices));}
 }
 if(rules.includes('version')){const a=included.find(a=>l.records[a].revision===2),i=excluded.find(i=>l.records[i].approved&&l.records[i].receipt!==l.records[a].receipt);if(i===undefined)return;l.records[i].receipt=l.records[a].receipt;l.records[i].revision=3;l.records[i].approved=false;l.records[i].approvedAt='2026-05-02';l.records[i].note='가장 최근 초안이지만 집계 기준일에 미승인';}
 l.witness={m:keep.map(x=>x?0:1),selected:0};
 if(E.sumErrors(l,l.witness.m).length)return;
 const mathematical=E.sumSolutions(l,'all');if(mathematical.length<2)return;
 const full=E.sumSolutions(l);if(full.length!==1)return;
 const ablation=Object.fromEntries(rules.map(rule=>[rule,E.sumSolutions(l,rule).length]));if(Object.values(ablation).some(n=>n<2))return;
 l.audit={solutions:full.length,withoutEvidence:mathematical.length,ablation};
 if(phase==='결산'){const spend=l.rs.reduce((a,b)=>a+b,0);l.closing={budget:spend+100,carry:60,refund:20,balance:20};}
 l.brief='행·열 합계와 증빙 조건을 함께 맞춰요. 제외는 이번 집계에서만 빼는 표시예요.';
 l.hints=[ruleText,'금액이 같아도 증빙 번호·승인·과목이 다를 수 있어요. 합계와 선택한 칸의 증빙을 번갈아 보세요.'];return l;
}
const queenSpecs=[
 ['normal','이 돈은 이 용도로만',['topic'],'편성','사업 과목에 쓸 수 있는 예산 묶음에 배정해요.'],
 ['normal','잔액이 남아도 들어갈 수는 없어요',['amount','fund'],'편성','사업비가 한도 안에 들어가고 지정 재원이 맞아야 해요.'],
 ['normal','보조금이 오는 달',['time'],'집행계획','사업의 가능 기간과 재원 사용 시작월을 함께 보세요.'],
 ['hard','돈은 있는데 용도가 달라요',['topic','amount','fund'],'편성','용도·금액·재원이 모두 맞는 묶음을 찾아요.'],
 ['hard','결재 끝난 뒤에 배정하세요',['fund','time','approval'],'집행계획','가상 배정 규칙: 전월 말까지 승인된 사업만 다음 달에 배정해요.'],
 ['hard','먼저 끝나야 시작합니다',['fund','time','dependency'],'집행계획','앞 사업을 마친 다음 달부터 뒤 사업을 시작해요. 월·묶음·재원도 모두 맞춰요.']
];
function permutations(){const out=[];function go(a){if(a.length===5){out.push(a);return;}for(let c=0;c<5;c++)if(!a.includes(c)&&(!a.length||Math.abs(a.at(-1)-c)>1))go([...a,c]);}go([]);return out;}const perms=permutations();
function queenCandidate(spec){
 const [diff,title,rules,phase,ruleText]=spec,n=5,p=pick(perms),reg=Array(n*n).fill(-1),front=[];
 p.forEach((c,r)=>{reg[r*n+c]=r;front.push(r*n+c);});
 for(let guard=0;reg.includes(-1)&&guard<4000;guard++){const i=pick(front),r=Math.floor(i/n),c=i%n,nb=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&a<n&&b>=0&&b<n&&reg[a*n+b]<0);if(nb.length){const [a,b]=pick(nb);reg[a*n+b]=reg[i];front.push(a*n+b);}}
 if(reg.includes(-1))return;
 const projects=Array.from({length:n},(_,r)=>({name:['생활 안내','현장 조사','시설 정비','교육 운영','홍보 인쇄'][r],short:['생활','조사','시설','교육','홍보'][r],topic:pick(topics),cost:int(2,8),fund:pick(funds),from:int(1,p[r]+1),to:int(p[r]+1,5),approvedMonth:int(0,p[r])}));
 const buckets=projects.map((x,i)=>({name:String.fromCharCode(65+i),fund:x.fund,topics:[x.topic,...(rand()<.45?[pick(topics)]:[])],limit:x.cost+int(0,3),from:int(1,p[i]+1)}));
 const sorted=projects.map((_,r)=>r).sort((a,b)=>p[a]-p[b]),dependencies=[];
 if(rules.includes('dependency')){const a=int(0,2),b=int(a+1,4);dependencies.push([sorted[a],sorted[b]]);const rest=sorted.filter(i=>i!==sorted[a]&&i!==sorted[b]);dependencies.push([rest[0],rest[2]]);}
 const l={budget:true,kind:'queens',n,reg,projects,buckets,rules,title,phase,ruleText,dependencies,brief:'사업마다·월마다·예산 묶음마다 하나씩. 배정끼리는 대각선까지 붙지 않아요(가상 조정 규칙).'};
 l.witness={c:Array(n*n).fill(0),selected:p[0]};p.forEach((c,r)=>l.witness.c[r*n+c]=2);
 if(E.queensErrors(l,l.witness.c).length)return;
 const full=E.queensSolutions(l);if(full.length!==1)return;
 const bare={...l,rules:[]},base=E.queensSolutions(bare);if(base.length<2)return;
 const ablation=Object.fromEntries(rules.map(rule=>[rule,E.queensSolutions(l,rule).length]));if(Object.values(ablation).some(n=>n<2))return;
 l.audit={solutions:full.length,withoutEvidence:base.length,ablation};l.hints=[ruleText,'한 사업의 가능한 칸을 좁힌 다음 같은 월·묶음의 다른 사업을 살펴보세요. 잠금 칸을 누르면 이유를 읽을 수 있어요.'];return l;
}
function generate(){const out={sumgrid:{normal:[],hard:[]},queens:{normal:[],hard:[]}},report=[];
 for(const [id,specs,make] of [['sumgrid',sumSpecs,sumCandidate],['queens',queenSpecs,queenCandidate]])for(const spec of specs){let l,tries=0;while(!l&&tries++<200000)l=make(spec);if(!l)throw Error(`${id} ${spec[1]}: 200000 tries exhausted`);out[id][spec[0]].push(l);report.push({id,diff:spec[0],title:l.title,tries,...l.audit});console.log(JSON.stringify(report.at(-1)));}
 fs.writeFileSync(path.join(__dirname,'levels.json'),JSON.stringify(out,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'generation-report.json'),JSON.stringify(report,null,2)+'\n');return out;
}if(require.main===module)generate();module.exports={generate};
