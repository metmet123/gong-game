from pathlib import Path
import hashlib, json, subprocess

ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT / '.github-publish'
manifest = json.loads((REPO/'codex-chats/workspace-manifest.json').read_text(encoding='utf-8'))
entries = manifest['files']
queries = ''.join(':'+e['repositoryPath']+'\n' for e in entries).encode('utf-8')
result = subprocess.run(['git','-c','core.fsmonitor=false','-C',str(REPO),'cat-file','--batch'],input=queries,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
data, offset = result.stdout, 0
for e in entries:
 end = data.index(b'\n',offset)
 header = data[offset:end].decode('utf-8')
 parts = header.rsplit(' ',2)
 assert len(parts)==3 and parts[1]=='blob', header
 length = int(parts[2])
 blob = data[end+1:end+1+length]
 assert hashlib.sha256(blob).hexdigest()==e['sha256'], e['repositoryPath']
 assert hashlib.sha256((ROOT/e['path']).read_bytes()).hexdigest()==e['sha256'], 'Source changed: '+e['path']
 offset = end+1+length+1
print(json.dumps({'stagedBlobHashes':'PASS','unchangedSourceHashes':'PASS','checkedFiles':len(entries)},ensure_ascii=True))
