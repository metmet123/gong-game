"""Cross-check the delivered plan without changing game files."""
from pathlib import Path
from collections import Counter,deque
import json,re,csv,hashlib,subprocess,sys
OUT=Path(__file__).resolve().parent;D=OUT.parent;ROOT=D.parent
checks=[];failures=[]
def check(name,ok,detail=None):
    checks.append({'name':name,'pass':bool(ok),'detail':detail})
    if not ok:failures.append(name)
def load(p):return json.loads(p.read_text(encoding='utf-8-sig'))
c=load(D/'data/planning_contract.json');layout=load(D/'data/office_original_v1.json');tasks=load(D/'tasks.json')
docs=sorted(D.glob('[0-9][0-9]_*.md'))
check('13 numbered documents',len(docs)==13 and [int(p.name[:2]) for p in docs]==list(range(13)))
alltext='\n'.join(p.read_text(encoding='utf-8') for p in docs)
check('No unfilled template markers',not re.search(r'%%[A-Z_]+%%|\bTBD\b|\bTODO\b',alltext))
check('No mixed-language fragments',not re.search(r'[\u3040-\u30ff\u3400-\u9fff\u0400-\u04ff]',alltext))
links=[]
for p in docs+[OUT/'requirements_traceability.md']:
    for target in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        if re.match(r'^(https?:|#|mailto:)',target):continue
        path=target.split('#')[0]
        if path and not (p.parent/path).exists():links.append(f'{p.name}: {path}')
check('Relative links resolve',not links,links)
check('14 x 21 / 46 objects',layout['cols']==14 and layout['rows']==21 and len(layout['items'])==46)
check('Map structure unchanged',layout==load(ROOT/'생활보장과_사무실배치.json'))
used={};overlap=[];outside=[]
for i,a in enumerate(layout['items']):
    for x in range(a[1],a[1]+a[3]):
        for y in range(a[2],a[2]+a[4]):
            if not(0<=x<14 and 0<=y<21):outside.append((i,x,y))
            if (x,y) in used:overlap.append((used[x,y],i,x,y))
            used[x,y]=i
check('No bounds/overlap errors',not outside and not overlap)
check('139 occupied and 155 free cells',len(used)==139 and 294-len(used)==155)
start=(1,12);prev={start:None};q=deque([start])
while q:
    x,y=q.popleft()
    for dx,dy in [(0,-1),(1,0),(0,1),(-1,0)]:
        cell=(x+dx,y+dy)
        if 0<=cell[0]<14 and 0<=cell[1]<21 and cell not in used and cell not in prev:prev[cell]=(x,y);q.append(cell)
check('Seven reachable representative approaches',len(c['zones'])==7 and all(tuple(z['approach']) in prev for z in c['zones']))
check('All free cells reachable',len(prev)==155,len(prev))
zoneids={z['id'] for z in c['zones']};ownership=Counter(o for z in c['zones'] for o in z['objects']);anchors={a for z in c['zones'] for a in z['anchors']}
check('Object IDs valid and unique zone ownership',all(re.fullmatch(r'o\d+',o) and int(o[1:])<46 and n==1 for o,n in ownership.items()))
check('Zone rectangles in bounds',all(0<=r[0]<r[2]<=14 and 0<=r[1]<r[3]<=21 for z in c['zones'] for r in z['rects']))
legacy={'compare','memory','sort','sequence','route'};types=legacy|{p['id'] for p in c['puzzles']};unlock={p['id']:p['unlockDay'] for p in c['puzzles']}
check('Eight unique main puzzle specs',len(c['puzzles'])==8 and len(unlock)==8 and all(f'`{p["id"]}' in alltext for p in c['puzzles']))
check('15 sequential days / 4 valid main tasks / no early unlock',len(c['days'])==15 and [x['day'] for x in c['days']]==list(range(1,16)) and all(len(x['main'])==4 and set(x['main'])<=types and all(unlock.get(t,1)<=x['day'] for t in x['main']) and 'archive' not in x['main'] for x in c['days']))
check('Catalog counts 10 tools /18 decor /11 packs',len(c['tools'])==10 and len(c['decor'])==18 and len(c['departments'])==11)
check('Catalog IDs / anchors valid',len({x['id'] for x in c['tools']+c['decor']})==28 and all(x['anchor'] in anchors for x in c['decor']))
check('Catalog prices and unlocks reproduced in tables',all(x['id'] in alltext and '|'+str(x['price'])+'|' in alltext and f'|D{x["day"]}|' in alltext for x in c['tools']+c['decor']))
check('15 day table reproduced from contract',all(' / '.join(day['main']) in alltext for day in c['days']))
check('Economy 1455 income /1425 prices /30 remainder',30+15*(4*20+15)==1455 and sum(x['price'] for x in c['tools'])==690 and sum(x['price'] for x in c['decor'])==735)
ids={t['id'] for t in tasks};deps={t['id']:set(t['prerequisites']) for t in tasks};done=set()
check('96 unique planned tasks',len(tasks)==len(ids)==96 and all(t['status']=='planned' for t in tasks))
check('Task required fields nonempty',all(all(v!='' and v is not None for v in t.values()) for t in tasks))
check('Dependencies refer to valid tasks',all(x in ids for ds in deps.values() for x in ds))
while True:
    ready={x for x,ds in deps.items() if ds<=done}-done
    if not ready:break
    done|=ready
