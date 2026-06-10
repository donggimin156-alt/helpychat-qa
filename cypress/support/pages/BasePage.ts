// ============================================================
// BasePage.ts — 모든 Page Object의 부모 클래스 (TypeScript)
// Python의 pages/base_page.py 와 동일한 역할
// ============================================================

class BasePage {

  // string = 문자열 타입 (TypeScript 타입 선언)
  visit(url: string): void {
    cy.visit(url)
  }

  urlShouldInclude(text: string): void {
    cy.url().should('include', text)
  }

  get(selector: string): Cypress.Chainable {
    return cy.get(selector)
  }

  contains(text: string): Cypress.Chainable {
    return cy.contains(text)
  }

  shouldBeVisible(selector: string): void {
    cy.get(selector).should('be.visible')
  }
}

export default BasePage
