// ============================================================
// commands.ts — 커스텀 커맨드 (TypeScript)
// ============================================================

import { LoginPage } from './pages'

// TypeScript: cy.login() 커맨드 타입 선언
// → 이 선언이 없으면 cy.login() 호출 시 타입 오류 발생
declare global {
  namespace Cypress {
    interface Chainable {
      login(userType?: string): Chainable<void>
      closeTokenBanner(): Chainable<void>
    }
  }
}

// ── cy.login() ───────────────────────────────────────────────
Cypress.Commands.add('login', (userType: string = 'default') => {
  cy.fixture('users').then((users) => {
    const user = users[userType]

    cy.session([userType, user.id], () => {
      LoginPage.open()
      LoginPage.login(user.id, user.pw)
      LoginPage.isLoginSuccess()
    })
  })
})

// ── cy.closeTokenBanner() ────────────────────────────────────
Cypress.Commands.add('closeTokenBanner', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid*="xmark"]').length) {
      cy.get('[data-testid*="xmark"]').first().click()
    }
  })
})
