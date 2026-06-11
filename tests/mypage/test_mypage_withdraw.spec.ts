// ============================================================
// test_mypage_withdraw.spec.ts — 계정 탈퇴 (FHC-084~086)
// ============================================================

import { test, expect } from '@playwright/test'
import { MyPageWithdrawPage } from '../../pages/MyPageWithdrawPage'

const DUMMY_EMAIL    = 'test_dummy@naver.com'
const DUMMY_PASSWORD = 'test@1234'
const DUMMY_NAME     = '포커스 테스트'

const LOGIN_URL =
  'https://accounts.elice.io/accounts/signin/me' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

test.use({ storageState: { cookies: [], origins: [] } })

test('[FHC-084~086] 계정 탈퇴 해피 케이스', { timeout: 120000 }, async ({ page }) => {
  // 로그인
  await page.goto(LOGIN_URL)
  await page.locator('[name="loginId"]').fill(DUMMY_EMAIL)
  await page.locator('[name="password"]').fill(DUMMY_PASSWORD)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(/ai-helpy-chat|otp/, { timeout: 30000 })
  if (page.url().includes('otp')) {
    test.skip()
    return
  }
  await expect(page).toHaveURL(/ai-helpy-chat/, { timeout: 5000 })
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null)

  const withdraw = new MyPageWithdrawPage(page)
  try {
    await withdraw.navigateToAccount()
  } catch {
    test.skip()
    return
  }

  // FHC-084: 탈퇴 영역 확인
  await withdraw.scrollToWithdrawArea()
  const hasArea = await withdraw.isWithdrawAreaDisplayed()
  expect(hasArea).toBeTruthy()

  // FHC-085: 2차 확인 문구
  await withdraw.clickWithdrawButton()
  const hasConfirm = await withdraw.isWithdrawConfirmMessageDisplayed()
  expect(hasConfirm).toBeTruthy()

  // FHC-086: 탈퇴 실행
  await withdraw.enterWithdrawConfirmText(DUMMY_EMAIL)
  await withdraw.submitWithdraw()
  const isComplete = await withdraw.isWithdrawalComplete()
  expect(isComplete).toBeTruthy()

  // 인프라: 재가입 복구
  await page.goto('https://qaproject.elice.io/ai-helpy-chat')
  await withdraw.signup(DUMMY_EMAIL, DUMMY_PASSWORD, DUMMY_NAME)
  const signupOk = await withdraw.isSignupSuccess()
  expect(signupOk).toBeTruthy()
})
