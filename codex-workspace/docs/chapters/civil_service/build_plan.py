"""Generate and statically validate planning artifacts. Does not build the game."""
import html
import json
import re
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATE = "2026-10-11"


def save_json(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


source_rows = [
    ("S01", "대전 서구 2026 주요업무계획", "https://clik.nanet.go.kr/clikr-collection/bill/042004/9/2026/CLIKC9769943775258170_1.pdf", "2026", "인쇄 52쪽 / PDF 54페이지", "민원편의 기능, 우선배려창구, 기록 이관과 사전공개 자료 현행화 계획", "맵의 대기·기록 구역, 공개 목록 갱신 사건", "업무계획의 추진 항목이다. 완료 실적이나 전국 공통 운영으로 해석하지 않는다."),
    ("S02", "구미시의회 2025 행정사무감사 결과보고서 · 기획행정위원회", "https://clik.nanet.go.kr/clikr-collection/bill/054005/9/2025/CLIKC1455081685519566_2.pdf", "2025", "인쇄 42쪽 / PDF 43페이지 / 항목 153", "여권 창구 대기 불편 지적과 예약·키오스크 등 개선 권고", "반복 방문과 안내 개선을 조사하는 창작 사건의 배경", "특정 기관 감사 지적이며 게임 주민·문서·원인·해결은 창작이다."),
    ("S03", "서대문구 종합 민원실 안내", "https://www.sdm.go.kr/civil/kind/info.do", None, "본문 민원실 업무 및 연장 운영 안내", "증명 발급, 가족관계 신고, 여권 접수·교부 및 일부 업무의 연장 운영", "접수·교부 분리, 가족관계 후속 안내, 제한된 야간 창구", "해당 기관 운영 안내다. 게임 내 요일·창구·조건은 가상값으로 작성한다."),
    ("S04", "외교부 여권 최초 발급 안내", "https://passport.go.kr/home/kor/contents.do?menuPos=2", None, "공통 구비 서류와 공동이용 확인 안내", "신청서·신분증·사진 등의 자료, 공동이용 확인에 따른 일부 제출 생략", "가상 접수자료와 확인표 대조", "최초·재발급·미성년 등 모든 신청에 동일 조건을 적용하지 않는다."),
    ("S05", "외교부 온라인 여권 사진 안내 본문", "https://passport.go.kr/home/kor/onlinePhotoVerify/index.do?menuPos=35", None, "본문 사진 규격과 온라인 확인 주의사항", "사진의 배경·품질·얼굴 방향 등 조건과 온라인 확인의 한계", "선언된 속성이 있는 가상 그림 카드의 보완 사유 선택", "온라인 확인은 실제 접수 적합성을 보장하지 않는다. 실제 사진과 이미지를 복제하지 않는다."),
    ("S06", "금천구 정보공개 업무처리절차", "https://www.geumcheon.go.kr/portal/contents.do?key=248", None, "접수·이송·처리·통지 흐름 본문", "접수창구와 정보 보유·처리부서 분리, 이송과 검토 및 통지", "문서 보유부서 확인과 전문 담당자 협조", "접수 담당의 단독 결정으로 각색하지 않는다. 최신 법정 기한을 확인한 자료로 취급하지 않는다."),
    ("S07", "서울시 2023 정보공개 업무 매뉴얼", "https://tbs.seoul.kr/common/images/info/info-guide_seoul_2023.pdf", "2023", "인쇄 176쪽 / PDF 182페이지", "민원 회신문서의 개인 식별 부분을 제외한 공개 권고 사례", "필수 정보를 유지하고 검토표에 지정된 보호 부분만 가리는 퍼즐", "2023 사례집이다. 2026년 현행 법령 또는 모든 이름의 비공개 규칙으로 사용하지 않는다."),
]
sources = []
for sid, title, url, year, location, evidence, use, limitation in source_rows:
    sources.append(dict(id=sid, title=title, url=url, publicationYear=year,
                        checkedAt=DATE, verification="body_read", locator=location,
                        evidenceSummary=evidence, proposedAdaptation=use, limitations=[limitation],
                        quotation=None, imageReuse=False,
                        pdfVisualCheck="not_completed" if url.endswith(".pdf") else "not_applicable"))
sources.append(dict(id="S08", title="구리시 시민의 소리 · 여권 창구 응대 관련 검색 후보",
                    url="https://guri.go.kr/mayor/selectBbsNttView.do?bbsNo=482&integrDeptCode=&key=1165&nttNo=108476&pageIndex=368&searchCnd=SJ&searchCtgry=&searchKrwd=",
                    checkedAt=DATE, verification="search_snippet_only", publicationYear=None,
                    evidenceSummary="검색 결과에 응대 불편과 답변이 나타났으나 원문 재열람에 실패했다.",
                    proposedAdaptation=None, limitations=["날짜·개별 민원 사실·원문 표현을 확인한 출처로 인용하지 않는다."],
                    quotation=None, imageReuse=False))
save_json("sources.json", {"checkedAt": DATE, "verifiedBodyCount": 7, "candidateCount": 1,
                          "realDisclosureRequestSubmitted": False, "sources": sources})

# Coordinates are proposed tile units, not pixels or deployed renderer coordinates.
objects_raw = [
    ("안내대", 1,8,3,1,2,9,"Z01"), ("번호표",5,8,1,1,5,9,"Z01"),
    ("무인발급기",20,9,2,2,19,10,"Z07"), ("서식대",8,8,3,1,9,9,"Z01"),
    ("증명 창구",1,6,3,1,2,7,"Z02"), ("여권 접수",5,6,3,1,6,7,"Z03"),
    ("가족관계 창구",9,6,3,1,10,7,"Z04"), ("공개 접수",14,6,3,1,15,7,"Z05"),
    ("여권 교부",18,6,3,1,19,7,"Z03"), ("주인공 책상",1,2,3,2,2,4,"Z02"),
    ("여권 책상",5,2,3,2,6,4,"Z03"), ("가족관계 책상",9,2,3,2,10,4,"Z04"),
    ("공개 검토",14,2,3,2,15,4,"Z05"), ("팀장석",9,0,3,1,10,1,"Z08"),
    ("인계함",5,0,2,1,6,1,"Z08"), ("자료장 A",18,1,2,1,19,2,"Z06"),
    ("자료장 B",21,1,2,1,22,2,"Z06"), ("열람 작업대",19,3,3,1,20,4,"Z06"),
    ("출력기",1,0,1,1,1,1,"Z08"), ("파쇄기",3,0,1,1,3,1,"Z08"),
    ("대기석 A",1,11,3,1,2,10,"Z07"), ("대기석 B",5,11,3,1,6,10,"Z07"),
    ("대기석 C",1,14,3,1,2,13,"Z07"), ("대기석 D",5,14,3,1,6,13,"Z07"),
    ("배려 대기 공간",9,11,2,2,10,13,"Z07"), ("상담석",14,10,3,2,15,12,"Z07"),
    ("전시대",14,14,3,1,15,13,"Z07"), ("급수대",21,14,1,1,20,14,"Z08"),
    ("출입구",10,17,4,1,12,16,"Z08"), ("게시판",18,14,2,1,19,13,"Z08"),
]
zone_names = ["접수 안내", "통합 증명", "여권 접수와 교부", "가족관계", "정보공개", "기록", "대기와 상담", "직원 지원과 출입"]
zones = [{"id":f"Z{i+1:02}", "name":name} for i,name in enumerate(zone_names)]
objects = []
for i, (name,x,y,w,h,ax,ay,zone) in enumerate(objects_raw,1):
    objects.append(dict(id=f"c{i:02}", label=name, zone=zone,
                        footprint=dict(x=x,y=y,width=w,height=h),
                        blocking=i not in (25,29), interactionCell=[ax,ay],
                        role="public_fixture", personalShopItem=False))
for zone in zones:
    zone["objectIds"] = [o["id"] for o in objects if o["zone"]==zone["id"]]
map_data = dict(schemaVersion=1, status="planned", id="cs.civil_hall", width=24,height=18,
                coordinateOrigin="zero_based_top_left", spawn=[12,16], centralAisleColumns=[12,13],
                walls=[[17,y] for y in range(5)], objects=objects, zones=zones,
                visitors=dict(mode="reserved_positions", staffAreaExcluded=True,
                              note="실제 주민 이동은 구현 시 검증"),
                visualChanges=[dict(day=3,id="revised_notice"),dict(day=6,id="evening_lights"),
                               dict(day=9,id="public_display"),dict(day=10,id="handoff_box")])
map_data["visitors"]["note"] = "주민 위치는 예약 배치한다. 직원 구역 제외와 별도 접근점은 실제 renderer에서 검증한다."
save_json("map_layout.json", map_data)

titles = [
    "새 창구의 첫 인사", "번호표보다 먼저 물을 것", "같은 설명이 닿도록", "사진 한 장의 기준", "접수 뒤의 안내",
    "불이 조금 늦게 꺼지는 날", "자료를 찾는 사람들", "함께 확인한 답변", "벽에 걸린 변화", "다음 창구로 가져갈 것"]
task_titles = [
    ["이다정 목적과 창구 안내","신청자료와 원문 대조","최신 안내문 취합","요청 내용 인계"],
    ["교부 봉투 주인","옛 안내 규칙 수정","부서 확인 일정","진해솔 접수자료"],
    ["수정 안내문 배포","이다정용 안내문","창구 간 연결 재확인","편의시설 보고서 공개 범위"],
    ["진해솔 사진 카드","교부 대상 구분","홍서우 신고 조건","접수·후속 확인 일정"],
    ["홍서우 후속 기관","후속 절차 한 장","공동이용 확인자료","사전공개 목록 검토"],
    ["여권 교부 대상","교부 기록 대조","야간 창구 시간 배치","수령 방법 안내"],
    ["이름만 가리면 될까요","백단비 협조자료","자료 보유 부서 규칙","검토 요청"],
    ["공개·건의 항목 구분","처리부서 협의 일정","자료 누락 대조","유사 요청 자료 주인"],
    ["재검토 공개본","사전공개 목록 갱신","최종 버전 자료 취합","개선 결과보고"],
    ["홍서우 주민센터 안내","인계용 문서 공개 범위","인수인계 일정","근무 기록 한 장"]]
types = ["route compare sort brief", "owner rules approval compare", "sort brief route disclosure",
         "compare owner rules approval", "route brief sort disclosure", "owner compare approval brief",
         "disclosure sort rules brief", "route approval compare owner", "disclosure rules sort brief",
         "route disclosure approval brief"]
events_by_task = [["E01"]*4, ["E02","E01","E01","E02"], ["E01"]*3+["E04"],
                  ["E02","E02","E03","E03"], ["E03"]*3+["E04"], ["E02"]*4,
                  ["E04"]*4,["E04"]*4,["E04"]*4,["E03","E04",None,None]]
sources_by_event = {"E01":["S02","S03"],"E02":["S03","S04","S05"],"E03":["S03"],"E04":["S01","S06","S07"]}
zone_by_type = dict(route="Z01",compare="Z02",sort="Z06",brief="Z02",owner="Z03",rules="Z02",approval="Z08",disclosure="Z05")
engine_design = {
    "route":dict(surface="접수 티켓",input="목적 카드·기관 역할표",action="담당/처리 항목 선택",check="필수 목적과 관할·처리 항목 제약",difficulty="단일 목적 / 연결2곳 / 청구와 건의 분리"),
    "compare":dict(surface="두 서류",input="기준표·원문·신청안",action="다른 칸과 보완 사유 표시",check="불일치 집합과 사유 일치",difficulty="항목4 / 6 / 8"),
    "sort":dict(surface="자료함",input="연도·버전·확정 여부·문서종류",action="자료 묶음 선택",check="필수 문서 집합, 구버전 제외",difficulty="자료5·필수2 / 자료7·필수3 / 자료9·필수4"),
    "owner":dict(surface="교부 봉투",input="가상 접수번호·수령 방식·이름 단서",action="봉투 일대일 배정",check="모든 단서 동시 충족과 유일해",difficulty="3 / 4 / 5명"),
    "rules":dict(surface="안내 편집",input="잠긴 확인조건·편집 슬롯·사례",action="허용 카드 교체",check="잠금 유지, 사례 전체 충족",difficulty="1슬롯 / OR조건 / 예외와 우선순위"),
    "approval":dict(surface="협조 달력",input="가능일·처리단계·담당자 용량",action="날짜 배치",check="선행·마감·용량, 동등해 허용",difficulty="1 / 2 / 3자료"),
    "brief":dict(surface="회신문 초안",input="사실·보완·방법 카드",action="선택·결합·순서 변경",check="필수 사실·출처·분량·순서",difficulty="필수3 / 4 / 6"),
    "disclosure":dict(surface="공개 검토표",input="문서의 의미 단위·검토 회신",action="보임/가림/미검토와 이유 선택",check="보호 부분, 필수 사실과 요청 문서",difficulty="보호1 / 문맥 식별 / 여러 문서와 누락")}
engine_design["route"]["surface"] = "접수 티켓"
days = []
relation_default=dict(route="cs.dohyun",compare="cs.dohyun",sort="cs.ian",brief="cs.dohyun",owner="cs.serin",rules="cs.dohyun",approval="cs.yujin",disclosure="cs.ian")
for d in range(1,11):
    rows=[]
    for i,puzzle in enumerate(types[d-1].split(),1):
        event=events_by_task[d-1][i-1]
        relation=relation_default[puzzle]
        if event=="E03": relation="cs.eungyeol"
        if event=="E02" and puzzle=="compare": relation="cs.serin"
        if (d,i) in ((1,4),(10,4)): relation="cs.yujin"
        zone=zone_by_type[puzzle]
        if event=="E03" and puzzle not in ("route","sort","approval"): zone="Z04"
        if event=="E02" and puzzle in ("compare","brief"): zone="Z03"
        rows.append(dict(id=f"cs.d{d:02}.t{i}",title=task_titles[d-1][i-1],puzzleType=puzzle,
                         eventId=event,zone=zone,relationCharacter=relation,
                         sourceIds=sources_by_event[event] if event else ["S01","S03"],
                         status="planned",mvp=d<=3,stageVariants=["easy"] if d<=3 else [],
                         fullReleaseVariants=["easy","normal","hard"],contentVersion="cs-plan-1",
                         callbackOnce=f"task:cs:d{d:02}:t{i}"))
    days.append(dict(day=d,newsTitle=titles[d-1],tasks=rows,closeRewardOnce=f"close:cs:d{d:02}"))
colleagues = [
    ("cs.yujin","서유진","민원행정팀장",True), ("cs.dohyun","문도현","통합 증명 담당",True),
    ("cs.serin","오세린","여권 담당",True), ("cs.eungyeol","고은결","가족관계 담당",False),
    ("cs.ian","정이안","기록과 공개 지원",False)]
visitors = [("cs.dajeong","이다정",[1,2,3,9]),("cs.haesol","진해솔",[2,4,6]),
            ("cs.seowoo","홍서우",[4,5,10]),("cs.hanbit","배한빛",[7,8,9])]
events = [
    dict(id="E01",title="세 번째 방문",days=[1,2,3],sourceIds=sources_by_event["E01"],
         goal="목적을 확인하고 구 안내문을 수정해 반복 방문을 줄인다.",
         resolution="3일 이다정 접수 안내 완료, 수정 안내문 배포",mapEffect="revised_notice",gift="P06"),
    dict(id="E02",title="출발 전에 한 번 더",days=[2,4,6],sourceIds=sources_by_event["E02"],
         goal="여권 접수·사진 보완·수령을 구분해 안내한다.",resolution="6일 교부 대상·방법 확인",gift="P07"),
    dict(id="E03",title="신고 뒤에 남는 안내",days=[4,5,10],sourceIds=sources_by_event["E03"],
         goal="신고를 확인한 뒤 주소 변경의 후속 기관을 안내한다.",resolution="10일 주민센터 인계",gift="P12"),
    dict(id="E04",title="어디까지 보여드릴까요",days=[3,5,7,8,9,10],sourceIds=sources_by_event["E04"],
         goal="보유 자료를 찾고 검토 회신에 따라 공개 사본을 만든다.",
         resolution="9일 개선 결과 전시, 10일 인계용 자료 점검",mapEffect="public_display")]
item_rows=[
    ("P01","새 창구 명패",0,1,"arrival","desk"),("P02","나소라의 작은 메모",0,0,"transfer","wall"),
    ("P03","창구 펜꽂이",30,1,"shop","desk"),("P04","안내 카드 받침",40,2,"shop","desk"),
    ("P05","접수 봉투 트레이",50,3,"shop","desk"),("P06","고친 안내문 액자",0,3,"E01","wall"),
    ("P07","파란 여권 모형",0,6,"E02","desk"),("P08","작은 순번 표시등",60,4,"shop","desk"),
    ("P09","민원실 갤러리 사진",70,6,"shop","wall"),("P10","공개 자료 책받침",80,7,"shop","desk"),
    ("P11","창구 팀의 사진",0,10,"ending","wall"),("P12","주민센터 길 안내 지도",0,10,"E03","wall")]
items=[dict(id=i,name=n,priceP=p,unlockDay=d,acquire=a,slot=s,mvp=int(i[1:])<=6,
            onceKey=f"purchase:cs:{i}" if a=="shop" else f"gift:cs:{i}") for i,n,p,d,a,s in item_rows]
tools=[dict(id=i,name=n,free=True,effect=e) for i,n,e in
       [("cs.checklist","체크판","대조 행 강조"),("cs.index","접수 색인","자료 정렬"),
        ("cs.marker","검토 표시자","확인 위치 표시"),("cs.handoff","인계 노트","처리 항목 목록 유지")]]
example_tokens=[
    dict(id="purpose",text="창구 안내를 더 쉽게 만들기 위한 안내 카드 제작",factId="improvement_purpose",policy="show",allowedReasons=[]),
    dict(id="amount",text="제작비 120P",factId="cost",policy="show",allowedReasons=[]),
    dict(id="role",text="업무 담당: 안내 개선 담당",factId="official_role",policy="show",allowedReasons=[]),
    dict(id="contact",text="개인의 연락처: 가상 연락처 A",factId="private_contact",policy="hide",allowedReasons=["private_contact"])]
example=dict(id="cs.disclosure.e01",status="planned_fixture",difficulty="easy",contentVersion="cs-plan-1",
             publicRules=["개선 목적과 지출 금액, 업무 담당 직위는 남긴다.","개인의 연락처는 검토 회신에 따라 가린다."],
             goals=["요청된 문서와 필수 사실을 유지한 공개 사본을 만든다.","검토표의 보호 부분만 올바른 사유로 가린다."],
             input=dict(documents=[dict(id="improvement_report",title="모서리구청 안내 개선 보고 · 가상 자료",tokens=example_tokens)]),
             constraints=dict(documentIds=["improvement_report"],requiredFacts=["improvement_purpose","cost","official_role"]),
             initialDraft=dict(documentIds=["improvement_report"],tokenStates={t["id"]:"unreviewed" for t in example_tokens},reasonByToken={}),
             witness=dict(documentIds=["improvement_report"],tokenStates={t["id"]:t["policy"] for t in example_tokens},reasonByToken={"contact":"private_contact"}),
             hintSteps=["공개 검토표에서 남겨야 할 항목을 확인한다.","개인의 연락처를 가리는 기준을 확인한다.","목적·금액·직위는 보이고 연락처만 가린다."],
             sourceIds=["S07"],moneyIsFictional=True)
plan=dict(schemaVersion=1,id="civil_service",shortId="cs",status="planned",version="1.0",date=DATE,
          title="민원봉사과 · 같은 설명이 닿도록",designPremise="반복 방문의 원인을 찾아 안내와 자료 전달을 개선하는 10일",
          map="map_layout.json",sources="sources.json",implementationTasks="tasks.json",
          quantity=dict(days=10,mandatoryContexts=40,plannedFullVariants=120,mvpDays=3,mvpEasyStages=12,
                        puzzleTypes=8,newEngines=1,mapObjects=30,mapZones=8,colleagues=5,visitors=4,
                        majorEvents=4,personalItems=12,freeTools=4,relationshipScenes=15,optionalScenes=6),
          transfer=dict(fromChapter="life_support",toChapter="civil_service",fromIdStatus="resolve_against_latest_source",
                        trigger="previous_chapter_summary",commit="confirmed_next_workday_start",testSaveKey="new_key_required"),
          colleagues=[dict(id=i,name=n,role=r,mvpDialogue=m,relationshipThresholds=[1,3,5]) for i,n,r,m in colleagues],
          visitors=[dict(id=i,name=n,appearanceDays=d,mvpDialogue=i in ("cs.dajeong","cs.haesol")) for i,n,d in visitors],
          legacyCameos=[dict(name="나소라",days=[0,5]),dict(name="연미루",days=[1]),dict(name="백단비",days=[7]),dict(name="임하루",days=[2,8])],
          days=days,events=events,puzzleAdapters=engine_design,disclosureExample=example,items=items,tools=tools,
          optionalScenes=[dict(id=f"cs.optional.{i:02}",title=n,day=d,blocksProgress=False,repeatedCurrency=False)
                          for i,(n,d) in enumerate([( "큰 글씨 안내문",1),("펜꽂이 정리",2),("기기 도움 요청",4),
                                                    ("창구 사진첩",5),("동료의 늦은 간식",6),("백단비의 기록물 농담",7)],1)],
          economy=dict(status="proposal_pending_live_source_audit",perTaskP=20,perTaskXP=15,perDayP=15,
                       fullIncomeP=950,fullShopCostP=330,fullNetP=620,mvpIncomeP=285,mvpShopCostP=120,mvpNetP=165),
          contentContract=["publicRules","input","goals","constraints","initialDraft","hintSteps","witness","contentVersion"],
          disclosureReasonCodes=["unknownToken","unreviewed","protectedVisible","requiredFactHidden","wrongReason","missingDocument"],
          implementationVerified=False)
save_json("chapter_plan.json",plan)

md=(ROOT / "민원봉사과_챕터_개발계획.md").read_text(encoding="utf-8")
task_section=md.split("## 13 ",1)[1].split("## 14 ",1)[0]
dev_tasks=[]
for line in task_section.splitlines():
    if re.match(r"\|CS\d{2}\|",line):
        tid,title,deps,acceptance=line.strip("|").split("|")
        dev_tasks.append(dict(id=tid,title=title,dependsOn=[] if deps=="없음" else deps.split(","),
                              acceptance=acceptance,status="planned",release="audit" if tid=="CS00" else "mvp" if int(tid[2:])<=11 else "full"))
save_json("tasks.json",dict(status="planned",tasks=dev_tasks))

# Static plan validation, not renderer, engine or save validation.
assert len(days)==10 and all(len(d["tasks"])==4 for d in days)
flat=[t for d in days for t in d["tasks"]]
assert len(flat)==len({t["id"] for t in flat})==40
assert len([t for t in flat if t["mvp"]])==12
assert sum(len(t["fullReleaseVariants"]) for t in flat)==120
assert len({t["puzzleType"] for t in flat})==8
verified={s["id"] for s in sources if s["verification"]=="body_read"}
assert all(set(t["sourceIds"])<=verified for t in flat)
assert len(items)==12 and sum(i["priceP"] for i in items)==330
assert len([i for i in items if i["mvp"]])==6
assert sum(i["priceP"] for i in items if i["mvp"])==120
assert 40*20+10*15==950 and 12*20+3*15==285
assert 950-330==620 and 285-120==165
assert len(dev_tasks)==18 and len({t["id"] for t in dev_tasks})==18
seen=set()
for t in dev_tasks:
    assert set(t["dependsOn"])<=seen, "dependency order or reference error"
    seen.add(t["id"])
assert all(t["zone"] in {z["id"] for z in zones} for t in flat)
assert all(t["eventId"] is None or t["eventId"] in {e["id"] for e in events} for t in flat)
relation_counts={i:sum(t["relationCharacter"]==i for t in flat) for i,_,_,_ in colleagues}
assert all(v>=5 for v in relation_counts.values()), relation_counts
blocked={tuple(c) for c in map_data["walls"]}
occupied=set()
for obj in objects:
    f=obj["footprint"]
    cells={(x,y) for x in range(f["x"],f["x"]+f["width"]) for y in range(f["y"],f["y"]+f["height"])}
    assert all(0<=x<24 and 0<=y<18 for x,y in cells)
    assert not (cells & occupied),obj["id"]
    occupied |= cells
    if obj["blocking"]:
        assert not cells & blocked,obj["id"]
        blocked |= cells
    ax,ay=obj["interactionCell"]
    assert (ax,ay) not in cells
    assert min(abs(ax-x)+abs(ay-y) for x,y in cells)==1,obj["id"]
assert all((x,y) not in blocked for x in (12,13) for y in range(18))
start=tuple(map_data["spawn"])
reached={start};queue=deque([start])
while queue:
    x,y=queue.popleft()
    for n in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
        if 0<=n[0]<24 and 0<=n[1]<18 and n not in blocked and n not in reached:
            reached.add(n);queue.append(n)
assert all(tuple(o["interactionCell"]) in reached for o in objects)
assert len({o["id"] for o in objects})==30 and len(zones)==8
assert set(example["witness"]["tokenStates"])=={t["id"] for t in example_tokens}
assert all(example["witness"]["tokenStates"][t["id"]]==t["policy"] for t in example_tokens)
assert set(example["constraints"]["requiredFacts"]) <= {t["factId"] for t in example_tokens if t["policy"]=="show"}
assert all(example["witness"]["reasonByToken"].get(t["id"]) in t["allowedReasons"] for t in example_tokens if t["policy"]=="hide")
validation=dict(date=DATE,status="static_plan_passed",gameTestsRun=False,htmlRenderingVerified=False,
                scope="계획 파일의 수량·참조·의존·경제와 가상의 격자 배치 검증",
                checks=dict(mandatoryContexts=40,mvpEasyContexts=12,plannedVariants=120,
                            sourceReferences="body_read_only",taskDependencies="acyclic_ordered",
                            itemCount=12,shopCostP=330,mapObjects=30,mapZones=8,
                            mapBounds="passed",mapOverlap="passed",centralAisle="clear",
                            adjacentInteractionCells=30,reachableInteractionCells=30,
                            relationUniqueTaskCounts=relation_counts,examplePolicyConsistency="passed"),
                notVerified=["배포본 최신 소스·저장 구조","실제 renderer·이동·카메라","퍼즐 엔진과 120문항 해 존재",
                             "발령·보상 원자성","게임 모바일·Android","PDF 원문 이미지 시각 확인"],
                fixtureContract="대표 예제의 필드와 witness 일관성만 검사; 실제 disclosure 엔진을 실행한 결과가 아님")
save_json("validation.json",validation)

# Engineering placement drawing; numbered fixtures correspond to the JSON IDs.
colors=["#e7c66f","#82b3dd","#84c9c1","#dba4ad","#aea7dd","#c9af8c","#b5c69b","#aeb8c6"]
cell=30;ox=24;oy=90;mw=24*cell;mh=18*cell
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="700" viewBox="0 0 1050 700" role="img" aria-labelledby="title desc">',
     '<title id="title">민원봉사과 24×18 배치 계획</title><desc id="desc">직원 책상은 위쪽, 창구는 가운데, 대기실은 아래쪽. 중앙 두 열은 주 통로이며 오른쪽 후면은 기록 구역이다. 물품 번호와 접근점은 map_layout.json에 대응한다.</desc>',
     '<style>text{font-family:Segoe UI,Malgun Gothic,sans-serif;fill:#233246}.num{font-size:13px;font-weight:700}.legend{font-size:12px}.small{font-size:11px;fill:#536176}</style>',
     '<rect width="1050" height="700" fill="#f8fafc"/>',
     '<text x="24" y="32" font-size="23" font-weight="700">민원봉사과 · 배치 계획</text>',
     '<text x="24" y="57" font-size="13">계획안 / 0부터 세는 타일 좌표 / 번호는 c01~c30 / 초록 점은 주인공 접근점</text>',
     f'<rect x="{ox}" y="{oy}" width="{mw}" height="{mh}" fill="#eee9e0"/>',
     f'<rect x="{ox}" y="{oy}" width="{mw}" height="{6*cell}" fill="#e2e8f0"/>',
     f'<rect x="{ox+12*cell}" y="{oy}" width="{2*cell}" height="{mh}" fill="#fffef3"/>']
