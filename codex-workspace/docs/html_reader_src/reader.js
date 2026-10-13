(() => {
'use strict';
const D=JSON.parse(document.getElementById('planData').textContent), C=D.contract;
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current='home', demo='office', puzzle='conveyor', difficulty='e', revealed=false, asset=null,lastContentHash='#home';
const go=id=>{if(location.hash==='#'+id)route();else location.hash=id;};
const closeMenu=()=>{$('#sidebar').classList.remove('is-open');$('#backdrop').hidden=true;$('#menuToggle').setAttribute('aria-expanded','false');};
$('#menuToggle').onclick=()=>{const open=!$('#sidebar').classList.contains('is-open');$('#sidebar').classList.toggle('is-open',open);$('#backdrop').hidden=!open;$('#menuToggle').setAttribute('aria-expanded',String(open));};
$('#backdrop').onclick=closeMenu;
function showDemo(id){demo=id;$$('[data-demo]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.demo===id));b.tabIndex=b.dataset.demo===id?0:-1;});$$('.demo-panel').forEach(p=>p.hidden=p.id!=='demo-'+id);}
function toc(doc){
 const list=(D.headings[doc]||[]).filter(h=>h.level<=3);
 $('#localToc').innerHTML=list.length?'<b>이 파트에서 바로 찾기</b>'+list.map(h=>`<a href="#${h.id}" class="${h.level===3?'sub':''}">${esc(h.text)}</a>`).join(''):'';
}
function route(){
 let id=decodeURIComponent(location.hash.slice(1)||'home');
 if(D.files[id]){openAsset(id);return;}
 let part=id.match(/^doc-\d\d/)?.[0]||(id.startsWith('showcase')?'showcase':id);
 if(!document.getElementById(part)?.classList.contains('chapter'))part='home';
 const changed=current!==part;current=part;lastContentHash='#'+id;
 $$('.chapter').forEach(c=>c.hidden=c.id!==part);
 $$('.nav-item').forEach(b=>{if(b.dataset.go===part)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const title=part==='home'?'시작':part==='showcase'?'화면 시안':D.names[Number(part.slice(4))];
 $('#breadcrumb').innerHTML='통합 개발계획 <span>/ '+esc(title)+'</span>';
 toc(part);closeMenu();
 if(part==='showcase'&&id.startsWith('showcase-'))showDemo(id.slice(9));
 const target=document.getElementById(id);
 if(target&&id!==part){
  for(let p=target;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  requestAnimationFrame(()=>{target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});target.classList.add('jump-highlight');setTimeout(()=>target.classList.remove('jump-highlight'),1800);});
 }else if(changed||id===part){const section=document.getElementById(part);section.setAttribute('tabindex','-1');section.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 $('#localToc a.active')?.classList.remove('active');$('#localToc a[href="#'+id+'"]')?.classList.add('active');
 const select=$('#'+part+' .part-jump select');if(select)select.value=id;
}
window.addEventListener('hashchange',route);
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href^="#file-"]');if(a){e.preventDefault();go(a.getAttribute('href').slice(1));}
 const g=e.target.closest('[data-go]');if(g&&!g.disabled)go(g.dataset.go);
 const d=e.target.closest('[data-demo]');if(d)go('showcase-'+d.dataset.demo);
 const c=e.target.closest('[data-close]');if(c)document.getElementById(c.dataset.close).close();
 const p=e.target.closest('[data-openpuzzle]');if(p){puzzle=p.dataset.openpuzzle;revealed=false;renderPuzzle();go('showcase-puzzles');}
});
$$('[data-demo]').forEach(b=>b.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=$$('[data-demo]');let i=tabs.indexOf(b);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].focus();go('showcase-'+tabs[i].dataset.demo);
}));
Object.entries(D.headings).forEach(([doc,list])=>{
 const select=document.createElement('select');select.setAttribute('aria-label','이 파트의 소제목으로 이동');
 select.innerHTML='<option value="'+doc+'">소제목 / TASK 바로 선택</option>'+list.filter(h=>h.level<=3).map(h=>`<option value="${h.id}">${h.level===3?'　':''}${esc(h.text)}</option>`).join('');
 select.onchange=()=>go(select.value);const wrap=document.createElement('div');wrap.className='part-jump';wrap.append(select);$('#'+doc+' .chapter-head').append(wrap);
});
function openDialog(dialog){if(!dialog.open)dialog.showModal();}
$('#assetDialog').addEventListener('close',()=>{if(location.hash.startsWith('#file-'))history.replaceState(null,'',lastContentHash);});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
function normalize(s){return String(s).toLowerCase().replace(/\s+/g,'');}
function search(){
 const q=$('#searchInput').value.trim(),terms=q.toLowerCase().split(/\s+/).filter(Boolean).map(normalize);
 let entries=q?D.search.filter(e=>terms.every(t=>normalize(e.title+' '+e.chapter+' '+e.text).includes(t))).map(e=>({...e,score:terms.reduce((a,t)=>a+(normalize(e.title).includes(t)?4:0),0)})).sort((a,b)=>b.score-a.score):D.names.map((name,i)=>({id:'doc-'+String(i).padStart(2,'0'),title:name,chapter:'PART '+String(i).padStart(2,'0'),text:'파트 전체 읽기'}));
 $('#searchHint').textContent=q?`${entries.length}개 항목 · 최대 40개 표시 · 소제목과 TASK로 바로 이동`:'파트 제목 · 소제목 · 본문 · TASK ID를 검색합니다.';
 $('#searchResults').innerHTML=entries.slice(0,40).map(e=>{
  let ix=q?e.text.toLowerCase().indexOf(q.toLowerCase()):0;ix=Math.max(0,ix-30);const snippet=e.text.slice(ix,ix+150);
  return `<button class="search-result" data-result="${e.id}"><small>${esc(e.chapter)}</small><b>${esc(e.title)}</b><p>${esc(snippet)}${e.text.length>ix+150?'…':''}</p></button>`;
 }).join('')||(q?'<p class="search-empty">검색 결과가 없습니다. 더 짧은 단어로 찾아보세요.</p>':'');
}
$('#searchTrigger').onclick=()=>{openDialog($('#searchDialog'));search();$('#searchInput').focus();};$('#searchInput').addEventListener('input',search);
$('#searchResults').onclick=e=>{const b=e.target.closest('[data-result]');if(b){$('#searchDialog').close();go(b.dataset.result);}};
document.addEventListener('keydown',e=>{const editing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable;if((e.key==='k'&&(e.ctrlKey||e.metaKey))||(e.key==='/'&&!editing)){e.preventDefault();$('#searchTrigger').click();}if(e.key==='Escape')closeMenu();});
function openAsset(id){asset=D.files[id];$('#assetTitle').textContent=asset.name;const body=$('#assetBody');body.replaceChildren();if(asset.kind==='html'){body.innerHTML=asset.content;body.className='prose';body.querySelectorAll('table').forEach(t=>{const w=document.createElement('div');w.className='table-scroll';t.replaceWith(w);w.append(t);});}else if(asset.kind==='image'){body.className='prose';const img=document.createElement('img');img.src=asset.content;img.alt=asset.name;body.append(img);}else{body.className='';const pre=document.createElement('pre');pre.textContent=asset.content;body.append(pre);}openDialog($('#assetDialog'));}
$('#assetDownload').onclick=()=>{if(!asset)return;const bytes=asset.base64?Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0)):asset.raw||asset.content;const url=URL.createObjectURL(new Blob([bytes],{type:asset.mime||'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=asset.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
let printed=[];$('#printButton').onclick=()=>{printed=$$('#'+current+' details').map(d=>[d,d.open]);printed.forEach(([d])=>d.open=true);window.print();};window.addEventListener('afterprint',()=>printed.forEach(([d,open])=>d.open=open));

// Small vector illustrations are authored here; no downloaded art or external fonts.
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
function avatar(x,y,shirt='#466b55',s=1){return `<g transform="translate(${x} ${y}) scale(${s})" shape-rendering="crispEdges">${rect(-5,-12,10,5,'#394638')}${rect(-6,-7,12,9,'#dfbd8f')}${rect(-8,2,16,11,shirt)}${rect(-5,13,4,7,'#435344')}${rect(1,13,4,7,'#435344')}${rect(-3,-4,1.5,2,'#3f483a')}${rect(2,-4,1.5,2,'#3f483a')}</g>`;}
let artSerial=0;
function deskArt(id='decor_plant'){
 const artKey=id+'-'+(++artSerial);
 let extra='';
 if(id==='decor_plant')extra=`${rect(82,142,29,24,'#ba956e')}${rect(93,113,7,31,'#718850')}${rect(79,124,18,10,'#7d9960')}${rect(99,114,19,12,'#5f804a')}`;
 if(id==='decor_mug')extra=`${rect(87,143,25,25,'#f7edd6','rx="3"')}${rect(110,148,9,13,'none','stroke="#f7edd6" stroke-width="4"')}${rect(94,149,12,5,'#8c9b70')}`;
 if(id==='decor_note')extra=`${rect(79,155,49,7,'#846c4c')}${rect(83,111,39,43,'#e8d18b','transform="rotate(-5 100 130)"')}${rect(89,123,23,3,'#8b865d')}${rect(89,132,19,3,'#8b865d')}`;
 if(id==='decor_lamp')extra=`${rect(78,162,47,7,'#8b8156')}${rect(102,114,5,49,'#9a936b')}${rect(82,100,43,19,'#d0b45b')}${rect(77,117,53,7,'#ddc76f')}`;
 if(id==='decor_stamp')extra=`${rect(86,151,34,18,'#76875a')}${rect(96,130,14,22,'#476e4d')}${rect(88,122,30,11,'#54784d')}`;
 const screen=id==='decor_monitor'?'#688b67':'#a7ba9a';
 return `<svg viewBox="0 0 420 280" role="img" aria-label="책상 꾸미기 예시 일러스트"><defs><pattern id="planks-${artKey}" width="70" height="26" patternUnits="userSpaceOnUse"><path d="M0 26H70M0 0V26" fill="none" stroke="#bdc4ad" stroke-width="1"/></pattern></defs>${rect(0,0,420,280,'#e4e9da')}${rect(0,189,420,91,'#d2d9c5')}${rect(0,189,420,91,`url(#planks-${artKey})`)}${rect(283,38,85,76,'#c4d3b7')}${rect(289,44,73,64,'#eef1dc')}${rect(324,44,4,64,'#b7c6a7')}${rect(289,73,73,4,'#b7c6a7')}${rect(40,180,337,13,'#8f7957')}${rect(51,167,315,13,'#c4a981')}${rect(61,193,14,55,'#978264')}${rect(341,193,14,55,'#978264')}${rect(230,193,93,53,'#b5a183')}${rect(238,202,78,3,'#8e7f62')}${rect(273,211,9,3,'#756e54')}${rect(151,85,117,71,'#4b604d','rx="3"')}${rect(159,93,101,54,screen)}${rect(190,111,40,23,'#dae3ca')}${rect(172,103,11,5,'#66845e')}${rect(183,156,51,9,'#708268')}${rect(147,170,129,7,'#dedcc8')}${rect(295,149,46,20,'#f3eedb')}${rect(300,154,28,2,'#b0b59f')}${rect(300,160,33,2,'#b0b59f')}${extra}${rect(169,213,49,34,'#7a8d6c','rx="5"')}${avatar(194,205,'#527854',1.6)}${rect(159,238,71,6,'#697e59')}${rect(190,244,7,30,'#697e59')}${rect(171,271,44,5,'#697e59')}</svg>`;
}
$('#heroArt').innerHTML=deskArt('decor_plant');

// Office map uses all 46 original footprints and a four-direction BFS.
const T=24,blocked=new Set(),cellKey=(x,y)=>x+','+y;
D.layout.items.forEach(([,x,y,w,h])=>{for(let xx=x;xx<x+w;xx++)for(let yy=y;yy<y+h;yy++)blocked.add(cellKey(xx,yy));});
function furniture(item,index){
 const [type,cx,cy,cw,ch,,label]=item,x=cx*T,y=cy*T,w=cw*T,h=ch*T;let s='';
 if(['me','staff','empty','chief','boss'].includes(type)){
  s=rect(x+2,y+3,w-4,h-7,type==='me'?'#9aae77':'#bba37a')+rect(x+8,y+7,w-16,16,'#516b54')+rect(x+11,y+10,w-22,10,'#c2d4af')+rect(x+9,y+30,19,7,'#ede9d4');
  if(type!=='empty')s+=avatar(x+w-11,y+h-13,type==='boss'?'#695b42':type==='chief'?'#78855b':'#6d8c7c',.58);
 }else if(type==='window')s=rect(x+5,y+1,w-9,h-2,'#bacbba')+rect(x+9,y+5,w-17,h-10,'#e5eee0')+`<path d="M${x+8} ${y+h/2}h${w-14}" stroke="#9aac93" stroke-width="3"/>`;
 else if(type==='counter')s=rect(x+2,y+2,w-4,h-4,'#b49d73')+rect(x+5,y+6,w-10,18,'#dccbab')+rect(x+12,y+8,25,13,'#6e8468')+rect(x+55,y+9,23,12,'#e9e5d0');
 else if(type==='meeting')s=rect(x+1,y+7,w-2,h-14,'#bba17a','rx="8"')+rect(x+25,y+17,20,13,'#e7e4ce')+rect(x+6,y+3,14,6,'#819572')+rect(x+48,y+3,14,6,'#819572')+rect(x+6,y+h-9,14,6,'#819572')+rect(x+48,y+h-9,14,6,'#819572');
 else if(type==='plant')s=rect(x+7,y+15,12,8,'#b3946e')+rect(x+10,y+4,5,13,'#6b8752')+rect(x+4,y+7,18,6,'#809966');
 else if(type==='board')s=rect(x+1,y+2,w-2,h-4,'#9c9167')+rect(x+4,y+4,w-8,h-8,'#d4c88c')+rect(x+8,y+6,10,10,'#f0ecd4')+rect(x+24,y+8,14,9,'#e2e3c5');
 else if(['cabinet','shelf'].includes(type)){s=rect(x+1,y+1,w-2,h-2,type==='shelf'?'#8c916b':'#9fa891');for(let i=5;i<w-4;i+=8)s+=rect(x+i,y+5,5,h-9,['#d5c58e','#75927f','#b4b58b'][i%3]);}
 else if(type==='door')s=rect(x+1,y+1,w-2,h-2,'#a6b294')+rect(x+4,y+4,w-8,h-8,'#d4dac6')+rect(x+w-8,y+h/2,3,3,'#6f825f');
 else if(type==='partition')s=rect(x+6,y+1,w-12,h-2,'#a9bba0');
 else if(type==='wait')s=rect(x+3,y+3,w-6,h-6,'#8da082')+rect(x+5,y+6,w-10,6,'#acb99a');
 else s=rect(x+2,y+2,w-4,h-4,'#b5bda8')+rect(x+5,y+5,w-10,7,type==='water'?'#a9c5c3':'#e5e5d6')+rect(x+7,y+h-8,w-14,3,'#788b72');
 return `<g data-object="o${index}"><title>${esc(label)} · o${index} (${cx},${cy})</title>${s}</g>`;
}
function mapBase(){let tiles='';for(let y=0;y<21;y++)for(let x=0;x<14;x++)tiles+=rect(x*T,y*T,T,T,(x+y)%2?'#e3e4d1':'#e8e8d8','stroke="#d5d9c4" stroke-width=".6"');return tiles+D.layout.items.map(furniture).join('');}
const base=mapBase();let actor=[1,12],chosen=null,motion=0;
$('#officeMap').innerHTML=base+'<g id="zoneOutline"></g><path id="walkPath" fill="none" stroke="#c2934e" stroke-width="3" stroke-dasharray="4 4"/><g id="mapActor"></g>';
function drawActor(){$('#mapActor').innerHTML=avatar(actor[0]*T+12,actor[1]*T+9,'#315c4c',.72);}
drawActor();
function bfs(start,end){const queue=[start],parents=new Map([[cellKey(...start),null]]);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];if(x===end[0]&&y===end[1])break;for(const [dx,dy]of[[0,-1],[1,0],[0,1],[-1,0]]){const n=[x+dx,y+dy],k=cellKey(...n);if(n[0]>=0&&n[0]<14&&n[1]>=0&&n[1]<21&&!blocked.has(k)&&!parents.has(k)){parents.set(k,[x,y]);queue.push(n);}}}if(!parents.has(cellKey(...end)))return [];const path=[];for(let n=end;n;n=parents.get(cellKey(...n)))path.push(n);return path.reverse();}
function zoom(zone){const vp=$('#mapViewport'),w=Math.min(210,Math.max(132,vp.clientWidth/2)),h=Math.min(260,vp.clientHeight/2),cx=zone.focus[0]*T,cy=zone.focus[1]*T;$('#officeMap').setAttribute('viewBox',`${Math.max(0,Math.min(336-w,cx-w/2))} ${Math.max(0,Math.min(504-h,cy-h/2))} ${w} ${h}`);}
async function chooseZone(zone){
 const token=++motion;chosen=zone;$$('.zone-button').forEach(b=>{const on=b.dataset.zone===zone.id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 $('#officeMap').setAttribute('viewBox','0 0 336 504');$('#mapTitle').textContent=zone.name;$('#mapWork').disabled=true;
 $('#zoneOutline').innerHTML=zone.rects.map(([x0,y0,x1,y1])=>rect(x0*T+1,y0*T+1,(x1-x0)*T-2,(y1-y0)*T-2,'#72935418','stroke="#668653" stroke-width="2"')).join('');
 const path=bfs(actor,zone.approach);if(!path.length){$('#mapStatus').textContent='경로를 찾지 못했습니다. 전체 지도로 돌아가세요.';return;}
 $('#walkPath').setAttribute('d',path.map((p,i)=>(i?'L':'M')+(p[0]*T+12)+' '+(p[1]*T+12)).join(' '));$('#mapStatus').textContent=`통로 ${path.length-1}칸을 이동 중…`;
 const step=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.min(100,1400/Math.max(path.length,1));
 for(const p of path){if(token!==motion)return;actor=p;drawActor();if(step)await new Promise(r=>setTimeout(r,step));}
 if(token!==motion)return;zoom(zone);$('#mapStatus').textContent=`${zone.name} 도착 · 초점 (${zone.focus.join(', ')}) · 설명용 이동`;$('#mapWork').disabled=false;
 $('#mapWork').textContent=zone.puzzles.length?'작업대 예시 →':'꾸미기 예시 →';
}
$('#zonePicker').innerHTML=C.zones.map((z,i)=>`<button class="zone-button" data-zone="${z.id}" aria-pressed="false"><b>${String(i+1).padStart(2,'0')} ${esc(z.name)}</b><small>${z.puzzles.length?'업무 '+z.puzzles.length+'종 연결':'휴식 · 꾸미기'} · 접근 (${z.approach.join(', ')})</small></button>`).join('');
$('#zonePicker').onclick=e=>{const b=e.target.closest('[data-zone]');if(b)chooseZone(C.zones.find(z=>z.id===b.dataset.zone));};
$('#mapReset').onclick=()=>{++motion;chosen=null;$('#officeMap').setAttribute('viewBox','0 0 336 504');$('#zoneOutline').innerHTML='';$('#walkPath').setAttribute('d','');$$('.zone-button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});$('#mapTitle').textContent='생활보장과 · 전체 지도';$('#mapStatus').textContent='구역을 선택해 이동 흐름을 확인하세요.';$('#mapWork').disabled=true;};
$('#mapWork').onclick=()=>{if(!chosen)return;if(!chosen.puzzles.length){go('showcase-decor');return;}puzzle=chosen.puzzles.find(id=>C.puzzles.some(p=>p.id===id))||'conveyor';revealed=false;renderPuzzle();go('showcase-puzzles');};
window.addEventListener('resize',()=>{if(chosen&&!$('#mapWork').disabled&&demo==='office'&&current==='showcase')zoom(chosen);});
const phoneData=[['desk','내 자리','소라 · “한 장씩 보죠.”','conveyor','방법 설계','도구 · 소품','내 자리의 PC와 서류가 작업의 출발점'],['service','민원 창구','미루 · “오늘의 가상 공지입니다.”','rules','규정 확인','게시판 읽기','공지에서 조건을 읽고 접수 규칙을 고침'],['approval','결재 자리','서윤 · “순서는 맞고, 날짜를 봅시다.”','approval','일정 설계','반려 사유','과장석과 계장석은 누른 대상별로 초점 이동']];
$('#zonePhones').innerHTML=phoneData.map(([id,title,bubble,pid,button,secondary,note])=>{const z=C.zones.find(z=>z.id===id),w=132,h=130,cx=z.focus[0]*T,cy=z.focus[1]*T,vb=[Math.max(0,Math.min(336-w,cx-w/2)),Math.max(0,Math.min(504-h,cy-h/2)),w,h].join(' ');return `<div><div class="phone"><div class="phone-top">${title}<span>D${C.puzzles.find(p=>p.id===pid).unlockDay} · 화면 예시</span></div><div class="phone-scene"><svg viewBox="${vb}" role="img" aria-label="${title} 구역 확대 시안">${base}</svg></div><div class="bubble">${bubble}</div><div class="phone-buttons"><button data-openpuzzle="${pid}">${button} ↗</button><button data-go="doc-04">${secondary} ↗</button></div><div class="phone-bottom">← 전체 지도　·　구역 화면</div></div><p class="phone-label">${note}</p></div>`;}).join('');

const intros={conveyor:'레일과 장치를 놓아 서류가 필요한 도장을 받고 기록함으로 가게 합니다.',rules:'접수 조건을 고치되, 잠긴 상위 규칙과 모든 공개 사례를 함께 만족시킵니다.',macro:'블록의 순서와 경계값을 고쳐, 정산 결과와 실행 로그를 맞춥니다.',owner:'공개 단서를 표에 기록해, 각 인물과 서류를 하나씩 연결합니다.',approval:'가능 날짜 · 선행 순서 · 담당자별 하루 용량을 지키는 일정을 설계합니다.',archive:'서류 상자는 밀 수 있습니다. 되돌리기와 재시작이 가능한 선택 업무입니다.',budget:'기간과 월별 금액을 바꾸지 않고, 월 · 분기 한도 안에 사업을 배치합니다.',brief:'허용된 요약 카드만 사용해 필수 사실과 순서를 보존하며 분량을 줄입니다.'};
$('#puzzlePicker').innerHTML=C.puzzles.map(p=>`<button class="puzzle-button" data-puzzle="${p.id}"><b>${esc(p.name)}</b><small>${p.group}군 · D${p.unlockDay} ${p.mandatory?'본편':'선택'}</small></button>`).join('');
$('#puzzlePicker').onclick=e=>{const b=e.target.closest('[data-puzzle]');if(b){puzzle=b.dataset.puzzle;revealed=false;renderPuzzle();}};
$$('[data-diff]').forEach(b=>b.onclick=()=>{difficulty=b.dataset.diff;revealed=false;renderPuzzle();});
$('#answerToggle').onclick=()=>{revealed=!revealed;renderPuzzle();};
$('#puzzleSpec').onclick=()=>go(D.headings['doc-05'].find(h=>h.text.includes('(`'+puzzle+'`')||h.text.includes('('+puzzle+','))?.id||D.headings['doc-05'].find(h=>h.text.includes(puzzle))?.id||'doc-05');
function gridSVG(cols,rows,content,label){let cells='';for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)cells+=rect(x*48,y*48,48,48,'#eef0e2','stroke="#d5dbc6"');return `<svg viewBox="0 0 ${cols*48} ${rows*48}" role="img" aria-label="${label}">${cells}${content}</svg>`;}
function tile(x,y,label,fill='#d3dfbd'){return rect(x*48+3,y*48+3,42,42,fill,'rx="4"')+`<text x="${x*48+24}" y="${y*48+29}" text-anchor="middle" fill="#43593a" font-size="11" font-family="system-ui">${esc(label)}</text>`;}
function conveyorBoard(){
 const size=difficulty==='e'?[5,4]:difficulty==='n'?[7,5]:[8,6];let b='',route='';
 if(difficulty==='e'){b=tile(0,1,'발행')+tile(2,1,'계장')+tile(4,1,'기록');route='M24 72H216';}
 else if(difficulty==='n'){b=tile(0,2,'발행')+tile(2,2,'분기')+tile(4,2,'계장')+tile(6,2,'접수함')+tile(6,4,'보완함','#e7d8b6');route='M24 120H312 M120 120V216H312';}
 else{b=tile(0,2,'발행')+tile(2,2,'복사')+tile(3,2,'계장')+tile(4,2,'≥100')+tile(4,1,'과장')+tile(7,2,'사본함')+tile(4,5,'기록')+tile(7,5,'원본함');route='M24 120H216V72H312V120H360 M216 120H360 M120 120V264H360';}
 const line=revealed?`<path d="${route}" fill="none" stroke="#8ea36a" stroke-width="9" stroke-linejoin="round"/>`:'';
 return gridSVG(...size,line+b,'컨베이어 장치 배치 예시')+`<p class="budget-note">${revealed?'녹색 레일은 예제 해법의 흐름을 나타냅니다.':'장치를 잇는 레일은 해법 보기에서 표시됩니다.'} 방향과 판정은 아래 명세를 참고하세요.</p>`;
}
function rulesBoard(){
 const hard=difficulty==='h',conditions=['사전 접수',revealed?'또는 OR':'접수 조건 수정','현장 접수'];
 const cases=difficulty==='e'?[['A 승인 / 50 / 목요일','허용 · 계장'],['B 미승인','보완'],['C 승인 / 100 / 목요일','허용 · 과장']]:hard?[['A 사전 / 불완전 / 50','보완'],['B 현장 / 완전 / 100','허용 · 과장'],['D 사전 / 완전 / 50','허용 · 계장'],['F 현장 / 불완전 / 50','보완']]:[['사전 / 50','허용 · 계장'],['현장 / 100','허용 · 과장'],['미접수 / 50','보완']];
 return `<div class="rule-line">${(difficulty==='e'?['승인된 서류',revealed?'요일 = 목요일':'요일 = 금요일']:conditions).map(t=>`<span class="rule-tile">${t}</span>`).join('')}</div><div class="rule-line"><span class="rule-tile locked">잠금 · 금액 ≥100 → 과장</span>${hard?'<span class="rule-tile locked">잠금 · 불완전 → 보완 우선</span>':''}</div><div class="case-list">${cases.map(([x,result])=>`<div class="case-row"><span>${x}</span><em>${revealed?result:'결과 미리보기'}</em></div>`).join('')}</div>`;
}
function macroBoard(){const blocks=difficulty==='e'?['입력 읽기','금액 합산','결과 제출']:difficulty==='n'?['승인 건 선택','ID 중복 제거','금액 합산','결과 제출']:['승인 건 선택','금액 ≥100 분기','계장 / 과장 경로','결과 제출'];return `<div class="macro-grid"><div class="block-list">${blocks.map((x,i)=>`<div class="code-block">${i+1}. ${x}</div>`).join('')}</div><div class="log-paper">입력과 실행 로그<br>${difficulty==='e'?'100 + 200':difficulty==='n'?'A100 · B250 · A100<br>C500 (미승인)':'99 / 100 / 150'}<strong>${revealed?(difficulty==='e'?'300':difficulty==='n'?'350':'1 / 2'): '—'}</strong><span>${difficulty==='h'?'계장 건수 / 과장 건수':'제출할 합계'}</span></div></div>`;}
function ownerBoard(){const people=['가온','보람','채림','다온','은오'].slice(0,difficulty==='e'?3:difficulty==='n'?4:5),docs=difficulty==='e'?['빨강','파랑','초록']:difficulty==='n'?['예산09','메모10','서식11','영수증12']:['신청09','변경10','보고11','회신13','열람14'],answer=difficulty==='e'?[1,0,2]:difficulty==='n'?[1,2,3,0]:[1,2,4,0,3];return `<table class="match-table"><thead><tr><th>인물 / 서류</th>${docs.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${people.map((p,i)=>`<tr><th>${p}</th>${docs.map((d,j)=>`<td class="${revealed&&answer[i]===j?'hit':''}">${revealed&&answer[i]===j?'●':'·'}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="budget-note">색 이름 · 시각도 문자로 공개합니다. 인물과 서류는 각각 한 번만 연결합니다.</p>`;}
function approvalBoard(){const entries=difficulty==='e'?[['계장 A'],['과장 A'],[],[],[]]:difficulty==='n'?[['계장 A·B'],['회계 A·B'],[],['과장 A·B'],[]]:[['계장 A·B'],['계장 C','회계 A·B'],['회계 C'],['과장 A·B'],['과장 C']];return `<div class="schedule">${['월','화','수','목','금'].map((d,i)=>`<div><strong>${d}</strong>${(revealed?entries[i]:[]).map(x=>`<span>${x}</span>`).join('')}</div>`).join('')}</div><p class="budget-note">${difficulty==='e'?'담당자별 하루 1건 · 수요일 마감':'담당자별 하루 2건 · 다음 날 이후 선행 · 금요일 마감'}</p>`;}
function archiveBoard(){let rows=difficulty==='e'?['#####','#...#','#@$.#','#..G#','#####']:difficulty==='n'?['######','#@...#','#.$.G#','#.$.G#','######']:['#######','#.....#','#.@$..#','#..$GG#','#.....#','#######'];let boxes=[],player=[];rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='$')boxes.push([x,y]);if(c==='@')player=[x,y];}));
 if(revealed){const moves=D.examples['archive_'+difficulty+'01'].answer.match(/[UDLR](?=\s|$)/g)||[];for(const m of moves){const delta={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]}[m],n=player.map((v,i)=>v+delta[i]),bi=boxes.findIndex(b=>b[0]===n[0]&&b[1]===n[1]);if(bi>=0)boxes[bi]=n.map((v,i)=>v+delta[i]);player=n;}}
 let b='';rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='#')b+=rect(x*48+1,y*48+1,46,46,'#839071');else if(c==='G')b+=tile(x,y,difficulty==='h'?(x===5?'25':'24'):'목표','#d5e1bd');}));boxes.forEach(([x,y],i)=>b+=tile(x,y,difficulty==='h'?(i===0?'2024':'2025'):'서류','#cbb180'));b+=avatar(player[0]*48+24,player[1]*48+23,'#476e53',1.05);return gridSVG(rows[0].length,rows.length,b,'서고 상자 밀기 예제')+'<p class="budget-note">밀기만 가능 · 되돌리기 무제한 · 선택 업무</p>';}
