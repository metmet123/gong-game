# 타과 협조·11종 후보·부서팩

> **퍼즐 시각·조작 계약 v1.2**: [앱 참고 디자인과 진행 방식](PUZZLE_UIUX_V1_2.md), [UI 데이터](data/puzzle_uiux_v1_2.json)를 함께 적용한다. 신규8·기존5·후속11종의 시안을 갱신했다. PF0~PF6·TASK39개와 게임 판정은 유지하고, 화면/조작 설명이 충돌하면 v1.2를 따른다. 실제 플레이 직관성·Android 실기는 이후 검증한다.

## 추출과 범위

첨부 `1-공무원키우기_새버전_기획시안.html`의 **06++ / 부서 지원 미니게임**에서 다음11종을 모두 확인했다. 장르명/★제작 난도/자동 생성 가능/인기라는 설명은 첨부의 제안 [A]이다. 실제 상용앱의 코드/수익/솔버를 확인한 증거가 아니다. 아래 고유 규칙·제작 우선순위·문제·효과는 이 계획 [D]이다.

현재 실행 순서는 생활보장과 베타 PF5 통과 뒤 PF6 샘플팩부터다 (이전 P9 대응). 첫4종을 지금 동시에 구현하지 않는다. **한 개 샘플팩 등록으로 지도/과제/판정/보상/도감/저장 연결을 검증한 뒤** 나머지3종을 추가한다. 미설치 팩은 전체 도감 완료율 분모와 본업4건에 넣지 않는다.

## 후보별 상세 비교

|팩ID/부서/퍼즐|일반 메커닉·첨부의 고유 제안|우리 문제 예시/수용할 변화|
|---|---|---|
|recycling / 자원순환과 / 재활용 선별장|물 정렬. 라벨페트는 제거대 경유, 오염물은일반폐기.|용량3 통4개, 아래→위 [A,B,A]/[B,A,B]/[]/[]; 같은종류 위 또는빈통에1개씩. 1→3,2→4,1→4,1→3,2→3,2→4로 A3/B3완료. 후속라벨L은제거대1칸에서L→A변환후만A통허용.|
|waterworks / 상하수도사업소 / 상수도관 연결|같은색 끝점 연결, 교차불가, 보호구역굴착금지, 제한허가.|5×5 A(0,0)↔(4,0),B(0,4)↔(4,4),보호칸(2,0). A는row1우회(0,0→0,1→4,1→4,0),B는row4. (2,1)이허가도로면1/2장소비. 서로다른경로를모두허용.|
|traffic / 교통행정과 / 불법주차 견인|방향대로탈출, 막힌차는실패, 소방로먼저.|4×4 A(1,1)E/B(2,1)E/C(0,2)N. 소방로row1. B→A를첫2번에비우고C; A를먼저누르면B에막힘. 여러유효순서허용,차량실제위법판단은가상맵.|
|land / 토지정보과 / 지적도 복원|노노그램, 필지지도수집, 측량으로한줄확정.|5×5 행/열[1],[3],[5],[3],[1]의다이아몬드. 00100/01110/11111/01110/00100. 고정레벨유일성검사,필지이름은가상. 측량은힌트무료대안과동일.|
|records / 기록관리팀 / 기록물 철하기|노출 타일 선택, tray7칸, 같은 분류3개 합침. 영구보존은 금고.|A3/B3/C3과 영구1개. A→B→C 순서로 철하고 영구는 금고. 금고 용량은 공개 stage 데이터이며 가려짐은 DAG로 정의.|
|disaster / 재난안전과 / 구호물자 창고|소코반, 유통기한임박분은출고문가까이.|본편archive_n01 재사용,2025상자는goal(4,2),2026은(4,3),출고문(5,2). D RR LL D RR witness. 보관대상연도는가상,실제재난훈련매뉴얼아님.|
|culture / 문화관광과 / 축제 부스 배치|첨부:블록3개배치/줄완성삭제/푸드트럭소화기근처/무대앞비우기.|기본은턴제5×5,통로x2전체보존. A2×1@(0,0),B1×2@(3,0),C2×2@(3,3),A는소화기(1,1)인접. **이미놓은부스가줄완성으로사라지는규칙은본업형에서제외**,선택휴식variant만가능.|
|it / 정보화팀 / 정산 매크로|본편매크로공통, 성공한자동화로일부본업편의.|A100/B250/A100/미승인C500→350. 본편macro_n01의다른서사/입력팩. 처음완료시기존auto해금경험을충족,새본편을자동넘기지않음.|
|river / 하천관리과 / 장마철 수문|핀순서로물/토사흐름, 예보물량변화, 가짜물리.|graph Rain3→G1→basin(cap4),G2→village. G2닫고G1열면3unit모두basin. 중은Rain5/basin4+보조basin2; 두유수지경로열고마을닫기. 중력연출은cellstate,유체엔진없음.|
|parks / 공원녹지과 / 노후 놀이터 해체|가려진나사는못풀고3색모으기, 안전고정마지막.|panelA가panelB를가림. s1제거→A분리→s2접근→s3안전고정마지막. ‘물리필요’첨부와달리DAG+고정낙하연출로단순화. 작업중지해도즉시undo.|
|building / 건축과 / 현장 안전점검|그림+문장점검표, 일부이상없음.|가상장면:비상구적치물/흔들린사다리2곳,통로는이상없음. 두위험hotspot표시+통로항목‘이상없음’. 클릭영역/문장의논리명확;실무안전판단서비스아님.|

