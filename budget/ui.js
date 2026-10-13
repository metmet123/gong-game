/* Additive integration: legacy easy levels and shared scoring stay in the app. */
(function(P,E,L){
 'use strict';
 const h=P.h,clone=x=>JSON.parse(JSON.stringify(x)),picked=new Map(),modes=new Map();
 const colors=['#ead6a8','#cedfc6','#d2dce9','#e5cbd4','#d7cdeb'];
 function css(){if(document.getElementById('budget-css'))return;const s=document.createElement('style');s.id='budget-css';s.textContent=`
 #pm-map .pm-row:has(.pnode[data-i="17"]){flex-wrap:wrap;gap:24px 12px;justify-content:center}
 .bp{width:100%;color:var(--ink);font:inherit}.bp *{box-sizing:border-box}.bp .bp-note{font-size:12px;line-height:1.5;margin:8px 0}.bp .bp-title{font-weight:900;margin:6px 0}.bp .bp-grid{display:grid;gap:3px;width:100%;max-width:360px;margin:8px auto}.bp button{font:inherit;min-height:44px;cursor:pointer;color:inherit}.bp .bp-cell{min-width:0;min-height:44px;border:1px solid #57604e;border-radius:5px;background:#fffdf5;font-weight:900;padding:2px;font-size:18px}.bp .bp-cell.off{background:#e6dcc0;color:#766f5c;text-decoration:line-through}.bp .bp-cell.keep{box-shadow:inset 0 0 0 3px #638057}.bp .bp-cell.selected{outline:2px solid #b77c2b;outline-offset:0}.bp .bp-cell.error{border:3px solid #bd4141}.bp .bp-head{font-size:11px;display:grid;place-items:center;min-width:0;overflow-wrap:anywhere}.bp .bp-total{font-size:14px;font-weight:900;background:#f1e2b5;border-radius:4px;display:grid;place-items:center;min-width:0}.bp .bp-total.ok{background:#cfe3bf}.bp .bp-total.error{outline:2px solid #bd4141}.bp .bp-card{background:#fffdf3;border:1px solid #b8b39a;border-radius:7px;padding:9px;margin:8px 0;font-size:12px;line-height:1.6;overflow-wrap:anywhere}.bp .bp-bar{display:flex;gap:4px;flex-wrap:wrap}.bp .bp-bar button{flex:1;padding:5px;border:1px solid #9c9b7c;border-radius:5px;background:#f2ebd4;font-size:12px;min-width:60px}.bp .bp-bar button[aria-pressed=true]{background:#d8e5c7;border-color:#638057}.bp .bp-lock{font-size:12px;opacity:.8}.bp details{font-size:12px;margin:5px 0;border:1px solid #bbb49e;border-radius:5px;padding:4px 8px}.bp summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-weight:800}.bp .bp-muted{color:#68715f}.bp .bp-auto{color:#827d6c;font-weight:400}
 `;document.head.append(s);}
 function intro(l){return h('div',{class:'bp-title'},l.title+' · '+l.phase);}
 function selected(l,d){return picked.has(l.key)?picked.get(l.key):(Number.isInteger(d.selected)?d.selected:0);}
 function sumView(l,d,a){
  css();const box=h('div',{class:'bp','data-budget':'sumgrid'}),i=selected(l,d),x=l.records[i],mode=modes.get(l.key)||'state',tot=E.sums(l,d.m),bad=new Set(a.result&&a.result.targets||[]);
  const choose=j=>{picked.set(l.key,j);a.redraw();},change=(j,value)=>{picked.set(l.key,j);const z=clone(d);z.m[j]=value===undefined?(z.m[j]+1)%3:value;a.set(z);};
  box.append(intro(l),h('p',{class:'bp-note'},l.ruleText),h('p',{class:'bp-note'},'단위 만 원 · '+l.year+'년 · 집계 기준 '+l.cutoff),h('div',{class:'bp-bar'},h('button',{type:'button','aria-pressed':String(mode==='state'),onclick:()=>{modes.set(l.key,'state');a.redraw();}},'상태 바꾸기'),h('button',{type:'button','aria-pressed':String(mode==='read'),onclick:()=>{modes.set(l.key,'read');a.redraw();}},'증빙 읽기')));
  const grid=h('div',{class:'bp-grid',style:'grid-template-columns:repeat(4,minmax(44px,1fr)) 42px'});
  l.cols.forEach(c=>grid.append(h('span',{class:'bp-head'},c)));grid.append(h('span',{class:'bp-head'},'목표'));
  for(let r=0;r<4;r++){for(let c=0;c<4;c++){const j=r*4+c;grid.append(h('button',{type:'button',class:'bp-cell '+(d.m[j]===1?'off ':d.m[j]===2?'keep ':'')+(j===i?'selected ':'')+(bad.has(j)?'error':''),'data-cell':j,'aria-label':`${l.rows[r]} ${l.cols[c]} ${l.g[r][c]}만 원, ${d.m[j]===1?'제외':d.m[j]===2?'포함 메모':'포함'}`,onclick:()=>mode==='read'?choose(j):change(j)},String(l.g[r][c])));}grid.append(h('span',{class:'bp-total '+(tot.rows[r]===l.rs[r]?'ok ':'')+(bad.has('r'+r)?'error':''),title:'현재 '+tot.rows[r]},h('small',{},l.rows[r]),String(l.rs[r])));}
  l.cs.forEach((v,c)=>grid.append(h('span',{class:'bp-total '+(tot.cols[c]===v?'ok ':'')+(bad.has('c'+c)?'error':''),title:'현재 '+tot.cols[c]},String(v))));grid.append(h('span',{class:'bp-head'},'합계'));box.append(grid,h('p',{class:'bp-note'},'상태: 포함 → 이번 집계에서 제외 → 포함 메모(○). 제외는 거래 취소가 아니에요.'));
  const facts=[`증빙 ${x.receipt} · ${Math.floor(i/4)+1}행 ${i%4+1}열 · ${l.g[Math.floor(i/4)][i%4]}만 원`];
  if(l.rules.includes('topic'))facts.push(`과목 ${x.topic} / 이 사업의 과목 ${x.expectedTopic}`);
  if(l.rules.includes('fund'))facts.push(`재원 ${x.fund} / 이 사업의 재원 ${x.expectedFund}`);
  if(l.rules.includes('approval')||l.rules.includes('version'))facts.push(`${x.approved?'승인 완료 '+x.approvedAt:'미승인'} · 수정 ${x.revision}차`);
  if(l.rules.includes('basis'))facts.push(`서식 ${x.basis} · ${x.note||'지출결의 총액을 집계해요.'}`);
  if(l.rules.includes('period'))facts.push(`${x.year}년 · ${x.category}`);
  const card=h('div',{class:'bp-card','data-evidence':i},...facts.map(t=>h('div',{},t)),h('div',{class:'bp-bar'},h('button',{type:'button',onclick:()=>change(i,0)},'포함'),h('button',{type:'button',onclick:()=>change(i,1)},'집계 제외'),h('button',{type:'button',onclick:()=>change(i,2)},'포함 메모 ○')));
  const related=l.records.map((v,j)=>v.receipt===x.receipt?j:-1).filter(j=>j>=0);if(related.length>1)card.append(h('p',{class:'bp-note'},'같은 증빙의 다른 기록'),h('div',{class:'bp-bar'},...related.map(j=>h('button',{type:'button',onclick:()=>choose(j)},`${Math.floor(j/4)+1}행 ${j%4+1}열 보기`))));box.append(card);
  if(l.closing)box.append(h('div',{class:'bp-card'},`결산 대조: 예산현액 ${l.closing.budget} = 이번 지출 ${tot.rows.reduce((a,b)=>a+b,0)} + 이월 ${l.closing.carry} + 반납 ${l.closing.refund} + 잔액 ${l.closing.balance} (만 원)`));
  box.append(h('p',{class:'bp-note bp-muted'},'업무를 간소화한 가상 자료예요. ★ 성공 · ★★ 확정 힌트 없이 · ★★★ 오답 제출 없이. 연습실은 P·경험치를 지급하지 않아요.'));a.el.append(box);
 }
 function queenView(l,d,a){
  css();const box=h('div',{class:'bp','data-budget':'queens'}),i=selected(l,d),r=Math.floor(i/5),c=i%5,p=l.projects[r],b=l.buckets[l.reg[i]],bad=new Set(a.result&&a.result.targets||[]),pins=d.c.map((v,j)=>v===2?j:-1).filter(j=>j>=0);
  const choose=j=>{picked.set(l.key,j);a.redraw();};
  box.append(intro(l),h('p',{class:'bp-note'},l.ruleText),h('p',{class:'bp-note'},'사업·월·예산 묶음마다 ● 하나. 옆·위아래·대각선으로 맞닿지 않게 놓아요.'));
  const grid=h('div',{class:'bp-grid',style:'grid-template-columns:28px repeat(5,minmax(44px,1fr));gap:0'});grid.append(h('span',{class:'bp-head'},'사업'));for(let c=0;c<5;c++)grid.append(h('span',{class:'bp-head'},(c+1)+'월'));
  for(let r=0;r<5;r++){grid.append(h('span',{class:'bp-head'},l.projects[r].short));for(let c=0;c<5;c++){const j=r*5+c,lock=E.cellReasons(l,r,c),auto=d.c[j]===0&&pins.some(k=>k%5===c||Math.floor(k/5)===r||l.reg[k]===l.reg[j]||Math.abs(k%5-c)<=1&&Math.abs(Math.floor(k/5)-r)<=1);grid.append(h('button',{type:'button',class:'bp-cell '+(j===i?'selected ':'')+(bad.has(j)?'error':''),style:`background:${colors[l.reg[j]]};border-radius:0`,'data-cell':j,'data-locked':!!lock.length,'aria-label':`${l.projects[r].name} ${c+1}월 ${l.buckets[l.reg[j]].name} ${lock.length?'배정 제한':d.c[j]===2?'배정':d.c[j]===1?'제외 메모':'빈칸'}`,onclick:()=>{picked.set(l.key,j);if(lock.length){a.redraw();return;}const z=clone(d);z.c[j]=(z.c[j]+1)%3;a.set(z);}},h('span',{class:lock.length?'bp-lock':auto?'bp-auto':''},d.c[j]===2?'●':d.c[j]===1?'×':lock.length?'🔒':auto?'×':'·'),h('small',{style:'display:block;font-size:10px'},l.buckets[l.reg[j]].name.replace('예산 묶음 ',''))));}}
  box.append(grid,h('p',{class:'bp-note'},'누르면 빈칸 → 제외 메모 × → 배정 ●. 흐린 ×는 배정에 따른 자동 표시예요. 🔒를 누르면 이유를 읽을 수 있어요.'));
  const facts=[`${p.name} · ${c+1}월 · ${b.name}`];if(l.rules.includes('topic'))facts.push('과목 '+p.topic);if(l.rules.includes('amount'))facts.push('사업비 '+p.cost*100+'만 원');if(l.rules.includes('fund'))facts.push('필요 재원 '+p.fund);if(l.rules.includes('time'))facts.push(`사업 기간 ${p.from}~${p.to}월`);if(l.rules.includes('approval'))facts.push(`${p.approvedMonth||'전년도 12'}월 말 승인 → 다음 달부터 배정`);
  const why=E.cellReasons(l,r,c);box.append(h('div',{class:'bp-card','data-evidence':i},...facts.map(t=>h('div',{},t)),...why.map(e=>h('div',{},'🔒 '+e.message)),h('div',{class:'bp-bar'},...l.projects.map((v,y)=>h('button',{type:'button',onclick:()=>choose(y*5+c)},v.short+' 보기')))));
  for(let k=0;k<5;k++){const v=l.buckets[k],f=[];if(l.rules.includes('topic'))f.push('사용 과목 '+v.topics.join('·'));if(l.rules.includes('amount'))f.push('배정 한도 '+v.limit*100+'만 원');if(l.rules.includes('fund'))f.push('재원 '+v.fund);if(l.rules.includes('time'))f.push(v.from+'월부터 사용');box.append(h('details',{style:'background:'+colors[k]},h('summary',{},'예산 묶음 '+v.name+' · 조건 보기'),...f.map(t=>h('div',{},t))));}
  if(l.rules.includes('dependency'))box.append(h('div',{class:'bp-card'},...l.dependencies.map(([x,y])=>h('div',{},`${l.projects[x].name} → 다음 달부터 ${l.projects[y].name}`))));
  box.append(h('p',{class:'bp-note bp-muted'},'월마다 한 사업·인접 금지·승인 다음 달 배정은 게임 규칙이에요. 실제 결재 기준은 기관마다 달라요. ★ 성공 · ★★ 확정 힌트 없이 · ★★★ 오답 제출 없이. 연습실은 P·경험치를 지급하지 않아요.'));a.el.append(box);
 }
 for(const [source,id] of [['sumgrid','it'],['queens','budget']]){
  const m=P.get(id),old={fromData:m.fromData,init:m.init,evaluate:m.evaluate,view:m.view,hints:m.hints};
  m.devices=m.devices||{};
  for(const diff of ['normal','hard'])L[source][diff].forEach((l,i)=>{const key='budget-'+diff+'-'+i;m.devices[key]={name:l.title,icon:'📋',text:l.ruleText};P.DATA[id][diff].push({...clone(l),stage:5,devices:[key],intro:key});});
  m.fromData=function(l,diff){return l.budget?l:old.fromData.call(m,l,diff);};
  m.init=function(l){return l.budget?source==='sumgrid'?{m:Array(16).fill(0),selected:0}:{c:Array(25).fill(0),selected:0}:old.init.call(m,l);};
  m.evaluate=function(l,d){return l.budget?(source==='sumgrid'?E.sumEvaluate(l,d):E.queensEvaluate(l,d)):old.evaluate.call(m,l,d);};
  m.view=function(l,d,a){return l.budget?(source==='sumgrid'?sumView(l,d,a):queenView(l,d,a)):old.view.call(m,l,d,a);};
  m.hints=function(l,d){return l.budget?l.hints:old.hints.call(m,l,d);};
  delete m._levels.normal;delete m._levels.hard;
 }
 if(typeof document!=='undefined')css();
})(Puzzles,window.BudgetEngine,window.BudgetLevels);
