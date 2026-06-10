// ============================================================
// test_login.cy.ts — 로그인 테스트 (TypeScript)
// ============================================================

import { LoginPage } from '../../support/pages'

// TypeScript: 타입 선언 — users.json 구조 정의
interface User { id: string; pw: string }
interface UsersFixture { default: User; dummy: User }

const INVALID_EMAIL    = 'email'
const INVALID_PASSWORD = '1234'
const LOCKOUT_EMAIL    = 'test_login1@elice.io'
const LOCKOUT_PASSWORD = 'test_login123'

describe('[FHC-006~013] 로그인', () => {

  // ── Happy Path ──────────────────────────────────────────────
  describe('Happy Path', () => {

    it('[FHC-006] 로그인 성공', { tags: 'smoke' }, () => {
      // cy.intercept(): 로그인 API 요청을 감시 (실제 요청은 그대로 통과)
      // → 요청이 실제로 발생했는지 검증할 때 사용
      cy.intercept('POST', '**/signin**').as('loginRequest')

      cy.fixture<UsersFixture>('users').then((users) => {
        LoginPage.open()
        LoginPage.login(users.default.id, users.default.pw)
        LoginPage.isLoginSuccess()
      })
    })
  })

  // ── Sad Case ────────────────────────────────────────────────
  describe('Sad Case', () => {

    beforeEach(() => {
      LoginPage.open()
    })

    it('[FHC-007] 이메일 유효성 검사', () => {
      LoginPage.emailInput.type(INVALID_EMAIL)
      LoginPage.emailError.should('be.visible')
    })

    it('[FHC-008~009] 비밀번호 유효성 + 마스킹', () => {
      LoginPage.emailInput.type('test@example.com')
      LoginPage.passwordInput.type(INVALID_PASSWORD)
      LoginPage.loginButton.click()
      LoginPage.passwordError.should('be.visible')
      LoginPage.passwordInput.should('have.attr', 'type', 'password')
      LoginPage.pwEyeIcon.click()
      LoginPage.passwordInput.should('have.attr', 'type', 'text')
    })

    it('[FHC-012] 로그인 5회 실패 계정 잠금', () => {
      LoginPage.emailInput.type(LOCKOUT_EMAIL)
      LoginPage.passwordInput.type(LOCKOUT_PASSWORD)
      Cypress._.times(6, () => { LoginPage.loginButton.click() })
      LoginPage.lockoutMsg.should('be.visible')
    })
  })
})