|팩|상대난도/재사용엔진|새자산 목표(공통UI제외)|우선순위/도감·꾸미기·본편효과|
|---|---|---|---|
|recycling|M:칸엔진+stack/top/capacity;변환규칙때문에자동생성이‘쉽다’고단정안함|통4/재활용3shape/라벨1/제거대1|P10 첫샘플. 분리수거스탬프/녹색머그테마;선택회신0턴1회|
|waterworks|M:GridBoard+경로그래프/보호/허가|관로 모서리4/시설4/공사표식2|P10 두번째. 관로스탬프/푸른PC테마; 선택 협조 대기1턴 감소|
|traffic|M:GridBoard+ray blocking+removal DAG|차량2body×4dir/소방로/견인1|P10 세번째. 교통배지/노란트레이;회신확인버튼단축|
|land|M:GridBoard+run-count solver/unique|필지타일2/지적도액자1|P10 네번째.지도1칸·액자;부서도감힌트1회빠른열람|
|records|M~L:stack occlusionDAG/tray/undo|문서5icon/금고1/철함1|P11 2차.영구보존스탬프/책받침;기록도감단서바로가기|
|disaster|S~M:archive engine 그대로+goal labels|물자3/출고문1/창고팔레트|P11 2차 첫재사용.창고배지/물병외형;선택휴식커피테마|
|culture|M:budget placement+walkablepath floodfill|부스4/소화기1/무대1|P11 2차.축제스탬프/포스터;관계대사1개|
|it|S~M:macro VM/검증세트공유|PCskin1/담당초상palette|P11 2차.자동화배지/모니터테마;legacy auto해금경험대체|
|river|L:cell flow directedgraph/정수unit|수문3/물·토사2tile/유수지2|P11 3차 조건부.수문도감/빗소리옵션;소식예보variant|
|parks|L:layerDAG/accessible screws/tray|판자4/나사3색/도구함1|P11 3차 조건부.시설스탬프/나무소품;동료일화|
|building|L:공통selector+declarativefacts,아트비용큼|최소1장면+위험4patch/항목표|P11 3차 마지막.점검배지/체크판외형;기사variant|

새자산수는견적을위한최소목표 [D],확정제작일정아님. 전원새NPC한명씩을만들지않고npc_haru+부서별팔레트초상으로첫팩검증. 부서별우호도0~3은일화/외형/선택협조회신편의이며본업의판정규칙/필수문제해존재를바꾸지않는다.

## 난도·문제·검증 계약

모든타과하/중/상적용. 하=3~4종/작은격자/한제약,중=5~6종/고유비틀기1,상=복수제약/최적화(시간단축아님). 초기각난도2레벨=6/type,반응/솔버검수후9로확장. 단순color shuffle만별개문제로부풀리지않음.

|유형|판정/해존재/악용시험|
|---|---|
|sort_bins|상단/동종/용량/제거대/오염함을 순수 상태로 검사. 완성 상태 역출제+BFS witness. 색과 기호 병기, 빈통 무한 추가 금지.|
|connect_paths|색 끝점·4방향 연속·교차·보호·허가 사용량 검사. 완성 경로에서 벽 역생성 후 재탐색. 허가는 최종 초안 기준.|
|arrow_exit|차량 진행선의 차량/벽과 단계별 우선순위를 검사. 해 순서에서 역배치, 순환 의존은 거절. 잘못 선택하면 다시 선택/undo.|
|nonogram|행·열 runs 일치와 고정 유일해 솔버. 답 그림ID를 비교하지 않는다. 설명된 논리로 풀 수 있고 추측 필수 문제는 제외.|
|triple_stack|노출가능DAG/7slot/triple제거/금고보존. 유효selectsequence 시뮬레이션. 되돌리기state/tray/dependency복원.|
|archive(disaster)|본편push판정+라벨/goal출고순서. 기존stage에서semanticgoal만추가시해검증을다시함.|
|booth_blocks|겹침/terrain/소화기인접/중앙동선연결. placement+floodfill. 끝없는mode는본업시간밖선택.|
|macro(it)|본편VM동일,contentVersion/hiddenSet만새등록. 부서팩이임의JS/VM명령추가하지않음.|
|water_cells|유한 칸·정수 물량 보존·초기 수문·유수지 용량·마을 누수0. 최대64tick, undo 후 결정적 결과. 실제 유체물리 제외.|
|screw_layers|판자 DAG·접근 가능 나사·안전 고정 선행·tray 검사. 순환 거절. 무게·낙하는 고정 연출.|
|hazard_check|declaredhotspot+safe사실+checklist조건모두판정. 위험없음도답으로선택. 그림의각항목과말이일치하는콘텐츠검수필수.|

