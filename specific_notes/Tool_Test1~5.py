import sys
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ========================
# 설정값
# ========================
SCHOOL_LEVEL = "중학교"   # "초등학교" / "중학교" / "고등학교" // 3중 선택
GRADE = "3학년"           # "1학년" ~ "6학년" // 6중 선택
SUBJECT = "수학"          # "국어" / "영어" / "수학" / "사회/도덕" / "과학"  // 5중 선택
UNIT = "1"                # 단원값 1~4 선택
# ========================

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

    # 세부 특기사항 메뉴 클릭
    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//a[.//p[text()='세부 특기사항']]"))
    ).click()
    print("세부 특기사항 클릭 완료")

    # 입력 내역 초기화
    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'입력 내역 초기화')]"))
    ).click()
    print("입력 내역 초기화 버튼 클릭 완료")

    # 모달 내 "초기화 하기" 빨간 버튼 클릭
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//*[@role='dialog']//button[contains(text(),'초기화 하기')]")
        )
    ).click()
    print("초기화 하기 버튼 클릭 완료")

    # 수업 정보 입력 탭 클릭
    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[@role='tab' and contains(text(),'수업 정보 입력')]"))
    ).click()
    print("수업 정보 입력 탭 클릭 완료")

    # 학교급 선택
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//label[contains(text(),'학교급')]/following-sibling::div//div[@role='combobox']")
        )
    ).click()
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, f"//li[@role='option' and normalize-space(text())='{SCHOOL_LEVEL}']")
        )
    ).click()
    print(f"학교급 '{SCHOOL_LEVEL}' 선택 완료")

    # 학년 선택 (학교급 변경 후 학년 드롭다운이 갱신될 때까지 대기)
    time.sleep(0.5)
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//label[contains(text(),'학년')]/following-sibling::div//div[@role='combobox']")
        )
    ).click()
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, f"//li[@role='option' and normalize-space(text())='{GRADE}']")
        )
    ).click()
    print(f"학년 '{GRADE}' 선택 완료")

    # clear() 사용시 값이 그대로 남아 있어서 전체 선택 후 삭제 하는 방법을 사용함
    subject_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[placeholder*='과목']"))
    )
    subject_input.click()
    subject_input.send_keys(Keys.CONTROL + "a")
    subject_input.send_keys(Keys.DELETE)
    subject_input.send_keys(SUBJECT)
    time.sleep(0.5)
    try:
        wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, f"//li[@role='option' and normalize-space(text())='{SUBJECT}']")
            )
        ).click()
        print(f"과목 '{SUBJECT}' 목록에서 선택 완료")
    except Exception:
        subject_input.send_keys(Keys.ESCAPE)
        print(f"과목 '{SUBJECT}' 직접 입력 완료")

    
    unit_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[placeholder*='단원']"))
    )
    unit_input.click()
    unit_input.send_keys(Keys.CONTROL + "a")
    unit_input.send_keys(Keys.DELETE)
    unit_input.send_keys(UNIT)
    print(f"단원 '{UNIT}' 입력 완료")

    
    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[not(@disabled) and text()='다음으로']"))
    ).click()
    print("다음으로 버튼 클릭 완료")

    try:
        wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//*[@role='dialog']//button[contains(text(),'수정하기')]")
            )
        ).click()
        print("수업 정보 수정 확인 완료")
    except Exception:
        print("수정 확인 모달 없음 (초기화 상태에서 바로 진행)")
    # ────────────────────────────────────────────────────────────

    time.sleep(1)