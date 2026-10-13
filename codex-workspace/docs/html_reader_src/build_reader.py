from pathlib import Path
import json,re,base64,hashlib,html
import markdown
from bs4 import BeautifulSoup

ROOT=Path(r'C:\Users\이현주\Desktop\공무원키우기 _코덱스')
D=ROOT/'docs';W=Path(__file__).resolve().parent
names=['한눈에 보기','자료 대조와 결정','게임 디자인','세계관과 15일','사무실 · 구역 · UX','신규 퍼즐 8종','성장 · 꾸미기 · 수집','타과 확장팩','기술 · 저장 · 자산','로드맵과 TASK','시험과 인수 기준','위험과 미확인 사항','다음 세션 인계']
desc=['이번 결정과 문서 읽는 순서','구현 사실, 제안, 새 요구를 구분','하루 루프, 난이도와 보상','3막 · NPC 9명 · 12개 후속 결과','정확한 좌표, 이동과 카메라','규칙 · 난도별 예제 · 판정 계약','도구10 · 소품18 · 도감5 · 업적18','11개 후보와 공통 데이터팩','모듈 구조와 v1 → v2 → v3','P0~P11 · 96개 실행 계약','검증 범위와 출시 게이트','권장 기본값과 조건부 결정','바로 전달하는 착수 프롬프트']
files=sorted(D.glob('[0-9][0-9]_*.md'))
file_ids={p.name:f'doc-{p.name[:2]}' for p in files}
attachments={};search=[];headings={};parts=[];all_stage={}

def make_flow(source):
    labels={}
    for match in re.finditer(r'(\w+)(?:\[([^\]]+)\]|\{([^}]+)\})',source):labels[match[1]]=match[2] or match[3]
    aliases={'FirstRun':'첫 실행','Bulletin':'출근 소식','Overview':'전체 사무실','Moving':'자동 이동','Zone':'구역 확대','Workbench':'작업대','Suspended':'초안 저장','Result':'결과 · 도장','DaySummary':'하루 결산','DecorPreview':'꾸미기 미리보기','BuildingMap':'청사 지도','DepartmentZone':'타과 구역','[*]':'시작'}
    labels.update(aliases)
    edges=[]
    for line in source.splitlines():
        matches=list(re.finditer(r'(?=(\b[\w]+|\[\*\])(?:\[[^\]]+\]|\{[^}]+\})?\s*-->(?:\|([^|]*)\|)?\s*([\w]+|\[\*\])(?:[^:>]*?:\s*(.*))?)',line))
        for match in matches:
            a,n,b,t=match.groups();edges.append((labels.get(a,a),labels.get(b,b),n or t or ''))
    content=''.join(f'<div class="flow-edge"><span>{html.escape(a)}</span><i aria-hidden="true">→</i><span>{html.escape(b)}</span>{f"<small>{html.escape(t)}</small>" if t else ""}</div>' for a,b,t in edges)
    return '<div class="flow-grid">'+content+'</div><details class="source-detail"><summary>흐름 정의 원문</summary><pre>'+html.escape(source)+'</pre></details>'

def attachment(path):
    key='file-'+hashlib.sha256(str(path).encode()).hexdigest()[:10]
    if key not in attachments:
        if path.suffix in ['.png','.jpg','.jpeg','.svg']:
            raw=path.read_bytes();mime='image/jpeg' if raw.startswith(b'\xff\xd8') else 'image/svg+xml' if path.suffix=='.svg' else 'image/png'
            b64=base64.b64encode(raw).decode()
            attachments[key]={'name':path.name,'kind':'image','content':'data:'+mime+';base64,'+b64,'base64':b64,'mime':mime}
        elif path.suffix=='.md':
            data=markdown.markdown(path.read_text(encoding='utf-8'),extensions=['tables','fenced_code'])
            attachments[key]={'name':path.name,'kind':'html','content':data,'raw':path.read_text(encoding='utf-8')}
        else:attachments[key]={'name':path.name,'kind':'text','content':path.read_text(encoding='utf-8-sig')}
    return key

