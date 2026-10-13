# 퍼즐 시스템·기존5종·신규8종 상세 명세

> **퍼즐 시각·조작 계약 v1.2**: [앱 참고 디자인과 진행 방식](PUZZLE_UIUX_V1_2.md), [UI 데이터](data/puzzle_uiux_v1_2.json)를 함께 적용한다. 신규8·기존5·후속11종의 시안을 갱신했다. PF0~PF6·TASK39개와 게임 판정은 유지하고, 화면/조작 설명이 충돌하면 v1.2를 따른다. 실제 플레이 직관성·Android 실기는 이후 검증한다.

전부 설계 제안 [D]; 신규 엔진은 아직 없다. ID는 첨부 상세계획과 호환되는 `conveyor/rules/macro/owner/approval/archive/budget/brief`. `rules`가 ‘규정 개정’, `brief`가 ‘한 장으로 줄여 와’다. 모든 가상 규칙은 작업대에서 볼 수 있으며 실제 법령/행정시스템을 복제하지 않는다.

## 기존 5종의 정확한 전환

|현재ID/작동하는 특성|유지할 역할|변경/새본편 연결|기록/도구 보존|
|---|---|---|---|
|compare: 5항목/오류1~3 집합 판정|D1~5 핵심, 이후20~40초 워밍업|원본탭/제출탭, 해당항목 교차강조. conveyor 검수장치/brief 사실확인의 개념으로 재사용|기록과guide 그대로; 새conveyor 기록으로 합산하지 않음|
|sort: 최신 승인 자료2개|파일명혼란 튜토리얼/짧은일|매크로가 수행할 가상 필터·dedup 목표를 먼저 이해|clean/auto/cleared 보존|
|memory: 종료 후2~4항목/다시보기|선택 기억 워밍업/서사전화|본편owner는 단서 항상공개. 전화 재열람과 메모 허용|memo 유지; 암기점수로owner잠그지 않음|
|sequence: 순서실행/입력2세트|코딩블록 기초|현재hard의filter/dedup 교환 정답을 보존. macro가 추가/조건/디버깅으로 확장|preview/sequence records 그대로|
|route: 가상담당규칙/안전우선|창구튜토리얼/짧은연결|rules의 편집규칙과 approval의 순서제약 기초|directory 보존. 실제법령 문제로 바꾸지 않음|

## 공통 계약

```ts
type Stage = {
 id:string; type:string; contentVersion:number; difficulty:'easy'|'normal'|'hard';
 seed:number; variant:string; input:unknown; goals:unknown; constraints:unknown;
 hintSteps:[Hint,Hint,Hint]; witnessId:string; tags:string[];
};
type Evaluation = {
 status:'valid'|'invalid'|'incomplete'|'error';
 reasons:{code:string,message:string,targets:string[]}[];
 trace:unknown[]; metrics:Record<string,number>; facts:Record<string,unknown>;
};
interface PuzzleModule {
 type:string; schemaVersion:number;
 validateStage(stage:Stage):Validation;
 createDraft(stage:Stage):Draft;
 reduceDraft(stage:Stage,draft:Draft,action:Action):Draft; // pure/immutable
 evaluate(stage:Stage,draft:Draft):Evaluation; // no DOM/clock/random/save/reward
 serializeDraft(draft:Draft):JSONValue;
 restoreDraft(stage:Stage,raw:JSONValue):Draft;
 makeHint(stage:Stage,draft:Draft,level:1|2|3):Hint;
 mount(ctx:UIContext):{dispose():void};
}
```

`Stage.input` 아래 유형별 스키마, `Draft`는 플레이어 편집 출력, `Evaluation`은 판정 출력이다. reward은 PuzzleModule이 지급하지 않는다. `GameSession.submit`이 valid/assisted 결과와 taskId를 확인해 원장1회 claim. hint3 witness는 정답의 유일성 주장이 아닌 **한 유효 해법**이며 보조기록을 남긴다.

공통 UI: 헤더56(구역뒤로/과제), 목표·가상규칙48, `자료/편집/검증` 탭40, 작업대 V, 고정액션104(`되돌리기`/`힌트`/`검증`/`제출`) + safe24. 320 가용W296, grid6×6@44=264. 7~12열은 내부zoom/pan/전체미리보기로 작업하며 페이지 폭을 늘리지 않는다. 드래그는 선택 기능, **선택→칸탭/위아래** 방식이 필수. 모든 데이터 숫자는DOM텍스트.

본업 강제 타이머 없음. elapsed는 기록용. 실패는 편집 유지, 되돌리기무제한, 중도종료 draft/seed/난도 저장. 재시도는 같은stage; 다른문제요청은 연습에서만. incomplete는 오답0, 검증도오답0, 최종잘못제출만10점(최소60). 보조완료 XP/P동일. 완료된task 연습은P/XP0. 최고기록은 난도·보조별 분리. 도구없이 모든레벨 해가 존재해야 한다.

콘텐츠량: 신규8종 각각 하3/중3/상3 =9 고정 레벨, 총72. 예시는 아래24개의 대표 witness이며 실제 JSON 레벨과 솔버시험은 각 TASK에서 제작한다. P3 conveyor9→P5 A27→P7 B27 추가→P8 C18 추가. 초기에2변형 중심,3번째는 후속 레벨로. witness를 먼저 만들고조건을 역검증; 무작위 출제는 검증예산내해존재+품질필터 통과 후만 등록한다.

## 1. 결재 컨베이어 (`conveyor`, A, D6)

