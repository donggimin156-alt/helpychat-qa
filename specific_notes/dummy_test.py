import sys
import io
import time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

with webdriver.Chrome() as driver:
    driver.get("https://qaproject.elice.io/ai-helpy-chat/tools")

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
    )

    driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("qa5team3-02@elicer.com")
    driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys("Mdk@02169630")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    WebDriverWait(driver, 15).until(EC.url_contains("ai-helpy-chat"))
    print("로그인 성공")

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[.//p[text()='세부 특기사항']]"))
    ).click()
    print("세부 특기사항 클릭 완료")

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@role='tab' and contains(text(),'수업 정보 입력')]"))
    ).click()
    print("수업 정보 입력 클릭 완료")

    # 단원 입력
    unit_input = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='unit']"))
    )
    unit_input.clear()
    unit_input.send_keys("1")
    print("단원 입력 완료")

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='다음으로']"))
    ).click()
    print("다음으로 버튼 클릭 완료")

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='수정하기']"))
    ).click()
    print("수정 완료")

    time.sleep(5)