function budgetBoard(){const cols=difficulty==='e'?4:difficulty==='n'?6:12,rows=difficulty==='e'?3:4,projects=difficulty==='e'?[[0,2,1,'A'],[2,1,1,'B']]:difficulty==='n'?[[0,3,1,'A'],[3,2,1,'B'],[5,1,2,'C']]:[[0,3,1,'A'],[3,2,1,'B'],[6,3,1,'C'],[9,2,1,'D'],[5,1,2,'E'],[11,1,2,'F']];const cell=36;let svg='';for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)svg+=rect(x*cell,y*cell,cell,cell,'#eef0e1','stroke="#d3dac0"');for(let x=0;x<cols;x++)svg+=`<text x="${x*cell+18}" y="${rows*cell+18}" font-size="10" text-anchor="middle" fill="#6f8062">${x+1}월</text>`;
 if(revealed)projects.forEach(([x,w,h,label],i)=>{svg+=rect(x*cell+2,(rows-h)*cell+2,w*cell-4,h*cell-4,['#b8cea0','#dcc68f','#a9c5bb'][i%3],'rx="3"')+`<text x="${(x+w/2)*cell}" y="${(rows-h/2)*cell+4}" text-anchor="middle" font-size="12" fill="#425940">${label}</text>`;});return `<svg viewBox="0 0 ${cols*cell} ${rows*cell+26}" role="img" aria-label="期間와 월별 금액 배치 예시">${svg}</svg><p class="budget-note">월별 한도 2 · 회전 금지 · 분기 탭으로 확대 편집하는 설계<br>${revealed?'예제의 유효 배치를 표시했습니다.':'해법을 열면 사업 A~'+projects.at(-1)[3]+'의 유효 배치를 표시합니다.'}</p>`;}
