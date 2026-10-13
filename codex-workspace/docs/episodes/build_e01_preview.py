"""Build a standalone planning reader and verify E01 arithmetic. No game files touched."""
from pathlib import Path
import html
import itertools
import json
import re

# Keep the old v0.1 generator available only for its original design contract.
# The current reader uses the revised design and independently authored mockup.
if json.loads((Path(__file__).resolve().parent / 'E01_contract.json').read_text(encoding='utf-8'))['version'] >= 2:
    import runpy
    runpy.run_path(str(Path(__file__).resolve().parent / 'build_e01_v2.py'), run_name='__main__')
    raise SystemExit(0)

ROOT = Path(__file__).resolve().parent
contract = json.loads((ROOT / 'E01_contract.json').read_text(encoding='utf-8'))
source = ROOT / 'E01_홍보물200부_상세기획.md'
md = source.read_text(encoding='utf-8')

def inline(value):
    value = html.escape(value)
    value = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', value)
    value = re.sub(r'`([^`]+)`', r'<code>\1</code>', value)
    return value

def render_markdown(text):
    lines = text.splitlines()
    output, i, heading_index = [], 0, 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith('```'):
            i += 1
            block = []
            while i < len(lines) and not lines[i].startswith('```'):
                block.append(lines[i]); i += 1
            output.append('<pre>' + html.escape('\n'.join(block)) + '</pre>')
            i += 1
            continue
        match = re.match(r'^(#{1,3}) (.+)', line)
        if match:
            level = len(match[1])
            if level == 1:
                i += 1; continue
            heading_index += 1
            output.append(f'<h{level} id="spec-{heading_index}">{inline(match[2])}</h{level}>')
            i += 1; continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [cell.strip() for cell in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', cell) for cell in cells):
                    rows.append(cells)
                i += 1
            output.append('<div class="table-wrap"><table>')
            for n, cells in enumerate(rows):
                tag = 'th' if n == 0 else 'td'
                output.append('<tr>' + ''.join(f'<{tag}>{inline(cell)}</{tag}>' for cell in cells) + '</tr>')
            output.append('</table></div>')
            continue
        if line.startswith('- '):
            output.append('<ul>')
            while i < len(lines) and lines[i].startswith('- '):
                output.append('<li>' + inline(lines[i][2:]) + '</li>'); i += 1
            output.append('</ul>'); continue
        paragraph = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||- |```)', lines[i]):
            paragraph.append(lines[i]); i += 1
        output.append('<p>' + inline(' '.join(paragraph)) + '</p>')
    return '\n'.join(output)

def card(title, detail, label='', cls=''):
    return f'<div class="card {cls}"><span class="small">{label}</span><b>{title}</b><span>{detail}</span></div>'

def tag(text, cls=''):
    return f'<span class="tag {cls}">{text}</span>'

def row(label, value, cls=''):
    return f'<div class="row {cls}"><span>{label}</span><b>{value}</b></div>'

def button(text, primary=False):
    return f'<button type="button" class="sample-button {"primary" if primary else ""}" disabled>{text}</button>'

screens = [
    {
        'goal': '200부 제작을 유지하며 26칩 안에 사업을 고르세요.',
        'body': '<div class="statgrid"><div><small>전체 예산</small><b>26칩</b></div><div><small>확정 전 예비</small><b>2칩</b></div></div>'
                + '<div class="notice">견적이 바뀌었어요<br><b>제작 20칩 → 22칩</b></div>'
                + card('홍보물 제작 200부', '예산 칩 ●●●●●●●●●● × 2 + ●●', '필수 · 22칩', 'selected')
                + card('안내 거치대', '완료 후 창구에 거치대가 남아요.', '선택됨 · 2칩', 'selected')
                + card('분점 배송', '배송원과 운송장으로 물품을 추적해요.', '선택 가능 · 3칩')
                + card('사전 교정', '최신본과 옛 안내를 나란히 확인해요.', '선택 가능 · 4칩')
                + row('배정 24칩 + 예비 2칩', '26 / 26'),
        'note': '카드 선택 → 칩 추가 또는 회수. 제작22칩과 선택사업 비용이 충족되면 사업 확정.',
        'footer': '편성 확인하기'
    },
    {
        'goal': '자료를 공문에 연결해 제작계획을 완성하세요.',
        'body': '<div class="tabs">자료 <b>공문</b> 서류철</div><div class="paper"><div class="letterhead">모서리구청 생활보장과</div>'
                + row('수신', '내부결재') + '<h4>생활보장과 이용 안내<br>홍보물 제작계획</h4>'
                + '<p>1. 이용 안내와 배부 정보를 제공합니다.</p><p>2. <span class="slot">200부</span> <span class="slot">A5 양면</span> <span class="slot">안내문 v2</span></p>'
                + '<p>3. 창구80 · A분점60 · B분점60</p><p>4. 안내 거치대 설치</p>'
                + '<div class="calculation">200부 × <span class="slot error">1,000원</span><small>견적 v1과 연결되어 있어요</small></div>'
                + '<div class="red-note">단가를 견적 v2의 1,100원으로 바꾸세요.</div>'
                + '<div class="attachments">붙임 📎 견적 v2 · 견본 v2 · 배부계획 · 거치대 자료</div>'
                + '<div class="stamps"><span>담당</span><span>협조</span><span>계장</span><span>과장</span></div></div>'
                + card('선택한 자료 · 견적 v2', '단가 1,100원 / 제작비 220,000원', '자료 → 산출 칸 연결', 'selected'),
        'note': '문구와 숫자의 출처를 문서에 끼운다. 금액·옵션·붙임 버전 불일치에 해당 위치 메모.',
        'footer': '공문 확인하기'
    },
    {
        'goal': '서류철의 준비 조건을 채워 결재받으세요.',
        'body': '<div class="progress-tags">' + tag('담당 확인 ✓', 'good') + tag('협조 ✓', 'good') + tag('출력 필요', 'warn') + '</div>'
                + '<div class="office"><div class="desk player">내 자리<br>▤ 서류철</div><div class="desk">나소라<br>협조 확인 ✓</div><div class="desk chief">권한솔<br>회의 중</div><div class="desk">정윤서<br>계장 확인 뒤</div><div class="desk printer">프린터<br>출력물 6장</div><div class="desk">기록 책장</div></div>'
                + '<div class="notice">협조와 출력이 끝나면 계장이 돌아와요.</div>'
                + '<div class="paper"><span class="small">출력함 · 선택한 종이</span><h4>홍보물 제작 견적 v2</h4><p>200부 × 1,100원 = 220,000원</p>' + button('서류철에 넣기') + '</div>'
                + row('놓친 종이', '출력함에서 다시 보기'),
        'note': '협조와 출력 순서는 자유. 준비 완료 → 계장 → 과장. 빠른 선택은 완료 조건이 아니다.',
        'footer': '서류철 조건 확인'
    },
    {
        'goal': '정상 안내문 200부를 확보하세요.',
        'body': '<div class="statgrid"><div><small>정상</small><b>160부</b></div><div><small>보완 필요</small><b>40부</b></div></div>'
                + card('발주 기준', 'A5 양면 · 안내문 v2 · 09:00~18:00', '규격 견본')
                + '<div class="boxes"><div>상자 1<br><b>50 정상</b></div><div>상자 2<br><b>50 정상</b></div><div>상자 3<br><b>50 정상</b></div><div class="bad">상자 4<br><b>10 정상 / 40 보완</b></div></div>'
                + '<div class="paper"><h4>선택한 묶음 · 40부</h4><p>운영시간 <span class="error">09:00~17:00</span></p><div class="red-note">지난 안내 내용이 인쇄되어 있어요.</div></div>'
                + card('보완 요청', '구버전40부 반품 → 정상40부 재인쇄', '추가 제작비 0원', 'selected'),
        'note': '상자를 열고 묶음을 분류. 반품40 + 보완40 후 정상200을 확인. 도착200과 정상200 구분.',
        'footer': '검수 내용 확인'
    },
    {
        'goal': '완료된 계약의 증빙을 연결해 지급하세요.',
        'body': '<div class="statgrid"><div><small>확정 사업비</small><b>24만 원</b></div><div><small>지급 후 잔액</small><b>2만 원</b></div></div>'
                + card('홍보물 제작', '220,000원 · PAY-E01-PRINT', '아직 미지급', 'selected')
                + '<div class="evidence-chain">계약 PRINT-E01<br>↓<br>청구 v2 · 220,000원<br>↓<br>검수 정상200부 · 보완 완료<br>↓<br>현재 기안 결재 완료</div>'
                + card('안내 거치대', '20,000원 · 설치 준비 확인', '별도 지급줄')
                + '<div class="notice">이번 지급 240,000원<br>확인만으로 돈이 지급되지는 않아요.</div>',
        'note': '지급줄마다 계약·청구·완료증빙 연결. 배송비는 B분점 인계 뒤 지급. 거래번호별 지급1회.',
        'footer': '지급 조건 확인'
    },
    {
        'goal': 'B분점에 전달되지 않은 40부를 찾아 보내세요.',
        'body': '<div class="dialogue"><b>연미루</b><p>“B분점은 20부만 받았대요. 기록은 60부인데요.”</p></div>'
                + '<div class="tabs">사건 <b>배부 지도</b> 자료</div>'
                + '<div class="routeboard"><div>창구<br><b>80 / 80</b></div><div>A분점<br><b>60 / 60</b></div><div class="holding">2층 공용 보관실<br><b>B-02 · 40부</b></div><div class="missing">B분점<br><b>20 / 60</b></div></div>'
                + '<div class="route-arrow">B-02 · 40부 ──────→ B분점</div>'
                + card('운반 담당자', '주인공 또는 가용 동료를 선택하세요.', '사람 배치')
                + card('현재 증거', '수령20 + 계획60 + 중간 인계40', '중간 인수를 최종 수령으로 잘못 집계'),
        'note': '인계표로 행방을 입증 → 담당자와 목적지 배치 → 실제40부 인계 → 수령증 → 회신.',
        'footer': '해결안 확인하기'
    },
    {
        'goal': '집계에 두 번 반영된 22만 원의 근거를 찾으세요.',
        'body': '<div class="statgrid"><div><small>집계표 총액</small><b class="error">46만 원</b></div><div><small>실제 지급</small><b>24만 원</b></div></div>'
                + '<div class="caseboard">' + card('집계 R1', 'PAY-E01-PRINT · 220,000원', '수동 입력', 'selected')
                + '<div class="link-label">동일 거래 여부를 근거로 확인</div>'
                + card('집계 R2', 'PAY-E01-PRINT · 220,000원', '가져온 행', 'selected')
                + card('지급확인증 P1', '같은 거래 · 실제 지급 1회 · 220,000원', '증거') + '</div>'
                + '<div class="notice">주장: 중복 집계<br>수정: R1 또는 R2 하나만 집계 제외</div>'
                + '<div class="paper">' + row('정정 총집행', '240,000원') + row('집행잔액', '20,000원') + '<small>실제 지급취소가 아닌 집계 정정입니다.</small></div>',
        'note': '같은금액만으로 중복 판정불가. 동일거래 증명 → 한행제외 → 보고 금액 연결 → 결산결재.',
        'footer': '조사 결과 확인'
    },
    {
        'goal': '사업이 끝난 흔적과 인물의 회신을 확인하세요.',
        'body': '<div class="complete-seal">완료<br><small>200부 전달</small></div>'
                + '<div class="notice">제작비 220,000원 + 거치대 20,000원<br>잔액 20,000원 · 민원 해결 · 결산 확인</div>'
                + '<div class="noticeboard"><div class="poster"><small>생활보장과</small><b>이용 안내</b><span>09:00~18:00</span><span>홍보물 v2</span></div><div class="stand">▤<br>안내 거치대</div></div>'
                + '<div class="dialogue"><b>백단비</b><p>“22만 원은 사라진 게 아니라 두 번 적힌 거였네요.”</p></div>'
                + card('문서 도감에 보관', '제작계획 · 검수기록 · 민원회신 · 결산보고', '완료 기록'),
        'note': '공통 게시판과 선택한 사업의 흔적만 반영. 캠페인XP/P와 별도인 체험 완료 기록.',
        'footer': '사건 기록 보기'
    }
]

def verify():
    c = contract
    assert c['quantity'] * c['initialUnitPrice'] == 200000
    assert c['quantity'] * c['finalUnitPrice'] == 220000
    assert c['budget'] // c['chipValue'] == 26
    paths = []
    initial_count = 0
    for count in range(4):
        for options in itertools.combinations(c['options'], count):
            option_cost = sum(o['cost'] for o in options)
            if 200000 + option_cost <= c['budget']:
                initial_count += 1
            spend = 220000 + option_cost
            if spend <= c['budget']:
                paths.append({'options': [o['id'] for o in options], 'spend': spend, 'remaining': c['budget'] - spend})
    assert len(paths) == 4
    assert initial_count == 6
    assert [p['remaining'] for p in paths] == [40000, 20000, 10000, 0]
    assert 220000 + 20000 + 30000 > c['budget']
    inspect = c['inspection']
    assert inspect['initialGood'] + inspect['initialBad'] == inspect['initialReceived']
    assert inspect['initialReceived'] + inspect['replacementGood'] - inspect['returned'] == c['quantity']
    assert inspect['initialGood'] + inspect['replacementGood'] == c['quantity']
    assert inspect['replacementCost'] == 0
    d = c['distribution']
    assert sum(d['initial'].values()) == sum(d['final'].values()) == c['quantity']
    assert sum(d['targets'].values()) == c['quantity']
    assert d['initial']['branchB'] + d['transferQuantity'] == d['targets']['branchB']
    assert d['initial']['holding'] - d['transferQuantity'] == d['final']['holding']
    assert len({r['paymentRef'] for r in c['settlementRows']}) == 1
    assert sum(r['amount'] for r in c['settlementRows']) - 220000 == 220000
    for excluded in ['R1', 'R2']:
        assert sum(r['amount'] for r in c['settlementRows'] if r['id'] != excluded) == 220000
    assert sum(s['minutes'][0] for s in c['stages']) == 17
    assert sum(s['minutes'][1] for s in c['stages']) == 24
    assert len(screens) == len(c['stages']) == 8
    assert len(c['issues']) == 4
    assert not re.search(r'[\u4e00-\u9fff]', md)
    assert not re.search(r'[\u4e00-\u9fff]', json.dumps(c, ensure_ascii=False))
    return {'scope': 'design_arithmetic_and_preview', 'runtimeTested': False,
            'validFinalPaths': paths, 'validInitialCombinationCount': initial_count,
            'minutes': [17,24], 'screenCount': 8,
            'checks': ['budget_options', 'price_revision', 'inspection_inventory', 'distribution_inventory',
                       'duplicate_projection', 'alternative_exclusion', 'duration', 'screen_count', 'text_characters']}

STYLE = '''
:root{--ink:#273b31;--green:#42614d;--paper:#fffef7;--bg:#f1efe6;--line:#d4d9cc;--muted:#657268;--red:#9d392a}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 "Malgun Gothic",system-ui,sans-serif}button,a{font:inherit}header{background:#253b2c;color:#fff;padding:42px max(24px,calc((100vw - 1180px)/2)) 32px}header .eyebrow{font-size:12px;letter-spacing:2px;color:#c5d8b5}h1{font-size:clamp(26px,4vw,40px);line-height:1.35;margin:10px 0 16px}header p{max-width:800px;color:#e1e8da;margin:0}.hero-meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.hero-meta span{background:#ffffff12;border:1px solid #ffffff24;border-radius:8px;padding:6px 12px;font-size:14px}nav{position:sticky;top:0;background:#faf9f2f5;backdrop-filter:blur(10px);border-bottom:1px solid var(--line);z-index:3;padding:12px 20px;display:flex;gap:8px;overflow:auto}nav a{white-space:nowrap;text-decoration:none;color:var(--ink);border:1px solid var(--line);padding:7px 12px;border-radius:7px;font-size:14px}nav a:hover,nav a:focus{background:#e2e9dc}main{max-width:1180px;margin:0 auto;padding:32px 24px 64px}.intro{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px}.intro>div{padding:22px;background:var(--paper);border:1px solid var(--line);border-radius:12px}.intro h2{margin:0 0 12px;font-size:20px}.intro p{margin:0}section.scene{scroll-margin-top:90px;display:grid;grid-template-columns:minmax(300px,390px) minmax(0,1fr);gap:40px;margin-bottom:64px;align-items:start}.scene-info{padding-top:20px}.scene-info .num{color:var(--green);font-weight:700;letter-spacing:2px;font-size:12px}.scene-info h2{margin:7px 0 18px;font-size:28px}.scene-info h3{font-size:16px;margin:24px 0 8px}.scene-info p{margin:0 0 14px}.rulebox{padding:18px 20px;border-left:4px solid var(--green);background:#e8ecdf;border-radius:0 8px 8px 0}.phone{border:2px solid #a6b29f;border-radius:20px;background:#eee9d9;overflow:hidden;box-shadow:0 12px 30px #26372613}.phone-head{background:var(--green);color:#fff;padding:14px 18px;display:flex;justify-content:space-between;font-size:14px}.screen-heading{padding:16px 18px 12px;background:#faf8ed}.screen-heading small{font-size:11px;color:var(--muted)}.screen-heading h3{margin:3px 0 8px;font-size:20px}.screen-heading p{margin:0;font-size:14px}.phone-body{padding:14px 16px}.phone .card{display:flex;flex-direction:column;gap:3px;background:#fffef9;border:1px solid #c6cebd;padding:12px 14px;border-radius:8px;margin-bottom:10px;font-size:14px}.card b{font-size:16px}.card.selected{border:2px solid var(--green);background:#f6faef}.small{font-size:11px;color:var(--muted)}.row{display:flex;gap:10px;justify-content:space-between;font-size:13px;border-bottom:1px solid #d9ddcf;padding:9px 0}.row b{text-align:right}.statgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}.statgrid>div{border-radius:8px;background:#dfe8d6;padding:12px;display:flex;flex-direction:column}.statgrid small{font-size:12px}.statgrid b{font-size:24px}.notice{background:#f8eed6;border:1px solid #dacaa3;border-radius:8px;padding:12px 14px;font-size:14px;margin-bottom:14px}.phone-footer{padding:12px 16px 16px;background:#faf8ef;border-top:1px solid #d0d5c6}.aux{display:flex;gap:8px;margin-bottom:8px}.sample-button{min-height:44px;display:inline-block;padding:9px 13px;border:1px solid #c3caba;border-radius:7px;background:#f6f7ee;color:var(--ink);font-size:13px;opacity:1}.sample-button.primary{display:block;width:100%;background:var(--green);border-color:var(--green);color:white;font-size:15px}.sample-button:disabled{cursor:default;opacity:1}.tabs{display:flex;justify-content:space-around;margin-bottom:14px;border-bottom:1px solid #b9c4b0;font-size:14px;padding-bottom:8px}.tabs b{color:var(--green)}.paper{background:var(--paper);padding:18px 16px;box-shadow:2px 4px 0 #a39d8530;border:1px solid #d4c9ae;margin-bottom:14px;font-size:13px}.paper h4{font-size:17px;margin:14px 0}.paper p{margin:12px 0}.letterhead{text-align:center;font-weight:700;font-size:15px;letter-spacing:1px;padding-bottom:12px;border-bottom:2px solid #6a7566}.slot{display:inline-block;background:#e4eddc;border:1px dashed var(--green);padding:2px 5px;margin-bottom:3px}.error{color:var(--red)}.calculation{background:#f0efdf;padding:12px}.calculation small{display:block;color:var(--red)}.red-note{color:#7c3028;background:#fae0d5;box-shadow:2px 2px 0 #bb938044;transform:rotate(-1deg);padding:9px;font-size:13px;margin:10px 0}.attachments{padding:12px 0;font-size:12px}.stamps{display:grid;grid-template-columns:repeat(4,1fr);text-align:center}.stamps span{padding:10px 0;border:1px solid #bfc7b5;font-size:12px}.progress-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px}.tag{font-size:11px;border:1px solid #bdc5b5;padding:4px 7px;background:#fff;border-radius:4px}.tag.good{background:#e0ecd6}.tag.warn{background:#f6e2bb}.office{display:grid;grid-template-columns:1fr 1fr;gap:22px;background:repeating-linear-gradient(0deg,#e3d3ad 0 22px,#decca5 22px 23px);padding:24px 16px;border:3px solid #a48d68;margin-bottom:14px}.desk{background:#759381;color:#fff;text-align:center;padding:12px 4px;box-shadow:3px 5px 0 #6d7864;font-size:12px}.desk.player{background:#435e4b}.desk.chief{background:#a08a5b}.desk.printer{background:#657978}.boxes,.routeboard{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}.boxes>div{background:#d5bc89;border:2px solid #b89b61;text-align:center;padding:16px 4px;font-size:12px}.boxes>div.bad{background:#e3c0a7;border-color:#b57250}.evidence-chain{padding:15px;background:#f8f7ef;border:1px dashed #91a080;border-radius:8px;text-align:center;font-size:13px;margin:14px 0}.dialogue{background:#fffdf5;padding:14px;border-left:4px solid #a99a6a;margin-bottom:14px;font-size:14px}.dialogue p{margin:6px 0 0}.routeboard>div{padding:16px 7px;background:#e1e9d8;border:1px solid #aebfa5;border-radius:8px;text-align:center;font-size:13px}.routeboard .holding{background:#f2e1bf}.routeboard .missing{background:#f6d9c7}.route-arrow{font-size:12px;text-align:center;color:var(--green);padding:6px;margin-bottom:12px}.caseboard{background:#ded7c3;padding:14px;border:5px solid #a99871;border-radius:8px;margin-bottom:14px}.link-label{text-align:center;font-size:11px;color:#8d392b;margin:4px 0 8px}.complete-seal{width:115px;height:115px;border:3px double #984c36;border-radius:50%;margin:12px auto 20px;color:#984c36;text-align:center;font-size:30px;line-height:1.2;padding-top:24px;transform:rotate(-8deg)}.complete-seal small{font-size:12px;display:block;margin-top:8px}.noticeboard{background:#b8ad83;border:5px solid #7b7452;padding:18px;display:flex;gap:16px;align-items:end;margin-bottom:14px}.poster{background:#fffef2;border:1px solid #eee7c7;padding:16px 12px;flex:1;display:flex;flex-direction:column;gap:7px;text-align:center}.poster small,.poster span{font-size:11px}.poster b{font-size:22px}.stand{border:3px solid #5f745d;background:#e4edda;text-align:center;padding:15px 6px;font-size:11px}.spec-reader{border-top:2px solid #ccd3c2;padding-top:24px}.spec-reader summary{font-size:22px;font-weight:700;cursor:pointer;padding:16px 0}.spec-reader h2{margin-top:42px;font-size:25px;scroll-margin-top:90px}.spec-reader h3{margin-top:25px;font-size:18px}.spec-reader p,.spec-reader li{max-width:960px}.table-wrap{overflow:auto;margin:16px 0 24px;border:1px solid var(--line);border-radius:8px}table{border-collapse:collapse;width:100%;font-size:14px;background:#fffef9;min-width:560px}th,td{text-align:left;padding:12px 14px;border-bottom:1px solid var(--line);vertical-align:top}th{background:#e6ebdf;font-weight:700}td{min-width:110px}pre{overflow:auto;background:#e4e9dc;border-radius:8px;padding:20px;font-size:14px}code{background:#e5e9df;border-radius:3px;padding:1px 4px}.endnote{font-size:13px;color:var(--muted);margin-top:32px}@media(max-width:740px){header{padding:28px 20px}main{padding:24px 16px}.intro{grid-template-columns:1fr}.scene-info{padding-top:0}section.scene{grid-template-columns:1fr;gap:20px}.phone{max-width:390px;width:100%;margin:auto}.scene-info h2{font-size:23px}nav{padding:8px 12px}nav a{padding:7px 10px}.spec-reader h2{font-size:22px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{nav{display:none}header{background:white;color:black}.hero-meta{display:none}header p{color:#222}section.scene{break-inside:avoid}.phone{box-shadow:none}.spec-reader details{display:block}}
'''

result = verify()
nav = ''.join(f'<a href="#scene-{i+1}">{i+1:02} {html.escape(stage["title"])}</a>' for i, stage in enumerate(contract['stages']))
scene_html = []
for i, (stage, scene) in enumerate(zip(contract['stages'], screens), 1):
    body = scene['body']
    scene_html.append(f'''<section class="scene" id="scene-{i}">
    <div class="phone"><div class="phone-head"><span>▤ 생활보장과</span><span>에피소드 01</span></div>
    <div class="screen-heading"><small>화면 시안 · {i} / 8 · 실제 판정 없음</small><h3>{html.escape(stage['title'])}</h3><p>{html.escape(scene['goal'])}</p></div>
    <div class="phone-body">{body}</div><div class="phone-footer"><div class="aux">{button('↶ 되돌리기')}{button('힌트')}{button('자료 보기')}</div>{button(scene['footer'], True)}</div></div>
    <div class="scene-info"><span class="num">SCENE {i:02} / {stage['minutes'][0]}~{stage['minutes'][1]}분 목표</span><h2>{html.escape(stage['title'])}</h2>
    <p>{html.escape(scene['note'])}</p><h3>주 조작</h3><p>{html.escape(stage['action'])}</p>
    <h3>완료 판정</h3><div class="rulebox">{html.escape(stage['gate'])}</div>
    <h3>다음 단계로 넘기는 결과</h3><p>{html.escape(stage['effect'])}</p>
    <p class="endnote">표시된 화면은 거치대 선택 경로의 서로 다른 진행 시점을 보여줍니다. 버튼은 시안 요소이며 게임을 실행하지 않습니다. 모든 경로의 예외와 재시도 조건은 아래 상세기획에 있습니다.</p></div></section>''')

document = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(contract['title'])} — 화면과 상세기획</title><style>{STYLE}</style></head><body>
<header><div class="eyebrow">GONG GAME · EPISODE DESIGN 01</div><h1>{html.escape(contract['title'])}</h1><p>사업을 고르고, 공문을 만들고, 돈과 물품의 이동을 확인한다. 민원과 결산을 해결한 결과가 사무실에 남는 첫 시범 에피소드.</p><div class="hero-meta"><span>8개 주요 화면</span><span>사업 예산 26만 원</span><span>홍보물 200부</span><span>17~24분 목표</span><span>상세기획 v0.1 · 게임 미구현</span></div></header>
<nav aria-label="화면 목차">{nav}<a href="#full-spec">전체 상세기획</a></nav><main>
<div class="intro"><div><h2>조작이 다음 장면을 바꾼다</h2><p>편성한 옵션은 문서·조사 자료·물품 추적과 사무실 소품에 반영한다. 제작비 지급, 실제 배부, 결산 집계는 각각 확인한다.</p></div><div><h2>선택과 재시도가 있는 한 편</h2><p>시간 제한 없이 탭만으로 완료. 정상 작업은 보존하고 잘못된 부분만 수정한다. 아래 8개 화면은 배치 시안이며, 실제 플레이와 판정은 구현 단계에서 만든다.</p></div></div>
{''.join(scene_html)}<div class="spec-reader" id="full-spec"><details open><summary>전체 상세기획 읽기</summary>{render_markdown(md)}</details></div>
<p class="endnote">2026년 10월 11일 · 원본 게임과 배포본 변경 없음 · 검증 범위는 기획 숫자·경로·수량 보존·시안 구조입니다.</p></main></body></html>'''
dest = ROOT / 'E01_화면과상세기획.html'
dest.write_text(document, encoding='utf-8')
assert document.count('<section class="scene"') == 8
assert document.count('<button ') == document.count(' disabled>')
assert not re.search(r'https?://|<script|<img', document)
assert not re.search(r'[\u4e00-\u9fff]', document)
result['previewFile'] = dest.name
result['markdownFile'] = source.name
(ROOT / 'E01_design_validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
