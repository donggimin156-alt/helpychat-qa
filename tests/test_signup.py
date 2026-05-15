import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.signup_page import SignupPage

# 회원가입 페이지 진입 fixture
@pytest.fixture
def signup(driver):

    page = SignupPage(driver)

    page.open()
    page.click_create_account_with_email()

    return page


def test_check_signup_page_elements(signup):
    """
    [test_signup_01] 회원가입 페이지 이동 확인
    """

    # signup_page = SignupPage(driver)

    # signup_page.open()
    # signup_page.click_create_account_with_email()

    assert "signup" in signup.driver.current_url


def test_check_signup_elements(signup):
    """
    [test_signup_02] 회원가입 입력창의 입력 요소 확인
    """
    
    assert signup.get_email_input().is_displayed()
    assert signup.get_password_input().is_displayed()
    assert signup.get_name_input().is_displayed()
    assert signup.get_agree_checkbox().is_displayed()


def test_signup_complete(signup):
    """
    [test_signup_03] 회원가입 완료 확인
    """

    signup.enter_email("qa5team3-94@elicer.com")
    signup.enter_password("qa5team3-94!")
    signup.enter_name("김엘리스")

    signup.click_agree_checkbox()
    signup.click_create_account_button()

    WebDriverWait(signup.driver, 10).until(
        EC.url_contains("isFirstLogin=true")
    )

    assert "isFirstLogin=true" in signup.driver.current_url

def test_invalid_email_validation(signup):
    """
    [test_signup_04] 이메일 유효성 검사
    """

    signup.enter_email("123")

    error_message = signup.get_email_error_message()

    assert error_message.is_displayed()