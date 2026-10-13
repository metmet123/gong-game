"""Independent checks of planning witnesses, not production puzzle engines."""
from pathlib import Path
from itertools import permutations
from collections import Counter
import json
OUT=Path(__file__).resolve().parent
results=[]
def record(type_,difficulty,checks):
    assert all(checks.values()),(type_,difficulty,checks)
    results.append({'stageId':f'{type_}_{difficulty}01','status':'PASS','checks':checks})

# Conveyor witness graph: each edge/device is exactly the coordinate sequence in 05.
delta={'E':(1,0),'S':(0,1),'W':(-1,0),'N':(0,-1)}
def run_conveyor(devices,sinks,start,docs):
    output=[]
    for root,amount,approved in docs:
        pending=[(start,'original',frozenset())]; copied=False; steps=0
        while pending:
            pos,kind,stamps=pending.pop(0);steps+=1;assert steps<=300
            if pos in sinks:
                output.append((root,kind,sinks[pos],tuple(sorted(stamps))));continue
            dev=devices[pos];op=dev[0]
            if op=='copy':
                assert not copied and kind=='original';copied=True
                for newkind,d in [('copy',dev[1]),('original',dev[2])]:
                    dx,dy=delta[d];pending.append(((pos[0]+dx,pos[1]+dy),newkind,stamps))
                continue
            if op=='stamp':stamps=stamps|{dev[1]};d=dev[2]
            elif op=='approved':d=dev[1] if approved else dev[2]
            elif op=='ge100':d=dev[1] if amount>=100 else dev[2]
            else:d=dev[1]
            dx,dy=delta[d];pending.append(((pos[0]+dx,pos[1]+dy),kind,stamps))
    return output
rail=lambda d:('rail',d)
e={(1,1):rail('E'),(2,1):('stamp','chief','E'),(3,1):rail('E')}
record('conveyor','e',{'expected_output':run_conveyor(e,{(4,1):'out'},(1,1),[('A',50,True)])==[('A','original','out',('chief',))]})
n={(1,2):rail('E'),(2,2):('approved','E','S'),(3,2):rail('E'),(4,2):('stamp','chief','E'),(5,2):rail('E'),(2,3):rail('S'),**{(x,4):rail('E') for x in range(2,6)}}
record('conveyor','n',{'classification':run_conveyor(n,{(6,2):'accepted',(6,4):'supplement'},(1,2),[('A',50,True),('B',50,False)])==[('A','original','accepted',('chief',)),('B','original','supplement',())]})
h={(1,2):rail('E'),(2,2):('copy','E','S'),(3,2):('stamp','chief','E'),(4,2):('ge100','N','E'),(4,1):('stamp','boss','E'),(5,1):rail('E'),(6,1):rail('S'),(5,2):rail('E'),(6,2):rail('E'),(2,3):rail('S'),(2,4):rail('S'),**{(x,5):rail('E') for x in range(2,7)}}
h[4,5]=('stamp','record','E')
actual=run_conveyor(h,{(7,2):'accepted',(7,5):'records'},(1,2),[('A',100,True),('B',50,True)])
expected=[('A','original','records',('record',)),('A','copy','accepted',('boss','chief')),('B','original','records',('record',)),('B','copy','accepted',('chief',))]
record('conveyor','h',{'bag_and_stamps':Counter(actual)==Counter(expected)})

# Rules witnesses: allowed admission expression and locked upper conditions.
def weekday_rule(editable_day):
    out=[]
    for approved,amount in [(True,50),(False,50),(True,100)]:
        if not approved:out.append(('supplement',None))
        elif amount>=100:out.append(('boss','thu'))
        else:out.append(('chief',editable_day))
    return out
