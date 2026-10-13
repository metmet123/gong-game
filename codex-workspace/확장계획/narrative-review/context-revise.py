"""Second editorial pass. Baseline is the completed first pass, never upstream."""
import json
from pathlib import Path
from revise import leaves
HERE = Path(__file__).resolve().parent
if (HERE / 'character-expansion/before_data.json').exists():
    raise SystemExit('Character expansion exists. Use expand.py after merging later edits; do not overwrite it with context baseline.')
ROOT = HERE.parent.parent
AUDIT = HERE / 'context-review'
AUDIT.mkdir(exist_ok=True)
src = ROOT / 'docs/narrative/narrative_data.json'
doc = ROOT / 'docs/narrative/narrative_concept.md'
for name, path in [('before_data.json', src), ('before_concept.md', doc)]:
    if not (AUDIT / name).exists():
        (AUDIT / name).write_bytes(path.read_bytes())
data = json.loads((AUDIT / 'before_data.json').read_text(encoding='utf-8'))
old = json.loads(json.dumps(data))
md = (AUDIT / 'before_concept.md').read_text(encoding='utf-8')
def put(path, value):
    node = data
    for part in path[:-1]: node = node[part]
    node[path[-1]] = value
def day(n, headline, rule, body):
    data['days'][str(n)]['news'] = dict(headline=headline, rule=rule, body=body)
day(1,'생활보장과에 새 주무관이 왔어요','결재 라인: 계장 도장을 받은 서류를 결재함으로 보내요.',[
    '모서리구청 생활보장과에 새 주무관이 왔습니다. 동료들과 첫 업무를 시작합니다.',
    '이번 이야기는 분기 마감을 준비하는 15일입니다. 분기 평가는 부서가 해 온 일을 정리해 살피는 과정입니다.'])
day(2,'캐비닛을 피해 결재 경로를 만들어요','결재 라인: 계장·과장 도장을 모두 받아야 해요.',[
    '오늘 결재 퍼즐에는 길을 막는 캐비닛이 있습니다. 빈 칸으로 돌아갈 경로를 만들어 주세요.',
    '어제와 달리 두 도장이 필요합니다. 자료 취합에서는 최신 승인본도 골라봅니다.'])
put(('days','2','talk','line'),'오늘 결재는 도장이 두 개 필요해요. 경로를 만들 때 둘 다 챙겨요.')
put(('days','2','morning',2,'line'),'오늘 결재 퍼즐에는 캐비닛이 있어요. 빈 칸으로 돌아가면 돼요.')
day(3,'원본과 사본, 목적함을 확인해요','오늘 결재 라인: 원본은 기록관, 사본은 신청인에게 보내요.',[
    '오늘 결재 퍼즐은 원본과 사본을 각각 다른 함으로 보내는 업무입니다.',
    '차지오 님도 신청 진행 상황을 물으러 오십니다. 문의 내용에 맞는 담당부서를 안내해 주세요.'])
day(4,'금액에 따라 결재를 나눠요','결재 라인: 100만 원 미만은 계장, 이상은 계장·과장 결재예요.',[
    '오늘 결재 퍼즐은 금액에 따라 필요한 도장이 달라집니다. 100만 원도 과장 결재 대상입니다.',
    '조사 자료 대조는 백단비 주무관과 함께합니다. 파일의 버전을 확인해 주세요.'])
day(5,'두 창구의 서류를 한곳으로 모아요','결재 라인: 두 접수함의 서류를 모아 하나뿐인 계장 도장을 거쳐요.',[
    '오늘 결재 퍼즐에는 접수함이 두 곳 있습니다. 양쪽에서 들어오는 서류를 모두 처리해야 합니다.',
    '계장 도장은 하나만 놓을 수 있습니다. 두 경로를 합친 뒤 도장을 받도록 만들어 주세요.'])
