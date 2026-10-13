from urllib.request import Request, urlopen
from pathlib import Path
import re,json
from urllib.parse import urljoin
def fetch(url):
    with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as response:
        return response.read()
root=Path(__file__).resolve().parent
html=fetch('https://dukope.com/').decode('utf-8')
records=json.loads((root/'asset_sources.json').read_text(encoding='utf-8'))[:4]
for slug,title in [('unsolicited','Unsolicited'),('republia','The Republia Times')]:
    start=html.find(title)
    fragment=html[start:start+3500]
    matches=re.findall(r'<img[^>]+src=["\']([^"\']+)',fragment,re.I)
    (root/(slug+'-image-candidates.json')).write_text(json.dumps(matches,indent=2),encoding='utf-8')
    candidates=[urljoin('https://dukope.com/',x) for x in matches if 'star.png' not in x]
    record={'id':slug,'name':title,'imageCandidates':candidates}
    if candidates:
        url=candidates[0];file='images/'+slug+'.png'
        (root/file).write_bytes(fetch(url))
        record['screenshots']=[{'file':file,'url':url,'source':'https://dukope.com/','kind':'creator homepage image'}]
    records.append(record)
(root/'asset_sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