**목적/모티브**: 승인 사본과 보관 원본을 목적별함에 자동전달하는 도장 공장. 내자리o12 PC/보드에서 시작, 결재석o7은 결과연출. 한솔: “도장부터 찍지 말고 어디로 갈지부터요.”

변형3: (a)승인/보완 분류라인 (b)원본·사본 분리/필요도장 (c)금액경계+잉크/부품 최적화. 처음10초: 접수에서함까지미완성레일1칸 깜박임→`레일선택`→칸탭→실행→한장도장. 규칙은 ‘선택장치는출력화살표방향으로보냄’ 하나부터.

화면: 접수/목표함고정, 레일격자(하5×4/중7×5/상8×6), 장치팔레트(직선/회전/조건분기/복사/도장), 선택칸회전/삭제, 실행·한tick·초기위치, 출력함의문서/도장목록. 레일모양과문서의가상판정은별도. 터치=부품→칸→방향버튼;마우스=같음+drag옵션;키보드=화살표칸선택/Enter배치/R회전/Delete제거. 320에서는44px작업칸/7열이상pan, 팔레트는가로카드탭.

|난도/예제ID|입력·목표·실질 규칙|정답 한 예/풀이|
|---|---|---|
|하 `conveyor_e01`|5×4. IN(0,1)E, A승인, OUT(4,1). A에chief도장필수. rail/stamp만.|(1,1)E→(2,1)chief/E→(3,1)E→함. 우회레일이어도chief1회/정확한함이면정답.|
|중 `conveyor_n01`|7×5. IN(0,2), A승인/B미승인. accepted(6,2),supplement(6,4). 승인만chief도장.|(1,2)E→(2,2)분기 approved?E:S. A는(3,2)E→(4,2)chief/E→(5,2)E→accepted. B는(2,3)S→(2,4)E→(3..5,4)E→supplement.|
|상 `conveyor_h01`|8×6. A100/B50. 원본record도장→(7,5), 사본chief+금액≥100일때boss→(7,2). 복사/조건·도장수·원본수제약.|IN(0,2)→rail(1,2)→copy(2,2):copyE/originalS. 사본chief(3,2)→분기GE100(4,2), A는(4,1)boss/E→(5,1)E→(6,1)S→(6,2)E→함;B는(5,2)E→(6,2)E→함. 원본(2,3)S→(2,4)S→(2,5)E→(3,5)E→record(4,5)E→(5,5)E→(6,5)E→보관함.|

정답은좌표일치가아니라rootId/instanceKind/목적함/requiredStamps/총수로판정. 필요없는도장허용은stage별 `extraStampsAllowed`; 상예제false. 복사장치는원본1+사본1만(같은root복사1회), 동시문서연출은허용하되 tick deterministic. 같은목적함은출력bag로,순서가중요한variant만순서검사. 빈칸·격자밖·잘못된함·복사증식·인스턴스루프는명확한reason. tick300/token16/spawn16 상한. 입력은순차발행하고그root의모든결과가나온뒤다음입력발행해MVP충돌폭발을피한다.

```json
{"input":{"board":{"cols":7,"rows":5},"inlets":[{"cell":[0,2],"dir":"E"}],
 "documents":[{"rootId":"A","approved":true,"amount":50},{"rootId":"B","approved":false,"amount":50}],
 "sinks":[{"id":"accepted","cell":[6,2]},{"id":"supplement","cell":[6,4]}]},
 "goals":{"accepted":[{"rootId":"A","stamps":["chief"]}],"supplement":[{"rootId":"B","stamps":[]}]},
 "constraints":{"tickLimit":300,"copyLimitPerRoot":1,"tokenLimit":16}}
Draft={"devices":[{"cell":[2,2],"kind":"branch","predicate":{"field":"approved","op":"eq","value":true},"yes":"E","no":"S"}]}
```

`evaluate`는 trace(tick/token/cell/action), metrics(parts/ticks/stamps), facts(copied/usedBoss)를 반환한다. 필수 배치 누락은 incomplete, 루프·출력 불일치는 invalid다. 렌더 오류는 error로 표시하고 초안을 보존한다. 부분 라인은 검증·연습할 수 있지만 모든 입력이 valid일 때만 완료 보상을 준다.

힌트1은 막힌 장치·잘못 이동한 원본을 강조하고, 힌트2는 한 문서의 경로와 조건, 힌트3은 유효 배치 하나를 제공한다. 편집 중 되돌리기는 무제한이며 실행 중 편집하면 시뮬레이션을 중지하고 초안을 유지한다. 평균60~120초, 상 난도 연구실120~240초가 목표다. 최적화는 부품수와 tick의 Pareto 기록이며 기본 완료와 분리한다. 출제는 해법에서 역으로 구성한 뒤 도착을 검증하는 방식이나, 처음에는 고정9레벨만 제작한다.

자산은 레일4방향·분기·복사·도장3종·접수/출력함·토큰3모양이며 종이 이동음과 낮은 도장음을 쓴다. 자동화/조율 숙련, trace 도구, st_conveyor 사건, decor_stamp 소품과 연결한다. 도감은 ‘원본은 남고 사본은 간다’. 시험은 99/100/101 경계, 복사0/1/2회, 루프, 미도착, 우회 해법2개, 중복 출력, undo 후 동일 trace, resize 후 동일 칸, 두 번 제출 시 보상1회다. 완료 조건은 9레벨 witness와 복수 해법, 320px 터치, D6 저장·구역 복귀다.

## 2. 규정 개정 (`rules`, A, D7)

