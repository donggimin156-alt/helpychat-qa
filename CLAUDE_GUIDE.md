# Claude와 함께하는 Selenium E2E 테스트 자동화 가이드
> 이 프로젝트(focus_project)의 구조·패턴을 다른 팀이 재사용할 때 참고하세요.

---

## 1. 이 프로젝트 구조 한눈에 보기

```
focus_project/
├── config/
│   ├── settings.py          # URL, 계정, 대기시간 상수
│   ├── browser_factory.py   # Firefox 드라이버 생성
│   ├── login_helpers.py     # 로그인/배너닫기 공통 함수
│   └── selenium_imports.py  # Selenium import 한곳에 모음
│
├── pages/                   # POM (Page Object Model)
│   ├── base_page.py         # 모든 Page의 부모 클래스
│   ├── login/login_page.py
│   ├── chat/chat_page.py
│   └── mypage/...
│
├── tests/                   # 실제 테스트 케이스
│   ├── login/test_login.py
│   ├── chat/test_chat.py
│   └── mypage/...
│
├── utils/
│   ├── jira_helper.py       # Jira 자동 티켓 생성
│   └── random_generator.py
│
├── conftest.py              # 공통 fixture (driver, login, 로깅, Allure)
└── pytest.ini
```

**핵심 패턴:**
- **POM** — 페이지별로 클래스 분리, 테스트 코드에는 로직 없음
- **BasePage** — 공통 클릭/입력/대기 메서드 상속
- **conftest** — driver fixture, 로그인 캐싱, Allure 리포트 자동 생성
- **settings.py** — URL·계정·타임아웃 전부 한 파일에서 관리

---

## 2. 새 프로젝트 시작할 때 Claude에게 할 말

### 프로젝트 셋업
```
우리 팀이 이전에 만든 Selenium + Pytest E2E 자동화 프로젝트 구조를 기반으로
새 프로젝트를 셋업해줘.

구조:
- POM 패턴 (pages / tests 폴더 분리)
- BasePage 상속 구조
- conftest.py에 driver fixture와 로그인 캐싱
- config/settings.py에 URL, 계정, 대기시간 상수 중앙화
- Allure 리포트 자동 생성

테스트 대상 서비스: [서비스 이름]
베이스 URL: [https://...]
주요 기능 페이지: [로그인, 대시보드, ...]
```

### 새 페이지 클래스 만들기
```
[페이지 이름] 페이지에 대한 Page Object 클래스를 만들어줘.

- pages/[기능]/[기능]_page.py 위치에 생성
- BasePage 상속
- 주요 동작:
  1. [버튼 클릭]
  2. [텍스트 입력]
  3. [결과 확인]
- 로케이터는 클래스 상단에 상수로 모아줘
```

### 새 테스트 파일 만들기
```
[기능]에 대한 pytest 테스트 파일을 만들어줘.

- tests/[기능]/test_[기능].py 위치
- conftest의 logged_in_driver fixture 사용
- 테스트 케이스:
  1. [정상 시나리오]
  2. [엣지 케이스]
- @allure.feature / @allure.story 데코레이터 포함
- 실패 시 스크린샷 자동 캡처 포함
```

---

## 3. 자주 쓰는 작업별 Claude 프롬프트

### 테스트가 깨졌을 때
```
tests/[파일명].py 의 [테스트명] 테스트가 실패하고 있어.
에러 메시지: [에러 붙여넣기]

pages/[페이지].py 의 관련 로케이터나 메서드를 확인하고 고쳐줘.
실제 서비스 구조가 바뀐 것 같으면 XPath/CSS selector도 같이 업데이트해줘.
```

### 로케이터(셀렉터) 찾기
```
[페이지 이름]에서 [버튼/입력창/텍스트] 요소를 찾아야 해.
현재 pages/[파일].py 에 추가할 CSS selector 또는 XPath를 알려줘.
가능하면 text() 기반보다 data-testid나 aria 속성 기반으로 작성해줘.
```

### 대기(Wait) 문제
```
[페이지].py 에서 [동작] 후 [요소]가 뜨는 걸 기다려야 하는데
타임아웃이 자주 발생해. BasePage의 wait 메서드를 활용해서 수정해줘.
현재 DEFAULT_WAIT는 10초야.
```

### conftest fixture 추가
```
conftest.py에 새로운 fixture를 추가해줘.
- fixture 이름: [이름]
- 역할: [설명]
- scope: [function / class / session]
- 기존 logged_in_driver fixture와 함께 쓸 수 있어야 해
```

### Allure 리포트에 스텝 추가
```
tests/[파일].py 의 [테스트 함수]에 Allure 스텝을 추가해줘.
각 주요 동작마다 @allure.step 으로 감싸서
리포트에서 실패 위치를 바로 알 수 있게 해줘.
```

---

## 4. 이 프로젝트에서 배운 주의사항 (다음 팀에게)

| 상황 | 해결법 |
|------|--------|
| React 입력창에 send_keys가 안 들어감 | `BasePage.js_input()` 사용 |
| 일반 click()이 막힘 | `BasePage.js_click()` 사용 |
| 로그인 후 토큰 배너가 떠서 클릭 막힘 | `close_token_banner()` 자동 호출됨 (`go()` 메서드 사용) |
| 테스트마다 로그인하면 느림 | `do_login_cached()` — 세션 캐싱으로 속도 개선 |
| 환경별 URL이 하드코딩됨 | `config/settings.py` 에서만 변경 |
| 계정 정보 노출 위험 | `.env` 파일 + `os.getenv()` 사용, 절대 코드에 직접 쓰지 말 것 |

---

## 5. 환경 세팅 (처음 시작하는 팀원)

```bash
# 1. 가상환경 생성
python -m venv venv
venv\Scripts\activate  # Windows

# 2. 패키지 설치
pip install -r config/requirements.txt

# 3. .env 파일 생성 (절대 git에 올리지 말 것)
# .env 내용:
# TEST_USER_ID=테스트계정@email.com
# TEST_USER_PW=비밀번호

# 4. 테스트 실행
pytest tests/ -v --alluredir=allure-results

# 5. 리포트 보기
allure serve allure-results
```

---

## 6. Claude에게 이 가이드를 전달하는 방법

새 대화를 시작할 때 이렇게 말하세요:

```
우리 팀이 Selenium + Pytest + POM 패턴으로 E2E 테스트 자동화 프로젝트를 운영하고 있어.
구조는 이 가이드 파일을 참고해줘: [CLAUDE_GUIDE.md 내용 붙여넣기 또는 파일 공유]

지금 작업할 내용은: [작업 내용]
```