for n,p in enumerate(files):
    docid=file_ids[p.name];text=p.read_text(encoding='utf-8')
    fragments=[]
    def diagram(match):
        fragments.append(make_flow(match.group(1)))
        return '\n\n'+f'<div data-flow="{len(fragments)-1}"></div>'+'\n\n'
    text=re.sub(r'```mermaid\n([\s\S]*?)```',diagram,text)
    raw=markdown.markdown(text,extensions=['tables','fenced_code','sane_lists'])
    soup=BeautifulSoup(raw,'html.parser')
    for tag in soup.select('script'):tag.decompose()
    for placeholder in soup.select('[data-flow]'):
        placeholder.replace_with(BeautifulSoup(fragments[int(placeholder['data-flow'])],'html.parser'))
    title=soup.find('h1')
    if title:title.decompose()
    headings[docid]=[]
    for i,h in enumerate(soup.find_all(re.compile(r'^h[2-6]$'))):
        hid=docid+'-h'+str(i);h['id']=hid
        headings[docid].append({'id':hid,'text':h.get_text(' ',strip=True),'level':int(h.name[1])})
        # Search uses the complete subsection, through the next heading of equal rank.
        chunks=[h.get_text(' ',strip=True)]
        for sib in h.next_siblings:
            if getattr(sib,'name',None) and re.fullmatch(r'h[2-6]',sib.name) and int(sib.name[1])<=int(h.name[1]):break
            chunks.append(sib.get_text(' ',strip=True) if hasattr(sib,'get_text') else str(sib))
        search.append({'doc':docid,'id':hid,'title':h.get_text(' ',strip=True),'chapter':names[n],'text':' '.join(chunks)})
    if docid=='doc-05':
        for row in soup.select('tr'):
            cells=row.find_all('td')
            if len(cells)<3:continue
            match=re.search(r'(conveyor|rules|macro|owner|approval|archive|budget|brief)_([enh])01',cells[0].get_text())
            if match:all_stage[match[0]]={'input':cells[1].get_text(' ',strip=True),'answer':cells[2].get_text(' ',strip=True)}
    for a in soup.find_all('a',href=True):
        href=a['href'];filename=href.split('#')[0]
        if filename in file_ids:a['href']='#'+file_ids[filename]
        elif href.startswith('https://'):
            a['target']='_blank';a['rel']='noopener noreferrer'
        elif filename and not href.startswith('#'):
            resource=p.parent/filename
            if resource.exists() and resource.is_file():
                a['href']='#'+attachment(resource)
    for img in soup.find_all('img',src=True):
        resource=p.parent/img['src']
        if resource.exists():
            raw=resource.read_bytes();mime='image/jpeg' if raw.startswith(b'\xff\xd8') else 'image/svg+xml' if resource.suffix=='.svg' else 'image/png'
            img['src']='data:'+mime+';base64,'+base64.b64encode(raw).decode()
            img['loading']='lazy'
    for table in soup.find_all('table'):
        wrap=soup.new_tag('div',attrs={'class':'table-scroll','tabindex':'0','aria-label':'표 가로 스크롤'});table.wrap(wrap)
    # Task bodies collapse individually; headings remain searchable and direct-linkable.
    if docid=='doc-09':
        for h in list(soup.find_all('h3')):
            if not re.match(r'P\d+-\d+',h.get_text()):continue
            detail=soup.new_tag('details',attrs={'class':'task-detail','id':h['id']})
            summ=soup.new_tag('summary');summ.string=h.get_text(' ',strip=True);detail.append(summ)
            h.insert_before(detail)
            for sib in list(h.next_siblings):
                if getattr(sib,'name',None) in ['h2','h3']:break
                detail.append(sib.extract())
            h.decompose()
    parts.append(f'<section class="chapter" id="{docid}" hidden data-title="{html.escape(names[n])}"><header class="chapter-head"><span class="eyebrow">PART {n:02d}</span><h1>{names[n]}</h1><p>{desc[n]}</p></header><div class="prose">{soup}</div><footer class="chapter-footer"><button class="btn" data-go="doc-{n-1:02d}" {"disabled" if n==0 else ""}>← 이전 파트</button><button class="btn primary" data-go="doc-{n+1:02d}" {"disabled" if n==12 else ""}>다음 파트 →</button></footer></section>')

assert len(all_stage)==21 # archive uses an ASCII witness block instead of a table.
archive_inputs=['5×5, 상자1개, 목표(3,3).','6×5, 상자2개와 목표2개.','7×6, 연도별 목표: 2025=(5,3), 2024=(4,3).']
for difficulty,input_,answer in zip('enh',archive_inputs,['R → U → R → D (밀기2회)','D → R → R → L → L → D → R → R (밀기4회)','D → R → R → L → L → U → R → U → R → D (밀기4회)']):
    all_stage['archive_'+difficulty+'01']={'input':input_,'answer':answer}
data={'contract':json.loads((D/'data/planning_contract.json').read_text(encoding='utf-8')),'layout':json.loads((D/'data/office_original_v1.json').read_text(encoding='utf-8')),'headings':headings,'search':search,'files':attachments,'examples':all_stage,'names':names,'tasks':json.loads((D/'tasks.json').read_text(encoding='utf-8'))}
payload=json.dumps(data,ensure_ascii=False).replace('</','<\/')
template=(W/'reader_template.html').read_text(encoding='utf-8')
nav=''.join(f'<button class="nav-item" data-go="doc-{n:02d}"><span class="nav-num">{n:02d}</span><span>{name}</span></button>' for n,name in enumerate(names))
htmlout=template.replace('%%NAV%%',nav).replace('%%CHAPTERS%%','\n'.join(parts)).replace('%%DATA%%',payload).replace('%%STYLE%%',(W/'reader.css').read_text(encoding='utf-8')).replace('%%SCRIPT%%',(W/'reader.js').read_text(encoding='utf-8'))
assert not re.search(r'%%[A-Z_]+%%',htmlout)
out=W/'공무원키우기_통합계획_탐색형.html';out.write_text(htmlout,encoding='utf-8')
(W/'html_build_manifest.json').write_text(json.dumps({'sourceDocuments':[{ 'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files],'chapters':13,'tasks':96,'exampleCount':24,'searchEntries':len(search),'singleFile':True,'bytes':out.stat().st_size},ensure_ascii=False,indent=2),encoding='utf-8')
print('HTML generated: 13 parts, 96 TASKs, 24 examples, '+str(len(search))+' searchable sections; '+str(out.stat().st_size)+' bytes.')
