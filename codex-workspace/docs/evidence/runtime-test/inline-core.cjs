/* Pure puzzle and progression rules, shared by the standalone game and checks. */
const GameCore=(()=>{
  const TYPES={compare:{name:'서류 검토',skill:'검토',icon:'document',xp:'review'},sort:{name:'자료 취합',skill:'자동화',icon:'files',xp:'automation'},memory:{name:'전화 메모',skill:'기억',icon:'phone',xp:'memory'},sequence:{name:'업무 자동화',skill:'자동화',icon:'blocks',xp:'automation'},route:{name:'담당부서 안내',skill:'조율',icon:'people',xp:'coordination'}};
  const TOOL_DEFS=[{id:'guide',name:'대조 가이드',type:'compare',icon:'document',cost:45,level:1,description:'원본과 제출안의 같은 항목을 교차 강조합니다.'},{id:'memo',name:'전화 메모장',type:'memory',icon:'phone',cost:45,level:1,description:'통화가 끝나도 요청자 이름 한 줄을 메모에 남깁니다.'},{id:'clean',name:'자료 정리 도구',type:'sort',icon:'files',cost:60,level:2,description:'요구 연도와 다른 자료, 미승인 자료를 자동으로 제외합니다.'},{id:'directory',name:'부서 연락망',type:'route',icon:'people',cost:50,level:2,description:'관련 없는 부서 한 곳을 제외하고 판단을 돕습니다.'},{id:'preview',name:'실행 미리보기',type:'sequence',icon:'blocks',cost:60,level:2,description:'현재 순서를 제출 전에 시뮬레이션합니다. 시도 횟수는 늘지 않습니다.'},{id:'auto',name:'반복 업무 매크로',type:'sort',icon:'spark',cost:120,level:3,description:'취합 업무 2건을 익힌 뒤 하루 1건을 자동으로 처리합니다.',requiredSort:2}];
  const DECOR_DEFS=[{id:'plant',name:'작은 화분',cost:35,art:'🪴',description:'모니터 옆에 초록빛 쉼표 하나.'},{id:'mug',name:'내 이름 머그컵',cost:40,art:'☕',description:'이제 종이컵과 작별할 시간.'},{id:'cat',name:'사무실 고양이',cost:100,art:'🐈',description:'퇴근은 같이, 결재는 따로.'}];
  const DAY_NAMES=['첫 출근, 반갑습니다.','최종_진짜최종을 찾아서','전화는 메모를 남긴다','이 업무, 자동화해도 될까요?','이번 주도 무사히 퇴근!'];
  const DIALOGUES=['처음엔 원본만 잘 봐도 절반은 한 거예요. 나머지 절반은… 커피죠.','파일 이름이 최종이라고 최종인 건 아니더라고요. 승인된 버전을 확인해요.','분명 들었는데 전화 끊으면 생각이 안 나죠? 메모장은 훌륭한 능력입니다.','똑같은 일을 세 번 했다면, 네 번째는 도구에게 맡겨도 괜찮아요.','퇴근 버튼이 가까워졌네요. 마지막 제출까지 같이 확인해요.'];
  const DAY_PLANS=[['compare','memory','sort','route'],['sort','sequence','compare','memory'],['memory','route','sort','compare'],['sequence','sort','route','memory'],['compare','sequence','memory','route']];
  const TITLE_POOLS={compare:['내년도 사업설명서 검토','급식비 지급내역 대조','행사 예산 수정본 확인','운영비 정산자료 확인'],sort:['최신 승인 자료만 취합','최종_진짜최종 찾기','부서별 자료 묶어 제출','연말 실적 자료 정리'],memory:['수정 요청 전화 받기','회의 일정 메모 남기기','긴급 자료 요청 기억하기','담당자 회신 내용 정리'],sequence:['반복 정산 업무 자동화','중복 청구 제거 매크로','자료 합계 만들기','제출 절차를 순서대로'],route:['민원 담당부서 연결','동료의 협조 요청 안내','긴급 문의 우선 연결','복합 요청의 담당 찾기']};
  function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};}
  function shuffled(list,seed){const a=[...list],r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function level(s){return Math.floor(s.xp/80)+1;}
  function rank(s){return ['시보 주무관','9급 주무관','8급 주무관','7급 주무관','선임 주무관','팀의 해결사'][Math.min(5,level(s)-1)];}
  function blank(){return {version:1,name:'새싹',started:false,day:1,xp:0,coins:30,energy:100,records:{},wrong:{},startedTasks:{},history:[],tools:[],decor:[],coffee:false,autoUsed:false,stats:Object.fromEntries(Object.keys(TYPES).map(t=>[t,{cleared:0,perfect:0,score:0}])),settings:{difficulty:'normal',sound:true,motion:true},weekCelebrated:false};}
  function tasks(day){const plan=DAY_PLANS[(day-1)%5];return plan.map((type,i)=>({id:`d${day}t${i}`,day,index:i,type,title:TITLE_POOLS[type][(day+i-1)%4],urgent:i===0,estimated:type==='memory'?'30초–1분':'1–2분'}));}
  function generate(task,difficulty='normal'){
    const seed=task.day*137+task.index*29+({easy:3,normal:7,hard:11}[difficulty]||7),r=rng(seed),tier={easy:0,normal:1,hard:2}[difficulty]??1;
    if(task.type==='compare'){
      const cost=1000+(seed%6)*500,op=500+(seed%4)*200,year=2027+(Math.floor((task.day-1)/5)%5);
      const originals=[{key:'year',label:'사업연도',value:year+'년'},{key:'materials',label:'재료비',value:cost.toLocaleString('ko-KR')},{key:'operation',label:'운영비',value:op.toLocaleString('ko-KR')},{key:'deadline',label:'제출기한',value:`${(seed%3)+10}월 20일`},{key:'unit',label:'금액 단위',value:'천 원'}];
      const candidates=shuffled(['year','materials','deadline','unit'],seed),errors=candidates.slice(0,tier+1),changed={year:(year-1)+'년',materials:(cost*10).toLocaleString('ko-KR'),deadline:`${(seed%3)+10}월 12일`,unit:'원'};
      return {type:task.type,difficulty,originals,submitted:originals.map(f=>({...f,value:errors.includes(f.key)?changed[f.key]:f.value})),errors,instruction:`원본과 다르게 옮긴 항목 ${errors.length}개를 찾아주세요.`,brief:'합계를 재계산하는 문제가 아닙니다. 원본에서 그대로 옮기지 않은 항목만 선택하세요.',explanation:errors.map(k=>{const a=originals.find(f=>f.key===k);return `${a.label} → ‘${a.value}’`}).join(' · ')};
    }
    if(task.type==='sort'){
      const year=2027+(Math.floor((task.day-1)/5)%5),depts=['교육팀','시설팀'],v=2+seed%3;
      let files=[{id:'edu_new',dept:depts[0],year,version:v,approved:true},{id:'edu_old',dept:depts[0],year,version:v-1,approved:true},{id:'fac_new',dept:depts[1],year,version:v+1,approved:true},{id:'fac_draft',dept:depts[1],year,version:v+2,approved:false},{id:'lastyear',dept:depts[1],year:year-1,version:v+3,approved:true}];
      if(tier>=1)files.push({id:'wrongdept',dept:'홍보팀',year,version:v+4,approved:true},{id:'edu_draft',dept:depts[0],year,version:v+1,approved:false});
      if(tier===2)files.push({id:'fac_old',dept:depts[1],year,version:v,approved:true},{id:'old_edu',dept:depts[0],year:year-1,version:v+4,approved:true});
      return {type:task.type,difficulty,files:shuffled(files,seed),year,depts,expected:['edu_new','fac_new'],instruction:'조건에 맞는 자료 2개만 골라 제출하세요.',brief:`${year}년 · 교육팀과 시설팀 · 승인된 자료 중 각 부서의 가장 높은 버전 1개씩. 미승인 자료는 버전이 높아도 제외합니다.`,explanation:`교육팀 v${v}와 시설팀 v${v+1}이 최신 승인 자료입니다. 연도·부서·승인 여부를 먼저 확인한 뒤 버전을 비교하세요.`};
    }
    if(task.type==='memory'){
      const name=['김민지','박지훈','이서연','정수빈'][seed%4],weekday=['화요일','수요일','목요일','금요일'][seed%4],time=['오전 10시','오후 2시','오후 4시'][seed%3],dept=['교육지원팀','시설관리팀','회계팀','기록관리팀'][seed%4],request=['사업설명서 수정본','회의 참석 명단','예산 집행 내역','행사 결과보고서'][Math.floor(seed/3)%4];
      const fields=[{key:'name',label:'요청자 이름',answer:name,options:shuffled([name,...['김민지','박지훈','이서연','정수빈'].filter(n=>n!==name).slice(0,2)],seed+1)},{key:'time',label:'제출기한',answer:weekday+' '+time,options:shuffled([weekday+' '+time,weekday+' '+(time==='오후 2시'?'오후 4시':'오후 2시'),(weekday==='목요일'?'금요일':'목요일')+' '+time],seed+2)},{key:'dept',label:'받을 부서',answer:dept,options:shuffled([dept,...['교육지원팀','시설관리팀','회계팀','기록관리팀'].filter(n=>n!==dept).slice(0,2)],seed+3)},{key:'request',label:'요청한 자료',answer:request,options:shuffled([request,...['사업설명서 수정본','회의 참석 명단','예산 집행 내역','행사 결과보고서'].filter(n=>n!==request).slice(0,2)],seed+4)}].slice(0,tier+2);
      return {type:task.type,difficulty,fields,name,time:weekday+' '+time,dept,request,instruction:'전화 내용을 읽고, 통화를 종료한 뒤 메모를 남기세요.',brief:'천천히 읽어도 괜찮아요. 준비되면 직접 통화를 종료합니다.',explanation:`요청자 ${name} / ${weekday} ${time}까지 / ${dept} / ${request}`};
    }
    if(task.type==='sequence'){
      const a=100+(seed%5)*50,b=200+(seed%3)*50;
      let input=[{id:'A',amount:a,approved:true},{id:'B',amount:b,approved:true}];
      if(tier>=1)input.push({id:'A',amount:a,approved:true});
      if(tier===2)input.push({id:'C',amount:500,approved:false});
      const defs={collect:{id:'collect',name:'자료 수집',description:'입력 자료를 가져옵니다.'},dedup:{id:'dedup',name:'중복 제거',description:'같은 청구 ID는 한 번만 남깁니다.'},filter:{id:'filter',name:'승인 자료만 남기기',description:'미승인 자료를 제외합니다.'},sum:{id:'sum',name:'합계 계산',description:'남은 청구의 금액을 합산합니다.'},submit:{id:'submit',name:'결과 제출',description:'계산한 합계를 제출합니다.'}};
      const target=['collect',...(tier>=1?['dedup']:[]),...(tier===2?['filter']:[]),'sum','submit'];
      const tests=[{input,expected:a+b},{input:[{id:'X',amount:70,approved:true},{id:'Y',amount:30,approved:true},...(tier>=1?[{id:'X',amount:70,approved:true}]:[]),...(tier===2?[{id:'Z',amount:90,approved:false}]:[])],expected:100}];
      let order=shuffled(target,seed);if(order.join()===target.join())order=order.reverse();
      return {type:task.type,difficulty,steps:target.map(id=>defs[id]),order,target,tests,instruction:'명령을 배열해 올바른 합계가 제출되게 만드세요.',brief:`${tier>=1?'중복 청구는 한 번만, ':''}${tier===2?'승인된 청구만 ':''}합산합니다. 두 가지 입력으로 실행 결과를 확인합니다.`,explanation:'자료 수집 → '+(tier>=1?'중복 제거 → ':'')+(tier===2?'승인 자료만 남기기 → ':'')+'합계 계산 → 결과 제출. '+(tier===2?'중복 제거와 승인 필터의 순서는 바뀌어도 됩니다.':'')};
    }
    const ruleSet=[{name:'시설관리팀',condition:'시설 파손·안전 위험은 시설관리팀에 연결합니다.'},{name:'회계팀',condition:'집행 금액·지급 내역은 회계팀에 연결합니다.'},{name:'교육지원팀',condition:'교육 프로그램·참가 신청은 교육지원팀에 연결합니다.'},{name:'기록관리팀',condition:'지난 공문·보관 문서는 기록관리팀에 연결합니다.'}];
    const index=seed%4,answer=ruleSet[index].name,caseTexts=['“교육 행사장 천장에서 물이 새요. 참가 신청도 확인하고 싶은데, 전기 콘센트 옆이라 위험해 보입니다.”','“작년 교육 행사 지급 내역을 확인하고 싶어요. 비용이 얼마 집행됐는지 담당자와 이야기할 수 있을까요?”','“이번 달 교육 프로그램에 참가 신청하려고 합니다. 신청 기간과 방법이 궁금해요.”','“예전에 발송한 행사 공문을 찾고 있어요. 보관된 문서가 있는지 확인 부탁드립니다.”'];
    let rules=ruleSet,priority=tier>0;if(tier===0)rules=ruleSet.filter((_,i)=>i===index||i===(index+1)%4);
    return {type:task.type,difficulty,rules,answer,priority,options:shuffled(rules.map(r=>r.name),seed),caseText:caseTexts[index],instruction:'문의 내용을 읽고 담당부서를 연결하세요.',brief:priority?'이 게임의 가상 안내 규칙입니다. 안전 위험이 있으면 먼저 시설관리팀으로, 그 외에는 요청의 핵심 내용을 기준으로 연결합니다.':'이 게임의 가상 안내 규칙입니다. 아래의 담당 업무와 요청 내용을 비교하세요.',explanation:ruleSet[index].condition+(index===0?' 안전 위험은 다른 요청보다 우선합니다.':' 핵심 요청을 담당하는 부서를 선택합니다.')};
  }
  function sameSet(a,b){return a.length===b.length&&new Set(a).size===a.length&&a.every(x=>b.includes(x));}
  function executeSequence(p,order){
    if(!sameSet(order,p.steps.map(s=>s.id)))return {ok:false,message:'모든 명령을 한 번씩 사용해야 합니다.',trace:[]};
    let finalTraces=[];
    for(let k=0;k<p.tests.length;k++){
      const test=p.tests[k];let data=null,total=null,submitted=false;const done=new Set(),trace=[];
      for(let i=0;i<order.length;i++){
        const op=order[i],step=p.steps.find(x=>x.id===op);
        const fail=msg=>({ok:false,message:`${i+1}단계 ‘${step.name}’: ${msg}`,trace});
        if(submitted)return fail('제출은 모든 처리가 끝난 뒤 마지막에 해야 합니다.');
        if(op==='collect'){if(data!==null)return fail('자료 수집은 맨 처음에 한 번만 합니다.');data=test.input.map(x=>({...x}));trace.push(`수집: ${data.length}건`);}
        else if(data===null)return fail('먼저 자료를 수집해야 합니다.');
        else if(op==='dedup'){if(total!==null)return fail('합계를 계산하기 전에 중복을 제거해야 합니다.');const seen=new Set();data=data.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true;});trace.push(`중복 제거: ${data.length}건`);}
        else if(op==='filter'){if(total!==null)return fail('합계를 계산하기 전에 미승인 자료를 제외해야 합니다.');data=data.filter(x=>x.approved);trace.push(`승인 필터: ${data.length}건`);}
        else if(op==='sum'){const required=p.steps.filter(s=>s.id==='dedup'||s.id==='filter').map(s=>s.id);if(required.some(x=>!done.has(x)))return fail('자료 정리 명령을 모두 실행한 뒤 합계를 계산하세요.');total=data.reduce((a,x)=>a+x.amount,0);trace.push(`합계: ${total}`);}
        else if(op==='submit'){if(total===null)return fail('아직 합계가 없습니다. 먼저 계산하세요.');submitted=true;trace.push(`제출: ${total}`);}
        done.add(op);
      }
      if(!submitted||total!==test.expected)return {ok:false,message:`입력 ${k+1}의 제출 결과가 목표 ${test.expected}와 다릅니다.`,trace};
      if(k===0)finalTraces=trace;
    }
    return {ok:true,message:`두 입력 모두 통과했습니다. ${finalTraces.join(' → ')}`,trace:finalTraces};
  }
  function evaluate(p,answer){
    if(p.type==='sequence')return executeSequence(p,answer);
    if(p.type==='compare'||p.type==='sort'){
      const expected=p.errors||p.expected,chosen=Array.isArray(answer)?answer:[],missed=expected.filter(k=>!chosen.includes(k)),extra=chosen.filter(k=>!expected.includes(k)),ok=sameSet(chosen,expected);
      return {ok,message:ok?p.explanation:`다시 확인해요. ${missed.length}개를 놓쳤고, 불필요한 선택은 ${extra.length}개입니다. `+(p.type==='compare'?'원본과 제출안의 같은 항목을 비교하세요.':'연도 → 부서 → 승인 여부 → 최신 버전 순으로 확인하세요.'),missed,extra};
    }
    if(p.type==='memory'){
      const missing=p.fields.filter(f=>!answer[f.key]);if(missing.length)return {ok:false,incomplete:true,message:'모든 메모 항목을 선택해 주세요.'};
      const wrong=p.fields.filter(f=>answer[f.key]!==f.answer);return {ok:!wrong.length,message:wrong.length?'확인할 항목: '+wrong.map(f=>f.label).join(', ')+'. 통화 다시 보기로 통화 내용을 확인해 보세요.':p.explanation};
    }
    return {ok:answer===p.answer,incomplete:!answer,message:answer===p.answer?p.explanation:(!answer?'담당부서를 선택해 주세요.':'핵심 요청과 안내 규칙을 다시 확인해요. '+(p.priority?'안전 위험이 있는 요청은 가장 먼저 연결합니다.':''))};
  }
  function complete(s,task,record={}){
    if(s.records[task.id]||!tasks(s.day).some(t=>t.id===task.id))return null;
    const score=record.automatic?90:record.assisted?60:Math.max(60,100-(s.wrong[task.id]||0)*10),xp=15,coins=20;
    s.records[task.id]={score,assisted:!!record.assisted,automatic:!!record.automatic,time:Math.max(0,Math.round(record.time||0)),difficulty:record.difficulty||'normal'};
    s.xp+=xp;s.coins+=coins;s.energy=Math.max(20,s.energy-8);s.stats[task.type].cleared++;s.stats[task.type].score+=score;if(score===100)s.stats[task.type].perfect++;
    if(record.automatic)s.autoUsed=true;
    return {score,xp,coins};
  }
  function todayRecords(s){return tasks(s.day).map(t=>s.records[t.id]).filter(Boolean);}
  function endDay(s){const rows=todayRecords(s);if(rows.length!==4)return false;const report={day:s.day,score:Math.round(rows.reduce((a,r)=>a+r.score,0)/4),perfect:rows.filter(r=>r.score===100).length};s.history.push(report);if(s.history.length>100)s.history.shift();s.coins+=15;s.day++;s.energy=100;s.coffee=false;s.autoUsed=false;return report;}
  function buyTool(s,id){const t=TOOL_DEFS.find(t=>t.id===id);if(!t||s.tools.includes(id)||s.coins<t.cost||level(s)<t.level||(t.requiredSort&&s.stats.sort.cleared<t.requiredSort))return false;s.coins-=t.cost;s.tools.push(id);return true;}
  function buyDecor(s,id){const d=DECOR_DEFS.find(t=>t.id===id);if(!d||s.decor.includes(id)||s.coins<d.cost)return false;s.coins-=d.cost;s.decor.push(id);return true;}
  function validateSave(x){
    if(!x||typeof x!=='object'||x.version!==1||typeof x.name!=='string'||x.name.length>12||typeof x.started!=='boolean')throw Error('게임 저장 파일의 형식이 다릅니다.');
    const finite=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
    if(!finite(x.day,1,3650)||!finite(x.xp,0,1000000)||!finite(x.coins,0,1000000)||!finite(x.energy,0,100))throw Error('진행 수치가 올바르지 않습니다.');
    if(!Array.isArray(x.tools)||!x.tools.every(id=>TOOL_DEFS.some(t=>t.id===id))||new Set(x.tools).size!==x.tools.length)throw Error('도구 정보가 올바르지 않습니다.');
    if(!Array.isArray(x.decor)||!x.decor.every(id=>DECOR_DEFS.some(t=>t.id===id))||new Set(x.decor).size!==x.decor.length)throw Error('소품 정보가 올바르지 않습니다.');
    if(!x.settings||!['easy','normal','hard'].includes(x.settings.difficulty)||typeof x.settings.sound!=='boolean'||typeof x.settings.motion!=='boolean')throw Error('설정 정보가 올바르지 않습니다.');
    const s=blank();Object.assign(s,{name:x.name,started:x.started,day:x.day,xp:x.xp,coins:x.coins,energy:x.energy,tools:[...x.tools],decor:[...x.decor],settings:{...x.settings},coffee:!!x.coffee,autoUsed:!!x.autoUsed,weekCelebrated:!!x.weekCelebrated});
    const entries=Object.entries(x.records||{});if(entries.length>14600)throw Error('기록이 너무 많습니다.');
    for(const [id,r]of entries){if(!/^d\d+t[0-3]$/.test(id)||Number(id.match(/^d(\d+)/)[1])>s.day||!r||!finite(r.score,60,100)||!finite(r.time,0,10000000)||!['easy','normal','hard'].includes(r.difficulty))throw Error('업무 기록이 올바르지 않습니다.');s.records[id]={score:r.score,time:r.time,difficulty:r.difficulty,assisted:!!r.assisted,automatic:!!r.automatic};}
    for(const [id,n]of Object.entries(x.wrong||{})){if(!/^d\d+t[0-3]$/.test(id)||!finite(n,0,10000))throw Error('시도 기록이 올바르지 않습니다.');s.wrong[id]=n;}
    for(const [id,d]of Object.entries(x.startedTasks||{})){if(!/^d\d+t[0-3]$/.test(id)||!['easy','normal','hard'].includes(d))throw Error('진행 중 업무가 올바르지 않습니다.');s.startedTasks[id]=d;}
    for(const [id,r]of Object.entries(s.records)){const day=Number(id.match(/^d(\d+)/)[1]),task=tasks(day)[Number(id.slice(-1))];s.stats[task.type].cleared++;s.stats[task.type].score+=r.score;if(r.score===100)s.stats[task.type].perfect++;}
    if(!Array.isArray(x.history)||x.history.length>100||x.history.some(h=>!h||!finite(h.day,1,s.day-1)||!finite(h.score,60,100)||!finite(h.perfect,0,4)))throw Error('하루 결산 정보가 올바르지 않습니다.');
    s.history=x.history.map(h=>({day:h.day,score:h.score,perfect:h.perfect}));return s;
  }
  return {TYPES,TOOL_DEFS,DECOR_DEFS,DAY_NAMES,DIALOGUES,blank,tasks,generate,evaluate,executeSequence,complete,todayRecords,endDay,buyTool,buyDecor,validateSave,level,rank,shuffled};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=GameCore;

