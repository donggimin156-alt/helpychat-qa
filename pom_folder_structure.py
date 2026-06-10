# ================================================================
#  Page Object Model — 3계층 폴더 구조
# ================================================================

# ── 1계층: 공통 Base ─────────────────────────────────────────────
#
#  pages/
#  └── base_page.py              ← BasePage (모든 Page가 상속)
#
#  역할: click / enter_text / js_click / wait 등 브라우저 공통 동작

# ── 2계층: 기능별 Page ───────────────────────────────────────────
#
#  pages/
#  ├── login/    login_page.py   ← LoginPage(BasePage)
#  ├── logout/   logout_page.py  ← LogoutPage(BasePage)
#  ├── mypage/   mypage_page.py  ← MyPage(BasePage)  ★ 공유 기반
#  ├── settings/ (공통 없음, 각 세부 Page가 직접 상속)
#  └── tools/    base_tool_page.py ← BaseToolPage(BasePage)  ★ 공유 기반
#
#  역할: 로그인 / 페이지 이동 / 언어 변경 등 도메인 공유 로직

# ── 3계층: 세부 Page ─────────────────────────────────────────────
#
#  pages/
#  ├── mypage/
#  │   ├── mypage_account_page.py      ← MyPage05(MyPage)
#  │   ├── mypage_withdraw_page.py     ← MyPage06(MyPage)
#  │   ├── mypage_organization_page.py ← MyPage07(MyPage)
#  │   ├── mypage_language_page.py     ← MyPage08(MyPage)
#  │   ├── mypage_support_page.py      ← MyPage09(MyPage)
#  │   └── mypage_profile_page.py      ← MyPage04(MyPage)
#  ├── settings/
#  │   ├── settings_general_page.py    ← SettingsPage(BasePage)
#  │   ├── settings_model_page.py      ← SettingsModelPage(BasePage)
#  │   ├── settings_member_page.py     ← SettingsMemberPage(BasePage)
#  │   ├── settings_subscription_page.py
#  │   └── settings_useage_page.py
#  └── tools/
#      ├── tools_specialty_page.py     ← SpecialtyPage(BaseToolPage)
#      ├── tools_behavior_page.py      ← BehaviorPage(BaseToolPage)
#      ├── tools_lesson_page.py        ← LessonPage(BaseToolPage)
#      ├── tools_ppt_page.py           ← PPTPage(BaseToolPage)
#      ├── tools_quiz_page.py          ← QuizPage(BaseToolPage)
#      └── tools_deep_page.py          ← DeepPage(BaseToolPage)
#
#  역할: 각 화면의 로케이터 정의 + 세부 동작 캡슐화

# ── 테스트 파일 ──────────────────────────────────────────────────
#
#  tests/
#  ├── login/   test_login.py      → LoginPage 사용
#  ├── mypage/  test_mypage_*.py   → MyPage05~09 사용
#  ├── settings/test_settings_*.py → Settings*Page 사용
#  └── tools/   test_tools_*.py    → Specialty/Behavior/... 사용
#
#  역할: "무엇을 검증할지"만 작성 — UI 제어 로직 없음
