from pathlib import Path
import re

root = Path(__file__).resolve().parent
src = root / 'src'
scripts = ['data/cases.js', 'data/chapter.js', 'engine/session.js', 'engine/actions.js', 'engine/review.js', 'engine/resolve.js', 'services/tutorial.js', 'services/storage.js', 'services/campaign.js', 'tutorial-view.js', 'puzzle-app.js']
blocks = []
for relative in scripts:
    code = (src / relative).read_text(encoding='utf-8')
    if re.search(r'</script', code, re.I):
        raise ValueError('Unsafe script terminator in ' + relative)
    blocks.append('<script>\n' + code + '\n</script>')
html = (src / 'puzzle-shell.html').read_text(encoding='utf-8').replace('__STYLE__', (src / 'puzzle.css').read_text(encoding='utf-8')).replace('__SCRIPTS__', '\n'.join(blocks))
assert '__STYLE__' not in html and '__SCRIPTS__' not in html
dest = root / '전입신고_퍼즐.html'
dest.write_text(html, encoding='utf-8')
(root / 'preview-puzzle').mkdir(exist_ok=True)
(root / 'preview-puzzle' / 'index.html').write_text(html, encoding='utf-8')
print('Built standalone puzzle:', dest.stat().st_size, 'bytes')
