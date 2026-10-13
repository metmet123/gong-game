import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent.parent
OUT=HERE/'character-expansion'
before=json.loads((OUT/'before_data.json').read_text(encoding='utf-8'))
after=json.loads((ROOT/'docs/narrative/narrative_data.json').read_text(encoding='utf-8'))
md=(ROOT/'docs/narrative/narrative_concept.md').read_text(encoding='utf-8')
def walk(x,p=()):
    if isinstance(x,dict):
        for k,v in x.items(): yield from walk(v,p+(k,))
    elif isinstance(x,list):
        for i,v in enumerate(x): yield from walk(v,p+(i,))
    else: yield p,x
def schema(a,b,p=()):
    assert type(a)==type(b),p
    if isinstance(a,dict):
        assert a.keys()==b.keys(),p
        for k in a:schema(a[k],b[k],p+(k,))
    elif isinstance(a,list):
        variable=p[:1]==('days',) and p[-1] in {'morning','evening'} or p[:1]==('characters',) and 'rel' in p
        if not variable:assert len(a)==len(b),p
        for i in range(min(len(a),len(b))):schema(a[i],b[i],p+(i,))
    elif p[-1] in {'id','who','spot','unlock','condition','note','hook','new'}:
        rewritten_speaker=p[-1]=='who' and ((p[0]=='days' and 'evening' in p) or (p[0]=='characters' and 'rel' in p))
        if not rewritten_speaker:assert a==b,p
schema(before,after)
assert after['proposals']==before['proposals']
speakers=set(after['characters'])|{'player'}
assert len(after['characters'])==12
assert sum(len(c['rel']) for c in after['characters'].values())==36
for k,c in after['characters'].items():
    assert set(c['rel'])=={'1','2','3'}
    for ep in c['rel'].values():
        assert len(ep)==6 and all(line['who'] in {k,'player'} for line in ep)
        assert [x['who'] for x in ep]==[k,'player']*3
    assert c['profile']['habit']==before['characters'][k]['profile']['habit']
    if k in after['visitors']:assert after['visitors'][k]['profile']==c['profile']
for day,v in after['days'].items():
    assert v['news']==before['days'][day]['news']
    assert v['actTransition']==before['days'][day]['actTransition']
    for typ in ['morning','evening']:
        assert all(x['who'] in speakers for x in v[typ])
        # Newly arriving co-workers retain original first-date visibility.
        assert all(int(day)>=threshold for who,threshold in [('danbi',4),('seoyun',10),('garam',11),('yunseo',12),('haru',8)] for x in v[typ] if x['who']==who)
for p,v in walk(after):
    if isinstance(v,str) and p[0]!='proposals' and p[-1] not in {'id','who','spot','unlock','note'}:
        assert v in md,(p,v)
        assert '\ufffd' not in v and '</script' not in v.lower()
assert after['achievements']==before['achievements'] and after['results']==before['results']
for k,v in after['departments'].items():
    for field in ['request','friend','news3','keepsake']:assert v[field]==before['departments'][k][field]
def split(s):
    a=s.index('const Narrative=')+len('const Narrative=');v,n=json.JSONDecoder().raw_decode(s[a:]);return s[:a],v,s[a+n:]
old_html=(OUT/'before_candidate.html').read_text(encoding='utf-8')
html=(HERE/'candidate/index.html').read_text(encoding='utf-8')
prefix,payload,suffix=split(old_html)
assert payload==before
expected=prefix+json.dumps(after,ensure_ascii=False,separators=(',',':'))+suffix
for p in json.loads((OUT/'html-patches.json').read_text(encoding='utf-8')):
    assert expected.count(p['before'])==p['count']
    expected=expected.replace(p['before'],p['after'])
assert expected==html,'Unexpected gameplay/storage/layout change'
# Deterministic introduction/payoff links in scenes seen regardless of relationship level.
arcs=[('2','7','설명 속도','설명','말할 틈'),
      ('6','14','엽서 답장','엽서','답장을 썼어요'),
      ('3','9','창구 휴식','목','맡아 줬더라고요'),
      ('8','13','협조 회신','답변','일정')]
for start,end,label,a,b in arcs:
    assert a in json.dumps(after['days'][start],ensure_ascii=False)
    assert b in json.dumps(after['days'][end],ensure_ascii=False)
counts=lambda x:{'morningLines':sum(len(v['morning']) for v in x['days'].values()),'eveningLines':sum(len(v['evening']) for v in x['days'].values()),'relationshipLines':sum(len(ep) for c in x['characters'].values() for ep in c['rel'].values())}
texts=[(p,v) for p,v in walk(after) if isinstance(v,str) and p[-1]=='line']
report={'status':'PASS','approvedChoices':['1B family/past/personal concerns','2A warm daily life and light humor','3B additional scenes'],
 'characters':12,'supportingContacts':11,'relationshipScenes':36,'before':counts(before),'after':counts(after),
 'dialogueCharactersMax':max(len(v) for p,v in texts),'candidateSha256':hashlib.sha256(html.encode('utf-8')).hexdigest(),
 'checked':['schema except approved dialogue lengths preserved','IDs/unlocks/conditions/visit dates/proposals preserved; dialogue speakers validated','15-day news and mechanics retained','all handbook text matches canonical data','arrival dates respected','4 daily introduction/payoff arcs','candidate only narrative payload plus existing profile text disclosure changed'],
 'limitations':['Mobile/browser text wrapping not tested','Not a full gameplay playthrough','Not publicly deployed']}
(OUT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
