/* Pure rules shared by generation, evaluation and UI. Amounts are integer game units. */
(function(root){
 'use strict';
 const reasons={duplicate:'같은 증빙이 두 번 포함됐어요.',topic:'사업의 예산과목과 다른 기록이에요.',approval:'집계 기준일까지 승인되지 않았어요.',version:'승인 완료본 중 최신 유효본을 사용해요.',basis:'지급·공제 명세는 대조용이에요. 지출결의 총액만 집계해요.',period:'이번 회계연도의 지출만 집계해요.',fund:'해당 사업의 재원과 다른 기록이에요.'};
 const validState=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(x=>Number.isInteger(x)&&x>=0&&x<=2);
 function sumErrors(l,m,ignore){
  const errors=[],selected=m.map((v,i)=>v===1?-1:i).filter(i=>i>=0),rules=(l.rules||[]).filter(x=>x!==ignore),add=(rule,indices)=>errors.push({rule,indices,message:reasons[rule]});
  for(const rule of rules){
   if(rule==='duplicate'){
    const groups=new Map();for(const i of selected){const key=l.records[i].receipt;groups.set(key,[...(groups.get(key)||[]),i]);}
    for(const indices of groups.values())if(indices.length>1)add(rule,indices);
   }else for(const i of selected){const x=l.records[i];let invalid=false;
    if(rule==='topic')invalid=x.topic!==x.expectedTopic;
    if(rule==='fund')invalid=x.fund!==x.expectedFund;
    if(rule==='approval')invalid=!x.approved||x.approvedAt>l.cutoff;
    if(rule==='period')invalid=x.year!==l.year||x.category!=='지출';
    if(rule==='basis')invalid=x.basis!=='지출결의';
    if(rule==='version'){
     const versions=l.records.filter(v=>v.receipt===x.receipt);
     if(versions.length>1){const latest=Math.max(...versions.filter(v=>v.approved&&v.approvedAt<=l.cutoff).map(v=>v.revision));invalid=!x.approved||x.approvedAt>l.cutoff||x.revision!==latest;}
    }
    if(invalid)add(rule,[i]);
   }
  }return errors;
 }
 function sums(l,m){return {rows:l.g.map((row,r)=>row.reduce((s,v,c)=>s+(m[r*l.n+c]===1?0:v),0)),cols:Array.from({length:l.n},(_,c)=>l.g.reduce((s,row,r)=>s+(m[r*l.n+c]===1?0:row[c]),0))};}
 function sumEvaluate(l,d){
  if(!d||!validState(d.m,l.n*l.n))return {status:'invalid',msg:'초안 형식이 맞지 않아요. 처음부터 다시 열어 주세요.',targets:[]};
  const errors=sumErrors(l,d.m);if(errors.length)return {status:'invalid',msg:errors[0].message,targets:errors.flatMap(e=>e.indices),errors};
  const s=sums(l,d.m),rows=s.rows.map((v,i)=>v===l.rs[i]?-1:i).filter(x=>x>=0),cols=s.cols.map((v,i)=>v===l.cs[i]?-1:i).filter(x=>x>=0);
  if(rows.length||cols.length)return {status:'invalid',msg:`합계가 안 맞는 줄 ${rows.length}개, 열 ${cols.length}개`,targets:[...rows.map(i=>'r'+i),...cols.map(i=>'c'+i)]};
  if(l.closing&&l.closing.budget!==s.rows.reduce((a,b)=>a+b,0)+l.closing.carry+l.closing.refund+l.closing.balance)return {status:'invalid',msg:'지출·이월·반납·잔액과 예산현액이 맞지 않아요.',targets:[]};
  return {status:'valid',msg:l.closing?'지출과 이월·반납·잔액을 구분했어요. 결산 끝!':'증빙과 모든 합계가 맞았어요. 정산 끝!'};
 }
 function sumSolutions(l,ignore,cap=100000){
  const n=l.n,options=l.g.map((row,r)=>{const a=[];for(let mask=0;mask<1<<n;mask++){let s=0;for(let c=0;c<n;c++)if(mask>>c&1)s+=row[c];if(s===l.rs[r])a.push(mask);}return a;}),cols=Array(n).fill(0),out=[];
  function go(r,m){if(out.length>=cap)return;if(r===n){if(cols.every((v,c)=>v===l.cs[c])&&(ignore==='all'||!sumErrors(l,m,ignore).length))out.push(m.slice());return;}
   for(const mask of options[r]){let possible=true;for(let c=0;c<n;c++)if(mask>>c&1){cols[c]+=l.g[r][c];if(cols[c]>l.cs[c])possible=false;}
    if(possible)go(r+1,[...m,...Array.from({length:n},(_,c)=>mask>>c&1?0:1)]);
    for(let c=0;c<n;c++)if(mask>>c&1)cols[c]-=l.g[r][c];
   }
  }go(0,[]);return out;
 }
 function cellReasons(l,r,c,ignore){
  const p=l.projects[r],b=l.buckets[l.reg[r*l.n+c]],rules=l.rules.filter(x=>x!==ignore),out=[];
  if(rules.includes('topic')&&!b.topics.includes(p.topic))out.push({rule:'topic',message:`${b.name}은 ${p.topic}에 쓸 수 없어요.`});
  if(rules.includes('amount')&&p.cost>b.limit)out.push({rule:'amount',message:`사업비 ${p.cost*100}만 원 > ${b.name} 한도 ${b.limit*100}만 원`});
  if(rules.includes('fund')&&p.fund!==b.fund)out.push({rule:'fund',message:`${p.name}은 ${p.fund} 재원으로 배정해요. 이 묶음은 ${b.fund}예요.`});
  if(rules.includes('time')&&(c+1<p.from||c+1>p.to||c+1<b.from))out.push({rule:'time',message:`사업은 ${p.from}~${p.to}월, 재원은 ${b.from}월부터 쓸 수 있어요.`});
  if(rules.includes('approval')&&c+1<=p.approvedMonth)out.push({rule:'approval',message:`${p.approvedMonth||'전년도 12'}월 말 승인 → 다음 달부터 배정해요.`});
  return out;
 }
 function queensErrors(l,c,ignore){
  const pins=c.map((v,i)=>v===2?i:-1).filter(i=>i>=0),out=[],add=(indices,message,rule)=>out.push({indices,message,rule});
  for(let a=0;a<pins.length;a++)for(let b=a+1;b<pins.length;b++){
   const i=pins[a],j=pins[b],x=i%l.n,y=Math.floor(i/l.n),xx=j%l.n,yy=Math.floor(j/l.n);
   if(x===xx||y===yy||l.reg[i]===l.reg[j]||Math.abs(x-xx)<=1&&Math.abs(y-yy)<=1)add([i,j],'같은 월·사업·예산 묶음에 둘이거나, 배정끼리 붙어 있어요.','geometry');
  }
  for(const i of pins)for(const e of cellReasons(l,Math.floor(i/l.n),i%l.n,ignore))add([i],e.message,e.rule);
  if(l.rules.includes('dependency')&&ignore!=='dependency')for(const [before,after] of l.dependencies){
   const a=pins.find(i=>Math.floor(i/l.n)===before),b=pins.find(i=>Math.floor(i/l.n)===after);
   if(a!==undefined&&b!==undefined&&a%l.n>=b%l.n)add([a,b],`${l.projects[before].name}을 마친 다음 달부터 ${l.projects[after].name}을 시작해요.`,'dependency');
  }return out;
 }
 function queensEvaluate(l,d){
  if(!d||!validState(d.c,l.n*l.n))return {status:'invalid',msg:'초안 형식이 맞지 않아요. 처음부터 다시 열어 주세요.',targets:[]};
  const errors=queensErrors(l,d.c);if(errors.length)return {status:'invalid',msg:errors[0].message,targets:errors.flatMap(e=>e.indices),errors};
  const n=d.c.filter(x=>x===2).length;if(n<l.n)return {status:'incomplete',msg:`사업 ${n}/${l.n}개를 놓았어요.`};
  return {status:'valid',msg:'모든 사업을 예산·재원·시기에 맞게 배정했어요.'};
 }
 function queensSolutions(l,ignore,cap=100000){
  const out=[],usedCols=new Set(),usedBuckets=new Set(),pos=[],n=l.n;
  function go(r){if(out.length>=cap)return;if(r===n){const c=Array(n*n).fill(0);pos.forEach((x,y)=>c[y*n+x]=2);if(!queensErrors(l,c,ignore).length)out.push(c);return;}
   for(let c=0;c<n;c++){const b=l.reg[r*n+c];if(usedCols.has(c)||usedBuckets.has(b)||r&&Math.abs(pos[r-1]-c)<=1||cellReasons(l,r,c,ignore).length)continue;
    usedCols.add(c);usedBuckets.add(b);pos.push(c);go(r+1);pos.pop();usedCols.delete(c);usedBuckets.delete(b);
   }
  }go(0);return out;
 }
 const api={validState,sumErrors,sums,sumEvaluate,sumSolutions,cellReasons,queensErrors,queensEvaluate,queensSolutions};
 if(typeof module!=='undefined')module.exports=api;else root.BudgetEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
