"""Read-only extraction of supplied source material for the master plan."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib, json, re

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SOURCES = {
    'game': ROOT / '공무원키우기_픽셀아트.html',
    'expansion': ROOT / '공무원키우기_생활보장과_확장상세계획.html',
    'new_design': ROOT / '.codex-remote-attachments/01a1216b-d366-7ce3-bede-e9c7d2abacfd/8f0f2f09-db74-4285-848c-20ea775cc1b1/1-공무원키우기_새버전_기획시안.html',
    'research': ROOT / '공무원키우기_유사게임조사_구현제안.html',
    'map': ROOT / '생활보장과_사무실배치.json',
}

class TextReader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hidden = 0
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hidden += 1
        if tag in ('p','div','section','h1','h2','h3','h4','li','tr','br','pre'): self.parts.append('\n')
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.hidden -= 1
        if tag in ('p','div','section','h1','h2','h3','h4','li','tr','pre'): self.parts.append('\n')
    def handle_data(self, data):
        if not self.hidden: self.parts.append(data)

manifest = []
for key, path in SOURCES.items():
    data = path.read_bytes()
    manifest.append(dict(id=key, path=str(path), bytes=len(data), sha256=hashlib.sha256(data).hexdigest()))
    if path.suffix == '.html':
        parser = TextReader(); parser.feed(data.decode('utf-8-sig'))
        clean = re.sub(r'\n[ \t]*\n+', '\n\n', ''.join(parser.parts))
        (OUT / f'{key}_text.txt').write_text(clean, encoding='utf-8')
(OUT / 'source_manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
game = SOURCES['game'].read_text(encoding='utf-8-sig')
scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', game, re.I)
for i, script in enumerate(scripts): (OUT / f'game_script_{i}.js').write_text(script, encoding='utf-8')
core = (ROOT / 'game-core.js').read_text(encoding='utf-8-sig')
inline_equal = any(core.strip() in s for s in scripts)
layout = json.loads(SOURCES['map'].read_text(encoding='utf-8-sig'))
embedded_layout = re.findall(r'<script[^>]*type=[\"\']application/json[\"\'][^>]*>([\s\S]*?)</script>', SOURCES['expansion'].read_text(encoding='utf-8-sig'), re.I)
layout_matches = []
for s in embedded_layout:
    try: layout_matches.append(json.loads(s) == layout)
    except Exception: pass
summary = dict(script_count=len(scripts), inline_core_matches_source=inline_equal, expansion_json_matches=layout_matches,
               items=len(layout['items']), missing_samsung_screenshot=not any(ROOT.rglob('Screenshot_20261010_205101_Samsung Browser.jpg')))
(OUT / 'extraction_result.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False))
print('Source bytes and SHA-256 recorded; originals not written.')
