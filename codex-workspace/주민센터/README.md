# 모퉁이동 주민센터 · 전입신고

친구 피드백용 공개 테스트: https://metmet123.github.io/gong-game/resident-test/ · 2026-10-11 배포·온라인 플레이/복원 검증 완료. 휴대폰 브라우저에서 ‘첫 접수 시작’을 누른다. 의견은 별도로 전달받으며 자동 수집하지 않는다.

[전입신고_퍼즐.html](전입신고_퍼즐.html)을 브라우저에서 열면 바로 플레이할 수 있다. 처음 시작하면 ‘두 사람의 첫 독립 주소’에서 주민의 말·이전 기록·새집의 부탁을 연결해 관계를 직접 판단한다. 오답도 초안에 남으며 자료를 보고 수정할 수 있다. 도입 완료 후 6사례 퍼즐로 이어지고, ‘4일의 근무 이야기’에서 주민센터 지도와 12회 방문을 진행한다. 설치나 인터넷 연결이 필요 없다.

[공무원키우기_주민센터_통합후보.html](공무원키우기_주민센터_통합후보.html)은 현재 배포본 사본에 연결한 로컬 후보다. 본편 근무를 마치면 인사발령이 열리고, ‘챕터 체험’은 즉시 무보상 플레이가 가능하다. 원본 본편·배포 저장을 덮어쓰지 않는다.

[UI_비교_프로토타입.html](UI_비교_프로토타입.html)에서 이전 시안과 현재 화면을 같은 크기로 조작할 수 있다. 이전 3사례 시안과 빌더도 그대로 보관했다.

구현: 모바일 카드 선택, 세대 구성과 관계 기록, 상세주소 질문, 보완 안내/재방문, 오류 수정, 무료 힌트, undo/redo, 자동 저장·복원, JSON 백업, 4일 이야기·6구역 지도·4개 기념품. 인물과 주소는 모두 가상이며 성인 사례만 포함한다. 실제 행정 처리를 수행하지 않는다.

## 빌드

- 실제 퍼즐: `python 주민센터/build_puzzle.py`
- 통합 후보: 위 명령 다음 `python 주민센터/build_integrated.py`
- 이전 시안만: `python 주민센터/build.py`

## 검증

`node 주민센터/tests/tutorial.test.cjs`, `node 주민센터/tests/engine.test.cjs`, `node 주민센터/tests/storage.test.cjs`, `python 주민센터/tests/protection.py`.

브라우저 검사는 Playwright와 Edge를 사용한다. `PLAYWRIGHT_PACKAGE`를 Playwright 패키지 경로로 지정한 뒤 `puzzle-browser.cjs`, `ux-browser.cjs`, `integration-browser.cjs`, `legacy-regression.cjs`를 실행한다. 전체 재현은 `python 주민센터/tests/run_checks.py --browser`로 실행한다. 최종 결과와 산출물 해시는 `docs/최종검사.json`에 기록한다. 실기기 확인 여부와 근거는 [출시 검증](docs/출시검증.md)에 구분했다.

문서: [진행 계획](PROJECT_PLAN.md), [작업 로그](2._WORK_LOG.md), [남은 확인](3._TODO.md), [설계 결정](DECISIONS.md), [본편 연결 계약](docs/본편연결계약.md).

[첫 접수 구현·모바일 검증](docs/첫접수_구현검증.md). 기존 진행 중 접수는 강제 도입 없이 복원되며 목록에서 첫 접수를 별도로 열 수 있다.
