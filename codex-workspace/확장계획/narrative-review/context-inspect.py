from pathlib import Path
import re
s=(Path(__file__).parent/'candidate/index.html').read_text(encoding='utf-8')
for term in ['const SENIOR','const MENUS','const FORECAST','function yesterdayResult','function friendship','friend[','function ending','ENDINGS','ACH_TEXT','const TOOLS','NEXT_QUARTER=','D.news={']:
    print('\nTERM',term)
    hits=list(re.finditer(re.escape(term),s))
    for m in hits[:6]:
        print(s[max(0,m.start()-100):m.start()+1300])