expected=[('chief','thu'),('supplement',None),('boss','thu')]
record('rules','e',{'original_wrong':weekday_rule('fri')!=expected,'edited_three_cases':weekday_rule('thu')==expected,'locked_boss_unchanged':weekday_rule('fri')[2]==weekday_rule('thu')[2]})
pre=[True,False,False,False];onsite=[False,True,False,True]
record('rules','n',{'OR_cases':[a or b for a,b in zip(pre,onsite)]==[True,True,False,True],'OR_commutative':all((a or b)==(b or a) for a,b in zip(pre,onsite))})
cases=[(True,False,False,50),(False,True,True,100),(False,False,True,50),(True,False,True,50),(True,False,True,100),(False,True,False,50)]
allow=[complete and (p or o) for p,o,complete,amount in cases]
actors=[('boss' if amount>=100 else 'chief') if ok else None for (*_,amount),ok in zip(cases,allow)]
record('rules','h',{'six_public_cases':allow==[False,True,False,True,True,False],'locked_priority':actors==[None,'boss',None,'chief','boss',None]})

record('macro','e',{'sum300':sum([100,200])==300,'sum100':sum([70,30])==100})
data=[('A',100,True),('B',250,True),('A',100,True),('C',500,False)]
def sum_unique(rows):return sum(amount for _,amount,approved in dict((x[0],x) for x in rows).values() if approved)
record('macro','n',{'350':sum_unique(data)==350,'empty0':sum_unique([])==0,'alternate100':sum_unique([('X',70,True),('Y',30,True),('X',70,True)])==100})
record('macro','h',{'boss100_150':[x for x in [99,100,150] if x>=100]==[100,150],'chief99':[x for x in [99,100,150] if x<100]==[99],'boundary98_100_101':[x>=100 for x in [98,100,101]]==[False,True,True]})

e=[x for x in permutations(['red','blue','green']) if x[0] not in ['red','green'] and x[1]=='red']
n=[x for x in permutations([9,10,11,12]) if x[1]==11 and x[0]==x[1]-1 and x[2]==12 and x[3]!=10]
h=[x for x in permutations([9,10,11,13,14]) if x[1]==11 and x[0]==10 and x[2]==14 and x[3]==9 and x[4]>11]
record('owner','e',{'unique':e==[('blue','red','green')]})
record('owner','n',{'unique':n==[(10,11,12,9)]})
record('owner','h',{'unique':h==[(10,11,14,9,13)]})

def schedule_valid(steps,available,cap,deadline):
    counts=Counter()
    for doc,byactor in steps.items():
        previous=-1
        for actor,day in byactor:
            if day not in available[actor] or day<=previous or day>deadline:return False
            counts[actor,day]+=1;previous=day
    return all(v<=cap for v in counts.values())
record('approval','e',{'witness':schedule_valid({'A':[('chief',0),('boss',1)]},{'chief':[0,1],'boss':[1,2]},1,2),'alternate':schedule_valid({'A':[('chief',1),('boss',2)]},{'chief':[0,1],'boss':[1,2]},1,2)})
av={'chief':[0,1],'account':[1,2],'boss':[3,4]}
record('approval','n',{'witness':schedule_valid({d:[('chief',0),('account',1),('boss',3)] for d in 'AB'},av,2,4),'alternate':schedule_valid({d:[('chief',0),('account',1),('boss',4)] for d in 'AB'},av,2,4)})
record('approval','h',{'witness':schedule_valid({'A':[('chief',0),('account',1),('boss',3)],'B':[('chief',0),('account',1),('boss',3)],'C':[('chief',1),('account',2),('boss',4)]},av,2,4)})

def push_witness(board,moves,labels=None):
    walls=set();boxes={};goals=set();player=None
    for y,row in enumerate(board):
        for x,c in enumerate(row):
            if c=='#':walls.add((x,y))
            if c=='$':boxes[x,y]=(labels or {}).get((x,y),'any')
            if c=='G':goals.add((x,y))
            if c=='@':player=(x,y)
    pushes=0
    for d in moves:
        dx,dy={'R':(1,0),'L':(-1,0),'U':(0,-1),'D':(0,1)}[d]
        target=(player[0]+dx,player[1]+dy);assert target not in walls
        if target in boxes:
            nxt=(target[0]+dx,target[1]+dy);assert nxt not in walls|boxes.keys()
            boxes[nxt]=boxes.pop(target);pushes+=1
        player=target
    return set(boxes)==goals,pushes,boxes
