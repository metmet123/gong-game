# 공무원 키우기 — 금일 중 제출 · 통합 마스터 개발계획

> **퍼즐 시각·조작 계약 v1.2**: [앱 참고 디자인과 진행 방식](PUZZLE_UIUX_V1_2.md), [UI 데이터](data/puzzle_uiux_v1_2.json)를 함께 적용한다. 신규8·기존5·후속11종의 시안을 갱신했다. PF0~PF6·TASK39개와 게임 판정은 유지하고, 화면/조작 설명이 충돌하면 v1.2를 따른다. 실제 플레이 직관성·Android 실기는 이후 검증한다.

기본 명세 v1.0 · 2026-10-10 / **구현 순서 개정 v1.1 · 2026-10-11**. 이 문서 묶음은 신규 게임 빌드가 아니다. 원본 게임·기획 파일은 읽기 전용으로 조사했으며, 테스트에는 별도 저장 키를 쓰는 사본만 사용했다.

## 최신 변경 · 퍼즐 먼저 구현

사용자가 3단계 화면 시안과 **퍼즐을 먼저 독립적으로 플레이 가능하게 만든 뒤 나머지 화면을 맞추는 순서**를 요청했다. 현재 실행 순서는 [PUZZLE_FIRST_V1_1](PUZZLE_FIRST_V1_1.md)과 [새 PF TASK39개](tasks_puzzle_first_v1_1.json)의 PF0~PF6이다. 기존 P0~P11 순서와 선행 관계는 이전 계획으로 보존한다. 게임 규칙·좌표·가격·해금일은 기존 명세를 재사용한다.

UI v1.2의 3단계 HTML 시안은 작업 폴더 맨 위 `공무원키우기_3단계시안_퍼즐우선계획.html`에 있다. 43개 항목/129개 시안을 JavaScript 없이 읽을 수 있다. 기존 `공무원키우기_통합계획_탐색형.html`은 v1.0 문서 스냅샷이다. 신규8종은 아직 구현되지 않았으며 새 PF TASK도 모두 planned다.

## 이번 결정 1페이지

|항목|권장 결정|
|---|---|
|게임 정체성|가상 구청 생활보장과의 짧은 업무 논리 퍼즐 성장 게임. 퍼즐 70 / 성장·수집 20 / 사무실 10은 설계 지향점이다.|
|첫 플랫폼|Android 모바일 브라우저 세로 우선, PC 대응. 외부 서비스·유료 재화·계정·상시 서버 없음.|
|지도|원본 14×21 / 46개 물품 보존. **전체 지도 → 구역/물품 탭 → 장애물 회피 자동 이동 → 실제 구역 확대 → 작업대 → 도장 → 구역 복귀**.|
|구역|내 자리, 동료 업무섬, 결재 자리, 민원 창구·게시판, 출력·기록, 회의·예산, 휴식·출입의 7개. 결재/기록은 여러 작은 영역을 묶고 대상별 포커스를 쓴다.|
|첫 검증|PF1 독립 연습실의 신규8종 각1문제. 사무실 없이 선택→편집→검증→제출→재시도. PF2는 하/중/상 각1개=24문제와 기존5종 어댑터·초안/힌트·모바일 조작.|
|구현 순서|최소 준비 → 신규8종 러프 플레이 → 퍼즐 플레이 완성 → 사무실/저장 연결 → 성장·15일·신규72문제 → 디테일·Android 검수. 타과11종은 베타 이후 샘플1팩부터.|
|하루|본업 4건, 6~10분 목표. 어려운 최적화는 별도 연구실. 필수 4건이 장시간화하면 워밍업 비중을 늘린다.|
|난이도·실패|언제든 하/중/상 설정; 시작한 task의 seed·난이도는 고정. 무제한 되돌리기·3단계 힌트·보조 완료. 핵심 보상은 동일, 기록만 구분.|
|생활보장과 베타|3막·15일·8종 신규/5종 워밍업, 가상 주요 NPC 9명+방문자 템플릿, 도구 10종·소품 18종·도감 5분류·업적 18종.|
|P4~P6 최소 버전|1~5일·소식/결산·워밍업 5종, 핵심 NPC 5명, 기존 도구 6종, 장착 소품 6종, 도감 5분류의 빈 상태까지. P6에서 10일/도구10/사건을 확장한다.|
|기술|기존 순수 규칙을 보존한 HTML/CSS/JavaScript ESM + Canvas 2D + DOM 텍스트. esbuild로 인라인 IIFE 단일 HTML. 새 게임 엔진으로 전면 재작성하지 않는다.|
|저장|v1 원본 보존 → v2 기본 모듈/구역/거래/draft → v3 스토리/부서팩 확장. 마이그레이션 실패 시 원본을 덮어쓰지 않는다.|

## 읽는 순서와 전체 문서

