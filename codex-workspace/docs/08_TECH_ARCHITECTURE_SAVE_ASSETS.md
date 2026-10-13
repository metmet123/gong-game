# 기술 아키텍처·데이터·저장·에셋·배포

## 기술 선택과 재사용

현재 DOM 없는 `GameCore`가 실행 HTML과 동일하고 기존1,200변형 검사도 통과했다. 핵심 규칙을 동결한 뒤 책임별 ESM으로 추출한다. 그림/모달/상태/저장은 분리한다. `build_scene.py`의 함수 문자열 자르기는 새 구조에서 폐기하고 원본 재현 전용으로만 보관한다.

|선택|이득|비용/제약|결정과 측정 게이트|
|---|---|---|---|
|Vanilla JS ESM + Canvas2D + DOM|기존 순수 규칙/텍스트/자체픽셀 재사용, 작은오프라인번들, 모바일실문자접근성|카메라/BFS/input/state 직접 작성|**선택**. 294칸/19좌석의 요구에는 충분한 설계. P2 프레임/입력지연 측정으로 확인.|
|Phaser|2D씬/입력/카메라/Canvas·WebGL 기능 제공|기존 DOM작업대/저장과 연동, 프레임워크 도입·이관/추가번들 검수|P2 직접 카메라 구현이 반복 오류/성능실패로 수정비용을 크게 늘릴 때 비교프로토타입. 측정없는전면재작성금지. [공식 소개](https://docs.phaser.io/phaser/getting-started/what-is-phaser)|
|Godot Web|편집기/씬/네이티브 Android 확장 가능|엔진·스크립트 재작성, Web export/파일/렌더 제약 별도, 단일HTML 목표와 거리|현단계 보류. 네이티브앱이확정되거나큰물리/3D이득이실측될때재검토. [공식 Web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html)|

비교는 비용/역할의 설계 평가이며 이 프로젝트의 엔진별 성능 벤치마크를 수행한 것은 아니다. 공식 자료 확인일2026-10-10. 별도프레임워크로옮겨도pure PuzzleModule/SaveRepository 계약은변하지않아야한다.

## 권장 소스 트리와 책임

```text
src/
  app/main.js                   # 기능 탐지, 최초 저장 로드, root mount
  app/session.js                # task 시작/중단/제출/결산, transition reducer
  core/state.js                 # 초기 상태/불변 invariants
  core/legacy-rules.js           # 기존 generate/evaluate 호환 어댑터
  core/task-planner.js           # 본업4건, 설치유형/일차/회신 fallback
  core/reward-ledger.js          # task/day/event 1회 claim, purchase transaction
  puzzles/registry.js            # type/contract/schema 등록
  puzzles/common/{draft,undo,feedback}.js
  puzzles/{compare,sort,memory,sequence,route}/...
  puzzles/{conveyor,rules,macro,owner,approval,archive,budget,brief}/
    rules.js / view.js / schema.js
  world/{map,collision,pathfinding,movement,camera,hit-test}.js
  render/{office,sprites,text-overlay,effects,audio}.js
  narrative/{events,conditions,callbacks}.js
  progression/{skills,economy,inventory,codex}.js
  persistence/{repository,validation,migrate-v1-v2,migrate-v2-v3,backup}.js
  ui/{router,workbench,bulletin,summary,shop,codex,settings}.js
  ui/styles/{tokens,layout,workbench}.css
content/
  office/layout.private.v1.json / zones.v1.json / anchors.v1.json
  stages/<type>/<difficulty>/*.json
  story/days.v1.json / npcs.v1.json / events.v1.json
  catalogs/{tools,decor,codex,achievements}.json
  departments/life_support/pack.json / recycling/pack.json ...
assets/{sprites,licenses.json}
tools/{build-html,serve,validate-content}.mjs
tools/solvers/<type>.mjs
tests/{unit,content,integration,e2e,fixtures}
dist/공무원키우기_통합_v2.html   # 이후 v3 별도 이름, 원본 덮어쓰지 않음
docs/                         # 이번 계획/증거, 제품 데이터로 직접 실행하지 않음
```

방향: UI→session action→pure core→새 snapshot→save→projection render. Renderer는화면에필요한snapshot을받고state전역/DOM업무목록을읽지않는다. PuzzleRegistry에는type별모듈등록만, 하루분기는TaskPlanner/DepartmentPack데이터에있다. Economy는가격/transaction과만관계하고그림을그리지않는다. Codex는완료기록/인벤토리/이벤트의projection이다.

현재`scene-controller`에서처음추출할것은store/state/complete/endDay, `scene-art`는 `geometry`를JSON map과CameraSnapshot을받는함수로치환, sprite는기존픽셀정의를재사용한다. `workshop.js`문자열후처리는공통WorkBench 컴포넌트+각view로교체. 한 번에모든UI를쓸어없애지않고featureFlag로새맵/기존5퍼즐어댑터부터연결한다.

## 공통 데이터/상태 계약

|모델|필수 필드/불변식|
|---|---|
|Map|layoutId,sourceVersion,cols,rows,items(id,type,x,y,w,h,dir,label); 원본불변,가구anchor와별도|
|Zone|zoneId,departmentId,polygons,objectIds,defaultFocus,approachCandidates,cameraScale,actions,npcIds,anchors|
|CameraSnapshot|centerX/Y,scale,viewportRect,transformRevision;파생/일시적,save에rawpixel없음|
|Task|taskId,stageId,type,contentVersion,seed,difficulty,required,zoneId,objectId,status,storyEventId,completedResult|
|QuestionData|Stage schema([05](05_PUZZLE_SYSTEM_AND_8_SPECS.md));검증용witness/생성seed버전|
|Draft|schemaVersion,taskId,type,stageSnapshot/고정seed,answerState,undoStack(last50),hintMax,elapsedActiveMs,assisted;paused와경과분리|
|Event|eventId/trigger/conditions/choices/effects/onceKey/callbackDay;effects허용enum만|
|Inventory|ownedItems{id:acquiredClaimId},equippedByAnchor{anchor:itemId},ownedTools;소유/장착분리|
|Codex|seenEntries,firstSeen,stage별기록/힌트/해금;stats는record에서재계산|
|DepartmentPack|packId/version/engineContract/zone/stage/npc/reward/dependencyAssets;[07](07_DEPARTMENT_EXPANSION_PACKS.md)|

화면 phase와day phase를분리: screen=`overview/moving/zone/workbench/result/menu`, dayPhase=`bulletin/working/summary`. summary는결산이후날짜경계의기록으로reload복구한다. 카메라선택은월드좌표/zone/object/lastSafeCell만save. 별도메뉴scroll/focus/UItab은편의필드로무시해도게임진행손실없다.

숫자는 유한 정수/한도, string은길이제한/HTML escape, ID는허용catalog와namespace로검사. `__proto__/constructor/prototype`키거절, map은Map/Object.create(null),객체를검증없이Object.assign하지않음. imported stage는임의JS/eval/assetURL실행불가. 입력File사이즈/형식실패로기존save를변경하지않음.

## 저장 v1 → v2 → v3

### v1 실제 구조

```json
{"version":1,"name":"새싹","started":false,"day":1,"xp":0,"coins":30,"energy":100,
 "records":{},"wrong":{},"startedTasks":{},"history":[],"tools":[],"decor":[],
 "coffee":false,"autoUsed":false,"stats":{"compare":{"cleared":0,"perfect":0,"score":0}},
 "settings":{"difficulty":"normal","sound":true,"motion":true},"weekCelebrated":false}
```

`stats` 실제로5유형;이예시는축약. v1Validate는범위day1..3650,수치0..1000000,tools/decor알려진ID/중복없음,history≤100,records≤14600,난도3종을검사하고stats를records에서재계산한다. wrong/startedTasks는저장하지만answer초안은없다. legacy task생성은`day*137+index*29+난도offset`으로고정되므로마이그레이션에generator버전도보관한다.

### v2 공통 구조

```json
{"version":2,"revision":1,"gameId":"civil-servant-grow","profile":{"name":"새싹","started":true},
 "resources":{"xp":75,"points":110,"focus":92},
 "campaign":{"id":"campaign1","day":2,"phase":"working","dayCloseClaims":[]},
 "tasks":{},"taskResults":{},"drafts":{},"rewardLedger":{},"purchaseLedger":{},
 "inventory":{"tools":[],"ownedItems":{},"equippedByAnchor":{}},
 "daily":{"coffeeUsed":false,"autoUsed":false,"archiveRecovered":false},
 "world":{"layoutId":"office_private_v1","departmentId":"life_support","zoneId":null,"objectId":null,"lastSafeCell":[1,12]},
 "story":{"flags":{},"eventLedger":{},"callbacks":[]},
 "settings":{"difficulty":"normal","sound":true,"motion":false,"textSize":16},
 "legacy":{"schemaVersion":1,"rawBackupRef":"legacy-v1","day":2,"records":{},"wrong":{},"startedTasks":{},"history":[]}}
```

v2는P1~P5 기본저장. core/장착/원장/초안/기본스토리의shape를먼저마련한다. v3(P6)에는 `contentVersions,packProgress,codex,achievements,story.relationships,story.deliveredCallbacks,returnContext,orphans`를추가. 기존v2필드이름을다시갈아엎지않는다. 각PuzzleDraft.schemaVersion은root save와독립적으로type모듈이migrate한다.

### 필드 보존·과거 일차 이어가기

|v1 입력|v2/v3 목적|보존/주의|
|---|---|---|
|name/started|profile|최대12자그대로,이름재입력강제없음|
|xp/coins/energy|resources xp/points/focus|숫자그대로,records로재계산해구매이력을잃지않음|
|records dNtI|legacy.records + taskResults legacy:dNtI|score/time/난도/보조/자동동일. 보상원장동일alias 등록,새신규완료위조금지|
|wrong/startedTasks|legacy + 현재bridge task|첫난도고정,legacy generate로같은문제. 초안은v1에없으므로새로만듦|
|day/history|legacy.day/history + campaign bridge|현재일차4건을먼저마침. 이미종료된날의dayclaim을보존,퇴근보너스중복0|
|tools6|inventory.tools|동일ID/무료소유,레벨/일차를다시요구안함|
|plant/mug/cat|decor_plant/decor_mug/decor_cat owned/equipped|기본slotplant/mug,cat와plant동시소유면plant기본장착/cat미장착. 무료변환/재구매금지|
|settings|settings|difficulty/sound/motion보존,textSize16추가. OS동작줄이기는실행시우선|
|coffee/autoUsed|daily|현재bridge/day에보존,다음새일차리셋|
|stats/weekCelebrated|재계산projection/legacy수료일화|기록유형혼합안함,처음수료보상재지급안함|

**bridge 명세**: old.day≤5면현재같은day의legacy4task를그대로이어가고퇴근후campaignDay=old.day+1. old.day>5면UI‘기존N일차이어하기’,현재legacy4건완료/퇴근후**새본편D6**으로연결. 예를들어v1 day27에서도새퍼즐D6을경험하고XP/P는27일이력그대로다. 현재완료한task는claim등록후완료로표시,다시reward하지않음. 수료후story1~5는recap/도감으로처리;원하면보상0회상모드. 일반기존기록의날짜를새15일스토리완료로전부소급하지않는다.

현재day에4개record있지만퇴근전이면summary가아직없으므로endDay1회만허용. history100개제한으로오래된결산이빠졌어도`day<old.day`의legacy closeclaims는상태값기반으로보존한다. 잘못된v1 future task/unknownID는조용히삭제하지않고오류보고/raw백업,허용된필드만으로복구제안한다.

### 마이그레이션 절차·롤백

1. 읽은원문JSON을그대로보관(프로필실명일수있으므로외부업로드없음). sourceHash/schema/revision/meta만로그.
2. v1검증→pure `migrateV1ToV2`→v2검증→pure `migrateV2ToV3`→v3검증. 입력객체불변,같은입력같은결과.
3. 신규namespace pending에완전한snapshot을기록/재읽기검증,그뒤main commit. **v1 키를삭제하거나덮어쓰지않음**.
4. main불가면메모리모드+JSON내보내기. 변환실패는이전HTML/기록으로이어가기버튼과구체적오류,진행0으로reset금지.
5. 신규업데이트시lastGood은이전정상snapshot. 앞으로의save버전인unknownfuture는read-only백업/이전빌드안내,강제downgrade하지않음.

keys: 기존 `civil-servant-grow-v1`, 새 `civil-servant-grow-v2`/`...-v3`, `...-pending`, `...-lastGood`, `...-legacy-v1-raw`. 모두같은origin에서보이는때만읽을수있다. **새파일명/content://가다른storage영역이면자동발견불가**,JSON내보내기→가져오기가정식이동경로다.

v1 픽스처는 미출근, D1부분완료, 4건완료/퇴근전, D6수료후, 옛D27, 모든도구+화분/고양이, 상난도 진행중, 오답기록, 잘못된 수치, 손상JSON, 미래버전의 11종이다. 이름·XP·P·소유·기록·시작 난도는 같은 값을 보존하고 통계만 재계산할 수 있다. 변환 구현/시험은 P1/P6에 있으며 이번 계획에서 v2/v3 변환을 구현하지 않았다.

### 보상 원자성·초안·파일 백업

`claimTask(taskId,result,revision)`는 시작 상태·같은seed·valid 또는 명시적 보조 결과를 확인하고 원장을 조회한다. 결과·XP·P·인벤토리·도감·플래그를 한 snapshot으로 저장한다. 이미 claim이면 기존 결과를 반환하고 증분0이다. 결산은 `dayClose:campaignId:day`, 구매는 `purchase:itemId`로 중복을 막는다. 오프라인 JS 조작을 완전히 방지하는 보안은 범위 밖이다.

결과와 재화는 main JSON 하나로 저장한다. pending은 전체 검증 snapshot이며 revision을 증가시킨다. commit 실패는 경고와 메모리 원장을 유지한다. 복원 시 유효 pending이 main보다 최신이면 미리보기 후 복구하고, 손상 pending은 lastGood을 제시한다. checksum은 우발 손상 검사용이며 암호화나 조작 방지가 아니다.

draft debounce500ms/제출·중단·visibilitychange/pagehide 즉시flush. 마지막브라우저종료이벤트실행은보장하지않으므로업무중‘저장됨’와‘내보내기’도제공. 매tick로그/카메라프레임마다저장하지않음. active필수draft1+선택draft1,undo최근50;stageSnapshot가판정호환성보장,시뮬의중간frame/pc는복원시재실행. elapsed는active시간만,배경에서제한시간흘러가지않음.

백업은 버전meta·schema·필요 stageSnapshot·save본문을 포함하고 날짜/일차 파일명을 쓴다. import 상한4MB, 실제 저장 목표1MB 이하. 파일 크기→JSON→schema→변환→미리보기→확정 순서이며 취소는 무변경, 기존 상태는 lastGood으로 남긴다. Blob 다운로드가 불가하면 텍스트 복사/가져오기를 제공한다. localStorage가 삭제되면 외부JSON 없이 복구할 수 없음을 설정에 표시한다.

## Android·오프라인 폴백

[MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)는file: URL의동작요건이정의되지않고브라우저별달라질수있음을설명한다(확인2026-10-10). 이는삼성content://의보장이아니다. 실기사양/앱버전/열기앱/주소scheme을검수로그에기록한다.

|상황|구현 기본값/시험|
|---|---|
|content:// 또는file://에서storage접근거절|try get/set probe/실패catch,메모리진행+지속경고+JSON백업. 어느앱이열었는지확인,로컬HTML실행을보장이라쓰지않음|
|storage quota/쓰기실패/브라우저데이터삭제|기존정상사본삭제금지,보상메모리한번만,백업안내. 외부파일없이삭제기록복구약속금지|
|파일명변경/다른브라우저|v1기존키자동검색실패가능,export/import 안내. origin간storage을우회탐색하지않음|
|portrait/rotation/주소창/키보드|dvh+vh fallback/visualViewport선택/ResizeObserver 또는window.resize. active판정동일,카메라재계산|
|Android 뒤로|화면 뒤로 버튼과 DOM 화면 history 어댑터, 초안 저장. 최상위 화면에서는 브라우저 뒤로를 막지 않음|
|touch/drag|pointer events, 칸 선택·방향 버튼, 스크롤 pan-y, 회전 pointercancel 후 초안 유지|
|오디오 autoplay/AudioContext 없음|첫 사용자 동작에서 resume. 무음으로도 진행. 소리off는 재생을 건너뜀|
|오래된브라우저기능결손|showModal/ResizeObserver/File.text/structuredClone feature탐지;DOM dialog/FileReader/resize/명시clone으로폴백|
|외부리소스offline|런타임fetch/fontCDN/remoteimage/importURL0. 미임베드asset은placeholder로기능유지|

삼성로컬열기가실기에서지속실패하면권장2안은정적HTTPS웹앱(계정/서버로직없음)+서비스워커캐시. SW는일반file://단일HTML에서작동한다고가정하지않는다. 정적웹앱은별도배포결정이며현재단일HTML기본을조용히바꾸지않음.

## 빌드/테스트 도구·실행 명령 계획

개발은 ESM, 배포는 IIFE(es2019 target)로 한다. esbuild 묶음·CSS·자산을 `tools/build-html.mjs`가 단일 HTML에 넣고 종료 script 문자 escape와 외부URL 잔존을 검사한다. 개발서버는 loopback 전용이며 제품 실행에는 서버가 필요하지 않다.

```powershell
# 다음 구현 세션에서 package.json/scripts를 작성한 뒤 실행할 계약
npm install --save-dev esbuild @playwright/test
npm run dev                         # node tools/serve.mjs, loopback
npm run test:unit                    # node --test tests/unit/*.test.mjs
npm run test:content                 # node tools/validate-content.mjs
npm run test:integration             # node --test tests/integration/*.test.mjs
npx playwright install chromium     # E2E 가능한 개발 환경에서만
npm run test:e2e                     # playwright test
npm run build                       # node tools/build-html.mjs
npm run verify:offline              # 내장 리소스/네트워크0/로드 검사
```

패키지는 설치 시 지원 Node와 맞추고 lockfile로 고정한다. 현재 package.json이 없어 위 npm 명령은 향후 계약이다. 기존 규칙 시험과 계획 검증만 실행했다. [esbuild 공식](https://esbuild.github.io/getting-started/), [Node test 공식](https://nodejs.org/api/test.html), [Playwright 공식](https://playwright.dev/docs/intro) 확인일2026-10-10. 도구별 지원 Node를 P0에서 확인한다. UI 자동화 불가 시 수동 절차로 대체하고 자동 통과로 표시하지 않는다.

빌드는 새 src/content/dist 경로만 사용한다. P2의 기존5종은 legacy 어댑터로 연결하며 기준 HTML을 덮어쓰지 않는다. 가져오기 시험은 별도 namespace다. 힌트 해법이 배포 HTML에서 보일 수 있는 개인용 오프라인 제약을 수용하며 이를 숨기기 위해 서버 요구를 추가하지 않는다.

## 아트·음향 자산과 성능 예산

|자산|MVP/베타 수량·방식|사용/저비용 제작|
|---|---|---|
|캐릭터|12×17 기본sprite 유지, 상세24×32는 선택. 4방향 걷기4/대기2, 전화·타이핑·종이·도장·전달 각2|주인공+NPC9은 팔레트 공유, 초상32×32·표정2|
|가구|원본types21종,2×2좌석base/1×4window/2×1cabinet/3×2meeting등|Canvas 또는직접그린sprite atlas,4방향은footprint그대로localart만|
|장식/도구|MVP소품6/도구6,베타소품18/도구10|16~24pxsprite, slot별visible리뷰|
|퍼즐|공통paper/stamp/tray/tile/card/log;유형별장치[05]|문제수치/카드문구HTML,배경한장당복붙금지|
|도감/부서|배지·초상·아이템sprite 재사용, 부서스탬프11은 순차 제작|타사그림·실제상징·실제지도 제외|
|소리|paper/stamp/phone/submit/undo/coffee6톤|WebAudio noise/oscillator로자체생성,PCM필수아님;기본음악없음|

목표30fps, 대기씬10~15fps. 논리 tick과 애니메이션을 분리하고 숨긴 탭은 rAF를 멈춘다. 바닥·가구는 캐시, 인물·효과만 갱신. DPR최대2, 텍스트DOM, 변경 칸만 갱신. 동시 NPC애니메이션4, 퍼즐토큰16, 실행 로그 최근256단계/화면8줄로 제한한다.

목표(측정필요): 첫배포HTML≤2MB(현재126KB기준에큰그림없음),저장≤1MB,모바일메모리≤64MB,첫조작가능2초내,95백분위입력피드백100ms내,씬이동/줌총2.5초내. 수치는보장아닌게이트, 실기에서안맞으면자산/리페인트/애니메이션부터줄임. Canvas성능이실패해도Puzzlelogic/state변경으로숨기지않음. 

외부자산은URL/작가/라이선스/확인날짜/변형/배포범위등록필수. 생성AI/유료API/폰트다운로드를기본예산전제로두지않음. 개인정보원문save/스크린샷은로컬증거에만두며보고서외부공유시이름/경로개인정보를제거한다.