put(('days','5','talk','line'),'두 창구의 서류를 모아서 하나뿐인 도장을 받게 해 봐요.')
day(6,'월요일, 배운 결재 규칙을 함께 써 봐요','오늘 종합 결재: 사본은 기록관, 원본은 금액에 맞는 결재함으로 보내요.',[
    '첫 주에 배운 도장·복사·금액 분기를 한 결재 퍼즐에서 함께 사용합니다.',
    '이번에는 3일차와 목적함이 다릅니다. 원본은 금액별 결재함으로, 사본은 기록관으로 보냅니다.'])
day(7,'바뀐 규정을 안내문에 반영해요','규정 개정: 잠긴 규칙과 사례별 기대 결과를 보고 문장 카드를 바꿔요.',[
    '결재 일정이나 접수 조건 등 업무 기준이 바뀌었습니다. 바꿀 내용은 업무 화면의 사례에 나옵니다.',
    '난이도와 문제마다 개정 내용이 다릅니다. 모든 사례가 새 기준에 맞도록 문장 카드를 수정해 주세요.'])
put(('days','7','morning',0,'line'),'오늘은 바뀐 업무 기준에 맞춰 규정 문장을 고치는 일이에요.')
day(8,'정산 자동화 시험과 첫 부서 협조','정산 매크로: 처리 블록을 조립하고 공개·추가 시험을 모두 통과해요.',[
    '정산 매크로는 반복 계산을 자동으로 처리하는 작업 순서입니다. 도재훈과 여러 입력으로 시험합니다.',
    '오늘부터 임하루 주무관이 다른 부서의 선택 업무를 전합니다. 첫 요청은 자원순환과의 재활용품 선별입니다.'])
day(9,'이름이 빠진 서류의 주인을 찾아요','서류 주인 찾기: 잉크 색·접수 시간 등 공개된 단서를 함께 확인해요.',[
    '접수함에 이름이 빠진 서류가 있습니다. 단서를 대조해 각 서류가 누구 것인지 확인합니다.',
    '오늘의 선택 협조는 상하수도사업소의 배관 연결 도면입니다. 임하루에게 요청을 확인할 수 있습니다.'])
day(10,'민서윤 계장과 결재 일정을 짜요','결재 일정: 출장·휴가·마감일과 도장 순서를 함께 지켜요.',[
    '조사관리계에 부임한 민서윤 계장과 결재 일정을 정합니다. 담당자가 자리를 비우는 날을 확인해 주세요.',
    '오늘의 선택 협조는 교통행정과의 견인 순서 정리입니다. 요청은 임하루가 전달합니다.'])
day(11,'오가람 계장과 사업 예산을 배치해요','예산 배치: 시작 가능한 달과 월·분기별 한도를 함께 지켜요.',[
    '장애인복지계 오가람 계장과 상반기 사업 예산표를 정리합니다. 사업마다 시작할 수 있는 달이 다릅니다.',
    '예산표의 월·분기는 사업 계획의 기간입니다. 출근 일차와는 별개이며, 오늘의 선택 협조는 토지정보과 도면 복원입니다.'])
day(12,'사업 보고서를 한 장으로 정리해요','한 장 보고: 문제에서 지정한 필수 내용은 남기고 문장을 합쳐요.',[
    '정윤서 과장이 사업 보고서를 한 장으로 정리해 달라고 요청했습니다. 업무 화면에서 꼭 남길 내용을 확인해 주세요.',
    '이 보고서는 분기 마감 준비에도 쓰입니다. 오늘의 선택 협조는 재난안전과의 구호물자 창고 정리입니다.'])
put(('days','12','morning',1,'line'),'이번 사업 내용을 한 장으로 정리하면 될까요?')
put(('days','12','morning',2,'line'),'네. 업무 화면에서 꼭 남길 내용을 확인하고 정리해 주세요.')
day(13,'부서 협조 결과도 함께 정리해요','협조 업무: 요청 내용을 확인하고 결과 보고와 회신 자료를 정리해요.',[
    '8일차부터 받던 부서 협조 요청에 이어, 오늘은 협조 공문과 결과 자료를 정리합니다.',
    '요청을 전하던 임하루 주무관과 정식 인사를 나눕니다. 오늘의 선택 협조는 정보화팀의 정산 매크로 점검입니다.'])