for x in range(25): svg.append(f'<path d="M{ox+x*cell},{oy}v{mh}" stroke="#d5d8da" stroke-width=".6"/>')
for y in range(19): svg.append(f'<path d="M{ox},{oy+y*cell}h{mw}" stroke="#d5d8da" stroke-width=".6"/>')
for x,y in map_data["walls"]: svg.append(f'<rect x="{ox+x*cell}" y="{oy+y*cell}" width="{cell}" height="{cell}" fill="#64748b"/>')
for obj in objects:
    f=obj["footprint"];color=colors[int(obj["zone"][1:])-1]
    x=ox+f["x"]*cell+2;y=oy+f["y"]*cell+2;w=f["width"]*cell-4;h=f["height"]*cell-4
    dash=' stroke-dasharray="4 3"' if not obj["blocking"] else ''
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{color}" stroke="#667085"{dash}/>')
    svg.append(f'<text class="num" x="{x+w/2}" y="{y+h/2+4}" text-anchor="middle">{int(obj["id"][1:]):02}</text>')
    ax,ay=obj["interactionCell"]
    svg.append(f'<circle cx="{ox+(ax+.5)*cell}" cy="{oy+(ay+.5)*cell}" r="3.5" fill="#23865c"/>')
svg.append(f'<circle cx="{ox+12.5*cell}" cy="{oy+16.5*cell}" r="8" fill="#294fd2"/><text class="small" x="{ox+14*cell}" y="{oy+16.5*cell+4}">시작</text>')
for i,z in enumerate(zones):
    y=95+i*22
    svg.append(f'<rect x="766" y="{y-10}" width="12" height="12" fill="{colors[i]}"/><text class="legend" x="785" y="{y}">{z["id"]} {z["name"]}</text>')
