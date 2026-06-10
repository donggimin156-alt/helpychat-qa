// ============================================================
// test_signup.spec.ts — 회원가입 테스트 (FHC-001~005)
// ============================================================

import { test, expect } from '@playwright/test'
import { SignupPage } from '../../pages/SignupPage'

const DEFAULT_PASSWORD = 'test1234!!'
const DEFAULT_NAME     = '김엘리스'
const LONG_TEXT_300    = '김수한무거북이와두루미삼천갑자동방삭'.repeat(15)

// 회원가입은 세션 없이 (로그인 안된 상태)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('[FHC-001~005] 회원가입', () => {

  test.beforeEach(async ({ page }) => {
    const signupPage = new SignupPage(page)
    await signupPage.open()
    await signupPage.clickCreateAccountWithEmail()
  })

  test('[FHC-001] 회원가입 페이지 요소 확인', async ({ page }) => {
    const s = new SignupPage(page)
    await expect(s.emailInput).toBeVisible()
    await expect(s.passwordInput).toBeVisible()
    await expect(s.nameInput).toBeVisible()
    await expect(s.agreeAllCheckbox).toBeVisible()
  })

  test('[FHC-002] 전체 동의 회원가입 성공 @smoke', async ({ page }) => {
    const s = new SignupPage(page)
    await s.fillSignupForm(`test${Date.now()}@test.com`, DEFAULT_PASSWORD, DEFAULT_NAME)
    await s.agreeTerms('all')
    await s.clickCreateAccountButton()
    await s.isSignupSuccess()
  })

  test('[FHC-003] 필수 약관 동의 회원가입 성공', async ({ page }) => {
    const s = new SignupPage(page)
    await s.fillSignupForm(`test${Date.now()}@test.com`, DEFAULT_PASSWORD, DEFAULT_NAME)
    await s.agreeTerms('required')
    await s.clickCreateAccountButton()
    await s.isSignupSuccess()
  })

  test('[FHC-004] 이메일 유효성 검사', async ({ page }) => {
    const s = new SignupPage(page)
    await s.emailInput.fill('123')
    await s.emailInput.press('Tab')
    await expect(s.emailError).toBeVisible({ timeout: 5000 })
  })

  test('[FHC-005] 이름 유효성 검사', async ({ page }) => {
    const s = new SignupPage(page)
    await s.fillSignupForm(`test${Date.now()}@test.com`, DEFAULT_PASSWORD, LONG_TEXT_300)
    await s.agreeTerms('all')
    await s.clickCreateAccountButton()
    await expect(s.nameError).toBeVisible({ timeout: 5000 })
  })
})