**목적/모티브**: 화면에정의된가상의접수/결재규칙을유한카드로개정해모든사례를맞춘다. 실제법령수정권을부여하는게임이아님을진입시짧게표시. 게시판o2/책장o18→창구o24. 미루: “오늘의 가상 공지입니다. 잠긴 조건은 그대로 두세요.”

변형3: (a)시간/대리결재1칸교체 (b)접수조건 AND/OR (c)우선규칙/예외 충돌 디버깅. 첫10초:금요일카드탭→목요일카드선택→사례하나의통과불이켜짐.

화면은 잠긴 감사규칙, 편집 문장2~3줄(줄당 최대6슬롯), 허용 카드, 사례3/4/6개, 목표·현재 결과, 개정권 사용량, 검증·제출 버튼으로 구성한다. 320px에서는 규칙/사례 탭으로 나누고 목표는 고정한다. 글씨16px, 슬롯48px. 터치·마우스는 슬롯→카드 선택, 키보드는 Tab/Enter/화살표다. 자유문장과 임의 숫자 입력은 제공하지 않는다.

|난도/예제ID|입력/목표|정답/풀이|
|---|---|---|
|하 `rules_e01`|가상오늘목요일. 소액승인A는chief에게목요일완료,미승인B보완,금액100C는잠긴boss규칙. editable날짜기본금요일,개정1회.|요일카드를목요일로교체. 상위‘100이상boss’는그대로;B는승인false라보완. A/C목표모두충족.|
|중 `rules_n01`|이용조건기본pre. 사전신청A/현장접수B허용, 미접수C보완, 100현장D허용/boss. 카드pre/onSite/OR, 개정2.|`pre OR onSite`; B도허용, C두조건false보완, D허용이면서잠긴boss. OR양쪽순서교환동등정답.|
|상 `rules_h01`|개정3권,상위locked `amount>=100→boss`와`complete=false→supplement`. A pre/불완전→보완, B onSite/완전/100→allow boss, C미접수/완전→보완, D pre/완전/50→allow chief. 추가 E=사전/완전/100→허용boss, F=현장/불완전/50→보완도 공개한다.|접수식`pre OR onSite`를편집하고complete상위조건을먼저적용. A는pre=true여도보완;B=100boss. 상위조건을OR식으로덮어쓰면invalid. 선언동등AST는인정.|

```json
{"input":{"editableRules":[{"id":"admit","slots":["pre","op","other"],"allowedCards":["pre","onSite","OR","AND"]}],
 "lockedRules":[{"id":"audit","priority":100,"if":{"gte":["amount",100]},"set":{"approver":"boss"}}],
 "cases":[{"id":"B","pre":false,"onSite":true,"complete":true,"amount":100}]},
 "goals":{"B":{"admission":"allow","approver":"boss"}},"constraints":{"editBudget":2,"maxRules":3}}
Draft={"bindings":{"admit":["pre","OR","onSite"]}}
```

DSL은 `all/any/not/eq/gte/lte`만 사용하고 필드·숫자 단위를 고정한다. AST 해석 → 타입 검사 → 잠긴 규칙 불변 검사 → 높은 우선순위부터 적용 → 사례 결과 비교 순서다. 같은 우선순위에서 같은 필드를 다르게 쓰면 conflict/invalid다. 낮은 규칙은 높은 규칙 결과를 덮지 못한다. 개정권은 원본과 최종 초안의 슬롯 차이이며 시도 횟수가 아니다. trace는 사례/적용 규칙/결과, metrics는 changedSlots/optionalRuleCount, facts는 conflictSeen이다. 일부 사례 일치는 진행 정보이며 전부 valid여야 완료다.

힌트1 실패 사례·필드, 힌트2 조건·우선순위, 힌트3 동등한 유효 식 하나를 제공한다. undo·reset·중단은 원본과 초안의 차이를 보존한다. 평균60~120초, 상120~180초. 최적화는 문장 길이가 아닌 최소 편집수다. 허용 카드 조합을 유한 열거해 해를 검사하되 최대6슬롯·카드8종과 탐색 예산을 둔다. 모순 목표는 등록을 거절하고 초기 고정9레벨을 제작한다.

자산은 게시판 종이·잠금·조건 타일·허용/보완/반려 기호와 카드 부착음이다. 검토 숙련, rulebook, st_form, decor_clip, 도감 ‘공지의 유효기간’과 연결한다. 시험은 잠긴 규칙 변조, 100 경계, 같은 우선순위 충돌, OR 교환, 불완전 연결, 무료 힌트, 화면 폭과 무관한 판정, 불가능 목표 거절이다. 완료 조건은 사례별 trace·9개 witness·명확한 가상 규칙·보조 완료다.

## 3. 매크로 설계·디버깅 (`macro`, A, D8)

**목적**: 반복자료를처리하는블록프로그램과경계값검증을설계한다. 내자리PCo12. 재훈:“99와101은맞는데100은틀립니다.”

변형3종: 직선 수집/필터/합산, 버그를 노출하는 입력 선택과 블록 교체, 각 자료를 한 번씩 조건 분류. 임의 점프·중첩 반복은 제외한다. 첫10초는 받기→활성 입력표→합계 블록 이동→한 단계 실행이다.

자료표, 명령 목록(기본 최대8/상12블록), 보관칸1개, 공개 테스트2~3개, 검증 결과, 실행 줄 강조, 최근 로그8줄을 표시한다. 320px에서는 명령/자료/로그 탭으로 나눈다. 터치는 추가·선택·↑↓·교체·삭제, 마우스 드래그는 선택 기능, 키보드는 Tab/Enter/Alt↑↓다. 일시정지·한 단계·전체 실행·2배속은 글자 버튼이다.

