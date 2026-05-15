import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

SIGNUP_URL = (
    "https://accounts.elice.io/accounts/signup/method?"
    "continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat"
    "&lang=en-US&org=qaproject"
)

# 브라우저 실행 fixture
@pytest.fixture
def driver():
    driver = webdriver.Firefox()
    driver.implicitly_wait(10)

    yield driver

    driver.quit()

def test_input_signup_elements(signup_page):
    """
    [test_signup_04] 이메일 유효성 검사
    """

    wait = WebDriverWait(signup_page, 10)

    email_input = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='Email']")
        )
    )

    # pw_input = wait.until(
    #     EC.visibility_of_element_located(
    #         (By.CSS_SELECTOR, "input[placeholder='Password']")
    #     )
    # )

    # name_input = wait.until(
    #     EC.visibility_of_element_located(
    #         (By.CSS_SELECTOR, "input[placeholder='Name']")
    #     )
    # )

    # agree_all = wait.until(
    # EC.element_to_be_clickable(
    #     (By.XPATH, "//span[text()='Agree all']/ancestor::label")
    #     )
    # )

    email_error = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//p[contains(text(), 'Email address is incorrect')]")
        )
    )

    email_input.send_keys("123")


    # pw_input.send_keys("qa5team3!")
    # name_input.send_keys("김엘리스")

    # agree_all.click()

    # signup_button = wait.until(
    #     EC.element_to_be_clickable(
    #         (By.XPATH, "//button[contains(text(), 'Create account')]")
    #     )
    # )

    # signup_button.click()

    # wait.until(
    # EC.url_contains("isFirstLogin=true")
    # )

    # assert "isFirstLogin=true" in signup_page.current_url

    assert email_error.is_displayed()