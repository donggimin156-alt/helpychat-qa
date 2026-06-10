# config/helpers.py
# 공통 유틸리티 함수 (로그인, 배너 닫기 등)

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException

import json
import time
from pathlib import Path

from config.settings import LOGIN_URL, BASE_URL, TEST_USER, SHORT_WAIT, DEFAULT_WAIT

_SESSION_DIR = Path(__file__).resolve().parent.parent / ".pytest_cache"
_SESSION_DURATION = 1800  # 30분


def do_login(driver, wait, user: dict = None):
    """로그인 페이지(한글)에서 지정 계정으로 로그인"""
    user = user or TEST_USER
    driver.get(LOGIN_URL)
    email_input = wait.until(
        EC.presence_of_element_located((By.NAME, "loginId"))
    )
    email_input.clear()
    email_input.send_keys(user["id"])

    password_input = driver.find_element(By.NAME, "password")
    password_input.clear()
    password_input.send_keys(user["pw"])

    wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[text()='로그인']"))
    ).click()
    wait.until(EC.url_contains("ai-helpy-chat"))
    close_token_banner(driver, wait)


def do_login_cached(driver, wait, user: dict = None):
    """쿠키 캐싱 기반 빠른 로그인 (30분 TTL). 캐시 없거나 만료 시 UI 로그인으로 폴백."""
    import logging
    _log = logging.getLogger(__name__)
    user = user or TEST_USER

    safe_id = user["id"].replace("@", "_").replace(".", "_")
    session_file = _SESSION_DIR / f"session_{safe_id}.json"
    valid_cookie = None

    if session_file.exists():
        try:
            data = json.loads(session_file.read_text(encoding="utf-8"))
            if time.time() - data.get("timestamp", 0) < _SESSION_DURATION:
                valid_cookie = data.get("cookie_value")
                _log.info(f"세션 캐시 유효 — 쿠키 인젝션으로 로그인 ({user['id']})")
        except Exception:
            pass

    if valid_cookie:
        driver.get(BASE_URL)
        driver.add_cookie({"name": "eliceSessionKey", "value": valid_cookie, "domain": ".elice.io"})
        driver.get(BASE_URL)
        try:
            WebDriverWait(driver, DEFAULT_WAIT).until(EC.url_contains("ai-helpy-chat"))
            close_token_banner(driver, WebDriverWait(driver, DEFAULT_WAIT))
            return
        except Exception:
            _log.warning("쿠키 인젝션 실패 — UI 로그인으로 폴백")

    do_login(driver, wait, user)

    cookies = driver.get_cookies()
    elice_cookie = next((c["value"] for c in cookies if c["name"] == "eliceSessionKey"), None)
    if elice_cookie:
        _SESSION_DIR.mkdir(parents=True, exist_ok=True)
        session_file.write_text(
            json.dumps({"cookie_value": elice_cookie, "timestamp": time.time()}),
            encoding="utf-8"
        )
        _log.info(f"새 세션 쿠키 캐싱 완료 ({user['id']})")


_BANNER_BTN = (By.XPATH, "//*[@data-testid='xmark-largeIcon']/ancestor::button[1]")


def close_token_banner(driver, wait):
    """토큰 안내 배너가 표시된 경우 닫기 (없으면 무시)"""
    try:
        close_btn = WebDriverWait(driver, SHORT_WAIT).until(
            EC.element_to_be_clickable(_BANNER_BTN)
        )
        close_btn.click()
        WebDriverWait(driver, SHORT_WAIT).until(
            EC.invisibility_of_element_located(_BANNER_BTN)
        )
    except Exception:
        pass
