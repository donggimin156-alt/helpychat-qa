// ============================================================
// LoginPage.ts — 로그인 페이지 Page Object (Playwright)
// ============================================================

import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

// cypress.config.ts 의 env.LOGIN_URL 과 동일
const LOGIN_URL =
  'https://accounts.elice.io/accounts/signin/me' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

export class LoginPage extends BasePage {

  constructor(page: Page) {
    super(page)
  }

  // ── 로케이터 ────────────────────────────────────────────────
  // Cypress: cy.get('[name="loginId"]')
  // Playwright: this.page.locator('[name="loginId"]')
  get emailInput()    { return this.page.locator('[name="loginId"]') }
  get passwordInput() { return this.page.locator('[name="password"]') }
  get loginButton()   { return this.page.getByRole('button', { name: '로그인' }) }
  get pwEyeIcon()     { return this.page.locator('[data-testid*="eye"], button[aria-label*="비밀번호"]').first() }
  get emailError()    { return this.page.getByText(/잘못된 이메일 형식|Invalid email format/) }
  get passwordError() { return this.page.locator("p:has-text('비밀번호는 8자리 이상 입력해주세요.')") }
  get lockoutMsg()    { return this.page.locator("p:has-text('로그인을 여러 번 잘못 시도하셨습니다.')") }

  // ── 액션 ────────────────────────────────────────────────────
  async open(): Promise<void> {
    await this.visit(LOGIN_URL)
  }

  // Cypress: LoginPage.login(id, pw) → 동기
  // Playwright: await loginPage.login(id, pw) → 비동기
  async login(id: string, pw: string): Promise<void> {
    await this.emailInput.fill(id)
    await this.passwordInput.fill(pw)
    await this.loginButton.click()
  }

  // ── 검증 ────────────────────────────────────────────────────
  async isLoginSuccess(): Promise<void> {
    await this.urlShouldInclude('ai-helpy-chat')
  }
}