e=push_witness(['#####','#...#','#@$.#','#..G#','#####'],'RURD')
n=push_witness(['######','#@...#','#.$.G#','#.$.G#','######'],'DRRLLDRR')
h=push_witness(['#######','#.....#','#.@$..#','#..$GG#','#.....#','#######'],'DRRLLURURD',{(3,3):2025,(3,2):2024})
record('archive','e',{'goals':e[0],'push2':e[1]==2})
record('archive','n',{'goals':n[0],'push4':n[1]==4})
record('archive','h',{'goals':h[0],'push4':h[1]==4,'year2025':h[2][5,3]==2025,'year2024':h[2][4,3]==2024})

def budget_check(months,placements,caps,qcaps):
    occupied=set();monthly=[0]*months
    for start,row,width,height in placements:
        for m in range(start-1,start-1+width):
            assert 0<=m<months
            monthly[m]+=height
            for y in range(row,row+height):
                assert (m,y) not in occupied;occupied.add((m,y))
    quarterly=[sum(monthly[i:i+3]) for i in range(0,months,3)]
    return all(x<=caps for x in monthly) and all(x<=cap for x,cap in zip(quarterly,qcaps)),quarterly
record('budget','e',{'witness':budget_check(4,[(1,0,2,1),(3,0,1,1)],2,[3,2])[0],'alternate':budget_check(4,[(2,0,2,1),(1,0,1,1)],2,[3,2])[0]})
n=budget_check(6,[(1,0,3,1),(4,0,2,1),(6,0,1,2)],2,[5,5])
record('budget','n',{'witness':n[0],'q3_4':n[1]==[3,4],'alternate':budget_check(6,[(1,0,3,1),(2,1,2,1),(6,0,1,2)],2,[5,5])[0]})
h=budget_check(12,[(1,0,3,1),(4,0,2,1),(7,0,3,1),(10,0,2,1),(6,0,1,2),(12,0,1,2)],2,[5,4,5,4])
record('budget','h',{'witness':h[0],'q3_4_3_4':h[1]==[3,4,3,4],'precedence':3<4 and 9<10})

cards={'G':(2,['goal']),'P':(1,['period']),'B':(1,['budget']),'R':(2,['risk']),'O':(1,['owner']),'D':(2,['decision']),'GP':(2,['goal','period']),'BR':(2,['budget','risk']),'OD':(2,['owner','decision']),'GPB':(3,['goal','period','budget']),'RO':(2,['risk','owner']),'Dshort':(1,['decision'])}
def brief(order,required,cap):
    cost=sum(cards[c][0] for c in order);facts=[f for c in order for f in cards[c][1]]
    return cost<=cap and set(required)<=set(facts),facts
record('brief','e',{'plain':brief(['G','P','B'],['goal','period','budget'],4)[0],'short':brief(['GP','B'],['goal','period','budget'],4)[0]})
record('brief','n',{'summary1':brief(['GP','B','R'],['goal','period','budget','risk'],5)[0],'summary2':brief(['G','P','BR'],['goal','period','budget','risk'],5)[0]})
one,f1=brief(['GP','BR','OD'],['goal','period','budget','risk','owner','decision'],6)
two,f2=brief(['GPB','RO','Dshort'],['goal','period','budget','risk','owner','decision'],6)
record('brief','h',{'summary1':one,'summary2':two,'fact_order1':f1.index('goal')<f1.index('budget') and f1[-1]=='decision','fact_order2':f2.index('goal')<f2.index('budget') and f2[-1]=='decision'})

assert len(results)==24
report={'date':'2026-10-10','status':'PASS','count':24,'scope':'Independent arithmetic/constraint/witness checks of 05 planning examples. Not new game engines or UI tests. Production stage evaluation and authored 72-level validation remain planned.','examples':results}
(OUT/'example_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: 24 planning witnesses; production puzzle engines and Android remain unverified.')
