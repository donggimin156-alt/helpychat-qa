# plugins/allure_plugin.py
# Allure 리포트 히스토리 보존 및 세션 종료 후 리포트 생성

import shutil
import subprocess
from pathlib import Path


def pytest_sessionstart(session):
    """직전 리포트의 history를 결과 폴더로 복사 (트렌드 그래프 유지)"""
    history_src = Path("allure-report/history")
    history_dst = Path("allure-results/history")
    if history_src.exists():
        if history_dst.exists():
            shutil.rmtree(history_dst)
        shutil.copytree(str(history_src), str(history_dst))


def pytest_sessionfinish(session, exitstatus):
    """세션 종료 시 Allure HTML 리포트 생성 (--open/--discord 시 serve)"""
    subprocess.run(
        ["allure", "generate", "allure-results", "-o", "allure-report", "--clean"],
        capture_output=True, timeout=60, shell=True
    )
    if session.config.getoption("--open", default=False) or session.config.getoption("--discord", default=False):
        subprocess.Popen(["allure", "serve", "allure-results"], shell=True)
