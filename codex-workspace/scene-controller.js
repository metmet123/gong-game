'use strict';
(()=>{
const G=GameCore,STORE='civil-servant-grow-v1',el=id=>document.getElementById(id),esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
__ICONS__
let state=G.blank(),storageOK=true,active=null,view='work',timer=null,modalMode='',lastFocus=null,toastTimer=null,audioCtx=null,walking=null,playerPos=null,lastDraw=0,speechTimer=null,speechAnchor='chat',sceneLayout=null;
try{const saved=localStorage.getItem(STORE);if(saved)state=G.validateSave(JSON.parse(saved));}catch(e){storageOK=false;}
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)state.settings.motion=false;
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));storageOK=true;el('save-status').textContent='진행 기록 저장됨';}catch(e){storageOK=false;}el('storage-notice').textContent=storageOK?'자동 저장 중 · 다른 브라우저로 옮길 때는 백업하세요.':'자동 저장을 사용할 수 없어요. 내보내기로 기록을 보관하세요.';}
function toast(message){el('toast').textContent=message;el('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el('toast').classList.remove('show'),2600);}
__SOUND__
function updateSound(){el('sound-button').innerHTML=icon(state.settings.sound?'sound':'mute');el('sound-button').setAttribute('aria-label',state.settings.sound?'효과음 끄기':'효과음 켜기');el('sound-setting').textContent=state.settings.sound?'켜짐':'꺼짐';}
function setView(next){view=next;if(next==='work'){el('menu-modal').close();return;}const title={growth:'업무 도구',office:'내 책상',archive:'업무 도감',settings:'설정'}[next];el('menu-title').textContent=title;document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==next+'-view');if(next==='growth')renderGrowth();if(next==='office')renderDecor();if(next==='archive')renderArchive();if(!el('menu-modal').open)el('menu-modal').showModal();sound();}
const objectGroups={phone:['memory'],papers:['compare'],inbox:['sort','route'],computer:['sequence']},objectNames={phone:'전화',papers:'서류',inbox:'결재함',computer:'PC'};
function pendingFor(object){return G.tasks(state.day).filter(t=>objectGroups[object]?.includes(t.type)&&!state.records[t.id]);}
function render(){
 const done=G.todayRecords(state).length,index=(state.day-1)%5;
 el('day-heading').textContent=`${state.day}일차 · ${['월요일','화요일','수요일','목요일','금요일'][index]}`;el('office-clock').textContent=['09:00','10:40','13:20','15:40','17:50'][done];el('tasks-stat').textContent=done+' / 4';el('coin-stat').textContent='◈ '+state.coins.toLocaleString()+' P';el('player-label').textContent=state.name+' · '+G.rank(state);el('energy-stat').textContent='집중력 '+state.energy;el('xp-fill').style.width=(state.xp%80)/80*100+'%';el('xp-fill').parentElement.setAttribute('aria-label',`경험치 ${state.xp%80} / 80`);
 el('week-steps').innerHTML=Array.from({length:5},(_,i)=>`<i class="${i<index?'done':i===index?'current':''}" aria-label="${i+1}일차"></i>`).join('');
 document.querySelectorAll('[data-object]').forEach(b=>{const id=b.dataset.object;if(objectGroups[id]){const count=pendingFor(id).length;b.classList.toggle('available',count>0);b.querySelector('.object-label').innerHTML=objectNames[id]+(count?` <b>${count}</b>`:'');b.setAttribute('aria-label',`${objectNames[id]} ${count?'업무 '+count+'건 시작':'업무 없음'}`);}if(id==='door')b.classList.toggle('available',done===4);if(id==='coffee')b.classList.toggle('available',!state.coffee&&state.energy<100);});
 el('scene-tip').textContent=done===4?'문을 눌러 퇴근해요':'반짝이는 물건을 눌러요';el('end-day').classList.toggle('waiting',done<4);el('end-day').innerHTML=done===4?icon('check')+'퇴근하기':'퇴근까지 '+(4-done)+'건';el('difficulty').value=state.settings.difficulty;el('motion-setting').textContent=state.settings.motion?'켜짐':'꺼짐';document.body.classList.toggle('motion-off',!state.settings.motion);updateSound();drawAvatar(el('talk-avatar'),'player');
 if(view==='growth')renderGrowth();if(view==='office')renderDecor();if(view==='archive')renderArchive();if(sceneLayout)drawOffice(0);
}
function speak(message,anchor='chat'){speechAnchor=anchor;const p=sceneLayout.objects[anchor]||sceneLayout.home,box=el('scene-speech');box.textContent=message;box.hidden=false;box.style.left=(sceneLayout.left+p.x*sceneLayout.scale)+'px';box.style.top=(sceneLayout.top+(p.y-50)*sceneLayout.scale)+'px';clearTimeout(speechTimer);speechTimer=setTimeout(()=>box.hidden=true,4700);}
function moveTo(object,callback){
 if(walking)return;el('scene-speech').hidden=true;const p=sceneLayout.objects[object],target={x:p.x+(object==='inbox'?-40:25),y:p.y+65};if(!state.settings.motion){playerPos=target;drawOffice(0);callback();return;}const from=playerPos||{...sceneLayout.home};walking={from,to:target,start:performance.now(),duration:Math.max(650,Math.min(1400,Math.hypot(from.x-target.x,from.y-target.y)*4)),callback};
}
function activateObject(object){
 if(walking)return;sound();
 if(object==='chat'){speak(['최종 파일은… 승인된 것만 믿어요.','전화는 메모가 남고, 커피는 향이 남죠.','급할수록 원본부터 확인해요.','자동화하면 퇴근이 조금 가까워져요.'][Math.floor(Math.random()*4)]);return;}
 if(object==='coffee'){if(state.coffee){speak('오늘의 커피는 다 마셨어요.','coffee');return;}if(state.energy===100){speak('아직은 집중력 만점!','coffee');return;}moveTo('coffee',()=>{state.coffee=true;state.energy=Math.min(100,state.energy+20);save();render();speak('잠깐의 휴식. 집중력 +20','coffee');});return;}
 if(object==='door'){if(G.todayRecords(state).length<4){speak('남은 업무를 마치면 퇴근해요.','door');return;}moveTo('door',endDay);return;}
 const list=pendingFor(object);if(!list.length){speak(object==='phone'?'지금은 전화가 조용해요.':object==='computer'?'오늘은 자동화할 업무가 없어요.':'이곳의 업무는 모두 처리했어요.',object);return;}
 moveTo(object,()=>{if(list.length===1)startTask(list[0].id);else{openModal(objectNames[object],`대기 ${list.length}건`, `<div class="object-tasklist">${list.map(t=>`<button data-task="${t.id}">${icon(G.TYPES[t.type].icon)}<span><b>${esc(t.title)}</b><small>${G.TYPES[t.type].name}</small></span><span class="arrow">›</span></button>`).join('')}</div>`,'object');el('modal-content').querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>startTask(b.dataset.task));}});
}
function conciseBrief(p){
 if(p.type==='compare')return '원본과 다른 칸만 선택하세요.';
 if(p.type==='memory')return '읽은 뒤 통화를 종료하세요.';
 if(p.type==='route')return p.priority?'가상 규칙 · 안전 위험부터 연결하세요.':'가상 규칙 · 담당 업무를 비교하세요.';
 return p.brief;
}
__MENUS__
function openModal(title,eyebrow,content,mode='info'){
 if(timer){clearInterval(timer);timer=null;}modalMode=mode;lastFocus=document.activeElement;el('modal-title').textContent=title;el('modal-eyebrow').textContent=eyebrow;el('modal-content').innerHTML=content;el('modal-close').hidden=mode==='welcome';el('game-modal').classList.toggle('welcome-modal',mode==='welcome');if(!el('game-modal').open)el('game-modal').showModal();el('game-modal').scrollTop=0;
}
function closeModal(){if(modalMode==='welcome')return;if(timer)clearInterval(timer);timer=null;active=null;el('game-modal').close();modalMode='';playerPos={...sceneLayout.home};drawOffice(0);lastFocus?.focus?.();}
el('modal-close').onclick=closeModal;el('game-modal').addEventListener('cancel',e=>{if(modalMode==='welcome'){e.preventDefault();return;}if(timer)clearInterval(timer);timer=null;active=null;modalMode='';playerPos={...sceneLayout.home};});
function welcome(){openModal('첫 출근','행정지원팀',`<div class="introbox"><div class="introart"><canvas id="intro-avatar" width="32" height="32" aria-hidden="true"></canvas></div><h2>내 자리에서,<br>오늘의 업무를 시작해요.</h2><p>전화 · 서류 · 결재함을 눌러주세요.</p><label for="player-name">주무관 이름</label><input id="player-name" value="${esc(state.name)}" maxlength="12" autocomplete="off"><br><button class="btn" id="begin-game">출근하기 →</button></div>`,'welcome');drawAvatar(el('intro-avatar'),'player');el('begin-game').onclick=()=>{state.name=el('player-name').value.trim().slice(0,12)||'새싹';state.started=true;modalMode='';el('game-modal').close();save();render();speak('반가워요. 책상 위 서류부터 볼까요?');sound('success');};el('player-name').onkeydown=e=>{if(e.key==='Enter')el('begin-game').click();};}
__PUZZLES__
function finishTask(assisted,automatic=false){
 if(!active)return;const task=active.task,p=active.p,oldLevel=G.level(state),reward=G.complete(state,task,{assisted,automatic,time:(Date.now()-active.time)/1000,difficulty:p.difficulty});if(!reward)return;if(timer)clearInterval(timer);timer=null;active=null;save();render();sound('success');
 openModal('제출 완료',assisted?'확인하고 배웠어요.':automatic?'매크로 처리 완료':'업무를 끝냈어요.',`<div class="resultbox"><div class="resultseal">✓</div><h2>${reward.score===100?'깔끔하게 끝냈어요!':'한 건 처리 완료.'}</h2><div class="rewardrow"><div class="reward"><b>${reward.score}점</b><small>업무 점수</small></div><div class="reward"><b>+15</b><small>경험치</small></div><div class="reward"><b>+20 P</b><small>포인트</small></div></div>${G.level(state)>oldLevel?`<div class="promotion">✦ 승진! ${G.rank(state)}</div>`:''}<div class="resultnote">${esc(p.explanation)}</div><button class="btn" id="result-done">사무실로 돌아가기</button></div>`,'result');el('result-done').onclick=()=>{closeModal();if(G.todayRecords(state).length===4)speak('오늘 업무는 끝! 이제 퇴근해요.','door');};
}
function endDay(){const day=state.day,report=G.endDay(state);if(!report)return;playerPos=null;save();render();sound('success');const firstWeek=day===5;openModal(firstWeek?'첫 주 수료':'오늘도 수고했어요.',day+'일차 · 정시 퇴근',`<div class="resultbox"><div class="resultseal">${firstWeek?'✦':'☾'}</div><h2>${firstWeek?'첫 주, 무사히 마쳤습니다.':'퇴근 도장, 꾹.'}</h2><div class="rewardrow"><div class="reward"><b>4건</b><small>처리 완료</small></div><div class="reward"><b>${report.score}점</b><small>오늘의 평균</small></div><div class="reward"><b>+15 P</b><small>퇴근 보너스</small></div></div>${firstWeek?`<div class="certificate"><h3>첫 주 수료증</h3><div class="name">${esc(state.name)} 주무관</div><p>20건의 업무, 확인 완료.</p><span class="seal">행정지원팀</span></div>`:''}<div class="dialogactions"><button class="btn" id="next-day">${firstWeek?'다음 주 출근':'다음 날 출근'} →</button><button class="btn secondary" id="after-work-growth">도구 보기</button></div></div>`,'dayend');el('next-day').onclick=()=>{closeModal();setView('work');speak('오늘도 한 건씩 차근차근.');};el('after-work-growth').onclick=()=>{closeModal();setView('growth');};}
function help(){openModal('짧은 근무 안내','공무원 키우기',`<div class="helptext"><h3>전화 · 서류 · 결재함 · PC</h3><p>반짝이는 물건을 눌러 업무를 시작하세요.</p><h3>하루 4건을 마치면 퇴근</h3><p>문을 누르면 결산, 다음 날 출근으로 이어져요.</p><h3>틀려도 다시 확인</h3><p>재시도하거나 정답을 확인하고 마칠 수 있어요.</p><h3>업무 포인트로 도구와 소품</h3><p>아래 메뉴에서 해금하세요. 진행은 자동 저장됩니다.</p></div><div class="dialogactions"><button class="btn" id="help-done">알겠어요</button></div>`);el('help-done').onclick=closeModal;}
__BACKUP__