function briefBoard(){const cards=revealed?(difficulty==='e'?[['GP','목표 · 기간',2],['B','예산',1]]:difficulty==='n'?[['GP','목표 · 기간',2],['B','예산',1],['R','위험',2]]:[['GP','목표 · 기간',2],['BR','예산 · 위험',2],['OD','담당 · 결정',2]]):[['G','목표',2],['P','기간',1],['B','예산',1],...(difficulty==='e'?[]:[['R','위험',2]]),...(difficulty==='h'?[['O','담당',1],['D','결정',2]]:[])];return `<div class="summary-cards">${cards.map(([id,text,cost])=>`<div class="summary-card"><small>${id}</small><b>${text}</b><span>${cost}칸</span></div>`).join('')}</div><p class="sum-cap">분량 <b>${cards.reduce((a,c)=>a+c[2],0)} / ${difficulty==='e'?4:difficulty==='n'?5:6}칸</b> · ${revealed?'필수 사실 보존':'원문을 선택하거나 허용 요약으로 결합'}</p>`;}
const board={conveyor:conveyorBoard,rules:rulesBoard,macro:macroBoard,owner:ownerBoard,approval:approvalBoard,archive:archiveBoard,budget:budgetBoard,brief:briefBoard};
function renderPuzzle(){const p=C.puzzles.find(x=>x.id===puzzle),example=D.examples[puzzle+'_'+difficulty+'01'];$('#puzzleTitle').textContent=p.name;$('#puzzleGroup').textContent=p.group+'군 · D'+p.unlockDay;$('#puzzleIntro').textContent=intros[puzzle];$('#exampleInput').textContent=example.input;$('#exampleAnswer').textContent=example.answer;$('#answerBlock').hidden=!revealed;$('#answerToggle').textContent=revealed?'해법 닫기':'해법 보기';$('#puzzleBoard').innerHTML=board[puzzle]();$$('[data-puzzle]').forEach(b=>{const on=b.dataset.puzzle===puzzle;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});$$('[data-diff]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.diff===difficulty)));}
renderPuzzle();
const npcNames={npc_sora:'나소라',npc_jae:'도재훈',npc_miru:'연미루',npc_dan:'백단비',npc_chief1:'권한솔',npc_chief2:'민서윤',npc_chief3:'오가람',npc_boss:'정윤서',npc_haru:'임하루'},legacyNames={compare:'서류 대조',memory:'전화 메모',sort:'자료 취합',route:'부서 안내',sequence:'처리 순서'};
const puzzleName=id=>C.puzzles.find(p=>p.id===id)?.name||legacyNames[id]||id;
function day(n){const d=C.days.find(d=>d.day===n),item=C.decor.find(c=>c.id===d.shopUnlock);$$('[data-day]').forEach(b=>{const on=Number(b.dataset.day)===n;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});$('#storyBulletin').innerHTML=`<div class="bulletin-header"><span>생활보장과 소식지</span><span>제 ${n}호 · ${n<=5?1:n<=10?2:3}막</span></div><h3>${esc(d.title)}</h3><p>${esc(d.event)}</p><div class="news-note"><b>오늘 만나는 사람 · ${npcNames[d.npc]}</b><br>하루의 사건은 본업과 소품 해금을 연결합니다. 어제의 선택 결과는 후속 결과 12종의 플래그에 따라 표시하는 설계입니다.</div><div class="receipt">가상 업무 · 실제 행정 규정과 무관<br>계획 데이터 ${d.flag} / 일차 ${n}의 화면 예시</div>`;$('#daySummary').innerHTML='<h3>오늘의 본업 · 네 건</h3>'+d.main.map((id,i)=>`<div class="task-card"><span>${String(i+1).padStart(2,'0')}</span><div><b>${puzzleName(id)}</b><small>완료 XP15 · 20P · 난도별 기본 보상 동일</small></div></div>`).join('')+`<div class="day-unlock"><b>상점에 새로 들어오는 소품</b><p>${item.name} · ${item.price}P</p><small>본업 4건 + 하루 결산 = XP60 · 95P</small></div>`;}
$('#dayPicker').innerHTML=C.days.map(d=>`<button data-day="${d.day}" title="${esc(d.title)}" aria-pressed="false">D${d.day}</button>`).join('');$('#dayPicker').onclick=e=>{const b=e.target.closest('[data-day]');if(b)day(Number(b.dataset.day));};day(1);
const decorIDs=['decor_plant','decor_mug','decor_note','decor_stamp','decor_monitor','decor_lamp'];
$('#decorPicker').innerHTML=decorIDs.map(id=>{const c=C.decor.find(c=>c.id===id);return `<button class="decor-item" data-decor="${id}" aria-pressed="false"><span>${({decor_plant:'♧',decor_mug:'☕',decor_note:'▤',decor_stamp:'▣',decor_monitor:'▰',decor_lamp:'☼'})[id]}</span><b>${c.name}</b><small>${c.price}P · D${c.day} · ${c.scope}</small></button>`;}).join('');
function decorate(id){const c=C.decor.find(c=>c.id===id);$('#decorArt').innerHTML=deskArt(id);$('#decorCaption').textContent=c.name+' · '+c.anchor+' · 외형 예시';$$('[data-decor]').forEach(b=>{const on=b.dataset.decor===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});}
$('#decorPicker').onclick=e=>{const b=e.target.closest('[data-decor]');if(b)decorate(b.dataset.decor);};decorate('decor_plant');
route();
})();