for i,obj in enumerate(objects):
    svg.append(f'<text class="legend" x="766" y="{290+i*11}">{int(obj["id"][1:]):02} {html.escape(obj["label"])}</text>')
svg.extend(['<text class="small" x="24" y="655">주인공 접근점 30개 정적 경로 확인 · 주민 구역 제한과 실제 게임 이동은 구현 시 별도 검증</text>',
            '<text class="small" x="24" y="676">직원 구역 y0~5 / 주민 구역 y7~17 / 기록 구역 진입 y5 / 점선은 통행 가능한 표시 영역</text>','</svg>'])
svg_text="\n".join(svg)
(ROOT/"map_preview.svg").write_text(svg_text,encoding="utf-8")

# Local raster preview of the same planning data, independent of browser access.
from PIL import Image, ImageDraw, ImageFont
canvas=Image.new("RGB",(1050,700),"#f8fafc")
draw=ImageDraw.Draw(canvas)
font_path="C:/Windows/Fonts/malgun.ttf"
def font(size):
    return ImageFont.truetype(font_path,size)
draw.text((24,14),"민원봉사과 · 배치 계획",font=font(23),fill="#233246")
draw.text((24,47),"계획안 / 0부터 세는 타일 좌표 / 번호 c01~c30 / 초록 점은 주인공 접근점",font=font(13),fill="#536176")
draw.rectangle((ox,oy,ox+mw,oy+mh),fill="#eee9e0")
draw.rectangle((ox,oy,ox+mw,oy+6*cell),fill="#e2e8f0")
draw.rectangle((ox+12*cell,oy,ox+14*cell,oy+mh),fill="#fffef3")
for x in range(25): draw.line((ox+x*cell,oy,ox+x*cell,oy+mh),fill="#d5d8da")
for y in range(19): draw.line((ox,oy+y*cell,ox+mw,oy+y*cell),fill="#d5d8da")
for x,y in map_data["walls"]: draw.rectangle((ox+x*cell,oy+y*cell,ox+(x+1)*cell,oy+(y+1)*cell),fill="#64748b")
for obj in objects:
    f=obj["footprint"];x=ox+f["x"]*cell+2;y=oy+f["y"]*cell+2;w=f["width"]*cell-4;h=f["height"]*cell-4
    draw.rounded_rectangle((x,y,x+w,y+h),radius=3,fill=colors[int(obj["zone"][1:])-1],outline="#667085")
    text=f'{int(obj["id"][1:]):02}';box=draw.textbbox((0,0),text,font=font(13))
    draw.text((x+w/2-(box[2]-box[0])/2,y+h/2-9),text,font=font(13),fill="#233246")
    ax,ay=obj["interactionCell"];cx=ox+(ax+.5)*cell;cy=oy+(ay+.5)*cell
    draw.ellipse((cx-3,cy-3,cx+3,cy+3),fill="#23865c")