day(14,'분기 마감 자료를 정리해요','마감 준비: 결재 일정·예산·매크로·서류를 각각 확인해요.',[
    '분기 마감을 앞두고 결재 일정과 예산, 자동화 결과, 서류를 점검합니다.',
    '오늘의 선택 협조는 기록관리팀의 기록물 묶기입니다. 내일 평가 소식을 듣기 전에 자료를 정리합니다.'])
day(15,'생활보장과, 분기 평가 우수','마지막 업무: 결과 보고·규정 정리·자동화 인계·민원 안내를 마쳐요.',[
    '전날까지 제출한 부서 자료로 생활보장과가 우수 평가를 받았습니다. 이제 남은 업무를 정리할 차례입니다.',
    '오늘 필수 업무를 마치고 퇴근하면 이번 이야기가 끝납니다. 문화관광과의 축제 부스 배치는 선택 협조입니다.'])
events = [
 ('생활보장과 첫 출근','동료들과 첫 업무를 시작하는 날. 분기 마감을 준비하는 15일 이야기가 시작된다.'),
 ('캐비닛을 돌아가는 결재','결재 퍼즐에서 캐비닛을 피해 길을 만들고 계장·과장 도장을 모두 받는 것이 오늘의 과제다.'),
 ('원본과 사본 나누기','오늘 결재는 원본을 기록관으로, 사본을 신청인에게 보내는 과제다.'),
 ('금액별 결재와 새 동료','금액에 맞는 결재 경로를 만들고, 백단비와 조사 자료를 대조하는 날.'),
 ('두 접수함, 하나의 도장','두 접수함에서 들어오는 서류를 모아 하나뿐인 계장 도장을 받게 하는 과제다.'),
 ('첫 주 결재 종합 연습','도장·복사·금액 분기를 함께 쓰는 날. 오늘은 사본이 기록관으로 가므로 목적함을 다시 확인해야 한다.'),
 ('안내문 개정','업무 화면에 제시된 변경 기준에 맞춰 규정 문장 카드를 고치는 날.'),
 ('정산 시험과 첫 협조 요청','정산 매크로 시험이 시작된다. 임하루가 자원순환과의 첫 선택 협조를 전한다.'),
 ('이름이 빠진 서류','단서를 대조해 서류의 주인을 찾는 날. 상하수도사업소의 도면 작업은 선택 협조다.'),
 ('민서윤 계장의 부임','새 계장과 인사를 나누고 결재 일정을 정하는 날. 교통행정과의 협조 요청도 도착한다.'),
 ('오가람 계장과 예산 계획','새 계장과 사업을 월별 예산표에 배치하는 날. 표의 기간은 출근 일차와 별개다.'),
 ('한 장 사업 보고서','필수 내용은 남기고 사업 보고서를 한 장으로 줄이는 과제다. 보고서는 마감 준비에도 쓰인다.'),
 ('임하루와 정식 인사','8일차부터 요청을 전하던 임하루와 정식으로 인사하는 날. 협조 결과와 회신 자료도 정리한다.'),
 ('마감 전 점검','평가에 앞서 결재 일정·예산·자동화·서류를 점검하는 날. 기록물 묶기는 선택 협조다.'),
 ('평가 소식과 마지막 업무','전날 제출 자료의 우수 평가 소식을 듣는 날. 오늘 필수 업무와 퇴근까지 마치면 이야기가 끝난다.')]
for i,(name,summary) in enumerate(events,1):
    data['dex']['events'][str(i)] = dict(name=name,summary=summary)