|난도/예제|문제/제약|정답/풀이|
|---|---|---|
|하 `macro_e01`|A100/B200(모두승인,중복없음),다른X70/Y30. 3블록직선. |받기→합산→제출=300/100. 두입력전부검증. |
|중 `macro_n01`|A100/B250/A100/C500미승인,목표350. 필터/dedup/합계, 다른테스트empty 및 X70/Y30/X70. |받기→승인필터→중복제거→합산→제출. 복제ID는동일payload라는stage불변조건을둬filter/dedup교환도정답. empty=0. |
|상 `macro_h01`|각청구amount≥100은boss, 나머지chief. 현재`>100`버그. 입력99/100/150, 테스트입력선택은3회표시(다시시작가능).|100단일입력으로버그노출→조건GE100으로교체→각자료1회분류→제출. chief={99},boss={100,150}, 공개/숨은98,100,101/empty도통과. |

```json
{"input":{"records":[{"claimId":"A","amount":100,"approved":true}],
 "commands":["receive","filterApproved","dedup","sum","submit"],
 "tests":[{"id":"visible1","records":[],"expected":0}],
 "hiddenTestSetId":"macro_dedup_v1"},"goals":{"outputKind":"sum","dedupPolicy":"identical_claim_payload"},
 "constraints":{"maxBlocks":8,"maxInstructions":256,"loop":"forEachInputOnce","maxInputRecords":20}}
Draft={"blocks":[{"op":"receive"},{"op":"sum"},{"op":"submit"}]}
```

VM은 순수 단계 실행이며 금액은 고정 단위 정수다. 받기 이전 처리, 제출 이후 명령, 중복 읽기, 타입 오류는 대상 행을 포함한 invalid 사유다. forEach는 입력20건 이하를 한 번씩만 처리하고 중첩·임의 goto를 금지하며 256단계에서 중지한다. trace는 pc/dataBefore/dataAfter/reason, 출력은 정수 합계 또는 함별 rootId 목록, metrics는 blocks/instructions, facts는 boundarySeen이다. 서로 다른 프로그램도 모든 테스트 결과가 같으면 정답이다. 숨은 검증은 공개 규칙의 경계·빈 입력·중복 입력이며 새 조건을 몰래 추가하지 않는다. 실패 입력 하나와 이유를 공개한다.

힌트1 실패 줄·경계값, 힌트2 이전 데이터·실패 입력, 힌트3 유효 블록 해법이다. 테스트3회 제한은 연구실의 디버깅 기록용이며 본업은 재시도·보조 완료가 가능하다. boundary는 실험1회를 절약한다. 중단 시 블록 초안을 저장하고 실행 pc는 복원 후 처음부터 다시 계산한다. 평균60~120초, 상 연구실120~240초. auto는 익힌 쉬운 워밍업만 하루1건 처리하며 새 매크로·대표 스토리 문제는 넘기지 않는다. 고정9레벨 뒤 유한 입력·경계 집합 비교를 검토한다.

자산은 PC 테두리·블록6~8종·커서/타이핑·짧은 클릭/완료음이다. 자동화 숙련, boundary/preview, st_macro, decor_monitor, 도감 ‘100은 어느 쪽’과 연결한다. 시험은 빈 입력·0·100·같은ID/다른값 거절·동등 순서·256상한·중단 초안·숨은 답 하드코딩·중복 제출이다. 완료 조건은 기존 sequence 회귀, 각 난도3레벨 검증, 숨은 테스트 실패 이유 공개다.

## 4. 서류 주인 찾기 (`owner`, B, D9)

**목적**: 이름이없는가상서류와동료/방문자의관계를단서로추리. 복사기o20/창구o24→동료업무섬. 단비:“외울필요없어요. 메모는옆에붙여뒀습니다.”

변형3종: 일대일 짝짓기, 시각/서류 종류 관계, 색/접수순서 다중 속성 표. 첫10초는 ‘보람은 빨강 서류’ 단서 선택 → 보람 행/빨강 열 → 확정 핀이다.

후보3/4/5명과 서류3/4/5장, 단서3/6/8개, 관계표, 확정/제외/미정 핀, 선택쌍 미리보기, 모순 근거를 보여준다. 320px은 후보/서류 탭과 단서 패널을 사용한다. 5×5도 48px 칸이면240px에 들어간다. 터치는 인물→문서 또는 칸 탭으로 상태 순환, 키보드는 화살표/Enter/Space(제외)다. 색·필체에 의존하지 않고 텍스트를 병기한다.

|난도/예제|공개단서|정답/추론|
|---|---|---|
|하 `owner_e01`|가온/보람/채림, 빨강/파랑/초록서류. 가온은빨강도초록도아님, 보람은빨강. |가온=파랑, 보람=빨강, 채림=초록. 제외단서+남은1대1. |
|중 `owner_n01`|가온/보람/채림/다온, 예산09/메모10/서식11/영수증12. 보람11시, 가온은 보람 직전, 채림은 마지막, 다온은 메모가 아님.|보람=서식11 → 가온=메모10 → 채림=영수증12 → 다온=예산09. 일대일 대응의 남은 자리로 추론.|
|상 `owner_h01`|5명과 09/10/11/13/14시의 신청/변경/보고/회신/열람. 보람=주황(공개 정보상11시 보고), 가온은 직전, 채림은 마지막, 다온은 처음, 은오는 보람 이후.|다온09신청, 가온10변경, 보람11보고, 은오13회신, 채림14열람. 색과 서류 정보는 메타데이터로 공개.|

