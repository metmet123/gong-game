"""Build the two-desk candidate without overwriting the published transfer artifact."""
from pathlib import Path
import base64, hashlib, json, re
from datetime import datetime, timezone
root=Path(__file__).resolve().parent
src=root/'src'
move=['data/cases.js','data/chapter.js','engine/session.js','engine/actions.js','engine/review.js','engine/resolve.js','services/tutorial.js','services/storage.js','services/campaign.js','tutorial-view.js','puzzle-app.js']
welfare=['welfare/data/extra-cases.js','welfare/data/cases.js','welfare/engine/session.js','welfare/engine/review.js','welfare/engine/resolve.js','welfare/engine/actions.js','welfare/services/storage.js']
host=move[:9]+welfare+['center/storage.js','center/bridge.js']
inputs=set()
def read(p):
    inputs.add(p)
    return (src/p).read_text(encoding='utf-8')
def scripts(paths):
    blocks=[]
    for p in paths:
        code=read(p)
        if re.search(r'</script',code,re.I):raise ValueError('Unsafe terminator '+p)
        blocks.append('<script>\n'+code+'\n</script>')
    return '\n'.join(blocks)
def page(shell,css,paths,embed=False):
    code=scripts(paths)
    if embed:code='<script>window.__RC_EMBED__=__EMBED_CONFIG__;</script>\n'+code
    return read(shell).replace('__STYLE__',read(css)).replace('__SCRIPTS__',code)
movehtml=page('puzzle-shell.html','puzzle.css',move,True)
welfarehtml=page('welfare/shell.html','welfare/welfare.css',welfare+['welfare/view.js','welfare/app.js'],True)
children={k:base64.b64encode(v.encode()).decode() for k,v in [('movein',movehtml),('welfare',welfarehtml)]}
html=page('center/shell.html','center/center.css',host).replace('</body>','<script>window.__CENTER_CHILDREN__='+json.dumps(children,separators=(',',':'))+';</script>\n'+scripts(['center/app.js'])+'</body>')
assert '__STYLE__' not in html and '__SCRIPTS__' not in html
for dest in [root/'주민센터_두업무.html',root/'preview-center/index.html']:
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(html,encoding='utf-8')
actual=(root/'주민센터_두업무.html').read_bytes()
report={'builtAt':datetime.now(timezone.utc).isoformat(),'artifact':'주민센터_두업무.html','sha256':hashlib.sha256(actual).hexdigest(),'normalizedContentSha256':hashlib.sha256(html.encode()).hexdigest(),'bytes':len(actual),'inputs':{p:hashlib.sha256((src/p).read_bytes()).hexdigest() for p in sorted(inputs)},'published':False}
(root/'docs/센터빌드검증.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Built two-desk candidate:',len(html.encode()),'bytes')
from build_center_compare import build
build()
