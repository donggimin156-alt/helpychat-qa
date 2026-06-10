// ============================================================
// LoginPage.ts — 로그인 페이지 Page Object (TypeScript)
// ============================================================

import BasePage from './BasePage'

class LoginPage extends BasePage {

  // ── 로케이터 ────────────────────────────────────────────────
  get emailInput()    { return cy.get('[name="loginId"]') }
  get passwordInput() { return cy.get('[name="password"]') }
  get loginButton()   { return cy.contains('button', '로그인') }
  get pwEyeIcon()     { return cy.get('[data-testid*="eye"], button[aria-label*="비밀번호"]').first() }
  get emailError()    { return cy.contains('잘못된 이메일 형식') }
  get passwordError() { return cy.contains('8자리 이상') }
  get lockoutMsg()    { return cy.contains('5분 후 시도') }

  // ── 액션 ────────────────────────────────────────────────────
  open(): void {
    this.visit(Cypress.env('LOGIN_URL'))
  }

  // id: string, pw: string — 문자열만 받을 수 있음 (타입 안전성)
  login(id: string, pw: string): void {
    this.emailInput.type(id)
    this.passwordInput.type(pw)
    this.loginButton.click()
  }

  // ── 검증 ────────────────────────────────────────────────────
  isLoginSuccess(): void {
    this.urlShouldInclude('ai-helpy-chat')
  }
}

export default new LoginPage()