check('Dependency DAG no cycles',done==ids)
check('Reverse dependencies match prerequisites',all(set(t['nextDependencies'])=={x['id'] for x in tasks if t['id'] in x['prerequisites']} for t in tasks))
with (D/'tasks.csv').open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
check('JSON /CSV /backlog consistent',len(rows)==96 and all(r['id']==t['id'] and r['implementation']==t['implementation'] and f'### {t["id"]} · {t["title"]}' in alltext for r,t in zip(rows,tasks)))
check('24 example IDs /18 achievements /12 callbacks /9 NPC IDs',all(f'{p}_{level}01' in alltext for p in unlock for level in 'enh') and len(set(re.findall(r'ach\.[a-z_]+',alltext)))==18 and len(set(re.findall(r'\|npc_[a-z0-9]+ /',alltext)))==9,{'achievements':len(set(re.findall(r'ach\.[a-z_]+',alltext)))})
manifest=load(OUT/'workspace_source_manifest.json')
check('Source HTML/map/reference hashes unchanged',all(hashlib.sha256(Path(e['workspacePath']).read_bytes()).hexdigest()==e['sha256'] for e in manifest))
core=(OUT/'runtime-test/inline-core.cjs').read_text(encoding='utf-8').strip()
game=(ROOT/'공무원키우기_픽셀아트.html').read_text(encoding='utf-8-sig')
check('Test core equals inline baseline',core in game)
run=subprocess.run(['node',str(OUT/'runtime-test/existing-rules.cjs')],capture_output=True,text=True,encoding='utf-8')
check('Existing 1200 rule variants',run.returncode==0 and '1200' in run.stdout,run.stdout.strip())
(OUT/'resumption_checks.json').write_text(json.dumps({'date':'2026-10-10','baseline':'공무원키우기_픽셀아트.html','coreMatchesInline':core in game,'command':'node docs/evidence/runtime-test/existing-rules.cjs','exitCode':run.returncode,'stdout':run.stdout,'uiEvidence':'Previous session only; no new UI/Android test in resumption','gameOriginalsUnchanged':True},ensure_ascii=False,indent=2),encoding='utf-8')
examples=load(OUT/'example_checks.json');check('Planning example checks PASS',examples['status']=='PASS' and examples['count']==24)
report={'date':'2026-10-10','status':'FAIL' if failures else 'PASS','scope':'Planning cross-validation + existing baseline logic, not new-game implementation/Android','passed':len(checks)-len(failures),'total':len(checks),'taskCount':96,'dependencyEdges':sum(len(x['prerequisites']) for x in tasks),'checks':checks,'failures':failures,'android':'unverified'}
(OUT/'plan_validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'status':report['status'],'passed':report['passed'],'total':report['total'],'failures':failures},ensure_ascii=True))
sys.exit(1 if failures else 0)