decor = {
 'plant':'모니터 옆에 놓는 작은 화분. 새 잎을 보는 재미가 있다.',
 'mug':'차나 커피를 담아 책상에 두는 머그컵.',
 'coaster':'머그컵 밑에 놓아 책상에 물 자국이 남지 않게 하는 받침.',
 'poster':'책상 뒤 칸막이에 붙이는 포스터.',
 'stamp':'결재 도장의 손잡이를 꾸미는 소품.',
 'photo':'가족사진을 넣어 모니터 옆에 두는 액자.',
 'cactus':'키보드 옆에 놓는 작은 선인장.',
 'fan':'더운 날 책상에서 바람을 쐴 수 있는 미니 선풍기.',
 'cushion':'의자 위에 놓아 오래 앉을 때 쓰는 방석.',
 'badge':'책상 앞에 이름을 표시하는 명패.',
 'trophy':'12일차부터 구매할 수 있는 장식용 트로피.',
 'traffic_token':'교통행정과 우호도 3단계 기념품. 잠깐 쉬어 가자는 문구가 적힌 표지패.',
 'it_token':'정보화팀 우호도 3단계 기념품. 쉬는 시간을 떠올리게 하는 쉼표 모양 키캡.',
 'records_token':'기록관리팀 우호도 3단계 기념품. 동료의 쪽지와 인사말을 보관하는 작은 상자.',
 'parks_token':'공원녹지과 우호도 3단계 기념품. 점심시간 산책을 권하는 문구가 적힌 표지패.'}
for key,v in decor.items(): put(('decor',key,'dex'),v)
for dep in data['departments']:
    if dep+'_token' in decor: data['departments'][dep]['keepsake']['desc']=decor[dep+'_token']
    # Three distinct completions can happen in practice on one day, not necessarily across a quarter.
put(('departments','recycling','friend','3'),'여러 작업을 함께 도와줘서 고맙다고 전해 달래요.')
put(('departments','records','friend','2'),'다시 함께 자료를 정리하게 되어 반갑다는 답장이 왔어요.')
put(('departments','it','friend','2'),'다음 작업도 함께 살펴보고 싶대요.')
task_intro = {
 'recycling':'재활용품을 나눠 선별장 작업 목표를 맞춘다.',
 'waterworks':'배관 조각을 이어 물이 목적지에 닿도록 연결한다.',
 'traffic':'차량이 서로 막히지 않게 견인 순서를 정한다.',
 'land':'도면 조각을 맞춰 지적도를 복원한다.',
 'disaster':'구호물자를 창고의 지정 위치로 옮긴다.',
 'it':'정산 처리 블록을 조립해 입력별 결과를 확인한다.',
 'records':'서류를 분류하고 정해진 기준에 맞게 묶는다.',
 'culture':'축제 공간의 조건에 맞게 부스를 배치한다.'}
for key,v in task_intro.items(): put(('dex','tasks',key,'intro'),v)
for ach in data['achievements']:
    if ach['id']=='hundred':
        ach.update(name='첫 정산 매크로',desc='정산 매크로 업무 한 건을 마쳤다.')
    if ach['id']=='week1':
        ach.update(name='첫 여섯 날 완주',desc='생활보장과의 6일차 필수 업무까지 마쳤다.')
    if ach['id']=='decor18':
        ach['desc']='구매 가능한 소품 열여덟 개를 모두 모았다.'
        ach['condition']='기념 소품을 제외한 구매 소품 18개를 모두 보유.'
put(('nextQuarter','day1News','rule'),'첫날 업무를 중 난이도부터 다시 시작해요. 보유 도구·소품·관계는 이어집니다.')
put(('nextQuarter','day1News','body',1),'같은 15일 업무를 다시 진행합니다. 지난 분기의 도구·소품·관계는 이어지고 업무 보상 포인트는 절반입니다.')
put(('nextQuarter','lines',1,'line'),'이번에도 간식 먹는 시간은 챙기기로 해요.')
put(('nextQuarter','lines',5,'line'),'이번 분기에도 점심시간에 산책해요.')
put(('nextQuarter','lines',6,'line'),'이번에도 차 한잔하면서 이야기 나눕시다.')
put(('nextQuarter','lines',8,'line'),'부서 협조는 8일차부터 다시 전해 드릴게요. 이번에도 잘 부탁해요.')
for key in ['rules','brief']:
    result={'rules':'어제 고친 안내문을 오늘 업무에 참고할 수 있어요.',
            'brief':'어제 한 장으로 정리한 보고서가 오늘 마감 준비 자료에 포함됐어요.'}[key]
    data['results'][key]={'good':result,'assisted':result+' 해법을 참고해 마쳤어요.'}
