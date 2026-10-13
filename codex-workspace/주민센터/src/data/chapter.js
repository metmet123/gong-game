(function(root){
  'use strict';
  const days=[
    {day:1,title:'낯선 창구, 새로운 주소',visits:['M01','M02','M03'],opening:'인사발령을 받고 모퉁이동 주민센터에 도착했습니다. 선임 정서린이 빈 창구를 가리킵니다. “오늘은 세 집의 새 주소를 함께 기록해 봐요.”',closing:'혼자 시작하는 집도, 함께 옮기는 집도 있었습니다. 선임이 메모장에 적습니다. “누가 남는지까지 확인하면 기록이 단단해져요.”'},
    {day:2,title:'잘 묻는 것도 업무입니다',visits:['M04','M05','M06'],opening:'창구 동료 도지안이 자료철을 건넵니다. “빈칸은 추측으로 채우지 않아요. 물어볼 수 있는 건 묻고, 준비가 필요한 건 정확하게 안내해요.”',closing:'수아에게 필요한 확인을 안내했습니다. 아직 주소를 옮기지는 않았지만 다음 방문의 길은 분명해졌습니다. 지안이 웃습니다. “오늘 한 안내가 내일의 처리를 돕겠죠.”'},
    {day:3,title:'어제의 안내가 돌아오는 날',visits:['M06-return','M07','M08'],opening:'어제 방문했던 수아가 자료철을 들고 들어옵니다. “알려주신 확인 자료를 준비했어요.” 그제야 보완 안내 기록이 다음 처리와 연결됩니다.',closing:'수아의 주소가 오늘 등록되었습니다. 서린이 동네 지도 엽서를 건넵니다. “다음 사람에게도 길을 잘 안내해 주세요.”'},
    {day:4,title:'이 동네에 온 사람들',visits:['M09','M10','M11'],opening:'생활보장계 선배 나소라에게서 안부 메모가 왔습니다. “먼저 원본부터요. 새 창구에서도 잘하고 있죠?” 익숙한 말을 떠올리며 오늘의 접수를 시작합니다.',closing:'열두 번의 방문과 열한 집의 이야기를 기록했습니다. 나소라에게 짧은 답장을 씁니다. “안내로 마친 방문도, 다시 돌아온 방문도 이 창구의 일이네요.” 창구 사진 한 장을 책상에 놓습니다.'}
  ];
  const items=[{id:'badge',name:'첫 업무 이름표',description:'첫 전입 처리를 끝낸 창구의 작은 이름표.'},{id:'memo',name:'접수 메모장',description:'확인한 사실과 다음 안내를 차근차근 적는 메모장.'},{id:'map',name:'동네 지도 엽서',description:'수아가 재방문을 마친 날 선임에게 받은 지도.'},{id:'photo',name:'창구 사진',description:'모퉁이동 주민센터의 첫 근무를 마친 기념.'}];
  const zones=[{id:'entry',name:'입구',x:2,y:11,w:3,h:2,approach:{x:4,y:10}},{id:'queue',name:'번호표 · 대기석',x:2,y:6,w:4,h:3,approach:{x:6,y:8}},{id:'counter',name:'전입 창구',x:8,y:3,w:7,h:3,approach:{x:11,y:6}},{id:'forms',name:'서식대',x:15,y:8,w:3,h:2,approach:{x:14,y:9}},{id:'files',name:'자료함',x:15,y:1,w:3,h:3,approach:{x:14,y:2}},{id:'desk',name:'직원 책상',x:2,y:1,w:4,h:3,approach:{x:6,y:3}}];
  function path(from,to){const blocked=(x,y)=>x<1||x>18||y<1||y>12||zones.some(z=>x>=z.x&&x<z.x+z.w&&y>=z.y&&y<z.y+z.h);if(blocked(from.x,from.y)||blocked(to.x,to.y))return null;const queue=[[from]],seen=new Set([from.x+','+from.y]);for(let at=0;at<queue.length;at++){const p=queue[at],last=p[p.length-1];if(last.x===to.x&&last.y===to.y)return p;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:last.x+dx,y:last.y+dy},key=n.x+','+n.y;if(!blocked(n.x,n.y)&&!seen.has(key)){seen.add(key);queue.push([...p,n]);}}}return null;}
  const api={days,items,zones,path};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MoveInChapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
