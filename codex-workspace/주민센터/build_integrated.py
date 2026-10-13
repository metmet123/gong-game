"""Create an isolated local candidate from the audited public HTML snapshot."""
import base64
import hashlib
import json
from pathlib import Path

root=Path(__file__).resolve().parent
snapshot=root/'docs/본편자료/배포본.html'
metadata=json.loads((root/'docs/본편자료/확인.json').read_text(encoding='utf-8'))
raw=snapshot.read_bytes()
assert hashlib.sha256(raw).hexdigest()==metadata['sha256'], 'Main snapshot changed; audit again before integration.'
html=raw.decode('utf-8')
patches={
    "const KEY='gongmuwon-proto-v1';":"const KEY='gong-game:integration:main:v2';",
    "|auto:d\\d{1,2})$/;":"|auto:d\\d{1,2}|rc:visit:M\\d{2}(?:-return)?|rc:day:[1-4])$/;",
    "if(Q.m.group==='dept'&&!Object.values(Week.COLLAB).includes(Q.m.id))":"if(Q.m.group==='dept'&&Q.m.id!=='movein'&&!Object.values(Week.COLLAB).includes(Q.m.id))"
}
for old,new in patches.items():
    assert html.count(old)==1, 'Integration hook changed: '+old
    html=html.replace(old,new,1)
modules=['data/cases.js','data/chapter.js','engine/session.js','engine/actions.js','engine/review.js','engine/resolve.js','services/tutorial.js', 'services/storage.js','services/campaign.js']
blocks=[]
for filename in modules:
    code=(root/'src'/filename).read_text(encoding='utf-8')
    assert '</script' not in code.lower()
    blocks.append('<script>'+code+'</script>')
encoded=base64.b64encode((root/'전입신고_퍼즐.html').read_bytes()).decode('ascii')
blocks.append('<script>window.__RC_HTML__=new TextDecoder().decode(Uint8Array.from(atob('+json.dumps(encoded)+'),c=>c.charCodeAt(0)));</script>')
marker='window.__proto={get S(){return S;}'
assert html.count(marker)==1
at=html.index(marker)
script_at=html.rfind('<script>',0,at)
html=html[:script_at]+''.join(blocks)+html[script_at:]
adapter=(root/'src/adapters/main-game.js').read_text(encoding='utf-8')
assert '</script' not in adapter.lower()
html=html.replace(marker,adapter+'\n'+marker,1)
target=root/'공무원키우기_주민센터_통합후보.html'
target.write_text(html,encoding='utf-8')
print('Built isolated integrated candidate:',target.stat().st_size,'bytes')
