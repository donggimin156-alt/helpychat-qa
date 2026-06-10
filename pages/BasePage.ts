// ============================================================
// BasePage.ts — 모든 Page Object의 부모 클래스 (Playwright)
// Cypress: cy.get() → Playwright: page.locator()
// Cypress: .should('be.visible') → Playwright: expect().toBeVisible()
// ============================================================

import { Page, expect, Locator } from '@playwright/test'

export class BasePage {

  constructor(protected page: Page) {}

  // ── 페이지 이동 ─────────────────────────────────────────────
  // Cypress: cy.visit(url)
  async visit(url: string): Promise<void> {
    await this.page.goto(url)
  }

  // ── URL 검증 ────────────────────────────────────────────────
  // Cypress: cy.url().should('include', text)
  async urlShouldInclude(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text))
  }

  // ── 요소 가져오기 ────────────────────────────────────────────
  // Cypress: cy.get(selector)
  locator(selector: string): Locator {
    return this.page.locator(selector)
  }

  // ── 텍스트로 요소 찾기 ───────────────────────────────────────
  // Cypress: cy.contains(text)
  getByText(text: string): Locator {
    return this.page.getByText(text)
  }

  // ── 요소 표시 여부 검증 ──────────────────────────────────────
  // Cypress: .should('be.visible')
  async shouldBeVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible()
  }
}
