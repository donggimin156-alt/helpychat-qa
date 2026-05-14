import sys
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

with webdriver.Chrome() as driver:
    driver.get("https://qaproject.elice.io/ai-helpy-chat/tools")
    wait = WebDriverWait(driver, 15)

    # 로그인
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("qa5team3-02@elicer.com")
    driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys("Mdk@02169630")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("ai-helpy-chat"))
    print("로그인 성공")

    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//a[.//p[text()='세부 특기사항']]"))
    ).click()
    print("세부 특기사항 클릭 완료")

    time.sleep(2)

    # 이름 필드 클릭
    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//p[@role='button' and text()='이름을 입력해주세요.']"))
    ).click()
    print("이름 필드 클릭 완료")

    # 이름 입력값 설정
    name_input = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//textarea[not(@aria-hidden='true') and @placeholder='이름을 입력해주세요.']"))
    )
    name_input.clear()
    name_input.send_keys("엘리스")
    print("학생 이름 입력완료")

    time.sleep(5)