from pathlib import Path
from urllib.request import Request, urlopen
import concurrent.futures, json, re
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parent
assets = root / 'images'
assets.mkdir(exist_ok=True)
def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30) as response:
        return response.read()

games = [('operator',1771980),('orwell',491950),('horticulture',1574580),('roottrees',2754380)]
def steam(item):
    slug, appid = item
    data = json.loads(fetch(f'https://store.steampowered.com/api/appdetails?appids={appid}&l=english'))[str(appid)]['data']
    results=[]
    for i, screen in enumerate(data['screenshots'][:3]):
        url=screen['path_full']
        file=f'{slug}-{i}.jpg'
        (assets / file).write_bytes(fetch(url))
        results.append({'file':'images/'+file,'url':url,'source':f'https://store.steampowered.com/app/{appid}/','kind':'developer-published Steam screenshot'})
    return {'id':slug,'name':data['name'],'screenshots':results}
records=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(steam,games): records.append(result)
(root/'asset_sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
sheet=Image.new('RGB',(960,4*220),'#24321e');draw=ImageDraw.Draw(sheet)
for row,record in enumerate(records[:4]):
    for col,s in enumerate(record['screenshots']):
        img=Image.open(root/s['file']).convert('RGB')
        img=ImageOps.contain(img,(308,185))
        sheet.paste(img,(col*320+6,row*220+22))
        draw.text((col*320+8,row*220+3),s['file'],fill='white')
sheet.save(root/'asset-contact.jpg')
print(json.dumps({'downloaded':12,'next':'Run collect_creator_assets.py to add creator images.'},ensure_ascii=False))
