from pathlib import Path
from html import escape as E
import json,re,hashlib
import markdown
from bs4 import BeautifulSoup
import puzzle_uiux as UI

W=Path(__file__).resolve().parent
R=Path(r'C:\Users\이현주\Desktop\공무원키우기 _코덱스')
D=json.loads((W/'stage_catalog.json').read_text(encoding='utf-8'))
C=json.loads((R/'docs/data/planning_contract.json').read_text(encoding='utf-8'))
L=json.loads((R/'docs/data/office_original_v1.json').read_text(encoding='utf-8'))
PALETTES=[dict(ink='#59605a',wood='#deded8',floor='#f3f3ef',green='#adada5',blue='#cececa',orange='#ddddcf',paper='#ffffff',line='#969c91',hair='#74776f',skin='#e5e5da'),dict(ink='#45613a',wood='#a9b38f',floor='#e5e9d9',green='#7f9e65',blue='#b5cebc',orange='#d3d9b2',paper='#fafcf0',line='#c4d0b2',hair='#576d4a',skin='#dacfa6'),dict(ink='#3e4c34',wood='#b29a69',floor='#e2e3c9',green='#658a4f',blue='#9cbcad',orange='#d6b86c',paper='#fcf4d9',line='#c2c9a7',hair='#39482f',skin='#d8bb88')]