cx=ox+12.5*cell;cy=oy+16.5*cell
draw.ellipse((cx-8,cy-8,cx+8,cy+8),fill="#294fd2")
draw.text((ox+14*cell,cy-9),"시작",font=font(11),fill="#536176")
for i,z in enumerate(zones):
    y=84+i*22;draw.rectangle((766,y,778,y+12),fill=colors[i])
    draw.text((785,y-2),f'{z["id"]} {z["name"]}',font=font(12),fill="#233246")
for i,obj in enumerate(objects): draw.text((766,278+i*12),f'{int(obj["id"][1:]):02} {obj["label"]}',font=font(11),fill="#233246")
draw.text((24,644),"주인공 접근점 30개 정적 경로 확인 · 주민 구역 제한과 실제 게임 이동은 구현 시 별도 검증",font=font(11),fill="#536176")
draw.text((24,669),"직원 구역 y0~5 / 주민 구역 y7~17 / 기록 구역 진입 y5 / 최종 게임 아트는 별도 제작",font=font(11),fill="#536176")
canvas.save(ROOT/"map_preview.png")

def inline(text):
    text=html.escape(text)
    text=re.sub(r"\[([^\]]+)\]\(([^)]+)\)",r'<a href="\2">\1</a>',text)
    text=re.sub(r"\*\*([^*]+)\*\*",r'<strong>\1</strong>',text)
    text=re.sub(r"`([^`]+)`",r'<code>\1</code>',text)
    return text


