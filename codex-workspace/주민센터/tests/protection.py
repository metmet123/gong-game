"""Record/verify originals without building or modifying the original game."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
MANIFEST = ROOT / 'docs' / '보호파일.json'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

if '--record' in sys.argv:
    if MANIFEST.exists():
        raise SystemExit('Protection baseline already exists; refusing to replace it.')
    paths = sorted(p for p in WORKSPACE.iterdir() if p.is_file() and p.suffix in {'.html', '.js', '.css', '.py', '.json', '.jpg'})
    paths += [ROOT/'전입신고_퍼즐시안.html']
    paths += sorted((ROOT/'src').glob('*'))
    entries = [{ 'path': p.relative_to(WORKSPACE).as_posix(), 'sha256': digest(p)} for p in paths if p.is_file()]
    MANIFEST.write_text(json.dumps({'recordedAt':'2026-10-11', 'files':entries}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Recorded {len(entries)} protected files')
else:
    entries=json.loads(MANIFEST.read_text(encoding='utf-8'))['files']
    mismatches=[e['path'] for e in entries if not (WORKSPACE/e['path']).is_file() or digest(WORKSPACE/e['path']) != e['sha256']]
    if mismatches:
        raise SystemExit('Protected files changed: '+', '.join(mismatches))
    print(f'PASS {len(entries)} protected originals unchanged')
