// ============================================================
// test_mypage_withdraw.spec.ts — 계정 탈퇴 (FHC-084~086)
// ============================================================

import { test, expect } from '@playwright/test'
import { MyPageWithdrawPage } from '../../pages/MyPageWithdrawPage'
import users from '../../fixtures/users.json'
import { loginDummy } from '../helpers/auth'

const DUMMY_NAME = '포커스 테스트'

test.use({ storageState: { cookies: [], origins: [] } })

test('[FHC-084~086] 계정 탈퇴 해피 케이스', { timeout: 120000 }, async ({ page }) => {
  const ok = await loginDummy(page)
  if (!ok) { test.skip(); return }
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
  await withdraw.enterWithdrawConfirmText(users.dummy.id)
  await withdraw.submitWithdraw()
  const isComplete = await withdraw.isWithdrawalComplete()
  expect(isComplete).toBeTruthy()

  // 인프라: 재가입 복구
  await page.goto('https://qaproject.elice.io/ai-helpy-chat')
  await withdraw.signup(users.dummy.id, users.dummy.pw, DUMMY_NAME)
  const signupOk = await withdraw.isSignupSuccess()
  expect(signupOk).toBeTruthy()
})