output=[];toc=[];paragraph=[];list_open=False;i=0;lines=md.splitlines()
def flush():
    if paragraph:
        output.append("<p>"+inline(" ".join(paragraph))+"</p>");paragraph.clear()


while i<len(lines):
    line=lines[i].strip()
    if not line:
        flush()
        if list_open: output.append("</ul>");list_open=False
        i+=1;continue
    if line.startswith("#"):
        flush()
        depth=len(line)-len(line.lstrip("#"));title=line[depth:].strip()
        anchor="s"+str(len(toc)+1) if depth==2 else "top" if depth==1 else "sub"+str(i)
        output.append(f'<h{depth} id="{anchor}">{inline(title)}</h{depth}>')
        if depth==2: toc.append(f'<a href="#{anchor}">{html.escape(title)}</a>')
        if depth==2 and title.startswith("4 "): output.append(f'<figure class="map">{svg_text}<figcaption>30개 물품과 8개 구역의 배치안. 최종 게임 아트는 별도 제작.</figcaption></figure>')
        i+=1;continue
    if line.startswith("|"):
        flush();rows=[]
        while i<len(lines) and lines[i].strip().startswith("|"):
            cells=lines[i].strip().strip("|").split("|")
            if not all(re.match(r"^:?-+:?$",c.strip()) for c in cells): rows.append(cells)
            i+=1
        output.append('<div class="table-scroll"><table>')
        for n,row in enumerate(rows):
            tag="th" if n==0 else "td";output.append("<tr>"+"".join(f"<{tag}>{inline(c.strip())}</{tag}>" for c in row)+"</tr>")
        output.append("</table></div>");continue
    if line.startswith("- "):
        flush()
        if not list_open: output.append("<ul>");list_open=True
        output.append("<li>"+inline(line[2:])+"</li>");i+=1;continue
    paragraph.append(line);i+=1
