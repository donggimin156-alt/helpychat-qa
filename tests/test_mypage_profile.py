import logging
import pytest

from pages.mypage_profile_page import MyPage

# pytest 실행 시 INFO 레벨 로그 출력
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

logger = logging.getLogger(__name__)

# =========================
# fixture
# =========================

@pytest.fixture
def mypage(login):

    logger.info("🧪 MyPage fixture 시작")

    try:
        driver, wait = login

        page = MyPage(driver)

        logger.info("✅ MyPage 객체 생성 완료")

        return page

    except Exception:
        logger.exception(
            "❌ MyPage fixture 생성 실패"
        )
        raise


# =========================
# test_mypage_01
# =========================

def test_check_mypage_dropdown_menu(mypage):

    logger.info(
        "🧪 [test_mypage_01] 드롭다운 메뉴 확인 시작"
    )

    try:
        mypage.click_profile_button()

        assert mypage.get_account_management_menu().is_displayed()
        logger.info("✅ 계정 관리 메뉴 확인 완료")

        assert mypage.get_payment_history_menu().is_displayed()
        logger.info("✅ 결제 내역 메뉴 확인 완료")

        assert mypage.get_language_setting_menu().is_displayed()
        logger.info("✅ 언어 설정 메뉴 확인 완료")

        assert mypage.get_customer_center_menu().is_displayed()
        logger.info("✅ 고객 센터 메뉴 확인 완료")

        assert mypage.get_logout_menu().is_displayed()
        logger.info("✅ 로그아웃 메뉴 확인 완료")

    except Exception:
        logger.exception(
            "❌ 드롭다운 메뉴 확인 테스트 실패"
        )
        raise


# =========================
# test_mypage_02
# =========================

def test_move_account_management_page(mypage):

    logger.info(
        "🧪 [test_mypage_02] 계정 관리 페이지 이동 테스트 시작"
    )

    try:
        mypage.move_to_account_management()

        assert mypage.get_name_label().is_displayed()
        logger.info("✅ 이름 항목 확인 완료")

        assert mypage.get_email_label().is_displayed()
        logger.info("✅ 이메일 항목 확인 완료")

    except Exception:
        logger.exception(
            "❌ 계정 관리 페이지 이동 테스트 실패"
        )
        raise


# =========================
# test_mypage_03
# =========================

def test_change_profile_image(mypage):

    logger.info(
        "🧪 [test_mypage_03] 프로필 이미지 변경 테스트 시작"
    )

    try:
        mypage.move_to_account_management()

        mypage.upload_profile_image(
            "images/test2.jpg"
        )

        success_message = (
            mypage.get_save_success_message()
        )

        assert success_message.is_displayed()

        assert (
            "저장되었습니다" in success_message.text
            or
            "Saved successfully" in success_message.text
        )

        logger.info(
            "✅ 프로필 이미지 변경 성공"
        )

    except Exception:
        logger.exception(
            "❌ 프로필 이미지 변경 테스트 실패"
        )
        raise


# =========================
# test_mypage_04
# =========================

def test_remove_profile_image(mypage):

    logger.info(
        "🧪 [test_mypage_04] 프로필 이미지 제거 테스트 시작"
    )

    try:
        mypage.move_to_account_management()

        mypage.click_profile_image_edit_button()

        mypage.click_remove_profile_image_menu()

        success_message = (
            mypage.get_save_success_message()
        )

        assert success_message.is_displayed()

        assert (
            "저장되었습니다." in success_message.text
            or
            "Saved successfully." in success_message.text
        )

        logger.info(
            "✅ 프로필 이미지 제거 성공"
        )

    except Exception:
        logger.exception(
            "❌ 프로필 이미지 제거 테스트 실패"
        )
        raise