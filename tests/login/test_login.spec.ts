// ============================================================
// test_login.spec.ts — 로그인 테스트 (Playwright)
// Cypress의 test_login.cy.ts 와 동일한 역할
//
// 핵심 차이:
//   Cypress: LoginPage.login()       동기 (체인)
//   Playwright: await loginPage.login()  비동기 (async/await)
// ============================================================

import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages'
import users from '../../fixtures/users.json'

const INVALID_EMAIL    = 'email'
const INVALID_PASSWORD = '1234'
const LOCKOUT_EMAIL    = 'test_login1@elice.io'
const LOCKOUT_PASSWORD = 'test_login123'

test.describe('[FHC-006~013] 로그인', () => {

  // ── Happy Path ──────────────────────────────────────────────
  test.describe('Happy Path', () => {
    // 로그인 자체를 테스트 → storageState 사용 안 함 (빈 세션으로 시작)
    test.use({ storageState: { cookies: [], origins: [] } })

    test('[FHC-006] 로그인 성공 @smoke', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.open()
      await loginPage.login(users.default.id, users.default.pw)
      await loginPage.isLoginSuccess()
    })
  })

  // ── Sad Case ────────────────────────────────────────────────
  test.describe('Sad Case', () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    // Cypress의 beforeEach(() => { LoginPage.open() }) 와 동일
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.open()
    })

    test('[FHC-007] 이메일 유효성 검사', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.emailInput.fill(INVALID_EMAIL)
      await loginPage.emailInput.press('Tab')  // 포커스 이동으로 유효성 검사 트리거
      await expect(loginPage.emailError).toBeVisible()
    })

    test('[FHC-008~009] 비밀번호 유효성 + 마스킹', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.emailInput.fill('test@example.com')
      await loginPage.passwordInput.fill(INVALID_PASSWORD)
      await loginPage.loginButton.click()
      await expect(loginPage.passwordError).toBeVisible()
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')
      await loginPage.pwEyeIcon.click()
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'text')
    })

    test('[FHC-012] 로그인 5회 실패 계정 잠금', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.emailInput.fill(LOCKOUT_EMAIL)
      await loginPage.passwordInput.fill(LOCKOUT_PASSWORD)
      // Cypress: Cypress._.times(6, ...) 와 동일
      for (let i = 0; i < 6; i++) {
        await loginPage.loginButton.click()
      }
      await expect(loginPage.lockoutMsg).toBeVisible()
    })
  })
})