```json
{"input":{"people":[{"id":"ga"},{"id":"bo"},{"id":"chae"}],
 "documents":[{"id":"red","color":"red"},{"id":"blue","color":"blue"},{"id":"green","color":"green"}],
 "clues":[{"op":"neq","person":"ga","document":"red"},{"op":"neq","person":"ga","document":"green"},{"op":"eq","person":"bo","document":"red"}]},
 "goals":{"bijection":true},"constraints":{"solutionPolicy":"unique"}}
Draft={"assignments":{"ga":"blue","bo":"red","chae":"green"},"notes":[{"cell":[0,0],"mark":"excluded"}]}
```

판정은 일대일 전체 배정과 모든 단서 관계의 충족이다. 힌트·노트는 판정에 영향을 주지 않으며 표시 이름·정렬과 무관하게 ID로 비교한다. 기본 본편은 추리 결말을 위해 유일해이며 3!~5! 배정을 열거해 해1개를 확인한다. 복수 해법 챌린지는 `solutionPolicy:anySatisfying`을 명시하고 서사상 유일한 주인이라고 단정하지 않는다. 부분 배정은 모순 단서를 설명하고 맞힌 쌍 수를 반복 노출해 찍기를 유도하지 않는다. 부분 보상은 없다.

힌트1 미사용 단서, 힌트2 관계표 한 줄, 힌트3 확정쌍 또는 전체 witness다. undo 무제한, 노트·배정 중도 저장, 같은 단서로 재시도. 제한시간 없이 평균60~120초 목표다. 점수는 노트 수에 의존하지 않는다. 고정9레벨 뒤 해법→단서 생성→유일성·불필요 단서 비율 검사를 검토한다.

공유 NPC 초상·종이5모양·핀·종이 펼침음을 쓴다. 추리 숙련, st_owner, decor_bookend, 도감 ‘주인 없는 한 장’과 단비 일화로 연결한다. 시험은 중복 배정·미배정·모순 단서 거절·문장/논리 일치·5! 유일성·정렬 불변·노트 복원·힌트3 보조 완료다. 완료 조건은 모든 고정 단서의 가독성과 유일성 증명이다.

## 5. 결재 동선 짜기 (`approval`, B, D10)

**목적**: 가능 시간·선행 조건·용량을 지키는 일정 설계. 회의o21 및 간부o7/o11/o39/o3에서 시작하고 달력 결과를 전달 연출로 보여준다. 서윤: “순서만 맞추면 출장 날짜가 끼어듭니다.”

변형3: (a)도장선행+출장 (b)여러문서/일별용량 (c)협조회신lag/최소완료일. 첫10초:팀장카드월→과장화에탭, 선행화살표녹색, 날짜가능조건보기. 

월~금5열, 담당자3행, 문서A/B/C, 선행 그래프, 마감·출장 불가 칸, 칸 용량, 일정 로그를 표시한다. 모바일은 날짜 탭과 담당자별 표로 편집하며 전체5열은 미리보기다. 터치는 단계→날짜/칸, 마우스 드래그는 선택 기능, 키보드는 Tab/화살표/Enter. 시간은 실제 분이 아닌 정수 슬롯이며 예제의 선행 단계는 다음날 이후다.

|난도/예제|조건|정답 일정/풀이|
|---|---|---|
|하 `approval_e01`|문서A, chief→boss. 담당자 하루1건. chief 월/화, boss 화/수, 수요일 마감.|월chief→화boss 또는 화chief→수boss 모두 정답.|
|중 `approval_n01`|A/B2문서 chief→account→boss, 사람별하루2건, chief월/화, account화/수, boss목/금(수출장), 금마감. |월chiefAB→화accountAB→목bossAB. 금boss도유효. |
|상 `approval_h01`|문서A/B/C, 담당자 하루2건. chief 월/화, account 화/수, boss 목/금. 선행 단계 최소 다음날.|월chiefAB; 화chiefC+accountAB; 수accountC; 목bossAB; 금bossC. 용량2는 담당자별이므로 화요일 총3건은 가능.|

```json
{"input":{"days":["mon","tue","wed","thu","fri"],"actors":[{"id":"chief","available":[0,1],"capacityPerDay":2}],
 "jobs":[{"id":"A","steps":[{"id":"A.c","actor":"chief"},{"id":"A.a","actor":"account","after":"A.c","lagDays":1},{"id":"A.b","actor":"boss","after":"A.a","lagDays":1}]}]},
 "goals":{"deadlineDay":4,"allSteps":true},"constraints":{"maxJobs":3}}
Draft={"schedule":[{"stepId":"A.c","day":0,"slot":0}]}
```

각 단계 정확히1회 → 가능 시간 → 담당자별 용량 → 선행/최소 간격 → 마감 순으로 검사한다. 사유에는 단계·날짜를 넣고 metrics는 makespan/idleDays/changesFromInitial, facts는 rescheduled다. 같은날 선행을 허용하는 후속 변형은 슬롯 시각과 minGap을 명시한다. 사무실 BFS 이동시간은 달력 판정에 쓰지 않는다. 유효 일정은 NPC 전달 연출로 재생하되 중간 건너뛰기가 가능하다.

