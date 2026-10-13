from pathlib import Path
from html import escape as E
import json

W=Path(__file__).resolve().parent
DATA=json.loads((W/'puzzle_uiux_v1_2.json').read_text(encoding='utf-8'))
UX={p['id']:p for p in DATA['puzzles']}
REF={r['id']:r for r in DATA['references']}

def pill(text,kind=''):
    return f'<span class="app-pill {kind}">{E(text)}</span>'
def panel(title,content,meta=''):
    return f'<section class="app-panel"><header><b>{E(title)}</b><small>{E(meta)}</small></header>{content}</section>'
def listrow(left,right,kind=''):
    return f'<div class="app-row {kind}"><span>{left}</span><b>{right}</b></div>'
def controls(values,chosen=0):
    return '<div class="app-segment">'+''.join(f'<span class="{"active" if i==chosen else ""}">{E(v)}</span>'for i,v in enumerate(values))+'</div>'
def cards(values):
    return '<div class="app-card-grid">'+''.join(f'<div class="app-doc {"picked" if selected else ""}"><small>{E(tag)}</small><b>{E(title)}</b><span>{E(note)}</span>{pill("✓ 선택" if selected else "미선택","good" if selected else "")}</div>'for tag,title,note,selected in values)+'</div>'

def workflow():
    labels=[('01','받기','입력 4건'),('02','승인만 남기기','미승인 C 제외'),('03','중복 제거','A 중복 1건 제외'),('04','합산','100 + 250'),('05','제출','결과 350')]
    return '<div class="app-workflow">'+''.join(f'<div class="app-node {"picked" if i==2 else ""}"><span class="app-node-icon">{num}</span><div><b>{label}</b><small>{note}</small></div><span class="node-tools">{ "선택" if i==2 else "⋮"}</span></div>'+('<div class="app-connector">↓</div>'if i<4 else '') for i,(num,label,note) in enumerate(labels))+'</div>'+controls(['↑ 위로','↓ 아래로','+ 블록'],2)+panel('실행 결과 예시','<div class="app-output"><small>정산 합계</small><b>350</b>'+pill('2건 합산','good')+'</div>','입력 → 출력')

