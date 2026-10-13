"""Run reproducible local checks; --browser additionally requires Playwright + Edge."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')
parser=argparse.ArgumentParser()
parser.add_argument('--browser',action='store_true')
parser.add_argument('--report',default='docs/최종검사.json')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
checks=[('original-core',['node','tests/core.test.js']),('engine',['node','tests/engine.test.cjs']),('storage',['node','tests/storage.test.cjs']),('first-contact',['node','tests/tutorial.test.cjs']),('protection',[sys.executable,'tests/protection.py'])]
if args.browser:
    checks += [(name,['node','tests/'+name+'.cjs']) for name in ['tutorial-browser','puzzle-browser','ux-browser','integration-browser','legacy-regression','screenshots']]
results=[]
for name,command in checks:
    start=time.perf_counter()
    result=subprocess.run(command,cwd=root,capture_output=True,encoding='utf-8',errors='replace')
    results.append({'name':name,'passed':result.returncode==0,'elapsedSeconds':round(time.perf_counter()-start,2),'output':result.stdout+result.stderr})
    print(('PASS' if result.returncode==0 else 'FAIL')+' '+name,flush=True)
    if result.returncode:print(result.stdout+result.stderr,flush=True)
report={'checkedAt':datetime.now(timezone.utc).isoformat(),'environment':'Windows / headless Microsoft Edge (browser checks only)','results':results,'artifacts':{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ['전입신고_퍼즐.html','공무원키우기_주민센터_통합후보.html','UI_비교_프로토타입.html']}}
(root/args.report).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
sys.exit(0 if all(r['passed'] for r in results) else 1)