|문서|용도|
|---|---|
|[PUZZLE_UIUX_V1_2](PUZZLE_UIUX_V1_2.md)|공식 앱9종 참고·퍼즐24종 작업면·첫 조작·오류/완료·모바일·직관성 검증 목표|
|[01_SOURCE_AUDIT_AND_DECISIONS](01_SOURCE_AUDIT_AND_DECISIONS.md)|실제 구현·첨부 제안·외부 사실·신규 결정의 구분, 충돌 조정, 조사 근거|
|[02_MASTER_GAME_DESIGN](02_MASTER_GAME_DESIGN.md)|재미·루프·하루·난이도·출시 범위|
|[03_STORY_WORLD_NPCS_EVENTS](03_STORY_WORLD_NPCS_EVENTS.md)|3막·15일·NPC·선택·다음 날 결과·대사|
|[04_OFFICE_ZONES_CAMERA_UI](04_OFFICE_ZONES_CAMERA_UI.md)|정확한 원본 좌표·7구역·BFS·카메라·터치·전체 UI 와이어프레임|
|[05_PUZZLE_SYSTEM_AND_8_SPECS](05_PUZZLE_SYSTEM_AND_8_SPECS.md)|5종 전환·8종별 입력/판정/3난이도 예제/힌트/검수|
|[06_GROWTH_DECOR_COLLECTIONS_ECONOMY](06_GROWTH_DECOR_COLLECTIONS_ECONOMY.md)|도구·소품·도감·업적·가격·15일 경제|
|[07_DEPARTMENT_EXPANSION_PACKS](07_DEPARTMENT_EXPANSION_PACKS.md)|타과 11종·고유 규칙·부서팩 등록·복귀|
|[08_TECH_ARCHITECTURE_SAVE_ASSETS](08_TECH_ARCHITECTURE_SAVE_ASSETS.md)|모듈·인터페이스·세이브·빌드·자산·플랫폼 폴백|
|[09_PHASED_ROADMAP_AND_TASK_BACKLOG](09_PHASED_ROADMAP_AND_TASK_BACKLOG.md)|P0~P11 작은 TASK, 의존성·입출력·수동/자동 검증·DoD|
|[10_TEST_PLAN_AND_ACCEPTANCE](10_TEST_PLAN_AND_ACCEPTANCE.md)|실제 이번 점검과 향후 시험 분리, 릴리스 게이트|
|[11_RISK_REGISTER_AND_OPEN_DECISIONS](11_RISK_REGISTER_AND_OPEN_DECISIONS.md)|재미·비용·플랫폼·개인정보·미확인 사항·결정 기본값|
|[12_NEXT_IMPLEMENTATION_HANDOFF](12_NEXT_IMPLEMENTATION_HANDOFF.md)|다음 세션 착수 프롬프트와 첫 TASK|

구현자는 **00 → 01 → 08 → 04 → 05 → 09 → 10 → 12**, 콘텐츠 담당자는 **02 → 03 → 05 → 06 → 07** 순서로 읽는다. 하나의 문서만 보고 구현하지 않는다.

## 추적 가능한 데이터·시안·증거

- [통합 기준 데이터](data/planning_contract.json): 일차·퍼즐 ID·구역·가격·해금. 문서와 이 파일이 충돌하면 우선 이 계획의 변경 기록을 작성하고 둘을 함께 수정한다. 사용자 원본 맵이 최상위 기준이다.
- [원본 배치 사본](data/office_original_v1.json), [구역 오버레이 SVG](assets/office_zones_overlay.svg): 순서/방향/footprint를 유지한 설계 그림. 신규 실행 게임 화면으로 오해하지 않는다.
- [TASK 데이터](tasks.json), [TASK CSV](tasks.csv): 구현 의존성 및 검수 항목. 모든 상태는 `planned`이다.
- [실제 원본 점검 결과](evidence/actual_audit_results.json), [소스 해시](evidence/source_manifest.json), [배치/접근 분석](evidence/map_analysis.json), [교차검증 결과](evidence/plan_validation.json).
- `evidence/preview/index.html`은 원본 HTML의 테스트 사본이다. 별도 저장 네임스페이스이며 출시/신규 구현 결과가 아니다.

이번 직접 실행은 데스크톱 내장 브라우저 320×640 / 390×844와 Node 규칙 테스트이다. **실제 Android 삼성 브라우저·content://·신규 카메라·신규 8종 엔진은 미검증**. `Screenshot_20261010_205101_Samsung Browser.jpg`는 작업 폴더/첨부에서 식별되지 않았다. ‘붙임5/6/7’은 역할로만 이해하고 임의 파일 번호 대응은 하지 않았다.

## 변경 통제

사용자 승인 후에도 한 TASK와 해당 시험을 끝내고 체험 빌드를 만든다. 대규모 일괄 재작성, 원본 덮어쓰기, 실제 인물/민원 데이터 사용, 상용 이미지 포함, 기본 네트워크 의존, 유료 서비스 도입을 금지한다. 미확인 플랫폼 제약을 해결하기 위해 게임 방향/배포 방식이 크게 바뀌면 그때만 사용자 결정을 받는다.

## 작업 재개와 제출 상태

2026-10-10 재개 작업 위치: `C:\Users\이현주\Desktop\공무원키우기 _코덱스`. 이전 실행 기준·소스·문서·증거를 복사해 보존했으며 원본 삭제/덮어쓰기는 하지 않았다. 실제 이전 문서 위치는 `Documents/Codex/2026-10-10/html/docs`였다.

요청한 Markdown13개, 정확한 원본물품/구역/도구/소품/15일경제 표, TASK96개와 의존성, 시험/위험/다음세션 인계를 작성했다. 원본 요청별 대응은 [요구사항 추적표](evidence/requirements_traceability.md), 재개 검사는 [plan_validation](evidence/plan_validation.json)·[example_checks](evidence/example_checks.json)·[resumption_checks](evidence/resumption_checks.json)을 따른다. 이 완료는 **계획서 제출**이며 신규 게임 구현/Android 검증 완료가 아니다.

첫 구현은 원본진단/보존 P0 → 규칙·저장호환 P1 → 실제3구역 맵 P2 → 컨베이어 합동한판 P3 순서다. 추가 사소한 결정 없이 문서기본값으로 시작할 수 있으며 실제 구현은 사용자 검토 후 요청할 때 착수한다.