def board(item,s,old):
    k=item['board']
    if k=='rules':
        content=controls(['모두 충족 AND','둘 중 하나 OR'],1)+listrow('신청 방식','사전 신청 ▾')+listrow('신청 방식','현장 접수 ▾')+'<div class="app-lock">▣ 잠금 · 금액 100 이상 → 과장</div>'
        return panel('접수 규칙',content,'수정 가능')+panel('사례 결과 예시','<div class="app-case-head"><span>사례</span><span>접수</span><span>결재</span></div>'+''.join(f'<div class="app-case"><span>{a}</span><b>{b}</b><span>{c}</span></div>'for a,b,c in [('A 사전','✓ 허용','계장'),('B 현장','✓ 허용','계장'),('C 미접수','보완','—'),('D 현장100','✓ 허용','과장')]),'4건')
    if k=='owner':
        return panel('공개 단서',listrow('01 가온','빨강·초록 아님')+listrow('02 보람','빨강 서류'),'언제든 읽기')+'<div class="app-owner-grid">'+''.join(f'<div class="app-person {"picked" if n=="가온" else ""}"><span class="person-icon">{n[0]}</span><b>{n}</b>{pill(a,"good" if a!="미배정" else "")}</div>'for n,a in [('가온','미배정'),('보람','빨강'),('채림','미배정')])+'</div>'+panel('가온에게 배정할 서류',controls(['빨강 ×','파랑','초록 ×'],1),'단서로 제외 표시')+'<div class="app-inline-note">선택: 가온 → 파랑 · 아직 배정 전</div>'
    if k=='approval':
        return panel('결재할 문서',cards([('선행 01','계장 결재','월 또는 화',True),('후행 02','과장 결재','화 또는 수',False)]),'수요일 마감')+'<div class="app-calendar"><div class="calendar-head">'+''.join(f'<span>{d}</span>'for d in ['월','화','수','목','금'])+'</div><div class="calendar-track"><span class="calendar-event chief">계장</span></div><div class="calendar-dep">↳ 다음 날 이후</div><div class="calendar-track"><span class="calendar-event boss">과장</span></div></div>'+controls(['월요일','화요일'],0)+pill('✓ 월 계장 → 화 과장은 유효 예시','good')
    if k=='brief':
        return panel('원문 자료',cards([('목표 · 2칸','G 목표','필수 사실',True),('기간 · 1칸','P 기간','필수 사실',True),('예산 · 1칸','B 예산','값 보존',False)]),'허용 요약만 사용')+controls(['목표+기간 요약','추가','제거'],0)+'<div class="app-report"><small>생활보장과 · 내부 보고</small><h4>한 장 보고</h4><div class="app-report-block picked"><b>GP 목표 + 기간</b><span>두 사실을 보존하는 허용 요약 · 2칸</span></div><div class="app-report-block"><b>B 예산</b><span>원문 값 그대로 · 1칸</span></div><div class="report-rule"></div><div class="app-meter-line"><b>분량 3 / 4칸</b>'+pill('사실 3 / 3','good')+'</div><div class="app-meter"><i style="width:75%"></i></div></div>'
    if k in ['macro','sequence']:return workflow()
    if k=='compare':
        return '<div class="app-compare"><div class="compare-head"><span>항목</span><b>원본</b><b>제출본</b></div>'+''.join(f'<div class="compare-line {"picked" if a=="금액" else ""}"><span>{a}</span><b>{b}</b><b>{c}</b></div>'for a,b,c in [('대상','사업 A','사업 A'),('기간','1~2월','1~2월'),('금액','100','150'),('인원','3명','3명'),('회신','내부메일','내부메일')])+'</div>'+controls(['동일','오류로 표시'],1)+'<div class="app-inline-note">✓ 선택 항목: 금액 · 오류 1곳 표시</div>'
    if k=='sort':
        return panel('예산 자료',cards([('승인 ✓','v2','최신 승인',True),('미승인','v3','제출 후보 제외',False)]),'1개 선택')+panel('실적 자료',cards([('승인 ✓','v1','최신 승인',True),('미승인','v2','제출 후보 제외',False)]),'1개 선택')
    if k=='memory':
        return '<div class="app-call"><span class="call-icon">☎</span><div><b>가상 자료 회신</b><small>통화 내용 다시 보기 가능</small></div></div><div class="app-notebook"><small>통화 메모 · 초안 유지</small><h4>놓치지 않게, 세 줄.</h4>'+''.join(listrow(a,b)for a,b in [('목적','자료 회신'),('시각','14:00'),('담당','기록 담당')])+'</div>'+controls(['통화 다시 보기','메모 편집'],1)
    if k=='route':
        return panel('가상 접수 티켓','<p class="app-ticket">위험 신호가 있는 요청입니다.</p>'+pill('! 위험 신호','warning'),'요청 #014')+'<div class="app-lock">공개 규칙 · 위험 신호가 있으면 안전 우선</div>'+cards([('우선','가상 안전','위험 대응',True),('일반','가상 기록','자료 요청',False),('일반','가상 예산','정산 요청',False),('일반','가상 안내','청사 안내',False)])
    if k=='budget':
        return panel('배치할 사업',cards([('A · 필수','2개월 × 1단위','회전 금지',True),('B · 필수','1개월 × 1단위','시작 월 선택',False)]),'선택 → 월 → 행')+'<div class="budget-sheet"><div class="budget-months"><span>1월</span><span>2월</span><span>3월</span><span>4월</span></div><div class="budget-grid"><div class="budget-block a">A · 2개월</div><div class="budget-block b">B</div></div><div class="budget-total"><span>1 / 2</span><span>1 / 2</span><span>1 / 2</span><span>0 / 2</span></div></div>'+panel('분기 사용액','<div class="app-meter-line"><b>1분기</b><span>3 / 3단위</span></div><div class="app-meter"><i style="width:100%"></i></div>','참고 유효 배치')
    if k=='conveyor':
        art=old(item,s)
        # Separate palette into a proper selection bar; old SVG preserves sample positions.
        art=art.split('<div class="rule-line">')[0]
        return controls(['배치','실행 기록'],0)+'<div class="app-canvas conveyor-canvas">'+art+'</div>'+panel('부품 선택',controls(['직선','회전','분기','도장'],0),'선택 → 칸 → 방향')+controls(['↑','→','↓','←'],1)+'<div class="app-inline-note">방향: → · 승인 E / 미승인 S</div>'
    art=old(item,s)
    if k in ['archive','archive2']:
        art=art.split('<div class="rule-line">')[0]
        return '<div class="app-canvas warehouse-canvas">'+art+'</div><div class="app-board-legend">'+pill('人 직원')+pill('□ 상자')+pill('◎ 목표')+'</div><div class="app-dpad"><span>↑</span><span>←</span><span>↓</span><span>→</span></div><div class="app-inline-note">방향 버튼 한 번 = 한 칸 · 상자는 밀기만</div>'
    addons={
      'bins':('받을 통 선택',['통 1','통 2','통 3','통 4'],2),
      'pipes':('선택한 관로',['A 관로','B 관로','한 칸 취소'],0),
      'cars':('열린 차량 선택',['A 막힘','B 출차','C 대기'],1),
      'nonogram':('표시 모드',['칠하기','제외 ×','지우기'],0),
      'triple':('처리할 곳',['대기칸','철함','영구 금고'],0),
      'booths':('놓을 부스',['A 부스','B 부스','C 부스'],0),
      'gates':('G2 수문 상태',['열기','닫기'],1),
      'screws':('노출된 나사',['s1 풀기','s2 가림','s3 마지막'],0),
      'hazards':('비상구 항목의 상태',['위험','이상없음'],0)
    }
    title,values,chosen=addons.get(k,('선택 도구',['선택','수정'],0))
    return '<div class="app-canvas">'+art+'</div>'+panel(title,controls(values,chosen),'탭으로 선택')

