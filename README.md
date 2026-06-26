AI HelpyChat QA 자동화 프로젝트

엘리스의 기업용 AI 플랫폼 HelpyChat을 대상으로 E2E 테스트 자동화를 진행한 프로젝트입니다.

기간: 2026.05.13 ~ 2026.06.01  
팀: 4인

---

브랜치 구성

selenium — Python + Selenium + Pytest 기반 팀 프로젝트

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