flush()
if list_open: output.append("</ul>")
doc='''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>민원봉사과 챕터 개발계획</title><style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f3f5f8;color:#263349;font:16px/1.8 "Malgun Gothic",sans-serif}a{color:#225fc0;text-underline-offset:3px}aside{position:fixed;top:0;left:0;bottom:0;width:250px;overflow:auto;padding:28px 22px;background:#17253a;color:#eef4ff}aside b{font-size:19px}aside p{color:#b4c4df;font-size:13px}nav a{display:block;color:#dfeaff;font-size:13px;text-decoration:none;padding:6px 0}main{max-width:1320px;margin:0 30px 0 280px;background:white;padding:38px 44px 80px}h1{font-size:30px;line-height:1.4;letter-spacing:-1px;margin-top:0}h2{font-size:23px;margin-top:58px;padding-bottom:10px;border-bottom:2px solid #dde6f1;scroll-margin-top:20px}h3{font-size:19px;margin-top:35px}p{margin:18px 0}strong{color:#17427b}.badge{display:inline-block;background:#e7effb;color:#16468b;padding:3px 12px;border-radius:14px;font-size:13px;margin-bottom:22px}.table-scroll{overflow-x:auto;margin:22px 0;border:1px solid #dde4ee;border-radius:8px}table{border-collapse:collapse;width:100%;min-width:620px;font-size:14px;line-height:1.6}th{background:#eaf0f8;text-align:left;white-space:normal}td,th{padding:12px;vertical-align:top;border-bottom:1px solid #e0e6ef}tr:last-child td{border:0}tbody tr:nth-child(even){background:#f9fbfd}.map{margin:24px 0}.map svg{width:100%;height:auto;display:block;border:1px solid #dde4ee;border-radius:10px}figcaption{font-size:13px;color:#66758d}.files{background:#f1f6fc;padding:14px 18px;border-radius:8px;font-size:14px}.files a{margin-right:15px}li{margin:5px 0}code{font-size:.9em;background:#edf2f7;padding:2px 5px}footer{font-size:13px;color:#6c798f;margin-top:45px}@media(max-width:1000px){aside{position:relative;width:auto;padding:18px 22px}nav{display:flex;flex-wrap:wrap;gap:0 15px}nav a{font-size:12px}main{margin:0;padding:25px 20px}h1{font-size:25px}}@media print{aside,.files{display:none}body,main{background:white;margin:0;padding:0}h2{break-after:avoid}tr,figure{break-inside:avoid}.table-scroll{overflow:visible}table{min-width:0;font-size:10px}td,th{padding:6px}a{color:inherit;text-decoration:none}}
</style></head><body><aside><b>같은 설명이 닿도록</b><p>민원봉사과 챕터 · 개발계획 v1.0<br>2026.10.11 · 모든 구현 항목 planned</p><nav>TOC</nav></aside><main><div class="badge">공식 자료 7개 본문 확인 · 창작 사건 4개 · 첫 구현 3일</div><div class="files"><a href="민원봉사과_챕터_개발계획.md">원문 Markdown</a><a href="map_preview.svg">맵 SVG</a><a href="chapter_plan.json">콘텐츠 계획</a><a href="tasks.json">개발 작업</a><a href="sources.json">출처와 한계</a><a href="validation.json">정적 검증</a></div>CONTENT<footer>이 문서는 계획 검증을 마쳤으며 게임 구현·배포·실기 검증은 수행하지 않았습니다.</footer></main></body></html>'''
doc=doc.replace("TOC","".join(toc)).replace("CONTENT","\n".join(output))
(ROOT/"민원봉사과_개발계획.html").write_text(doc,encoding="utf-8")
print(json.dumps({"status":"static_plan_passed","files":9,"contexts":40,"mvp":12,"mapReachable":30,"relationCounts":relation_counts},ensure_ascii=False))
