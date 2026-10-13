from pathlib import Path
import base64
def build():
    root=Path(__file__).resolve().parent
    html=(root/'주민센터_두업무.html').read_text(encoding='utf-8')
    html=html.replace('<script>','<script>Object.defineProperty(navigator,"locks",{value:undefined});</script><script>',1)
    template=(root/'design/두업무_구현비교_shell.html').read_text(encoding='utf-8')
    assert template.count('__BASE64__')==1
    (root/'design/두업무_구현비교.html').write_text(template.replace('__BASE64__',base64.b64encode(html.encode()).decode()),encoding='utf-8')
if __name__=='__main__':build()