힌트1 위반 단계·날짜, 힌트2 최초 가능 날짜·혼잡 담당자, 힌트3 유효 일정이다. 중단 시 일정을 저장한다. 전달 연출 중 중단해도 보상은1회다. 빠른 완료·최소 변경은 별도 기록이며 마감 안에 완료하면 스토리 보상은 같다. 평균60~120초, 상 연구실120~240초. 고정9레벨을 유한 CSP로 검사하고 선행 순환·불가능 용량을 거절한다.

달력·문서3종·출장 아이콘·건네기2프레임·도장을 쓴다. 조율 숙련, reply 편의, 계장3명, st_reject, decor_tray와 연결한다. 시험은 순서·중복 단계·담당자 용량·목/금 복수해·출장일·마지막 대기 무료 회신·연출 중 복원·표시 날짜 형식 불변이다. 완료 조건은 9레벨 일정, 복수 해법2개, 지도와 독립된 판정이다.

## 6. 서고 정리 (`archive`, B, D6선택)

**목적**: 밀기만가능한짧은서류상자공간퍼즐, 본업사이기분전환. 캐비닛o31/책장o18. 단비:“당기기는안됩니다. 대신되돌리기는됩니다.”

변형3종: 상자1/2개 목표, 연도별 지정칸, 출고 순서/좁은 통로. 재난안전과도 같은 밀기 엔진을 재사용한다. 처음10초는 한 칸 걷기→상자 밀기→되돌리기다.

벽·바닥·상자·연도 목표·주인공·이동/밀기 횟수·방향패드48px·undo/reset/hint·선택 업무 표시. 하5×5/중6×5/상7×6이다. 6열 이하는44px, 7열은 내부 이동 또는 시각39px와 별도48px 방향패드를 쓴다. 인접 바닥 탭은 한 걸음, 먼 바닥은 걷기만 BFS하며 상자를 자동으로 밀지 않는다. 키보드 화살표/WASD, Backspace는 되돌리기다.

표기 `#벽 .바닥 @사람 $상자 G목표`,좌표0기준, witness moves는U/D/L/R. 

```text
archive_e01 하5×5     archive_n01 중6×5       archive_h01 상7×6
#####                 ######                  #######
#...#                 #@...#                  #.....#
#@$.#                 #.$.G#                  #.@$..#
#..G#                 #.$.G#                  #..$GG#
#####                 ######                  #.....#
                                              #######
하 witness R U R D (push2)
중 witness D R R L L D R R (push4)
상 witness D R R L L U R U R D (push4)
```

하상자(2,2)→(3,2)→(3,3). 중2상자를각오른쪽목표로밀기. 상에서는아래상자(3,3,2025)를먼저(5,3,2025)까지, 위상자(3,2,2024)를(4,2)→(4,3,2024). 연도지정으로중과구분하고목표주변벽/동선관계로난도확장. 더긴공식소코반문제를복사하지않음. 

```json
{"input":{"cols":5,"rows":5,"walls":[[0,0]],"player":[1,2],"boxes":[{"id":"b1","cell":[2,2],"year":2025}],"goals":[{"cell":[3,3],"year":2025}]},
 "constraints":{"pull":false,"optional":true,"maxBoxes":3}}
Draft={"player":[3,2],"boxes":[{"id":"b1","cell":[3,3]}],"moveHistory":["R","U","R","D"]}
```

벽·상자 겹침 없음, 미는 다음 칸이 빈칸, 모든 상자가 연도별 목표에 있으면 성공이다. 출고 변형 외에는 이동 순서 무관. metrics는 pushes/moves, facts는 archiveVisited다. 부분 목표는 표시만 한다. 코너 막힘은 ‘되돌릴 수 있어요’로 안내하며 강제 reset하지 않는다. 힌트1 막힘·통로, 힌트2 다음 밀기, 힌트3 유효 이동열. undo 무제한, 같은 문제 reset, 선택 초안 저장. 제한시간 없이20~90초 목표다.

하루 첫 선택 완료는 집중력+10(최대100), XP/P0, 도감·첫 일화1회다. 본업2건 후 보이며 건너뛰어도 퇴근 가능하다. 다른 서고를 풀어도 같은날 회복은 중복되지 않는다. 최소 밀기는 상자 위치와 플레이어 도달 영역을 상태로 하는 BFS이며 최단 걷기와 분리한다. 초기 고정9개, 역밀기 생성은 해 검증·재미 검수 후 도입한다.

벽/바닥/연도 상자3종/목표/기존 걷기와 부드러운 밀기음을 쓴다. 선택 서고는 숙련의 방문 기록만 남기고 도감·단비·책받침(D9 상점)·취미 업적에 연결한다. 시험은 벽/상자·목표 연도·undo 복원·코너 복구·반복 파밍·닫기/회전이다. 완료 조건은 9개 해 존재, 퇴근 방해 없음, 하루 회복1회다.

## 7. 예산 테트리스 (`budget`, C, D11)

**목적**: 기간×게임금액block을월/분기한도안에배치하는턴제공간퍼즐. 회의o21/PCo12. 가람:“금액을돌려도기간은돌아가지않습니다.”

변형3: (a)월별한도/기간연속 (b)분기한도/시작window (c)사업선행/고정예약/평탄한집행. 낙하/시간반응/줄삭제없음, **회전금지**(기간↔금액의미를바꾸면안됨). 첫10초:width2/height1사업선택→월1시작칸tap→월합계두칸증가. 

월4/6/12열×금액3/4행, 사업A~F, 월별·분기 한도, 시작 범위·선행 조건, 미배치 목록을 표시한다. 320px은 분기 탭(3개월×44px)과 연간 미리보기이며 월·금액 축은 텍스트로 고정한다. 사업 선택→시작월/행 선택, 마우스 드래그는 선택 기능, 키보드 사업 선택/화살표/Enter다.