changes=[]
before_leaves=dict(leaves(old))
for p,v in leaves(data):
    if before_leaves[p]!=v: changes.append({'path':list(p),'before':before_leaves[p],'after':v})
# Replace longer strings first; duplicate strings share one revised meaning.
pairs={c['before']:c['after'] for c in changes}
assert all(pairs[c['before']]==c['after'] for c in changes)
for a,b in sorted(pairs.items(),key=lambda x:len(x[0]),reverse=True):
    assert a in md, a
    if a=='네. 이 잔으로 새 차도 마셔 봐야죠.':
        head,tail=md.rsplit(a,1)
        md=head+b+tail
    else:
        md=md.replace(a,b)
src.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
doc.write_text(md,encoding='utf-8')
(AUDIT/'changes.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Maintain cumulative first-baseline validation, preserving the first pass evidence.
if not (AUDIT/'language-changes.json').exists():
    (AUDIT/'language-changes.json').write_bytes((HERE/'changes.json').read_bytes())
baseline=dict(leaves(json.loads((HERE/'before_data.json').read_text(encoding='utf-8'))))
cumulative=[{'path':list(p),'before':baseline[p],'after':v} for p,v in leaves(data) if baseline[p]!=v]
(HERE/'changes.json').write_text(json.dumps(cumulative,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
patches=[
 ('Object.assign(NPCS[k],{profile:c.profile,wrong:c.wrong,win:c.win,ask:c.ask});','Object.assign(NPCS[k],{quote:c.profile.habit,profile:c.profile,wrong:c.wrong,win:c.win,ask:c.ask});'),
 ('D.news={...D.news,headline:n.news.headline,body:n.news.body};','D.news={...D.news,headline:n.news.headline,rule:n.news.rule,body:n.news.body};'),
 ("rule:'지난 분기에 배운 규칙은 그대로',body:N.nextQuarter.day1News.body","rule:N.nextQuarter.day1News.rule,body:N.nextQuarter.day1News.body"),
 ('오늘부터 바뀐 규칙','오늘의 업무 안내'),
 ('한 주 진행 · 보상 장부','업무 기록 · 도감'),
 ('생활보장과 · 첫 주 프로토타입','생활보장과 · 15일 업무 체험'),
 ('<br>실제 업무: ','<br>관련 업무: '),
 ('100만 원 넘는 건 과장님까지.','100만 원 이상은 과장님까지 결재를 받아요.'),
 ('모든 서류는 계장 도장 → 사본은 기록관 → 원본은 금액에 따라 계장 전결 또는 과장 결재로.','이번 종합 결재는 계장 도장 → 복사 → 사본은 기록관, 원본은 금액별 결재함으로 보내요. 3일차와 목적함이 달라요.'),
 ('분기기는 기준을 넘는 서류를 오른쪽으로 꺾어요.','분기기는 기준 이상인 서류를 오른쪽으로 꺾어요.'),
 ("'민원 예보: 월요일이라 붐빔'","'민원 예보: 출근 직후 붐빔'"),
 ('업무 도구 열 개를 모두 갖췄다.','업무 도구 열 개를 모두 갖췄다.')]
patches=[dict(before=a,after=b) for a,b in patches if a!=b]
html=(HERE/'upstream/index.html').read_text(encoding='utf-8')
a=html.index('const Narrative=')+len('const Narrative=')
_,n=json.JSONDecoder().raw_decode(html[a:])
html=html[:a]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+html[a+n:]
for p in patches:
    p['count'] = 2 if p['before']=='한 주 진행 · 보상 장부' else 1
    assert html.count(p['before'])==p['count'],(p['before'],html.count(p['before']))
    html=html.replace(p['before'],p['after'])
(AUDIT/'html-patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(HERE/'candidate/index.html').write_text(html,encoding='utf-8')
print(json.dumps({'contextChangedFields':len(changes),'cumulativeChangedFields':len(cumulative),'htmlPatches':len(patches)},ensure_ascii=False))
