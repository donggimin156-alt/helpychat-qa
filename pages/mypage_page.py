from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class MyPage:

    # =========================
    # Locator
    # =========================

    # 우측 상단 프로필 버튼
    PROFILE_BUTTON = (
        By.CSS_SELECTOR,
        "button.MuiAvatar-root"
    )

    # 계정 관리 메뉴
    ACCOUNT_MANAGEMENT_MENU = (
        By.XPATH,
        "//span[contains(text(), '계정 관리')]"
    )

    # 계정 관리 페이지 제목
    ACCOUNT_MANAGEMENT_TITLE = (
        By.XPATH,
        "//*[contains(text(), '계정 관리')]"
    )

    # 결제 내역 페이지 제목
    PAYMENT_HISTORY_MENU = (
        By.XPATH,
        "//*[contains(text(), '결제 내역')]"
    )

    # 언어 설정 메뉴 제목
    LANGUAGE_SETTING_MENU = (
        By.XPATH,
        "//*[contains(text(), '언어 설정')]"
    )

    # 고객 센터 메뉴 제목
    CUSTOMER_CENTER_MENU = (
        By.XPATH,
        "//*[contains(text(), '고객 센터')]"
    )

    # 로그아웃 메뉴 제목
    LOGOUT_MENU = (
        By.XPATH,
        "//*[contains(text(), '로그아웃')]"
    )

    # 파일 업로드 input
    FILE_INPUT = (
        By.CSS_SELECTOR,
        "input[type='file']"
    )

    # 저장 완료 메시지
    SAVE_SUCCESS_MESSAGE = (
        By.XPATH,
        "//*[contains(text(), '저장되었습니다') or contains(text(), 'Saved successfully')]"
    )

    # 이름 항목
    NAME_LABEL = (
        By.XPATH,
        "//*[contains(text(), '이름')]"
    )

    # 이메일 항목
    EMAIL_LABEL = (
        By.XPATH,
        "//*[contains(text(), '이메일')]"
    )

    # 프로필 이미지 제거 메뉴
    REMOVE_PROFILE_IMAGE_MENU = (
        By.XPATH,
        "//li[@role='menuitem']"
        "[.//*[contains(text(), '프로필 이미지 제거')]]"
    )

     # 프로필 이미지 수정 버튼
    PROFILE_IMAGE_EDIT_BUTTON = (
        By.XPATH,
        "//span[contains(@class, 'MuiBadge-badge')]"
        "[.//*[contains(@data-testid, 'pen-to-squareIcon')]]"
    )   

    # =========================
    # 초기화
    # =========================

    def __init__(self, driver):

        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    # =========================
    # 요소 조회
    # =========================

    def get_profile_button(self):

        return self.wait.until(
            EC.element_to_be_clickable(
                self.PROFILE_BUTTON
            )
        )

    def get_account_management_menu(self):

        return self.wait.until(
            EC.element_to_be_clickable(
                self.ACCOUNT_MANAGEMENT_MENU
            )
        )
    
    def get_payment_history_menu(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.PAYMENT_HISTORY_MENU
            )
    )

    def get_language_setting_menu(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.LANGUAGE_SETTING_MENU
            )
        )

    def get_customer_center_menu(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.CUSTOMER_CENTER_MENU
            )
        )

    def get_logout_menu(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.LOGOUT_MENU
            )
        )

    def get_account_management_title(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.ACCOUNT_MANAGEMENT_TITLE
            )
        )

    def get_file_input(self):

        return self.wait.until(
            EC.presence_of_element_located(
                self.FILE_INPUT
            )
        )

    def get_save_success_message(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.SAVE_SUCCESS_MESSAGE
            )
        )
    
    def get_name_label(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.NAME_LABEL
            )
        )

    def get_email_label(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.EMAIL_LABEL
            )
        )
    
    def get_remove_profile_image_menu(self):

        return self.wait.until(
            EC.element_to_be_clickable(
                self.REMOVE_PROFILE_IMAGE_MENU
            )
      ) 
 
    def get_profile_image_edit_button(self):

        return self.wait.until(
            EC.presence_of_element_located(
                self.PROFILE_IMAGE_EDIT_BUTTON
            )
        )
    
    # =========================
    # 액션
    # =========================

    # 프로필 버튼 클릭
    def click_profile_button(self):

        button = self.get_profile_button()

        self.driver.execute_script(
            "arguments[0].click();",
            button
        )

    # print("프로필 버튼 클릭 완료")

        # 계정 관리 메뉴 클릭
    def click_account_management(self):

        menu = self.get_account_management_menu()

        print("계정 관리 찾음")

        self.driver.execute_script(
            "arguments[0].click();",
            menu
        )
    
    # 계정 관리 페이지 이동
    def move_to_account_management(self):

        current_window = (
            self.driver.current_window_handle
        )

        self.click_profile_button()

        self.click_account_management()

        # 새 탭 열릴 때까지 대기
        self.wait.until(
            lambda d: len(d.window_handles) > 1
        )

        # 새 탭으로 이동
        for window in self.driver.window_handles:
            if window != current_window:
                self.driver.switch_to.window(window)
                break

    def click_profile_image_edit_button(self):

        button = self.get_profile_image_edit_button()

        self.driver.execute_script(
            "arguments[0].scrollIntoView(true);",
            button
        )

        self.driver.execute_script(
            "arguments[0].click();",
            button
        )

    # 프로필 이미지 업로드
    def upload_profile_image(self, image_path):

        absolute_path = str(
            Path(image_path).resolve()
        )

        file_input = self.get_file_input()

        file_input.send_keys(
            absolute_path
        )

    # 프로필 이미지 제거
    def click_remove_profile_image_menu(self):

        menu = self.get_remove_profile_image_menu()

        self.driver.execute_script(
            "arguments[0].click();",
            menu
        )