from pathlib import Path
root = Path(__file__).resolve().parent
text = (root / 'E01_묶음1_게임화면.html').read_text(encoding='utf-8')
text = text.replace('<link rel="stylesheet" href="e01-pair.css">', '<style>' + (root / 'e01-pair.css').read_text(encoding='utf-8') + '</style>')
for source in ['e01-engine.js', 'e01-pair.js']:
    text = text.replace(f'<script src="{source}"></script>', '<script>' + (root / source).read_text(encoding='utf-8') + '</script>')
(root / 'E01_묶음1_휴대용시안.html').write_text(text, encoding='utf-8')
print('Built portable pair design.')
