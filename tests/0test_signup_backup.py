import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.signup_page import SignupPage

@pytest.fixture
def signup_page(driver):

    page = SignupPage(driver)

    page.open()
    page.click_create_account_with_email()

    return page


def test_check_signup_page_elements(driver):
    """
    [test_signup_01] 회원가입 페이지 이동 확인
    """

    # signup_page = SignupPage(driver)

    # signup_page.open()
    # signup_page.click_create_account_with_email()

    assert "signup" in driver.current_url


def test_check_signup_elements(driver):
    """
    [test_signup_02] 회원가입 입력창의 입력 요소 확인
    """

    signup_page = SignupPage(driver)

    signup_page.open()
    signup_page.click_create_account_with_email()

    assert signup_page.get_email_input().is_displayed()
    assert signup_page.get_password_input().is_displayed()
    assert signup_page.get_name_input().is_displayed()
    assert signup_page.get_agree_checkbox().is_displayed()


def test_signup_complete(driver):
    """
    [test_signup_03] 회원가입 완료 확인
    """

    signup_page = SignupPage(driver)

    signup_page.open()
    signup_page.click_create_account_with_email()

    signup_page.enter_email("qa5team3-96@elicer.com")
    signup_page.enter_password("qa5team3-96!")
    signup_page.enter_name("김엘리스")

    signup_page.click_agree_checkbox()
    signup_page.click_create_account_button()

    WebDriverWait(driver, 10).until(
        EC.url_contains("isFirstLogin=true")
    )

    assert "isFirstLogin=true" in driver.current_url