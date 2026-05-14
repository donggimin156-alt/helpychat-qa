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
# 설정값 (원하는 값으로 변경)
# ========================
STUDENT_NAME = "민동기"       # 학생 이름

# 활동 키워드 카테고리 (아래 중 하나 선택)
# "학습 태도" / "성장·변화" / "의사소통·사회성" / "문제 해결·탐구 역량" / "태도 및 품성"
KEYWORD_CATEGORY = "태도 및 품성"

# 카테고리 내 하위 키워드 (카테고리에 맞는 항목 선택)
# [학습 태도]        수업 집중도 높음 / 수업 참여도 높음 / 질문 및 의견 제시 적극적 /
#                   친구 의견 경청 / 토론·협업 적극적 / 책임감 있는 과제 수행 /
#                   성실한 과제 제출 / 문제 해결 시도 적극적 / 자기주도 학습 태도 /
#                   꾸준한 학습 노력 / 과제 완성도 높음 / 수업 준비 철저함 /
#                   반응·피드백 반영 능력 우수
# [성장·변화]        학기 중 성장의 뚜렷함 / 참여·태도에서 긍정적 변화 /
#                   꾸준한 노력으로 향상됨 / 도전적 과제 수행 경험
# [의사소통·사회성]  협력적 태도 우수 / 역할 분담 책임감 / 친구 돕기 적극적 /
#                   발표 능력 우수 / 자신의 의견을 논리적으로 표현 / 타인의 생각 존중
# [문제 해결·탐구 역량] 실험/탐구 과정 충실 / 스스로 해결 전략 탐색 /
#                   창의적 아이디어 제시 / 자료 조사 능력 우수 / 프로젝트 수행 능력 우수
# [태도 및 품성]     예의 바르고 바른 태도 / 성실한 생활 습관 / 학교생활 모범 /
#                   인내심·끈기 발휘 / 책임감 있는 행동
KEYWORD_ITEM = "예의 바르고 바른 태도"

# 추가 요청사항 (빈 문자열 "" 이면 입력 건너뜀)
ADDITIONAL_REQUEST = "성실하고 모범적인 학생입니다."

# 다운로드 저장 경로
DOWNLOAD_DIR = r"C:\Users\Admin\Desktop"
# ========================

options = webdriver.ChromeOptions()
prefs = {
    "download.default_directory": DOWNLOAD_DIR,
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
}
options.add_experimental_option("prefs", prefs)