모두`PuzzleModule` 계약/무료힌트3/중단draft/보조완료/claim1회 사용. type별plot/이미지를교체하는것과새판정로직등록을구분한다. data만으로새알고리즘을생성할수있다는주장을하지않는다.

## 부서팩 계약과 등록

```json
{
 "packId":"dept.recycling.v1","departmentId":"recycling","name":"자원순환과",
 "packVersion":1,"minSaveVersion":3,"minEngineContract":1,
 "zones":[{"id":"recycling.sorting","mapId":"recycling_room_v1","focus":[3,3]}],
 "puzzleTypes":["sort_bins"],"stages":["recycling_e01","recycling_n01","recycling_h01"],
 "requests":[{"id":"coop.recycling.intro","afterStory":"st_end","optional":true,
 "npcId":"npc_haru","zoneId":"recycling.sorting","rewardId":"stamp.recycling"}],
 "codex":["dept.recycling"],"decor":["theme.recycling_mug"],
 "events":["coop.recycling.reply"],"assets":["bin_basic","recycling_labels"],
 "effects":[{"id":"replyBonus.recycling","kind":"optionalReplyTurns","amount":-1,"usesPerDay":1}]
}
```

`registerPack(pack,modules)`는 스키마·버전·namespace·타입·자산·구역·문제·보상·효과 enum 의존성을 검사한다. core progress/economy에 부서별 if를 추가하지 않는다. 처음 보는 팩 진행은 빈값으로 초기화하고 삭제·미설치 팩의 진행/초안/인벤토리는 orphans에 보존한다. 결손 팩은 도감에서 숨기며 메인 진행을 막지 않는다.

모듈과팩은개발시ESM로등록하고최종HTML에**로컬번들**한다. 오프라인단일HTML이온라인에서팩을자동다운로드하는것으로설계하지않는다. 새팩은새번들배포+JSON백업복원; user-installed zip실행/임의JS주입은MVP제외. `moduleId -> registry`와content-only stage변경을구분한다.

## 진입·복귀 흐름과 상태

`생활보장과업무함 optional요청 → 청사지도 → 설치된부서구역 → 퍼즐 → 도장/부서도감/외형1회 → 해당부서구역 → 생활보장과마지막zone`.

`returnContext={departmentId:"life_support",zoneId,objectId,lastSafeCell}`를 저장하고 카메라는 복귀 화면에서 재계산한다. 협조 중 뒤로가기는 초안 저장→부서 구역→청사 지도/생활보장과다. 본업 복귀 버튼은 항상 제공한다. 협조 미완료도 퇴근 가능하며 실제 청사 주소·이동 경로를 사용하지 않는다.

팩별taskId=`coop:packId:requestId:instanceId`,핵심스탬프once=`stamp:departmentId:firstClear`. 어려움별추가P없음. 같은요청반복은연습0P, 부서우호도는uniqueepisode만증가하여무한파밍차단. 기능효과상한은optionalReplyTurns0이하로안내려감, 서로다른부서효과중첩해본업규칙을삭제하지않음.

## 확장 게이트

1. P9 생활보장과모바일/저장/원본호환/15일회귀 통과.
2. P10 샘플recycling팩하/중/상6문제 등록,지도/도감/보상/복귀/draft/저장동작,core/save파일에부서별분기추가0.
3. 이어 waterworks/traffic/land 각solver/모바일 검수. procedural은solvability와체험품질통과후만.
4. P11 2차 disaster/it의재사용이실질적으로비용을낮추는지먼저검증→records/culture.
5. 3차 river/parks/building은셀연출/DAG/자체그림예산확보와새규칙의재미를검증할때착수. 슬롯만빈채전부배포하지않음.

샘플 팩 하나만 등록한 빌드에서 메인·도감·claim·저장·복귀를 시험한다. 미설치 데이터 보존과 재설치 복원, P9 회귀, 미설치 항목의 완료율 분모 제외, 오프라인 네트워크0, 320px 조작, 협조 미완료 퇴근을 확인한다.
