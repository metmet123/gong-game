"""Build the revised design reader from the current design and actual mockup captures."""
from pathlib import Path
import html
import re
import json

ROOT = Path(__file__).resolve().parent
source = (ROOT / 'E01_홍보물200부_개정기획.md').read_text(encoding='utf-8')
source = (ROOT / 'E01_재미중심_개정안.md').read_text(encoding='utf-8') + '\n\n## 현재 목업 v0.2의 구현 규칙\n\n' + source

# A portable copy keeps the entire interaction available in a single HTML file.
portable = (ROOT / 'E01_플레이목업.html').read_text(encoding='utf-8')
portable = portable.replace('<link rel="stylesheet" href="e01-mockup.css">', '<style>' + (ROOT / 'e01-mockup.css').read_text(encoding='utf-8') + '</style>')
for script in ['e01-engine.js', 'e01-mockup.js']:
    portable = portable.replace('<script src="' + script + '"></script>', '<script>' + (ROOT / script).read_text(encoding='utf-8') + '</script>')
portable = portable.replace('href="E01_플레이목업.html"', 'href="E01_체험목업.html"')
(ROOT / 'E01_체험목업.html').write_text(portable, encoding='utf-8')

def inline(text):
    text = html.escape(text)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)

lines, pieces, i = source.splitlines(), [], 0
while i < len(lines):
    line = lines[i]
    if line.startswith('# '):
        i += 1; continue
    if not line.strip():
        i += 1; continue
    if line.startswith('## '):
        pieces.append('<h2>' + inline(line[3:]) + '</h2>'); i += 1; continue
    if line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].startswith('|'):
            cells = lines[i].strip('|').split('|')
            if not all(re.fullmatch(r':?-+:?', c.strip()) for c in cells): rows.append(cells)
            i += 1
        pieces.append('<div class="table-wrap"><table>')
        for n, cells in enumerate(rows):
            tag = 'th' if n == 0 else 'td'
            pieces.append('<tr>' + ''.join('<' + tag + '>' + inline(c) + '</' + tag + '>' for c in cells) + '</tr>')
        pieces.append('</table></div>'); continue
    if line.startswith('- '):
        pieces.append('<ul>')
        while i < len(lines) and lines[i].startswith('- '):
            pieces.append('<li>' + inline(lines[i][2:]) + '</li>'); i += 1
        pieces.append('</ul>'); continue
    pieces.append('<p>' + inline(line) + '</p>'); i += 1

names = ['사업 편성', '공문 작업대', '결재 작전', '납품 검수', '지급 서류철', '민원 조사', '결산 사건 보드', '오늘의 사무실']
captions = ['예산 칩으로 사업을 활성화하고 가격 상승에 대응', '자료를 선택해 공문 위 수량·단가·붙임 교체', '서류철을 들고 협조와 출력, 결재 순서 수행', '상자 개봉과 샘플 비교, 구버전 40부 무료 교체', '계약·청구·검수 증빙을 넣고 실제 지급', '단서에서 B-02를 찾아 40부 실제 전달', '집계행을 지급확인증과 연결하고 중복 집계 제외', '홍보물과 선택 사업의 흔적이 사무실에 남음']
gallery = ''.join('<article><div class="scene-number">' + str(i + 1).zfill(2) + '</div><h3>' + name + '</h3><a href="mockup_screens/' + str(i + 1).zfill(2) + '-desktop.png"><img loading="lazy" src="mockup_screens/' + str(i + 1).zfill(2) + '-desktop.png" alt="' + name + ' 실제 목업 화면"></a><p>' + captions[i] + '</p><a href="mockup_screens/' + str(i + 1).zfill(2) + '-mobile.png">모바일 화면 보기 ↗</a></article>' for i, name in enumerate(names))

style = '''*{box-sizing:border-box}body{margin:0;background:#f0ecdf;color:#2b443b;font:16px/1.7 'Malgun Gothic',system-ui,sans-serif}header{background:#294b3d;color:#fff;padding:40px max(24px,calc((100vw - 1240px)/2))}header small{color:#dbe8b9;letter-spacing:2px}h1{font-size:clamp(25px,4vw,38px);line-height:1.4;margin:10px 0}header p{max-width:820px;color:#e3eada}.hero-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:23px}.hero-links a{color:#283f39;background:#dce8b9;padding:11px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700}.hero-links a.secondary{background:#fffdf0}main{max-width:1290px;margin:auto;padding:28px 24px}h2{margin:36px 0 15px;font-size:25px}h3{margin:8px 0 15px;font-size:19px}iframe{display:block;width:100%;height:1120px;border:1px solid #b6c1a4;border-radius:12px;background:#eee9db}.reader-note{font-size:13px;color:#5b7166}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:25px}.gallery article{background:#fffdf4;border:1px solid #cdd1bc;border-radius:12px;padding:20px}.scene-number{font-size:12px;letter-spacing:2px;color:#668252;font-weight:700}.gallery img{width:100%;display:block;border:1px solid #cbd1ba;border-radius:7px}.gallery p,.gallery a{font-size:13px}.gallery p{margin:13px 0 7px}a{color:#37664f}details{border-top:2px solid #c5cdb4;margin-top:45px;padding-top:20px}summary{font-size:24px;font-weight:700;cursor:pointer}.spec{padding-top:5px}.spec h2{font-size:22px}.spec p,.spec li{max-width:1040px}.table-wrap{overflow:auto;border:1px solid #cbd0b9;border-radius:7px;margin:18px 0}table{width:100%;border-collapse:collapse;font-size:13px;min-width:620px;background:#fffdf4}th,td{text-align:left;padding:12px;border-bottom:1px solid #d8dacb;vertical-align:top}th{background:#e3ead7}footer{font-size:12px;color:#60766b;padding:30px 0}@media(max-width:760px){main{padding:18px 16px}.gallery{grid-template-columns:1fr}header{padding:28px 20px}iframe{height:1560px}.gallery article{padding:16px}summary{font-size:22px}}@media print{iframe,.hero-links{display:none}.gallery article{break-inside:avoid}header{background:#fff;color:#283f39}header p{color:#283f39}}'''

document = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>홍보물 200부 개정기획과 플레이 목업</title><style>' + style + '</style></head><body><header><small>모서리구청 생활보장과 · 개정기획 v0.2</small><h1>홍보물 200부,<br>오늘 안에 끝내라고요?</h1><p>돈을 배치하고, 서류를 고치고, 물품을 옮겨 사업 하나를 끝내는 독립 에피소드. 주요 화면을 직접 체험하고 장면별 조작과 완료 조건을 확인할 수 있습니다.</p><div class="hero-links"><a href="E01_플레이목업.html">독립 목업 크게 열기 →</a><a class="secondary" href="#gallery">주요 화면 8장 보기</a><a class="secondary" href="#spec">개정 상세기획 읽기</a></div></header><main><h2>직접 플레이</h2><p class="reader-note">처음부터 순서대로 진행하거나 ‘주요 화면 둘러보기’로 장면을 선택하세요. 독립 목업은 기존 게임 저장과 연결되지 않습니다.</p><iframe title="홍보물 200부 독립 플레이 목업" src="E01_플레이목업.html"></iframe><h2 id="gallery">주요 화면 목업</h2><p class="reader-note">독립 목업에서 실제 조작한 장면입니다. 이미지를 누르면 원본 크기로 열립니다.</p><div class="gallery">' + gallery + '</div><details id="spec" open><summary>개정 상세기획</summary><div class="spec">' + '\n'.join(pieces) + '</div></details><footer>이전 v0.1의 화면을 대체한 v0.2 · 신규 에피소드 규칙 체험 · 배포 게임에 적용 전</footer></main></body></html>'
document = document.replace('E01_플레이목업.html', 'E01_체험목업.html')
document = document.replace('모서리구청 생활보장과 · 개정기획 v0.2', '현재 목업 v0.2 · 재미 중심 개정안 v0.3')
document = document.replace('<h2>직접 플레이</h2>', '<section style="padding:20px;background:#e3ead4;border-left:4px solid #547b50;border-radius:0 8px 8px 0"><h2 style="margin-top:0">가장 중요한 기준은 재미</h2><p>다음 개정은 지원 카드에 따른 해결 방법, 문서 모순의 발견, 사무실에서 선택한 순서의 결과에 집중합니다. 반복 검수와 확인 클릭을 줄이고, 기안·결재·납품의3~5분 구간부터 실제 사용자 반응을 확인합니다.</p><p class="reader-note">아래 목업은 업무 흐름과 기능을 확인한 v0.2입니다. 재미 중심 v0.3의 새 기능과 사용자 재미 검증은 아직 진행 전입니다.</p><a href="#spec">재미 중심 개정안 읽기 →</a></section><h2>현재 목업 직접 플레이</h2>')
document = document.replace('<summary>개정 상세기획</summary>', '<summary>재미 중심 개정안과 현재 목업 규칙</summary>')
document = document.replace('이전 v0.1의 화면을 대체한 v0.2 · 신규 에피소드 규칙 체험 · 배포 게임에 적용 전', '현재 목업 v0.2 · 다음 플레이 개정 기준 v0.3 · 사용자 재미 검증 전')
(ROOT / 'E01_화면과상세기획.html').write_text(document, encoding='utf-8')
(ROOT / 'E01_design_validation.json').write_text(json.dumps({
    'scope': 'revised_design_and_interactive_mockup', 'version': 2,
    'source': 'E01_홍보물200부_개정기획.md',
    'screenCount': 8, 'captureCount': 16, 'minutesTarget': [17, 24],
    'runtimeReports': ['E01_mockup_validation.json', 'E01_browser_validation.json'],
    'legacyLogicReuse': False, 'productionGameIntegrated': False,
    'nextDesign': 'E01_재미중심_개정안.md', 'funValidatedWithUsers': False
}, ensure_ascii=False, indent=2), encoding='utf-8')
print('Built revised design reader with 8 captured screens.')
