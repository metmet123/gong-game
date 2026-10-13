from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
import json
root=Path(__file__).resolve().parent
data=json.loads((root/'research.json').read_text(encoding='utf-8'))
canvas=Image.new('RGB',(1200,640),'#1f2a1b');draw=ImageDraw.Draw(canvas)
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',18)
for i,g in enumerate(data['games']):
    x=i%3*400;y=i//3*320
    draw.rounded_rectangle((x+6,y+6,x+394,y+314),8,fill='#35442c')
    draw.text((x+18,y+18),f'{i+1:02}  {g["title"]}',font=font,fill='#f4eedb')
    img=Image.open(root/g['image']).convert('RGB')
    img=ImageOps.contain(img,(372,255))
    canvas.paste(img,(x+14+(372-img.width)//2,y+50+(255-img.height)//2))
canvas.save(root/'참고게임_화면모음.jpg')
print('Created contact sheet from six verified public screenshots.')