def r(x,y,w,h,c,extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" {extra}/>'
def t(x,y,text,size=11,c='#45533a',anchor='middle'):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{c}" font-size="{size}" font-family="system-ui,Malgun Gothic,sans-serif">{E(str(text))}</text>'
def svg(w,h,body,label):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{E(label)}">{body}</svg>'
def avatar(x,y,p,s=1):
    return f'<g transform="translate({x} {y}) scale({s})" shape-rendering="crispEdges">'+r(-5,-12,10,5,p['hair'])+r(-6,-7,12,9,p['skin'])+r(-8,2,16,11,p['green'])+r(-5,13,4,7,p['ink'])+r(1,13,4,7,p['ink'])+r(-3,-4,1,2,p['ink'])+r(2,-4,1,2,p['ink'])+'</g>'
def grid(cols,rows,p,size=42):
    return ''.join(r(x*size,y*size,size,size,p['floor'],f'stroke="{p["line"]}" stroke-width=".7"') for y in range(rows) for x in range(cols))
def tile(x,y,label,p,size=42,fill=None):
    return r(x*size+3,y*size+3,size-6,size-6,fill or p['paper'],'rx="3" stroke="'+p['line']+'"')+t(x*size+size/2,y*size+size/2+4,label,10,p['ink'])
def rows(items):
    return '<div class="mock-list">'+''.join(f'<div class="row"><span>{E(a)}</span><b class="{cl}">{E(b)}</b></div>' for a,b,cl in items)+'</div>'
def tokens(values,locked=False):
    return '<div class="rule-line">'+''.join(f'<span class="token {"locked" if locked else ""}">{E(v)}</span>' for v in values)+'</div>'
def mini_cards(cards,cols=3):
    return f'<div class="mini-grid" style="grid-template-columns:repeat({cols},minmax(0,1fr))">'+''.join(f'<div class="mini-card"><small>{E(code)}</small><b>{E(title)}</b><span>{E(detail)}</span></div>' for code,title,detail in cards)+'</div>'

def office_symbols():
    out=''
    for s,p in enumerate(PALETTES):
        b=r(0,0,336,504,p['floor'])
        for x in range(15):b+=f'<path d="M{x*24} 0V504" stroke="{p["line"]}" stroke-width=".4"/>'
        for y in range(22):b+=f'<path d="M0 {y*24}H336" stroke="{p["line"]}" stroke-width=".4"/>'
        for i,(typ,cx,cy,cw,ch,direction,label) in enumerate(L['items']):
            x,y,w,h=cx*24,cy*24,cw*24,ch*24
            body=''
            if s==0:
                body=r(x+1,y+1,w-2,h-2,p['paper'],f'stroke="{p["line"]}" stroke-width="1"')+t(x+w/2,y+h/2+3,'o'+str(i),7,p['ink'])
            elif typ in ['staff','me','chief','boss','empty']:
                body=r(x+2,y+3,w-4,h-6,p['wood'])
                if direction=='up':monitor=[x+8,y+23,w-16,15];ax,ay=x+w/2,y+10
                elif direction=='left':monitor=[x+25,y+8,15,h-16];ax,ay=x+12,y+25
                else:monitor=[x+8,y+7,w-16,15];ax,ay=x+w-12,y+h-13
                body+=r(*monitor,p['ink'])+r(monitor[0]+3,monitor[1]+3,monitor[2]-6,monitor[3]-6,p['blue'])
                if s==2:body+=r(x+8,y+h/2,13,6,p['paper'])+r(x+9,y+h/2+2,7,1,p['line'])+r(x+2,y+h-5,w-4,2,'#87784e')
                if typ!='empty':body+=avatar(ax,ay,p,.53 if direction=='left' else .55)
                if typ=='me' and s==2:body+=r(x+2,y+4,6,5,p['green'])+r(x+w-8,y+10,5,7,p['paper'])
            elif typ=='window':
                body=r(x+4,y+1,w-8,h-2,p['blue'])+r(x+8,y+5,w-16,h-10,p['paper'])+r(x+5,y+h/2,w-10,3,p['line'])
            elif typ=='plant':body=r(x+6,y+15,12,7,p['wood'])+r(x+10,y+4,5,12,p['green'])+r(x+4,y+8,17,6,p['green'])
            elif typ=='counter':body=r(x+2,y+2,w-4,h-4,p['wood'])+r(x+7,y+5,w-14,17,p['paper'])+r(x+12,y+8,25,11,p['green'])
            elif typ=='board':body=r(x+1,y+2,w-2,h-4,p['wood'])+r(x+4,y+4,w-8,h-8,p['orange'])+r(x+8,y+6,10,9,p['paper'])
            elif typ=='meeting':body=r(x+1,y+7,w-2,h-14,p['wood'],'rx="6"')+r(x+25,y+16,22,14,p['paper'])+r(x+6,y+1,14,6,p['green'])+r(x+48,y+1,14,6,p['green'])+r(x+6,y+h-8,14,6,p['green'])+r(x+48,y+h-8,14,6,p['green'])
            elif typ in ['cabinet','shelf']:
                body=r(x+1,y+1,w-2,h-2,p['wood'])
                for xx in range(5,int(w-4),7):body+=r(x+xx,y+4,4,h-7,[p['green'],p['orange'],p['blue']][xx%3])
            else:
                body=r(x+2,y+2,w-4,h-4,p['green'] if typ=='wait' else p['line'])+r(x+5,y+5,w-10,6,p['paper'])
                if s==2:body+=r(x+8,y+h-8,w-16,2,p['ink'])
            b+=f'<g data-source-object="o{i}"><title>{E(label)} ({cx},{cy}) {direction}</title>{body}</g>'
        out+=f'<g id="office-{s}">{b}</g>'
    return '<svg class="svg-defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>'+out+'</defs></svg>'

def map_board(zone,s):
    p=PALETTES[s];z=next((z for z in C['zones'] if z['id']==zone),None)
    if z:
        w,h=150,184;cx,cy=z['focus'][0]*24,z['focus'][1]*24;x=max(0,min(336-w,cx-w/2));y=max(0,min(504-h,cy-h/2));vb=f'{x} {y} {w} {h}'
        highlight=''.join(r(a*24+1,b*24+1,(c-a)*24-2,(d-b)*24-2,'none',f'stroke="{p["green"]}" stroke-width="1.5" stroke-dasharray="4 2"') for a,b,c,d in z['rects']) if s==0 else ''
        actor=avatar(z['approach'][0]*24+12,z['approach'][1]*24+9,p,.7)
    else:
        vb='0 0 336 504';highlight=''.join(r(a*24+1,b*24+1,(c-a)*24-2,(d-b)*24-2,'none',f'stroke="{p["green"]}" stroke-width="1.5"') for z in C['zones'] for a,b,c,d in z['rects']) if s!=2 else '';actor=avatar(36,297,p,.72)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="원본 배치의 {E(zone)} 구역 단계{s+1}"><use href="#office-{s}"/>{highlight}{actor}</svg><span class="map-legend">{ "원본 점유 · 구조" if s==0 else "접근칸 · 확대" if s==1 else "픽셀 · 소품 · 동료"}</span>'

def desk_art(s):
    p=PALETTES[s];b=r(0,0,320,220,p['floor'])+r(0,160,320,60,p['line'])+r(39,145,249,13,p['wood'])+r(48,158,12,51,p['wood'])+r(268,158,12,51,p['wood'])+r(115,75,106,66,p['ink'])+r(122,82,92,51,p['blue'])+r(153,141,34,7,p['ink'])+r(112,149,109,7,p['paper'])
    if s==0:b+=t(168,111,'PC',18,p['paper'])+t(74,111,'소품',13,p['ink'])
    else:b+=r(65,129,20,18,p['wood'])+r(72,101,5,30,p['green'])+r(57,111,18,8,p['green'])+r(77,103,16,9,p['green'])+r(243,132,20,16,p['paper'])
    if s==2:
        b+=r(238,40,53,51,p['wood'])+r(242,44,45,43,p['paper'])+r(242,64,45,3,p['line'])+r(261,44,3,43,p['line'])+r(143,100,26,19,p['green'])+r(175,104,23,15,p['orange'])+r(257,96,5,36,p['wood'])+r(242,84,35,13,p['orange'])+r(235,128,49,5,p['wood'])+r(237,142,28,6,p['paper'])+avatar(179,184,p,1.15)+r(154,206,48,7,p['green'])
    return svg(320,220,b,'내 책상 소품과 PC 외형 단계'+str(s+1))

def board(item,s):
    k=item['board'];p=PALETTES[s];size=42
    if k=='map':return map_board(item.get('zone','overview'),s)
    if k=='rules':return '<span class="field-caption">수정 가능한 접수 조건</span>'+tokens(['사전 신청','OR','현장 접수'])+tokens(['잠금 · 100 이상 → 과장'],True)+rows([('A 사전 / 50','허용 · 계장',''),('B 현장 / 50','허용 · 계장',''),('C 미접수','보완','selected'),('D 현장 / 100','허용 · 과장','')])
    if k=='owner':
        b=grid(4,4,p)
        for i,v in enumerate(['인물','빨강','파랑','초록']):b+=t(i*size+21,24,v,10,p['ink'])
        for i,v in enumerate(['가온','보람','채림'],1):b+=t(21,i*size+25,v,10,p['ink'])
        for x,y in [(1,1),(3,1)]:b+=t(x*size+21,y*size+25,'×',18,p['line'])
        b+=tile(1,2,'●',p,fill=p['green']);return '<span class="field-caption">공개 단서 · 보람은 빨강</span>'+svg(168,168,b,'서류 주인 관계표')+'<div class="bubble">가온은 빨강도 초록도 아닙니다.</div>'
    if k=='approval':
        b=grid(5,3,p,48)
        for i,d in enumerate(['월','화','수','목','금']):b+=t(i*48+24,26,d,12,p['ink'])
        b+=tile(0,1,'계장A',p,48)+tile(1,2,'과장A',p,48);return svg(240,144,b,'월계장 화과장 결재 일정')+tokens(['선행 · 다음 날 이후','수요일 마감'],True)+'<p class="mini-label">담당자 하루1건 · 날짜를 탭해 편집</p>'
    if k in ['brief','sequence','macro']:
        if k=='brief':return '<span class="field-caption">원문 카드 · 필수 사실 G/P/B</span>'+mini_cards([('G','목표','2칸'),('P','기간','1칸'),('B','예산','1칸')])+'<div class="mini-report"><span class="report-stamp">4칸 이하</span><b>보고서 · GP + B</b><br>목표와 기간은 함께 요약<br>예산 값은 그대로 보존<br><b>분량 3 / 4칸</b></div>'
        blocks=['받기','승인 필터','중복 제거','합산','제출'];out=rows([(str(i+1)+'. '+x,'↕','')for i,x in enumerate(blocks)])
        return '<span class="field-caption">처리 블록 · 위/아래로 편집</span>'+out+'<div class="mini-report"><b>입력 A100 / B250 / A100</b><br>C500 미승인 → 제외<br><span class="report-stamp">350</span>검증 출력 · 350</div>'
    if k in ['archive','archive2']:
        ars=['#####','#...#','#@$.#','#..G#','#####'] if k=='archive' else ['######','#@...#','#.$.G#','#.$.G#','######'];b=grid(len(ars[0]),len(ars),p)
        for y,row in enumerate(ars):
            for x,c in enumerate(row):
                if c=='#':b+=r(x*42+2,y*42+2,38,38,p['wood'])
                elif c=='G':b+=tile(x,y,'목표',p,fill=p['blue'])
                elif c=='$':b+=tile(x,y,'서류' if k=='archive' else ('2025' if y==2 else '2026'),p,fill=p['orange'])
                elif c=='@':b+=avatar(x*42+21,y*42+20,p,.9) if s else t(x*42+21,y*42+26,'@',17,p['ink'])
        return svg(len(ars[0])*42,len(ars)*42,b,'밀기 퍼즐 초기 상태')+tokens(['←','↑','↓','→'])
    if k=='budget':
        b=grid(4,3,p,52)+r(3,2*52+3,98,46,p['green'],'rx="3"')+t(52,2*52+30,'A · 2개월',12,p['paper'])+r(2*52+3,2*52+3,46,46,p['orange'],'rx="3"')+t(2*52+26,2*52+30,'B',12,p['ink'])
        for x in range(4):b+=t(x*52+26,177,str(x+1)+'월',11,p['ink'])
        return '<span class="field-caption">세로=금액 공간 / 가로=월</span>'+svg(208,190,b,'예산 기간 금액 배치')+tokens(['월한도 2','Q1 3/3','회전 금지'],True)
    if k=='conveyor':
        b=grid(7,5,p)
        b+=f'<path d="M21 105H273 M105 105V189H273" fill="none" stroke="{p["green"]}" stroke-width="{6 if s<2 else 9}" stroke-linejoin="round"/>'
        if s==2:b+=f'<path d="M21 105H273 M105 105V189H273" fill="none" stroke="{p["paper"]}" stroke-width="1.4" stroke-dasharray="3 6"/>'
        for x,y,text in [(0,2,'입구'),(2,2,'분기'),(4,2,'계장'),(6,2,'접수'),(6,4,'보완')]:b+=tile(x,y,text,p,fill=p['orange'] if text=='보완' else p['paper'])
        if s==2:b+=r(55,98,17,12,p['paper'],'stroke="#a79d76"')+f'<path d="M55 98l8 6 9-6" fill="none" stroke="#9c956e"/>'+t(139,87,'승인 →',9,p['ink'])+t(126,155,'↓ 미승인',9,p['ink'])
        return svg(294,210,b,'승인 분기와 계장 도장 컨베이어')+tokens(['직선','회전','분기','도장'])
    if k=='compare':return '<span class="field-caption">항목　 원본　 제출본</span>'+rows([('대상　 가상사업 A','동일',''),('기간　 1~2월','동일',''),('금액　 100 → 150','오류 선택','selected'),('인원　 3명','동일',''),('회신　 내부메일','동일','')])
    if k=='sort':return mini_cards([('예산','v2 승인','최신 승인 ✓'),('예산','v3 미승인','선택 제외'),('실적','v1 승인','최신 승인 ✓'),('실적','v2 미승인','선택 제외')],2)+'<p class="mini-label">파일명보다 승인 상태와 버전을 비교합니다.</p>'
    if k=='memory':return '<div class="paper-sheet"><div class="paper-head">가상 통화 · 메모 가능</div><h4>자료 회신 부탁드려요.</h4><p>목적: 가상 자료 회신<br>시각: 14:00<br>담당: 기록 담당</p></div>'+rows([('전화 다시 보기','가능',''),('메모 항목','3칸','selected')])
    if k=='route':return '<div class="bubble">위험 신호가 있는 가상 요청입니다.</div>'+tokens(['공개 규칙 · 안전 우선'],True)+mini_cards([('01','가상 안전','선택 ✓'),('02','가상 기록','일반 분류'),('03','가상 예산','일반 분류'),('04','가상 안내','일반 분류')],2)
    if k=='bins':
        b=''
        for i,stack in enumerate([['A','B','A'],['B','A','B'],[],[]]):
            x=5+i*70;b+=r(x,32,55,154,'none',f'stroke="{p["ink"]}" stroke-width="2" rx="5"')
            for j,v in enumerate(stack):b+=r(x+5,139-j*42,45,38,p['green'] if v=='A' else p['orange'],'rx="3"')+t(x+27,162-j*42,v,17,p['paper'] if v=='A' else p['ink'])
            b+=t(x+27,209,'통 '+str(i+1),10,p['ink'])
        return svg(285,223,b,'용량3 재활용 통4 초기 상태')+tokens(['상단 1개씩','동종/빈통'],True)
    if k=='pipes':
        b=grid(5,5,p);b+=f'<path d="M21 21V63H189V21 M21 189H189" stroke="{p["green"]}" fill="none" stroke-width="8"/>'
        for x,y,lab in [(0,0,'A'),(4,0,'A'),(0,4,'B'),(4,4,'B')]:b+=tile(x,y,lab,p,fill=p['blue'])
        b+=tile(2,0,'보호',p,fill=p['orange']);return svg(210,210,b,'보호칸을 우회하는 두 관로')
    if k=='cars':
        b=grid(4,4,p,50)
        for x,y,lab in [(1,1,'A →'),(2,1,'B →'),(0,2,'C ↑')]:b+=tile(x,y,lab,p,50,fill=p['wood'])
        return svg(200,200,b,'방향대로 출구로 이동하는 차량')+tokens(['소방로 row1 우선'],True)
    if k=='nonogram':
        b=grid(6,6,p,35)
        for i,v in enumerate([1,3,5,3,1],1):b+=t(i*35+17,23,v,12,p['ink'])+t(17,i*35+23,v,12,p['ink'])
        for y,row in enumerate(['00100','01110','11111','01110','00100'],1):
            for x,v in enumerate(row,1):
                if v=='1':b+=r(x*35+3,y*35+3,29,29,p['green'])
        return svg(210,210,b,'1 3 5 3 1 노노그램 다이아몬드')
    if k=='triple':return mini_cards([('A1','A서류','노출'),('A2','A서류','노출'),('A3','A서류','노출'),('B','B서류','다음 묶음'),('C','C서류','다음 묶음'),('영구','보존자료','금고')],3)+tokens(['tray □ □ □ □ □ □ □'],True)+'<div class="bubble">같은 분류 3개 → 철함 / 영구 → 금고</div>'
    if k=='booths':
        b=grid(5,5,p);b+=r(84,0,42,210,p['blue'])+t(105,110,'통로',11,p['ink'])+r(3,3,78,36,p['green'])+t(42,27,'A',12,p['paper'])+r(129,3,36,78,p['wood'])+t(147,46,'B',12,p['paper'])+r(129,129,78,78,p['orange'])+t(168,174,'C',13,p['ink'])+tile(1,1,'소화기',p);return svg(210,210,b,'중앙 통로와 소화기를 보존한 부스 배치')
    if k=='gates':
        b=r(18,15,244,34,p['blue'],'rx="4"')+t(140,37,'비 예보 · 물 3단위',12,p['ink'])+f'<path d="M140 49V72M140 72H70V125M140 72H210V125" fill="none" stroke="{p["green"]}" stroke-width="5"/>'+r(28,90,83,34,p['green'])+t(70,112,'G1 열기',11,p['paper'])+r(170,90,83,34,p['orange'])+t(210,112,'G2 닫기',11,p['ink'])+r(18,140,105,53,p['blue'])+t(70,160,'유수지 3 / 4',11,p['ink'])+r(158,140,105,53,p['wood'])+t(210,160,'마을 누수 0',11,p['ink']);return svg(280,210,b,'가상 수문과 정수 물량 그래프')
    if k=='screws':
        b=r(35,58,200,106,p['line'],'rx="4"')+r(67,28,139,98,p['wood'],'rx="4"')+t(138,73,'판자 A',14,p['paper'])+t(138,151,'가려진 판자 B',12,p['ink'])
        for x,y,v in [(88,48,'s1'),(62,144,'s2'),(210,144,'s3')]:b+=f'<circle cx="{x}" cy="{y}" r="15" fill="{p["green"] if v=="s1" else p["orange"]}" stroke="{p["ink"]}"/>'+t(x,y+4,v,10,p['paper'] if v=='s1' else p['ink'])
        return svg(280,205,b,'겹친 판자와 나사 접근 단계')+tokens(['안전 고정 s3 · 마지막'],True)
    if k=='hazards':
        b=r(0,0,280,170,p['floor'])+r(12,20,65,112,p['green'])+t(44,43,'비상구',11,p['paper'])+r(27,90,53,38,p['wood'])+t(52,113,'적치물',10,p['ink'])+f'<path d="M151 140L176 34M187 140L212 34M161 101L197 101M170 67H204" fill="none" stroke="{p["wood"]}" stroke-width="6"/>'+r(92,150,159,9,p['blue'])+t(232,145,'통로',10,p['ink']);return svg(280,176,b,'가상 점검 장면 위험2와 안전 통로')+rows([('비상구 적치물','위험',''),('흔들린 사다리','위험',''),('별도 통로','이상없음','selected')])
    if k=='title':return desk_art(s)+'<div class="paper-sheet"><h4>금일 중 제출</h4><p>새로 시작 / 이어하기<br>저장 백업 가져오기</p></div>'
    if k=='inbox':return '<span class="field-caption">퍼즐 연습실 · 사무실 없이 바로 시작</span>'+mini_cards([('01','규정','규칙 편집'),('02','주인','관계 추리'),('03','일정','날짜 배치'),('04','보고','카드 요약'),('05','매크로','블록 실행'),('06','서고','상자 밀기'),('07','예산','기간 배치'),('08','컨베이어','서류 자동화')],2)
    if k=='bulletin':return '<article class="paper-sheet"><div class="paper-head">생활보장과 소식지 · 제 7호</div><h4>서식은<br>오늘부터.</h4><p>사전 신청과 현장 접수,<br>둘 다 받을 수 있도록<br>가상 접수 규칙을 정리합니다.</p><div class="bubble">어제의 도장 공장, 오늘은 실전입니다.</div></article>'
    if k=='dialogue':return '<div class="npc-portrait">'+svg(80,90,avatar(40,32,p,2.2),'권한솔 계장 초상 구성 시안')+'</div><span class="field-caption">권한솔 계장</span><div class="bubble">“도장부터 찍지 말고<br>어디로 갈지부터요.”</div>'+rows([('선택1','경로부터 보겠습니다',''),('선택2','규칙을 다시 읽을게요',''),('단서/힌트','무료로 열기','selected')])
    if k=='result':return '<div class="stamp-center">제출<br>완료</div>'+tokens(['핵심 조건 충족','다른 유효 해법도 수용'])+'<div class="mini-report"><b>본업 완료 · XP15 / 20P</b><br>같은 업무의 재제출 지급0<br>연습 모드: XP0 / P0</div>'
    if k=='dayend':return '<div class="paper-sheet"><div class="paper-head">17:50 · 생활보장과</div><h4>오늘 네 건,<br>제출 완료.</h4><p>업무 4 / 4 완료<br>업무 XP60 · 80P<br>퇴근 결산 · 15P<br><b>오늘 합계 · 95P</b></p></div><div class="bubble">내일 예고 · 한 줄 회신</div>'
    if k=='tools':return rows([(x['name'],str(x['price'])+'P','')for x in C['tools'][:4]])+'<div class="mini-report"><b>대조 가이드 · 45P</b><br>같은 항목을 교차 강조합니다.<br>도구 없이도 해법은 존재합니다.</div>'
    if k=='decor':return desk_art(s)+tokens(['화분 · 소유','머그 · 40P','스탠드 · D11'])+'<div class="mini-report">desk.plant · 작은 화분 장착<br>교체해도 소유 기록은 유지</div>'
    if k=='codex':return mini_cards([('01','업무','8종 + 워밍업'),('02','인물','주요9명'),('03','소품','18종'),('04','부서','설치팩만'),('05','사건','후속12'),('☆','업적','18개')],3)+'<div class="mini-report">획득한 기록과 아직 비어 있는 칸<br>하/중/상과 보조 완료는 별도 표시</div>'
    if k=='building':return rows([('생활보장과','본업으로 복귀','selected'),('자원순환과','선택 샘플팩',''),('상하수도사업소','후속 후보',''),('교통행정과','후속 후보',''),('토지정보과','후속 후보','')])+'<div class="bubble">미설치 부서는 선택할 수 없으며 본업 진행을 막지 않습니다.</div>'
    if k=='settings':return rows([('다음 과제 난도','하 / 중 / 상',''),('글씨 크기','보통 / 크게',''),('소리','켜기 / 무음',''),('동작 줄이기','켜기','selected'),('저장 백업','내보내기','')])+'<div class="mini-report">진행 중인 문제의 seed와 난도는<br>설정 변경 후에도 고정됩니다.</div>'
    raise ValueError(k)

def actions(item):
    k=item['board']
    if k=='map':return ['전체 지도','업무 열기','대화/소품','업무함']
    if k=='title':return ['새로 시작','이어하기','백업 가져오기','설정']
    if k=='inbox':return ['문제 선택','시작','초안 이어하기','난도']
    if k=='settings':return ['적용','닫기','백업','도움말']
    if k in ['result','dayend']:return ['기록 보기','구역 복귀' if k=='result' else '다음 날','다시 풀기' if k=='result' else '책상 보기','닫기']
    if k in ['tools','decor','codex','building','dialogue','bulletin']:return {'tools':['효과 보기','구매','소유 도구','닫기'],'decor':['미리보기','장착','해제','닫기'],'codex':['분류','항목 보기','기록','닫기'],'building':['부서 선택','협조 시작','본업 복귀','닫기'],'dialogue':['단서 보기','선택','건너뛰기','닫기'],'bulletin':['이전 결과','업무 시작','건너뛰기','기록']}[k]
    return ['되돌리기','검증','힌트','제출']

def frame(item,s,category):
    if category!='places':return UI.frame(item,s,category,board)
    stage=D['stages'][s];kind='rough basic detail'.split()[s];is_map=item['board']=='map'
    name=item['name'];goal=item['goal'];a=actions(item)
    if category=='places':small='본업 2 / 4' if is_map else '화면 구성';tab=['장면','업무','기록'] if is_map else ['내용','선택','기록']
    else:small='연습 · 보상0';tab=['자료','편집','검증']
    status='조작과 정보의 위치 확인' if s==0 else '규칙을 지키는지 검증해 보세요.' if category!='places' else '같은 저장·진입·복귀 계약 유지'
    if s==2:status={'map':'나소라 · “먼저 원본부터요.”','brief':'정윤서 · “한 장으로. 글자는 그대로.”','conveyor':'권한솔 · “어디로 갈지부터요.”','archive':'백단비 · “되돌리기는 됩니다.”','budget':'오가람 · “분기에 들어가면 됩니다.”'}.get(item['board'],status)
    sample_id=('화면 '+item['id']) if category=='places' else item.get('sample','가상 업무 예시')
    return f'''<article class="stage-card {kind}" data-stage="{stage['id']}"><header><b>{stage['title']}</b><small>{['정보 · 회색 블록','조작 · 상태 · 판정','픽셀 · 반응 · 분위기'][s]}</small></header><div class="mock-screen"><div class="mock-head"><b>← {E(name)}</b><span>{small}</span></div><div class="mock-goal"><b>{'오늘의 구역' if is_map else '목표 / 공개 규칙'}</b>{E(goal)}</div><div class="mock-tabs">{''.join('<span>'+v+'</span>'for v in tab)}</div><div class="mock-board {'map-board' if is_map else ''}">{board(item,s)}</div><div class="mock-status">{E(status)}</div><div class="mock-actions">{''.join(f'<span class="mock-button {"primary" if i==3 or i==1 and category=="places" else ""}">{E(v)}</span>'for i,v in enumerate(a))}</div><div class="mock-nav"><span>사무실</span><span>업무함</span><span>내 책상</span><span>기록</span></div></div><small class="mock-caption">설명용 화면 시안 · 게임 실행 버튼이 아님</small><p class="delta"><span>{['이 단계에서 정할 것','이 단계에서 구현할 것','이 단계에서 더할 것'][s]}</span>{E(item[kind])}</p></article>'''

tasks=[]
plan_path=W/'PUZZLE_FIRST_V1_1.md'
plan=(plan_path if plan_path.exists() else R/'docs/PUZZLE_FIRST_V1_1.md').read_text(encoding='utf-8')
for line in plan.splitlines():
    if not re.match(r'^\|PF[0-6]-[A-Z0-9]+\|',line):continue
    cells=[x.strip()for x in line.strip('|').split('|')]
    if len(cells)!=5:raise ValueError(line)
    id,title,deps,accept,reference=cells
    tasks.append(dict(id=id,title=title,dependsOn=[] if deps=='없음'else deps.split(','),acceptance=accept,legacyReference=reference,status='planned',milestone=id.split('-')[0]))
assert len(tasks)==39
task_ids={t['id']for t in tasks}
for task in tasks:assert all(id in task_ids for id in task['dependsOn'])
def visit(id,path):
    assert id not in path,('cycle',path,id)
    for dep in next(t for t in tasks if t['id']==id)['dependsOn']:visit(dep,path+[id])
for task in tasks:visit(task['id'],[])
(W/'tasks_puzzle_first_v1_1.json').write_text(json.dumps(tasks,ensure_ascii=False,indent=2),encoding='utf-8')

type_short={'rules':'RUL','owner':'OWN','approval':'APR','brief':'BRF','macro':'MAC','archive':'ARC','budget':'BUD','conveyor':'CNV'}
def item_section(item,category,number):
    id=('puzzle-'if category=='puzzles'else 'place-'if category=='places'else 'pack-')+item['id']
    label=('신규 본편'if item.get('kind')=='new'else '기존 워밍업')if category=='puzzles'else '장소 / 공통 화면'if category=='places'else '후속 타과 후보'
    code=item['id'];section='new-puzzles'if category=='puzzles'and item['kind']=='new'else 'legacy-puzzles'if category=='puzzles'else 'places'if category=='places'else 'expansions'
    task=f'PF1-{type_short[item["id"]]} / PF2-{type_short[item["id"]]}'if category=='puzzles'and item['kind']=='new'else 'PF2-LEG'if category=='puzzles'else item.get('task','PF6-01 이후 개별 선택')
    linked=re.sub(r'PF[0-6]-[A-Z0-9]+',lambda m:f'<a href="#task-{m[0]}">{m[0]}</a>'if m[0]in task_ids else m[0],task)
    subtitle=item.get('zone')if category=='puzzles'else item.get('dept','')if category=='expansions'else '원본 14×21·46물품 보존'if item['board']=='map'else '공통 UI · 계획 계약'
    notes=('<div><b>구현 착수 범위</b><p>'+E(item['first'])+'</p></div><div><b>완료 판단</b><p>'+E(item['tests'])+'</p></div>')if category!='places'else '<div><b>화면의 역할</b><p>'+E(item['goal'])+'</p></div><div><b>연결 TASK</b><p>'+linked+'</p></div>'
    witness=''if category=='places'else '<details class="witness"><summary>대표 문제와 한 가지 유효 해법 보기</summary><p><b>조건</b> '+E(item['sample'])+'<br><b>해법</b> '+E(item['answer'])+'<br><b>관련 TASK</b> '+linked+'<br>새 판정기 구현 시 조건 충족과 해 존재를 실행 시험으로 다시 확인합니다.</p></details>'
    refs=UI.notes(item) if category!='places' else ''
    search_refs=' '.join(UI.REF[r]['name'] for r in UI.UX[item['id']]['references']) if category!='places' else ''
    return f'<section class="item" id="{id}" data-group="{section}" data-search="{E(item["name"]+" "+item["id"]+" "+str(subtitle or "")+" "+item["goal"]+" "+task+" "+search_refs)}"><header class="item-header"><div><span class="kind">{label} {number:02d}</span><span class="code">{code}</span><h3>{E(item["name"])}</h3><p>{E(str(subtitle or ""))} · {E(item["goal"])}</p></div><a class="back" href="#{section}">목록 ↑</a></header><div class="triptych">'+''.join(frame(item,s,category)for s in range(3))+'</div>'+refs+'<div class="item-notes">'+notes+'</div>'+witness+'</section>'

nav='<a class="main-link" href="#top">시작 · 3단계 기준</a><a class="main-link" href="#plan">퍼즐 우선 구현 계획</a><h3>신규 퍼즐8종 · 먼저 구현</h3>'+''.join(f'<a href="#puzzle-{p["id"]}">{i+1:02d} {E(p["name"])}</a>'for i,p in enumerate(D['puzzles'][:8]))+'<h3>기존 워밍업5종</h3>'+''.join(f'<a href="#puzzle-{p["id"]}">{E(p["name"])}</a>'for p in D['puzzles'][8:])+'<h3>장소 / 공통 화면19개</h3>'+''.join(f'<a href="#place-{p["id"]}">{E(p["name"])}</a>'for p in D['places'])+'<h3>후속 타과11종</h3>'+''.join(f'<a href="#pack-{p["id"]}">{E(p["name"])}</a>'for p in D['expansions'])
def section_head(id,eyebrow,title,desc):return f'<header class="section-heading" id="{id}"><p class="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{desc}</p></header>'
nav='<a class="main-link" href="#uiux">앱 참고와 조작 원칙 v1.2</a>'+nav
content=UI.intro()+section_head('new-puzzles','BUILD FIRST · NEW 8','먼저 플레이할 신규 퍼즐 8종','구현 권장 순서대로 배치했습니다. 같은 대표 조건을 러프·기본·디테일로 비교하며, 그림 속 유효 배치는 참고 해법입니다.')+''.join(item_section(p,'puzzles',i+1)for i,p in enumerate(D['puzzles'][:8]))
content+=section_head('legacy-puzzles','KEEP WORKING · LEGACY 5','기존 워밍업 5종','현재 작동하는 규칙을 보존하고 새 연습실과 작업대 UI에 연결합니다. 새 본편8종의 구현 완료를 기존 규칙 검사로 대신하지 않습니다.')+''.join(item_section(p,'puzzles',i+1)for i,p in enumerate(D['puzzles'][8:]))
content+=section_head('places','AFTER PUZZLES · 19 SCREENS','장소별 · 공통 화면별 시안','전체지도와 7구역, 시작·업무함·소식지·대화·결과·퇴근·도구·소품·도감·청사지도·설정을 각각 세 단계로 비교합니다. 사무실과 공통 UI의 구현은 퍼즐 기본 플레이 완료 뒤에 연결합니다.')+''.join(item_section(p,'places',i+1)for i,p in enumerate(D['places']))
content+=section_head('expansions','OPTIONAL LATER · DEPARTMENT 11','후속 타과 후보 11종','생활보장과 베타 이후의 후보 시안입니다. 지금 구현할 신규8종과 분리하고, 첫 샘플팩1개를 검증한 뒤 개별로 선택합니다. 난도·문제·자산 제작은 별도 TASK가 필요합니다.')+''.join(item_section(p,'expansions',i+1)for i,p in enumerate(D['expansions']))

ps=BeautifulSoup(markdown.markdown(plan,extensions=['tables','fenced_code','sane_lists']),'html.parser');ps.find('h1').decompose()
for i,h in enumerate(ps.find_all('h2')):h['id']='plan-h'+str(i)
for table in ps.find_all('table'):
    # Task contracts get direct links and collapsible entries below.
    for td in table.find_all('td'):
        if td.get_text(strip=True)in task_ids:
            value=td.get_text(strip=True);td.clear();a=ps.new_tag('a',href='#task-'+value);a.string=value;td.append(a)
    wrap=ps.new_tag('div',attrs={'class':'table-scroll','tabindex':'0','aria-label':'표 내부 가로 스크롤'});table.wrap(wrap)
taskhtml=''.join(f'<details class="task" id="task-{t["id"]}"><summary><span class="task-status">PLANNED</span>{t["id"]} · {E(t["title"])}</summary><div class="task-body"><p><b>직접 선행</b> '+(', '.join(f'<a href="#task-{dep}">{dep}</a>'for dep in t['dependsOn'])or'없음')+f'</p><p><b>완료 증거</b> {E(t["acceptance"])}</p><p><b>기존 계약 참고</b> {E(t["legacyReference"])}</p></div></details>'for t in tasks)
content+=section_head('plan','V1.1 · IMPLEMENTATION ORDER','퍼즐 먼저, 그다음 사무실과 성장','이 문서의 PF0~PF6 순서가 이전 P0~P11 순서를 대체합니다. 게임 규칙과 배치·경제·해금일은 유지합니다. 아래 TASK39개는 모두 계획 상태입니다.')+'<div class="plan-flow">'+''.join(f'<a href="#task-{id}">{label}</a>'+('<i>→</i>'if i<5 else '')for i,(id,label)in enumerate([('PF0-01','준비'),('PF1-RUL','8종 러프 플레이'),('PF2-01','퍼즐 플레이 완성'),('PF3-01','사무실 연결'),('PF4-01','성장·15일'),('PF5-01','디테일·검수')]))+'</div><div class="plan">'+str(ps)+'<h2 id="task-index">TASK 상세 · 선행 바로가기</h2>'+taskhtml+'</div>'
assert len(D['puzzles'])==13 and len(D['places'])==19 and len(D['expansions'])==11
css=(W/'stage_atlas.css').read_text(encoding='utf-8')+'\n'+(W/'puzzle_uiux.css').read_text(encoding='utf-8')
js='''document.documentElement.classList.add('has-js');const q=document.getElementById('search'),items=Array.from(document.querySelectorAll('.item'));q.addEventListener('input',()=>{const term=q.value.toLowerCase().replace(/\\s+/g,'');let count=0;items.forEach(item=>{const match=item.dataset.search.toLowerCase().replace(/\\s+/g,'').includes(term);item.hidden=!match;if(match)count++;});document.getElementById('searchCount').textContent=term?count+'개 항목 · 검색어를 지우면 전체 시안을 다시 표시합니다.':'';document.getElementById('searchEmpty').hidden=count>0;});document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=document.getElementById(a.hash.slice(1));if(!target)return;if(target.classList.contains('item')&&target.hidden){q.value='';q.dispatchEvent(new Event('input'));}if(target.tagName==='DETAILS')target.open=true;});function openHash(){const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t?.tagName==='DETAILS')t.open=true;}window.addEventListener('hashchange',openHash);openHash();'''
html=f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>공무원 키우기 · 3단계 시안과 퍼즐 우선 계획</title><style>{css}</style></head><body><span class="top-anchor" id="top"></span>{office_symbols()}<aside class="sidebar"><a class="brand" href="#top"><span class="brand-mark">公</span><span><b>공무원 키우기</b><small>금일 중 제출</small></span></a><div class="edition">시안집 v1.2 · 구현 순서 v1.1 / 2026.10.11</div><nav class="side-index">{nav}</nav><p class="side-note">목차와 모든 그림은 JavaScript 없이 표시됩니다. 검색만 JavaScript를 사용합니다.</p></aside><div class="page"><header class="topbar"><a href="#top">시안집</a><a href="#new-puzzles">퍼즐</a><a href="#places">화면</a><a href="#plan">구현 순서</a><small>UI v1.2</small><label class="search-box"><input type="search" id="search" placeholder="화면 · 게임 · TASK 검색" aria-label="시안 항목 검색"></label></header><main><header class="hero"><p class="eyebrow">FROM ROUGH TO DETAIL · PUZZLES FIRST</p><h1>먼저 풀 수 있게,<br><em>그다음 사무실의 하루로.</em></h1><p class="lead">퍼즐24종은 실제 앱의 작업 패턴을 참고해 <b>구조 러프 → 앱형 플레이 UI → 게임 디테일 UI</b>로 다듬었습니다. 장소19개는 기존의 3단계 시안을 함께 보존합니다. 구현은 신규 퍼즐8종을 독립 연습실에서 먼저 완성한 뒤 사무실·성장·스토리를 연결합니다.</p><div class="meta"><span class="chip">43개 항목 · 시안129장</span><span class="chip">신규8 + 기존5 + 후속11</span><span class="chip">장소 / 공통 화면19개</span><span class="chip tan">새 TASK39개 · 전부 계획</span></div><div class="hero-links"><a href="#puzzle-conveyor">컨베이어 3단계부터 보기</a><a href="#place-overview" class="secondary">사무실 3단계</a><a href="#plan" class="secondary">퍼즐 우선 구현 순서</a></div></header><details class="index-mobile"><summary>게임 · 장소 · 화면 바로 찾기 ▾</summary><nav class="side-index">{nav}</nav></details><div class="legend">{''.join('<div><span class="num">'+str(i+1).zfill(2)+'</span><b>'+v['title'][3:]+'</b><p>'+v['subtitle']+'<br>'+v['gate']+'</p></div>'for i,v in enumerate(D['stages']))}</div><div class="notice"><p><strong>3단계는 완성도입니다. 난이도 하·중·상과 다릅니다.</strong> 현재 그림은 설명용 시안이며 신규 게임 판정기는 아직 구현하지 않았습니다. 세 단계는 같은 대표 조건을 사용하고, 유효 배치를 보여주는 그림도 포함합니다. 원본 게임은 그대로 보존합니다.</p></div><p class="pc-note">PC: 세 단계 나란히 / 휴대폰: 01→02→03 순서로 보기 · 모바일 세로 작업대를 기준으로 한 시안입니다. PC 게임에서는 자료와 편집을 나란히 놓고 같은 판정·탭 조작을 유지합니다.</p><p class="search-count" id="searchCount" aria-live="polite"></p><p class="empty-search" id="searchEmpty" hidden>일치하는 시안이 없습니다. 더 짧은 단어로 찾아보세요.</p>{content}<p class="source-note">기준: docs/02~08 · planning_contract.json · office_original_v1.json · 대표 예제24개. 타과는 07의 제안에서 도출한 독자적인 화면 구성입니다. 본 문서의 미리보기 점검과 실제 Android 게임 검증은 별도입니다.</p></main><footer class="footer">공무원 키우기 · 시안 UI v1.2 / 퍼즐 우선 계획 v1.1　·　오프라인 단일 HTML　·　2026.10.11</footer></div><script>{js}</script></body></html>'''
file=W/'공무원키우기_3단계시안_퍼즐우선계획.html';file.write_text(html,encoding='utf-8')
roadmap={'version':'1.1','date':'2026-10-11','authority':{'confirmed':['3단계 비교 시안','퍼즐 먼저 독립 플레이 가능하게 구현'],'proposed':['8종 내부 구현 순서','PF 마일스톤과 콘텐츠 수량'],'implemented':['기존5종 기준 규칙'],'unimplemented':['신규8종 엔진','새 BFS/카메라','신규 캠페인']},'supersedesImplementationOrder':'v1.0 P0~P11 / docs/tasks.json','taskRegistry':'tasks_puzzle_first_v1_1.json','coreContentRegistry':'data/planning_contract.json','order':['PF0','PF1','PF2','PF3','PF4','PF5','PF6'],'puzzleBuildOrder':[p['id']for p in D['puzzles'][:8]],'contentTargets':{'PF1':8,'PF2':24,'PF4':72,'cumulativeNotAdditive':True},'prototypeScreens':{'corePuzzles':39,'placesAndCommon':57,'optionalDepartments':33,'total':129},'economy':{'income':30+15*(4*20+15),'tools':sum(t['price']for t in C['tools']),'decor':sum(t['price']for t in C['decor'])},'allTasksStatus':'planned','actualAndroid':'unverified'}
assert roadmap['economy']==dict(income=1455,tools=690,decor=735)
(W/'puzzle_first_roadmap_v1_1.json').write_text(json.dumps(roadmap,ensure_ascii=False,indent=2),encoding='utf-8')
(W/'stage_atlas_manifest.json').write_text(json.dumps({'version':'1.2','appReferences':9,'redesignedPuzzles':24,'uiuxRegistry':'puzzle_uiux_v1_2.json','items':43,'screens':129,'tasks':len(tasks),'bytes':file.stat().st_size,'originalGameSHA256':hashlib.sha256((R/'공무원키우기_픽셀아트.html').read_bytes()).hexdigest(),'sources':[{ 'file':str(R/'docs'/name),'sha256':hashlib.sha256((R/'docs'/name).read_bytes()).hexdigest()}for name in ['02_MASTER_GAME_DESIGN.md','05_PUZZLE_SYSTEM_AND_8_SPECS.md','07_DEPARTMENT_EXPANSION_PACKS.md','data/planning_contract.json','data/office_original_v1.json']]},ensure_ascii=False,indent=2),encoding='utf-8')
print('Generated: 43 items / 129 staged screens / 39 planned tasks / '+str(file.stat().st_size)+' bytes')
