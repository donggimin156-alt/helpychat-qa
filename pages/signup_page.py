# pages/signup_page.py

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class SignupPage:
    SIGNUP_URL = (
        "https://accounts.elice.io/accounts/signup/method?"
        "continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat"
        "&lang=en-US&org=qaproject"
    )

    # ========== Locator (페이지 요소를 찾고 자동 대기, 재시도를 담당하는 객체) ==========
    EMAIL_INPUT = (By.CSS_SELECTOR, "input[placeholder='Email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[placeholder='Password']")
    NAME_INPUT = (By.CSS_SELECTOR, "input[placeholder='Name']")

    CREATE_EMAIL_BUTTON = (
        By.XPATH,
        "//button[contains(., 'Create account with email')]"
    )

    AGREE_ALL_CHECKBOX = (
        By.XPATH,
        "//span[text()='Agree all']/ancestor::label"
    )

    CREATE_ACCOUNT_BUTTON = (
        By.XPATH,
        "//button[contains(text(), 'Create account')]"
    )

    # 에러 메시지 locator
    EMAIL_ERROR_MESSAGE = (
        By.XPATH,
        "//p[contains(text(), 'Email address is incorrect')]"
    )

    # ========== 초기화 ==========
    def __init__(self, driver):

        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    # ========== 페이지 이동 ==========
    def open(self):

        self.driver.get(self.SIGNUP_URL)

    # ========== 요소 조회 ==========
    def get_email_input(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.EMAIL_INPUT
            )
        )

    def get_password_input(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.PASSWORD_INPUT
            )
        )

    def get_name_input(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.NAME_INPUT
            )
        )

    def get_agree_checkbox(self):

        return self.wait.until(
            EC.element_to_be_clickable(
                self.AGREE_ALL_CHECKBOX
            )
        )

    def get_create_account_button(self):

        return self.wait.until(
            EC.element_to_be_clickable(
                self.CREATE_ACCOUNT_BUTTON
            )
        )
    
    def get_email_error_message(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.EMAIL_ERROR_MESSAGE
            )
        )

    # ========== 액션 ==========
    def click_create_account_with_email(self):

        self.wait.until(
            EC.element_to_be_clickable(
                self.CREATE_EMAIL_BUTTON
            )
        ).click()

    def enter_email(self, email):
        self.get_email_input().send_keys(email)

    def enter_password(self, password):
        self.get_password_input().send_keys(password)

    def enter_name(self, name):
        self.get_name_input().send_keys(name)

    def click_agree_checkbox(self):
        checkbox = self.get_agree_checkbox()

        self.driver.execute_script(
            "arguments[0].click();",
            checkbox
        )

    def click_create_account_button(self):
        self.get_create_account_button().click()