with webdriver.Chrome(options=options) as driver:
    driver.get("https://qaproject.elice.io/ai-helpy-chat/tools")
    wait = WebDriverWait(driver, 15)

    # ── 로그인 ──────────────────────────────────────────────
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("qa5team3-02@elicer.com")
    driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys("Mdk@02169630")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("ai-helpy-chat"))
    print("로그인 성공")

    # ── 세부 특기사항 메뉴 클릭 ────────────────────────────
    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//a[.//p[text()='세부 특기사항']]"))
    ).click()
    print("세부 특기사항 클릭 완료")

    # ── 학생 정보 입력 및 생성 탭으로 이동 ─────────────────
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[@role='tab' and contains(text(),'학생 정보 입력 및 생성')]")
        )
    ).click()
    print("학생 정보 입력 및 생성 탭 클릭 완료")

    # ── 학생 추가 버튼 클릭 ─────────────────────────────────
    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'학생 추가')]"))
    ).click()
    print("학생 추가 완료")

    # ── 이름 입력 ────────────────────────────────────────────
    # "이름을 입력해주세요." 버튼 클릭 → textarea 활성화
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'이름을 입력해주세요.')]")
        )
    ).click()

    # 빈 이름 textarea 입력 (새로 추가된 행, value가 비어있는 것)
    name_ta = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//textarea[@placeholder='이름을 입력해주세요.' and not(@value) or "
                       "//textarea[@placeholder='이름을 입력해주세요.']]")
        )
    )
    # 새 행의 빈 textarea만 찾기
    name_inputs = driver.find_elements(By.XPATH, "//textarea[@placeholder='이름을 입력해주세요.']")
    # 비어있는(새로 추가된) textarea 선택
    name_ta = next((ta for ta in name_inputs if ta.get_attribute("value") == ""), name_inputs[-1])
    name_ta.click()
    name_ta.send_keys(Keys.CONTROL + "a")
    name_ta.send_keys(Keys.DELETE)
    name_ta.send_keys(STUDENT_NAME)
    print(f"이름 '{STUDENT_NAME}' 입력 완료")

    # 이름 행의 저장 버튼 클릭 (같은 TR 안의 저장 버튼)
    save_btn = name_ta.find_element(
        By.XPATH, "ancestor::tr//button[text()='저장']"
    )
    save_btn.click()
    print("이름 저장 완료")

    # ── 활동 키워드 선택 ─────────────────────────────────────
    # "키워드를 선택해주세요." 버튼 클릭 (새로 추가된 행의 것)
    keyword_btns = driver.find_elements(
        By.XPATH, "//button[contains(text(),'키워드를 선택해주세요.')]"
    )
    keyword_btns[-1].click()  # 마지막(새로 추가된) 행의 버튼
    print("활동 키워드 모달 열기")

    # 카테고리 아코디언 클릭
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH,
             f"//div[contains(@class,'MuiAccordionSummary-root')]"
             f"//div[contains(@class,'MuiAccordionSummary-content') and text()='{KEYWORD_CATEGORY}']")
        )
    ).click()
    print(f"카테고리 '{KEYWORD_CATEGORY}' 펼치기 완료")

    # 하위 키워드 Chip 클릭
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH,
             f"//div[contains(@class,'MuiChip-root')]"
             f"[.//span[contains(@class,'MuiChip-label') and text()='{KEYWORD_ITEM}']]")
        )
    ).click()
    print(f"키워드 '{KEYWORD_ITEM}' 선택 완료")

    # 모달 저장 버튼 클릭
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//*[@role='dialog']//button[contains(text(),'저장')]")
        )
    ).click()
    print("활동 키워드 저장 완료")

    # ── 추가 요청사항 입력 (선택) ────────────────────────────
    if ADDITIONAL_REQUEST:
        # "요청사항을 입력해주세요." 버튼 클릭 → textarea 활성화
        request_btns = driver.find_elements(
            By.XPATH, "//button[contains(text(),'요청사항을 입력해주세요.')]"
        )
        request_btns[-1].click()  # 마지막(새로 추가된) 행의 버튼

        request_ta = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//textarea[@placeholder='요청사항을 입력해주세요.']")
            )
        )
        # 비어있는 요청사항 textarea 선택
        request_inputs = driver.find_elements(
            By.XPATH, "//textarea[@placeholder='요청사항을 입력해주세요.']"
        )
        request_ta = next(
            (ta for ta in request_inputs if ta.get_attribute("value") == ""),
            request_inputs[-1]
        )
        request_ta.click()
        request_ta.send_keys(Keys.CONTROL + "a")
        request_ta.send_keys(Keys.DELETE)
        request_ta.send_keys(ADDITIONAL_REQUEST)
        print(f"추가 요청사항 입력 완료")

        # 추가 요청사항 저장 버튼 클릭 (같은 TR 안의 저장 버튼)
        save_req_btn = request_ta.find_element(
            By.XPATH, "ancestor::tr//button[text()='저장']"
        )
        save_req_btn.click()
        print("추가 요청사항 저장 완료")

    # ── 생성 결과 받기 (엑셀 다운로드) ──────────────────────
    wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'생성 결과 받기')]")
        )
    ).click()
    print("생성 결과 받기 클릭 - 엑셀 다운로드 시작")

    time.sleep(5)
    print(f"완료! '{DOWNLOAD_DIR}' 에 엑셀 파일이 저장되었습니다.")