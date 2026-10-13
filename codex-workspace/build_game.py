from pathlib import Path

root=Path(__file__).parent
shell=(root/'game-shell.html').read_text(encoding='utf-8')
css=(root/'game.css').read_text(encoding='utf-8')
js=(root/'game-core.js').read_text(encoding='utf-8')+'\n'+(root/'game-app.js').read_text(encoding='utf-8')
assert '</script>' not in js
output=shell.replace('__CSS__',css).replace('__JS__',js)
dest=root/'공무원키우기_플레이.html'
dest.write_text(output,encoding='utf-8')
print('Built standalone game:',dest.stat().st_size,'bytes')
