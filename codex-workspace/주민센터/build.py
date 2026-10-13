from pathlib import Path

root = Path(__file__).resolve().parent
src = root / 'src'
html = (src / 'shell.html').read_text(encoding='utf-8')
for token, filename in [('__STYLE__', 'style.css'), ('__CORE__', 'core.js'), ('__APP__', 'app.js')]:
    content = (src / filename).read_text(encoding='utf-8')
    if filename.endswith('.js') and '</script' in content.lower():
        raise ValueError('Inline script terminator found')
    html = html.replace(token, content)
(root / '전입신고_퍼즐시안.html').write_text(html, encoding='utf-8')
(root / 'preview').mkdir(exist_ok=True)
(root / 'preview' / 'index.html').write_text(html, encoding='utf-8')
print('Built standalone HTML and preview/index.html')
