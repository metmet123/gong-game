from pathlib import Path
import re
root=Path(__file__).parent
old=(root/'game-app.js').read_text(encoding='utf-8')
def between(a,b): return old[old.index(a):old.index(b)]
controller=(root/'scene-controller.js').read_text(encoding='utf-8')
controller=controller.replace('__ICONS__',between('const paths=','let state='))
controller=controller.replace('__SOUND__',between('function sound(','function updateSound'))
controller=controller.replace('__MENUS__',between('function renderGrowth','function openModal'))
puzzles=between('function startTask','function finishTask')
puzzles=puzzles.replace('function puzzleMarkup()', 'function basePuzzleMarkup()').replace('function puzzleArea()', 'function basePuzzleArea()')
puzzles=puzzles.replace('업무함으로 돌아가기','사무실로 돌아가기')
puzzles=puzzles.replace('${esc(p.brief)}','${esc(conciseBrief(p))}')
puzzles=puzzles.replace("`${G.TYPES[task.type].name} · 난이도 ${ {easy:'하',normal:'중',hard:'상'}[p.difficulty]} · 경험치 +15`","`${G.TYPES[task.type].name} · ${ {easy:'하',normal:'중',hard:'상'}[p.difficulty]}`")
puzzles=puzzles.replace('<button class="btn ghost small" id="tool-info">성장 도구 안내</button>','<button class="btn ghost small" id="tool-info">도구</button>')
puzzles=puzzles.replace('확인 완료하고 업무 마치기','확인하고 마치기').replace('정답 학습하기','정답 확인')
puzzles=puzzles.replace('천천히 읽어도 괜찮아요. 준비되면 직접 통화를 종료합니다.','읽은 뒤 통화를 종료하세요.')
puzzles=puzzles.replace('bindArea();if(active.p.type', 'bindArea();if(!state.settings.motion)drawWorkClerk(0);if(active.p.type')
controller=controller.replace('__PUZZLES__',puzzles+'\n'+(root/'workshop.js').read_text(encoding='utf-8'))
controller=controller.replace('__BACKUP__',between('function confirmReset','/* Original pixel art'))
art=(root/'scene-art.js').read_text(encoding='utf-8').replace('__SPRITES__',(root/'pixel-characters.js').read_text(encoding='utf-8'))
app=controller+art+(root/'scene-init.js').read_text(encoding='utf-8')
(root/'scene-app.js').write_text(app,encoding='utf-8')
shell=(root/'scene-shell-top.html').read_text(encoding='utf-8')
old_shell=(root/'game-shell.html').read_text(encoding='utf-8')
menus=old_shell[old_shell.index('<section id="growth-view"'):old_shell.index('<nav class="bottomnav"')]
shell=shell.replace('__MENUS__',menus)
css=(root/'game.css').read_text(encoding='utf-8')+'\n'+(root/'scene.css').read_text(encoding='utf-8')+'\n'+(root/'workshop.css').read_text(encoding='utf-8')+'\n.motion-off *{animation:none!important}'
js=(root/'game-core.js').read_text(encoding='utf-8')+'\n'+app
assert '</script>' not in js
out=shell.replace('__CSS__',css).replace('__JS__',js)
if (root/'공무원키우기_플레이.html').exists() and not (root/'공무원키우기_플레이_이전버전.html').exists():
 (root/'공무원키우기_플레이_이전버전.html').write_bytes((root/'공무원키우기_플레이.html').read_bytes())
for name in ['공무원키우기_플레이.html','공무원키우기_사무실버전.html','공무원키우기_픽셀아트.html']:(root/name).write_text(out,encoding='utf-8')
preview=root/'.preview';preview.mkdir(exist_ok=True)
(preview/'index.html').write_text(out.replace("civil-servant-grow-v1","civil-servant-grow-scene-qa-v1"),encoding='utf-8')
print('Built scene HTML:',len(out.encode('utf-8')),'bytes')