한 칸은 가상예산1단위다. 너비는 연속 개월 수, 높이는 매월 금액이다. y행은 블록을 놓을 공간이며 돈의 단위를 바꾸지 않고 겹침만 금지한다.

|난도/예제|조건|유효배치/풀이|
|---|---|---|
|하 `budget_e01`|4개월×3행, 월 한도2. Q1(1~3월)3/Q2(4월)2. A2×1/B1×1 필수.|A1~2월 행0, B3월 행0. Q1=3. A2~3월/B1월도 유효.|
|중 `budget_n01`|6×4, 월 한도2, 분기5/5. A3×1 시작1/2월, B2×1 시작2~4월, C1×2는6월만.|A1~3월 행0, B4~5월 행0, C6월 행0~1. Q1=3/Q2=4. B2~3월 행1이면 Q1=5/Q2=2로 역시 유효.|
|상 `budget_h01`|12×4, 월 한도2, 분기[5,4,5,4]. A3×1 시작1, B2×1 시작4, C3×1 시작7, D2×1 시작10, E1×2는6월, F1×2는12월. A뒤B, C뒤D.|A1~3, B4~5, C7~9, D10~11, E6, F12월 행0부터. Q=[3,4,3,4], 월 최대2. 행 이동도 유효. 후속 상 변형은 시작 범위2개와 고정 예약을 더해 선택 폭을 확보.|

```json
{"input":{"months":6,"rows":4,"unit":"fictional_budget_unit",
 "projects":[{"id":"A","duration":3,"amountPerMonth":1,"allowedStarts":[1,2],"required":true}],
 "monthlyCaps":[2,2,2,2,2,2],"quarterCaps":[5,5],"dependencies":[]},"goals":{"allRequiredPlaced":true},"constraints":{"rotate":false,"clearRows":false}}
Draft={"placements":[{"projectId":"A","startMonth":1,"row":0}]}
```

사업 각1회, 크기 불변, 범위·겹침·시작 범위·월합·분기합·선행을 검사한다. 분기는 실제 월 번호로 계산하며 UI 탭과 무관하다. 월합은 사업 높이 합, 분기합은 칸 단위 합이다. metrics는 peakMonthly/monthlyVariance/changes(최적화 가능한 레벨만), facts는 budgetSubmitted다. 일부 배치는 incomplete, 한도 초과는 월·분기·초과량을 표시한다. 배치 행 번호를 금액으로 읽지 않는다.

힌트1 초과 월·불가능 시작, 힌트2 사업 범위·비워야 할 월, 힌트3 유효 배치. placements는 저장하고 분기 탭·내부 이동은 편의 상태다. 시간제한 없이60~120초, 상 연구실120~240초 목표. 고정9개를 유한 후보와 한도 가지치기로 검사하고 불가능 레벨을 거절한다. 절차 출제는 유효 배치→조건 추정→재탐색 순서다.

블록6모양·분기 눈금·종이 칸 선택음·도장. 검토/조율 숙련, st_budget, decor_lamp, 도감 ‘돈은 있는데 칸이 없다’. 시험은 회전 금지·3/4월 경계·월0/13·사업 중복·화면 크기 불변·다른 행·고정 사업 이동·필수 누락·정수 상한이다. 완료 조건은 9레벨, 320px 분기 탭, 부분 보상0, 고급 연구실 분리다.

## 8. 한 장으로 줄여 와 (`brief`, C, D12)

**목적**: 고정문장/정보카드를선택·합쳐핵심사실을손실없이분량제한안에제출. 내자리서류o12/프린터o19→과장o3. 과장:“한장으로. 글자크기는그대로요.” AI자유문장채점/외부API없음. 

변형3: (a)필수·중복정보선택 (b)허용요약recipe (c)사실값/논리순서/보고대상관심constraint. 첫10초:기간카드선택→보고서칸1차지→중복카드삭제→남은칸표시. 

원문 카드5/8/10개, 양식 용량4/5/6, 필수 사실, 결합2/3/4개, 선택/제거/합치기/순서, 남은 분량, 충돌 사유. 320px에서는 원문/보고서 탭과 고정 사실 요약을 쓰며 카드 높이48~64px·본문16px이다. 카드 선택→추가, 두 카드 선택→허용 결합, 키보드 Tab/Enter/Alt↑↓. 긴 자유문장 입력은 없다.

|난도/예제|카드비용/목표|정답/풀이|
|---|---|---|
|하 `brief_e01`|G목표2/P기간1/B예산1/F중복홍보3. required G,P,B/cap4, recipe GP2. |G+P+B=4 또는GP+B=3. F없어도핵심보존, 더짧은답valid. |
|중 `brief_n01`|G2/P1/B1/R2, 필수 사실4개/용량5. GP2, BR2 결합.|GP2+B1+R2=5 또는 G2+P1+BR2=5. 원문6칸은 초과하므로 두 요약 모두 유효.|
|상 `brief_h01`|G2/P1/B1/R2/O담당1/D결정2, required6/cap6, goal은budget보다앞, decision은마지막. recipes GP2/BR2/OD2, 추가GPB3/RO2/Dshort1. |GP→BR→OD=6(목표앞/결정뒤). 대안GPB→RO→Dshort=6. 모든factvalue동일. ‘예산반토막’같은유사단어카드는requiredfact값과충돌해invalid. |

