"""Reproduce the center build and validate legacy/new paths; preserve prior final report."""
import argparse,hashlib,json,subprocess,sys,time
from pathlib import Path
from datetime import datetime,timezone
sys.stdout.reconfigure(encoding='utf-8')
parser=argparse.ArgumentParser()
parser.add_argument('--browser',action='store_true')
parser.add_argument('--reuse-legacy-report',action='store_true',help='Reuse only a passing acceptance report for identical legacy artifacts')
args=parser.parse_args();root=Path(__file__).resolve().parents[1];results=[]
def run(name,cmd):
    started=time.perf_counter();r=subprocess.run(cmd,cwd=root,capture_output=True,encoding='utf-8',errors='replace');results.append({'name':name,'passed':r.returncode==0,'elapsedSeconds':round(time.perf_counter()-started,2),'output':r.stdout+r.stderr});print(('PASS ' if r.returncode==0 else 'FAIL ')+name,flush=True)
    if r.returncode:print(r.stdout+r.stderr,flush=True)
run('build',[sys.executable,'build_center.py']);first=(root/'주민센터_두업무.html').read_bytes();run('rebuild',[sys.executable,'build_center.py']);second=(root/'주민센터_두업무.html').read_bytes();results.append({'name':'reproducible-build','passed':first==second and second==(root/'preview-center/index.html').read_bytes()})
run('welfare-engine',['node','tests/welfare-engine.cjs']);run('center-storage',['node','tests/center-storage.cjs']);run('welfare-difficulty',['node','tests/welfare-difficulty.cjs'])
if args.reuse_legacy_report:
    prior=json.loads((root/'docs/전입인수검증.json').read_text(encoding='utf-8'))
    valid=all(r['passed'] for r in prior['results']) and all(hashlib.sha256((root/n).read_bytes()).hexdigest()==h for n,h in prior['artifacts'].items())
    results.append({'name':'legacy-acceptance-reused','passed':valid,'source':'docs/전입인수검증.json','scope':'Same accepted artifacts; checks not rerun in this bundle'})
else:run('legacy-acceptance',[sys.executable,'tests/run_checks.py',*(['--browser'] if args.browser else []),'--report','docs/전입인수검증.json'])
if args.browser:
    for name in ['center-browser','center-recovery-browser','center-artifact-browser','welfare-catalog-browser','welfare-order-browser']:run(name,['node','tests/'+name+'.cjs'])
build=json.loads((root/'docs/센터빌드검증.json').read_text(encoding='utf-8'))
results.append({'name':'artifact-size-and-hash','passed':len(second)<2*1024*1024 and build['sha256']==hashlib.sha256(second).hexdigest()})
report={'checkedAt':datetime.now(timezone.utc).isoformat(),'environment':'Windows / headless Edge; viewport/touch emulation is not real-device evidence','artifact':build,'results':results,'passed':all(r['passed'] for r in results),'limitations':['실제 Android/iPhone 미검증','초심자 3명 평가 미실시','새 센터판 공개 배포 및 본편 정식 통합 미실시']}
(root/'docs/센터검증.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');sys.exit(0 if report['passed'] else 1)