def frame(item,s,category,old):
    ui=UX[item['id']];kind=['rough','basic','detail'][s]
    title=['01 구조 러프','02 앱형 플레이 UI','03 게임 디테일 UI'][s]
    note=['목표 · 첫 조작 · 정보 순서','선택 · 도구 · 오류 안내','종이 · 도장 · 픽셀 포인트'][s]
    avatar='<span class="app-pixel-seal" aria-hidden="true">公</span>' if s==2 else '<span class="app-symbol" aria-hidden="true">□</span>'
    return f'''<article class="stage-card {kind} app-stage" data-stage="{kind}"><header><b>{title}</b><small>{note}</small></header><div class="mock-screen app-screen"><div class="app-titlebar"><span class="app-back">←</span><div><small>생활보장과 · 퍼즐 연습</small><b>{E(item['name'])}</b></div>{avatar}</div><div class="app-objective"><small>이번 업무</small><b>{E(ui['goal'])}</b><span>{E(item['goal'])}</span></div><div class="app-stepper"><span>① 자료</span><span class="active">② 작업</span><span>③ 확인</span></div><div class="app-first"><span>시작 안내</span>{E(ui['firstAction'])}</div><div class="mock-board app-workarea">{board(item,s,old)}</div><div class="app-current"><span class="status-dot"></span><span>{E(ui['status'])}</span></div><div class="app-bottom"><div class="app-main-actions"><span class="app-undo">↶ 되돌리기</span><span class="app-cta">{E(ui['primary'])} →</span></div><div class="app-secondary"><span>힌트</span><span>처음부터</span><span>확인 후 제출</span></div></div></div><small class="mock-caption">설명용 편집 예시 · 버튼은 그림 · 실행 기능 없음</small><p class="delta"><span>{['정할 것','구현할 것','다듬을 것'][s]}</span>{E(item[kind])}</p></article>'''

def notes(item):
    ui=UX[item['id']]
    links=' · '.join(f'<a href="{REF[r]["url"]}" target="_blank" rel="noopener">{E(REF[r]["name"])}</a>' for r in ui['references'])
    return f'''<div class="ux-reference"><span class="ux-label">앱 참고 · 디자인 제안</span><b>{E(ui['pattern'])}</b><p>{links}</p><small>{E(ui['adaptation'])}</small></div><ol class="ux-flow">{''.join(f'<li><span>{i+1:02d}</span><b>{E(v)}</b></li>'for i,v in enumerate(ui['steps']))}</ol><div class="ux-feedback"><div><b>위반 안내 예시</b><p>{E(ui['error'])}</p></div><div><b>완료 조건</b><p>{E(ui['success'])}</p></div></div>'''

def intro():
    refs=''.join(f'<li><a href="{r["url"]}" target="_blank" rel="noopener">{E(r["name"])}</a><span>{E(r["observed"])}</span></li>' for r in DATA['references'])
    return '''<section id="uiux" class="ux-intro"><p class="eyebrow">V1.2 · APP-INSPIRED PUZZLE WORKSPACES</p><h2>익숙한 작업 방식,<br>풀고 싶어지는 게임 화면.</h2><p>신규8종·기존5종·후속11종, 총24종의 작업 화면을 앱별 패턴으로 다듬었습니다. 아래는 직접 그린 제안 시안이며 실제 퍼즐 플레이와 직관성 사용자 시험은 구현 단계에서 확인합니다.</p><div class="ux-principles"><div><span>01</span><b>첫 조작을 한 문장으로</b><p>해야 할 일 → 선택 → 바뀐 상태를 가까이 둡니다.</p></div><div><span>02</span><b>유형에 맞는 작업면</b><p>조건·일정·문서·흐름·격자를 구분합니다.</p></div><div><span>03</span><b>수정할 곳을 알려주기</b><p>오류 이유와 위치를 보여주고 초안을 유지합니다.</p></div></div><details class="ux-sources"><summary>참고한 실제 앱 9종 · 공식 출처와 적용 원칙</summary><ul>'''+refs+'''</ul><p>2026.10.11 공식 공개 자료를 확인했습니다. 출처는 제품 패턴의 근거이며, 이 게임의 구성·색상·조작 흐름은 별도 디자인 제안입니다. 상세 계약은 PUZZLE_UIUX_V1_2.md에 있습니다.</p></details></section>'''