```json
{"input":{"facts":[{"id":"budget","value":100,"unit":"fictional_unit"}],
 "cards":[{"id":"B","text":"예산은100단위입니다.","cost":1,"facts":[{"id":"budget","value":100}]}],
 "recipes":[{"id":"GP","consume":["G","P"],"produce":"GP","cost":2,"preserves":["goal","period"]}]},
 "goals":{"requiredFacts":["goal","period","budget"],"capacity":4,"orderConstraints":[]},"constraints":{"freeText":false,"duplicateFactPolicy":"sameValueAllowed"}}
Draft={"cardOrder":["GP","B"],"recipeApplications":[{"id":"GP","sources":["G","P"]}]}
```

카드·결합의 적법성 → 원문 출처 → 사실ID/값/긍정·부정 일치 → 필수 사실 → 비용 합 → 순서 조건을 검사한다. 폰트·줄 수·글자 수·이미지 폭은 분량이 아니며 stage.cost가 기준이다. 결합을 분해하면 원문 카드를 복원하고, 소비한 원문과 결합품을 이중 사용할 수 없다. facts는 usedRecipes/covered, metrics는 cost/cardCount, reasons는 missingFact/contradiction/overCapacity/order다. 부분 사실은 체크만 표시한다. 다양한 요약은 조건으로 판정하고 제작자 답 카드ID 하나와 비교하지 않는다.

힌트1 누락 사실·분량, 힌트2 중복·결합 후보, 힌트3 유효 요약. undo는 원문 출처까지 복원하고 중단 시 순서·소스를 저장한다. 제한시간 없이60~120초, 상 연구실120~180초. 최적화는 비용·정보 밀도이며 작은 글자 악용은 없다. 고정9개를 카드 부분집합·허용 결합·유한 순서로 검사한다. 단어 포함 여부로 채점하지 않는다. 절차 생성은 문장 검수 비용 때문에 후순위다.

문장 카드·집게·인쇄·과장 표정2종, 짧은 프린터음·도장. 검토 숙련, st_brief, decor_mat, 과장 일화, 도감 ‘한 장의 기준’. 시험은 필수 누락·같은 단어/다른값·소스 중복·결합 undo·글씨20px 동일 판정·동등 요약·순서·텍스트 escape·출처 복원이다. 완료 조건은 검수 문장9레벨, 동등 요약, 자유문장/외부API0이다.

## 엔진별 시험·출제·진행 게이트

|유형|해존재 증명 방법|절차출제 게이트|대표 고장/진행 폴백|
|---|---|---|---|
|conveyor|완성레일witness pure simulation + 결과bag|device cap/tick/copy와여러입력검증|loop/copy폭발→trace/보조완료|
|rules|유한allowed카드AST열거|우선순위/locked/모든목표동시해|충돌→관련규칙상세|
|macro|referenceprogram/고정경계입력전부|유한블록/금액범위/256step|budget 초과→stop+초안유지|
|owner|3!~5!constraints열거/unique|clue품질/한국어관계문검수|유일성0/2+stage등록거절|
|approval|유한slotCSP/dag|capacity/time/lag검사|불가능availability→safevariant|
|archive|pushBFS와걷기reachable|cornerdeadlock/최대풀이push20|undo/reset/선택skip|
|budget|후보 배치 backtracking|월/분기/window/선행 동시 검사|분기 초과 안내/전체 미리보기|
|brief|허용 결합·부분집합·순서 열거|문장과 사실 의미 검수|출처 손상 시 마지막 정상 초안|

솔버는 콘텐츠 제작/CI 도구이며 배포 HTML에는 필요한 힌트 witness만 넣는다. 오프라인 클라이언트의 답을 완전히 숨기는 서버 보안은 도입하지 않는다. 신규 golden JSON·솔버·시험을 제작했을 때만 신규 엔진 검증 통과라고 쓴다. 이번 계획의 예제 확인은 해법·산술의 별도 점검이며 게임 판정기 실행 시험과 구분한다.

## 예제 데이터의 완전성 보충

위 JSON은 타입 계약의 축약 예시이며 생략된 원문카드/벽/사례까지 실제 stage에 포함해야 한다. 규정 상 예제의 공개6사례는 A(사전/불완전/50), B(현장/완전/100), C(미접수/완전/50), D(사전/완전/50), E(사전/완전/100), F(현장/불완전/50)다. 예상 접수결과는 보완/허용/보완/허용/허용/보완이며 허용 문서 B/E는boss, D는chief다. 잠긴 불완전 규칙이 접수 OR보다 먼저다.

한장보고의 결합카드는 `orderedFacts`를 포함한다. GP=[goal,period], BR=[budget,risk], OD=[owner,decision], GPB=[goal,period,budget], RO=[risk,owner], Dshort=[decision]다. 상 예제의 ‘goal이 budget보다 먼저’는 `(카드순서, 카드내orderedFacts순서)`의 사전식 순서로 판정한다. 같은 GPB 카드 안에서도 goal이 budget 앞이므로 대안요약이 유효하다. decision은 보고서의 마지막 사실이어야 한다. 스크린 줄바꿈이나 폰트크기는 이 순서에 영향을 주지 않는다.

컨베이어 상 예제의 GE100 분기에서 yes는N, no는E다. copy(2,2)는 사본E/원본S이며 레일진입·출력방향은 문서의 진행을 결정한다. 충돌 연출과 별개로 입력은 원본별 순차 발행한다. 각사본 chief는1회, boss는100이상만1회, 원본 record는1회다. 이 규칙으로 A100/B50의 출력과도장을 비교한다.
