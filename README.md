AI HelpyChat QA 자동화 프로젝트

엘리스의 기업용 AI 플랫폼 HelpyChat을 대상으로 E2E 테스트 자동화를 진행한 프로젝트입니다.

기간: 2026.05.13 ~ 2026.06.01
팀: QA 5기 3팀 Focus (4인)

---

브랜치 구성

selenium — Python + Selenium + Pytest 기반 팀 프로젝트
playwright — TypeScript + Playwright로 직접 리팩토링한 개인 버전

---

selenium 브랜치

사용 도구: Python, Selenium, Pytest, GitLab CI/CD, Allure Report, Discord Webhook, Jira

팀 전체에서 GitLab CI/CD 파이프라인을 구성해 테스트 실행 → Allure 리포트 자동 생성 → Discord 알림 → Jira 이슈 자동 등록까지 이어지는 흐름을 만들었습니다.

내가 한 것:

테스트 코드와 UI 로직을 분리하는 3계층 POM 구조를 설계했습니다.
BasePage → 기능별 Page → 세부 Page 3단계로 나누어,
URL이 바뀌거나 UI 구조가 변경됐을 때 수정해야 하는 파일이 29개에서 1개로 줄었습니다.
URL, 계정 정보, 로그인 헬퍼도 fixtures/helpers로 중앙화해 환경이 바뀌어도 수정 파일은 1개입니다.
마이페이지, 설정, 도구 관련 테스트 케이스를 작성했습니다.

팀 전체 테스트 케이스 67개 (일반 61개 + 부하 테스트 6개), Failed 0

---

playwright 브랜치

사용 도구: TypeScript, Playwright, Node.js

팀 프로젝트 종료 후 Selenium 기반 코드를 TypeScript + Playwright로 혼자 옮겼습니다.

주요 변경 내용:
- OTP SSO 로그인을 global-setup.ts에서 1회 처리하고 storageState로 세션을 재사용
  → 테스트마다 반복되던 로그인을 없애 실행 시간이 46분에서 2.4분으로 줄었습니다
- selenium 브랜치의 3계층 POM 구조를 그대로 유지하면서 TypeScript로 재작성
- 팝업 처리, 탭 전환 방식 등 Selenium 특유의 패턴을 Playwright 방식으로 교체

기능 테스트 61개 (npx playwright test), Failed 0
부하 테스트 6개 (npx playwright test --config=playwright.performance.config.ts), 별도 실행

부하 테스트를 기본 실행에서 분리한 이유:
부하 테스트는 AI 응답 대기, accounts.elice.io 세션 등 실제 서버 응답 시간이 포함되어 순차 실행(workers: 1)이 강제됩니다.
병렬 실행이 불가능하기 때문에 Playwright의 핵심 장점인 병렬 실행 속도 우위를 정확히 측정하려면
기능 테스트만을 비교 대상으로 삼아야 합니다.
부하 테스트 코드는 playwright.performance.config.ts로 분리하여 독립 실행이 가능합니다.
