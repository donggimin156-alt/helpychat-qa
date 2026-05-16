import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.signup_page import SignupPage

LONG_TEXT_300 = "김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리워리세브리깡가나다라마바사아자차"

# 회원가입 페이지 진입 fixture
@pytest.fixture
def signup(driver):

    page = SignupPage(driver)

    page.open()
    page.click_create_account_with_email()

    return page


def test_check_signup_page_elements(signup):
    """
    [test_signup_01] 회원가입 페이지 이동 확인 및 입력 요소 확인
    (이메일, 비밀번호, 이름, 약관 동의 영역, [Create Account] 버튼)
    """

    assert "signup" in signup.driver.current_url
   
    assert signup.get_email_input().is_displayed()
    assert signup.get_password_input().is_displayed()
    assert signup.get_name_input().is_displayed()
    assert signup.get_agree_checkbox().is_displayed()


def test_signup_complete_agree_all(signup):
    """
    [test_signup_02] 회원가입 완료 확인 - Agree All 체크
    """

    signup.enter_email("testteam3js4@test.com")
    signup.enter_password("test1234!!")
    signup.enter_name("김엘리스")

    signup.click_agree_checkbox()
    signup.click_create_account_button()

    WebDriverWait(signup.driver, 10).until(
        EC.url_contains("isFirstLogin=true")
    )

    assert "isFirstLogin=true" in signup.driver.current_url

def test_invalid_email_validation(signup):
    """
    [test_signup_03] 이메일 유효성 검사
    """

    signup.enter_email("123")

    error_message = signup.get_email_error_message()

    assert error_message.is_displayed()

def test_invalid_name_validation(signup):
    """
    [test_signup_04] 이름 유효성 검사
    """
    signup.enter_email("testteam3js3@test.com")
    signup.enter_password("test1234!!")
    signup.enter_name(LONG_TEXT_300)

    signup.click_agree_checkbox()
    signup.click_create_account_button()

    error_message = signup.get_name_error_message()

    assert error_message.is_displayed()