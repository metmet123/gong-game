import urllib.request,json,concurrent.futures,pathlib
out=pathlib.Path('research_assets');out.mkdir(exist_ok=True)
ids=[239030,1924360,1166290,375820,1202900,448510]
def fetch(i):
    u=f'https://store.steampowered.com/api/appdetails?appids={i}&l=english'
    data=json.load(urllib.request.urlopen(u,timeout=35))[str(i)]['data']
    rec={'id':i,'name':data['name'],'url':f'https://store.steampowered.com/app/{i}/','developer':data['developers'],'images':[]}
    for n,shot in enumerate(data['screenshots'][:2]):
        url=shot['path_full'];p=out/f'{i}_{n}.jpg'
        p.write_bytes(urllib.request.urlopen(url,timeout=35).read());rec['images'].append({'path':str(p),'url':url})
    return rec
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex: data=list(ex.map(fetch,ids))
(out/'sources.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
for r in data: print(r['name'], [(x['path'],pathlib.Path(x['path']).stat().st_size) for x in r['images']])
from PIL import Image,ImageDraw
sheet=Image.new('RGB',(900,6*290),'#eee');draw=ImageDraw.Draw(sheet)
for k,r in enumerate(data):
    draw.text((10,k*290+5),r['name'],fill='black')
    for n,a in enumerate(r['images']):
        im=Image.open(a['path']);im.thumbnail((440,250));sheet.paste(im,(n*450,k*290+30))
sheet.save(out/'contact.jpg')
