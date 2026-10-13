raise SystemExit("Historical generator: do not regenerate finalized docs. Edit current JSON and run validate_plan.py.")
"""Create planning data/visuals only. Never writes the executable game."""
from pathlib import Path
from collections import deque, Counter
import json, html
ROOT=Path(__file__).resolve().parents[2]; DOC=ROOT/'docs'
(DOC/'data').mkdir(exist_ok=True);(DOC/'assets').mkdir(exist_ok=True)
layout=json.loads((ROOT/'생활보장과_사무실배치.json').read_text(encoding='utf-8-sig'))
(DOC/'data/office_original_v1.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2),encoding='utf-8')
def z(id,name,rects,focus,approach,objects,puzzles,npcs,anchors):
 return dict(id=id,name=name,rects=rects,focus=focus,approach=approach,objects=objects,puzzles=puzzles,npcs=npcs,anchors=anchors,zoneScaleMobile=2,zoneScalePC=3)
zones=[
 z('desk','내 자리 · PC/서류',[[5,4,7,9]],[6,6],[6,4],['o12','o10'],['compare','memory','sort','sequence','conveyor','macro','brief'],['player','npc_sora'],['desk.plant','desk.mug','desk.stationery','desk.lamp','desk.chair','desk.monitor','desk.stamp']),
 z('colleagues','동료 업무섬',[[7,4,11,9],[5,9,11,14],[5,14,11,19]],[9,11],[9,9],['o'+str(i) for i,a in enumerate(layout['items']) if a[0]=='staff'],['owner'],['npc_sora','npc_jae','npc_dan'],['colleagues.memo']),
 z('approval','결재 자리',[[11,0,13,3],[11,5,13,8],[11,10,13,13],[11,15,13,18]],[12,2],[11,0],['o3','o7','o11','o39'],['conveyor','approval','brief'],['npc_chief1','npc_chief2','npc_chief3','npc_boss'],['approval.tray']),
 z('service','민원 창구 · 게시판',[[0,0,5,4]],[2.5,1.5],[2,2],['o24','o2'],['route','rules','owner'],['npc_miru','npc_visitor'],['service.poster','service.badge']),
 z('records','출력 · 기록',[[5,2,13,4],[0,8,2,11]],[1,9],[1,9],['o16','o17','o18','o19','o20','o23','o31'],['owner','archive','brief'],['npc_dan'],['records.label','records.bookend']),
 z('meeting','회의 · 예산',[[1,18,6,21]],[3.5,19],[3,17],['o21'],['approval','budget'],['npc_jae','npc_chief2'],['meeting.coaster','meeting.mat']),
 z('rest','휴식 · 출입',[[0,5,2,8],[0,12,2,18],[6,0,9,1]],[1,7],[1,7],['o22','o25','o26','o27','o28','o33','o34','o36','o37','o38','o45'],[],['npc_miru'],['rest.coffee','rest.cushion','rest.calendar'])
]
days=[
 (1,'첫 출근',['compare','memory','sort','route'],'npc_sora','서류 한 장이 오늘의 튜토리얼','st_day1','decor_plant'),
 (2,'최종_진짜최종',['sort','sequence','compare','memory'],'npc_jae','파일명보다 승인 버전','st_final','decor_mug'),
 (3,'한 줄 회신',['memory','route','sort','compare'],'npc_miru','전화 메모와 회신 대기 1턴','st_reply','decor_note'),
 (4,'점심시간 순삭',['sequence','sort','route','memory'],'npc_dan','선택 업무 보류와 쉬운 반복 처리','st_lunch','decor_coaster'),
 (5,'첫 주 수료',['compare','sequence','memory','route'],'npc_chief1','수료 후 같은 하루를 더 편하게','st_week1','decor_poster'),
 (6,'도장 공장 시범',['conveyor','compare','sort','route'],'npc_chief1','결재 컨베이어; 서고는 선택','st_conveyor','decor_stamp'),
 (7,'서식은 오늘부터',['rules','conveyor','compare','memory'],'npc_miru','가상 규정 개정; 잠긴 상위 규칙','st_form','decor_clip'),
 (8,'100은 어느 쪽',['macro','rules','sort','route'],'npc_jae','매크로 경계값 디버깅','st_macro','decor_monitor'),
 (9,'복사기에 남은 한 장',['owner','conveyor','memory','compare'],'npc_dan','서류 주인 추리; 이름은 가명','st_owner','decor_bookend'),
 (10,'결재 반려, 다시',['approval','macro','owner','route'],'npc_chief2','가능 시간과 선행 조건','st_reject','decor_tray'),
 (11,'분기 칸은 좁다',['budget','rules','sort','compare'],'npc_chief3','기간×금액 턴제 배치','st_budget','decor_lamp'),
 (12,'한 장으로 줄여 와',['brief','conveyor','owner','memory'],'npc_boss','필수 사실과 분량 계약','st_brief','decor_mat'),
 (13,'협조는 상호작용',['approval','macro','rules','sort'],'npc_haru','가상 타과 회신 이야기; 실제 부서팩은 후속','st_coop','decor_badge'),
 (14,'금일 중, 또 금일 중',['budget','owner','conveyor','compare'],'npc_chief3','배운 도구로 돌발 요청 수습','st_deadline','decor_cover'),
 (15,'제출 완료, 새 요청',['brief','approval','conveyor','rules'],'npc_boss','최종본 봉인 뒤 새 서식 도착','st_end','decor_calendar')]
tools=[
 ('guide','대조 가이드',45,1,'compare','같은 항목 교차 강조'),('memo','전화 메모장',45,1,'memory','통화 후 핵심 1칸 유지'),
 ('clean','자료 정리 도구',60,2,'sort','명백한 조건 불일치 흐리게 표시'),('directory','부서 연락망',50,2,'route','무관 부서 1곳 제외'),
 ('preview','실행 미리보기',60,2,'sequence','감점 없이 단계별 실행'),('auto','반복 업무 매크로',120,4,'sort','튜토리얼 취합 2건 후 익숙한 워밍업 하루 1건 처리'),
 ('trace','동선 추적지',70,6,'conveyor','한 서류의 레일 궤적 표시'),('rulebook','규정 색인',70,7,'rules','충돌한 상위 조건과 적용 순서 강조'),
 ('boundary','경계값 카드',80,8,'macro','경계 입력 1개 제안; 테스트 횟수 소비 없음'),('reply','회신 바로가기',90,10,'approval','다음 날 선택 협조 회신 1턴 단축; 필수 해는 도구 없이 존재')]
decor=[
 ('decor_plant','작은 화분',35,'desk.plant',1,'MVP'),('decor_mug','내 이름 머그컵',40,'desk.mug',2,'MVP'),
 ('decor_note','메모 꽂이',25,'desk.stationery',3,'MVP'),('decor_coaster','점심 컵받침',25,'meeting.coaster',4,'MVP'),
 ('decor_poster','정시퇴근 포스터',45,'service.poster',5,'MVP'),('decor_stamp','녹색 도장 손잡이',45,'desk.stamp',6,'MVP'),
 ('decor_clip','별 클립',30,'desk.stationery',7,'Beta'),('decor_monitor','숲 모니터 테마',35,'desk.monitor',8,'Beta'),
 ('decor_bookend','기록관 책받침',40,'records.bookend',9,'Beta'),('decor_tray','나무 결재함 라벨',40,'approval.tray',10,'Beta'),
 ('decor_lamp','노란 스탠드',40,'desk.lamp',11,'Beta'),('decor_mat','회의 테이블 매트',35,'meeting.mat',12,'Beta'),
 ('decor_badge','협조 배지',35,'service.badge',13,'Beta'),('decor_cover','의자 커버',45,'desk.chair',14,'Beta'),
 ('decor_calendar','금일중 달력',40,'rest.calendar',15,'Beta'),('decor_cat','사무실 고양이 조각',100,'desk.plant',5,'Beta'),
 ('decor_coffee','탕비 트레이',45,'rest.coffee',6,'Beta'),('decor_cushion','대기석 쿠션',35,'rest.cushion',10,'Beta')]
new=[('conveyor','결재 컨베이어','A',6),('rules','규정 개정','A',7),('macro','매크로 설계·디버깅','A',8),('owner','서류 주인 찾기','B',9),('approval','결재 동선','B',10),('archive','서고 정리','B',6),('budget','예산 테트리스','C',11),('brief','한 장 보고','C',12)]
departments=[('recycling','자원순환과','재활용 선별장','sort_bins',1),('waterworks','상하수도사업소','상수도관 연결','connect_paths',1),('traffic','교통행정과','불법주차 견인','arrow_exit',1),('land','토지정보과','지적도 복원','nonogram',1),('records','기록관리팀','기록물 철하기','triple_stack',2),('disaster','재난안전과','구호물자 창고','archive',2),('culture','문화관광과','축제 부스 배치','booth_blocks',2),('it','정보화팀','정산 매크로','macro',2),('river','하천관리과','장마철 수문','water_cells',3),('parks','공원녹지과','놀이터 해체','screw_layers',3),('building','건축과','현장 안전점검','hazard_check',3)]
data={'planVersion':'1.0','date':'2026-10-10','departmentId':'life_support','map':{'cols':14,'rows':21,'tile':24,'objects':46},'difficulty':['easy','normal','hard'],'dailyMain':4,'durationMinutes':[6,10],'reward':{'taskXP':15,'taskP':20,'dayP':15,'initialP':30,'energyCost':8},'zones':zones,'puzzles':[dict(id=a,name=b,group=c,unlockDay=d,mandatory=a!='archive') for a,b,c,d in new],'days':[dict(day=d,title=t,main=p,npc=n,event=e,flag=f,shopUnlock=i) for d,t,p,n,e,f,i in days],'tools':[dict(id=i,name=n,price=p,day=d,type=t,effect=e) for i,n,p,d,t,e in tools],'decor':[dict(id=i,name=n,price=p,anchor=a,day=d,scope=s) for i,n,p,a,d,s in decor],'departments':[dict(id=i,name=n,puzzleTitle=p,puzzleType=t,wave=w) for i,n,p,t,w in departments]}
(DOC/'data/planning_contract.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
blocked={};overlaps=[];outside=[]
for i,(_,x,y,w,h,dr,lbl) in enumerate(layout['items']):
 for yy in range(y,y+h):
  for xx in range(x,x+w):
   if not(0<=xx<14 and 0<=yy<21):outside.append([i,xx,yy])
   if (xx,yy) in blocked:overlaps.append([blocked[xx,yy],i,xx,yy])
   blocked[xx,yy]=i
def path(start,end):
 q=deque([start]);prev={start:None}
 while q:
  u=q.popleft()
  if u==end:
   route=[]
   while u is not None:route.append(list(u));u=prev[u]
   return list(reversed(route))
  for dx,dy in [(0,-1),(1,0),(0,1),(-1,0)]:
   v=u[0]+dx,u[1]+dy
   if 0<=v[0]<14 and 0<=v[1]<21 and v not in blocked and v not in prev:prev[v]=u;q.append(v)
 return None
approaches={}
for i,(_,x,y,w,h,*_) in enumerate(layout['items']):
 candidates=[(xx,y-1) for xx in range(x,x+w)]+[(xx,y+h) for xx in range(x,x+w)]+[(x-1,yy) for yy in range(y,y+h)]+[(x+w,yy) for yy in range(y,y+h)]
 valid=[(c,path((1,12),c)) for c in candidates if 0<=c[0]<14 and 0<=c[1]<21 and c not in blocked]
 valid=[(c,p) for c,p in valid if p]
 approaches['o'+str(i)]=[list(c) for c,p in sorted(valid,key=lambda cp:(len(cp[1]),cp[0][1],cp[0][0]))]
report={'objects':len(layout['items']),'blockedCells':len(blocked),'freeCells':294-len(blocked),'outside':outside,'overlap':overlaps,'start':[1,12],'paths':{z['id']:path((1,12),tuple(z['approach'])) for z in zones},'objectApproaches':approaches,'note':'Planning BFS over exact static footprints. Not an implemented game movement test.'}
(DOC/'evidence/map_analysis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
colors=['#e4bd60','#8bb5c1','#c595ba','#8bb293','#b5b0cc','#c7a37d','#b5c997']
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="930" height="780" viewBox="0 0 930 780"><rect width="930" height="780" fill="#faf6e9"/><g font-family="Malgun Gothic, sans-serif" fill="#263f35"><text x="24" y="34" font-size="22" font-weight="bold">생활보장과 · 7구역 오버레이 설계</text><text x="24" y="60" font-size="14">원본 14×21 / 46물품 보존 · o번호는 원본 배열 0부터 · 구현 화면 아님</text>']
S=30;OX=54;OY=96
for zi,zv in enumerate(zones):
 for x0,y0,x1,y1 in zv['rects']:svg.append(f'<rect x="{OX+x0*S}" y="{OY+y0*S}" width="{(x1-x0)*S}" height="{(y1-y0)*S}" fill="{colors[zi]}" fill-opacity=".25" stroke="{colors[zi]}" stroke-width="2"/>')
for x in range(15):svg.append(f'<path d="M{OX+x*S} {OY}v630" stroke="#d2cbb6"/>')
for y in range(22):svg.append(f'<path d="M{OX} {OY+y*S}h420" stroke="#d2cbb6"/>')
for i,(t,x,y,w,h,dr,label) in enumerate(layout['items']):
 color=colors[next((zi for zi,zv in enumerate(zones) if 'o'+str(i) in zv['objects']),0)] if t not in ('window','partition') else '#ddd8c9'
 svg.append(f'<rect x="{OX+x*S+2}" y="{OY+y*S+2}" width="{w*S-4}" height="{h*S-4}" rx="2" fill="{color}" stroke="#6d6d57"/><text x="{OX+(x+w/2)*S}" y="{OY+(y+h/2)*S+4}" text-anchor="middle" font-size="10">{i}:{html.escape(label[:3])}</text>')
 arrow={'up':'↑','down':'↓','left':'←','right':'→'}[dr]
 svg.append(f'<text x="{OX+x*S+5}" y="{OY+y*S+13}" font-size="10">{arrow}</text>')
for zi,zv in enumerate(zones):
 ax,ay=zv['approach'];svg.append(f'<circle cx="{OX+(ax+.5)*S}" cy="{OY+(ay+.5)*S}" r="8" fill="{colors[zi]}" stroke="#263f35"/><text x="{OX+(ax+.5)*S}" y="{OY+(ay+.5)*S+3}" text-anchor="middle" font-size="9">{zi+1}</text>')
 xx=510;yy=120+zi*80;svg.append(f'<rect x="{xx}" y="{yy-20}" width="20" height="20" fill="{colors[zi]}"/><text x="{xx+30}" y="{yy-4}" font-size="17">{zi+1}. {zv["name"]}</text><text x="{xx+30}" y="{yy+18}" font-size="12">{zv["id"]} / 接近 {zv["approach"]}</text>')
svg.append('<text x="510" y="712" font-size="12">창문·칸막이는 환경 물품. 통로는 구역 밖도 이동 가능.</text><text x="510" y="734" font-size="12">결재/기록의 분리 영역은 대상별 포커스로 확대.</text></g></svg>')
(DOC/'assets/office_zones_overlay.svg').write_text(''.join(svg).replace('接近','접근'),encoding='utf-8')
print(json.dumps({'zones':len(zones),'mapObjects':len(layout['items']),'blocked':len(blocked),'pathsReachable':all(report['paths'].values()),'overlaps':len(overlaps),'outside':len(outside)},ensure_ascii=False))
