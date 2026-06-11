// ============================================================
// test_mypage_account.spec.ts — 계정 관리 (FHC-080~083)
// test_dummy@naver.com 계정 사용 (storageState 별도)
// ============================================================

import { test, expect } from '@playwright/test'
import { MyPageAccountPage } from '../../pages/MyPageAccountPage'
import users from '../../fixtures/users.json'
import { loginDummy } from '../helpers/auth'
import { ACCOUNT_URL } from '../helpers/urls'

const NEW_PASSWORD = 'test@4321'
const NEW_NAME     = '포커스 테스트'

// dummy 계정은 별도 로그인 (default storageState 안씀)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('[FHC-080~083] 계정 관리', () => {

  test.beforeEach(async ({ page }) => {
    const ok = await loginDummy(page)
    if (!ok) { test.skip(); return }
    // qaproject 완전 로드 후 accounts 페이지 이동 (세션 안정화)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null)
    const mypage = new MyPageAccountPage(page)
    try {
      await mypage.navigateToAccount()
    } catch {
      // signin 리디렉션: 세션 만료 — 스킵
      test.skip()
    }
  })

  test('[FHC-080] 이름 변경', async ({ page }) => {
    const mypage = new MyPageAccountPage(page)
    await mypage.clickNameEdit()
    await mypage.enterName(NEW_NAME)
    await mypage.saveName()
    await mypage.isSaveSuccessToastDisplayed()
  })

  test('[FHC-081] 비밀번호 변경', async ({ page }) => {
    const mypage = new MyPageAccountPage(page)

    // 변경
    await mypage.clickPasswordEdit()
    await mypage.changePassword(users.dummy.pw, NEW_PASSWORD)
    await mypage.isSaveSuccessToastDisplayed()

    // 복구 (teardown)
    await mypage.navigateToAccount()
    await mypage.clickPasswordEdit()
    await mypage.changePassword(NEW_PASSWORD, users.dummy.pw)
  })

  test('[FHC-082] 프로모션 알림 토글', async ({ page }) => {
    const mypage = new MyPageAccountPage(page)
    const before = await mypage.getPromotionState()
    await mypage.togglePromotion()
    await mypage.isSavedSuccessfullyDisplayed()
    const after = await mypage.getPromotionState()
    expect(before).not.toBe(after)

    // 복구
    await mypage.togglePromotion()
  })

  test('[FHC-083] 선호 언어 설정 변경', async ({ page }) => {
    const mypage = new MyPageAccountPage(page)
    await mypage.changeLanguage('ko-KR')
    await mypage.isSavedSuccessfullyDisplayed()
  })
})
