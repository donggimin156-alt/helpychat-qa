// ============================================================
// ChatPage.ts — 채팅 페이지 Page Object (TypeScript)
// ============================================================

import BasePage from './BasePage'

class ChatPage extends BasePage {

  // ── 로케이터 ────────────────────────────────────────────────
  get newChatTab()    { return cy.contains('새 대화') }
  get chatInput()     { return cy.get('[contenteditable="true"]').first() }
  get searchTab()     { return cy.contains('검색') }
  get searchInput()   { return cy.get('[placeholder*="검색"]') }
  get searchResults() { return cy.get('[class*="search"] [class*="item"], [class*="result"]') }

  // ── 액션 ────────────────────────────────────────────────────
  open(): void {
    this.visit('/ai-helpy-chat')
  }

  clickNewChat(): void {
    this.newChatTab.click()
  }

  sendMessage(message: string): void {
    this.chatInput.type(message)
    this.chatInput.type('{enter}')
  }

  clickSearch(): void {
    this.searchTab.click()
  }

  enterSearchKeyword(keyword: string): void {
    this.searchInput.type(keyword)
  }

  // ── 검증 ────────────────────────────────────────────────────
  isChatWindowOpen(): void {
    this.chatInput.should('be.visible')
  }

  waitForAIResponse(): void {
    cy.get('[class*="message"], [class*="response"]', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
  }

  isSearchModalOpen(): void {
    this.searchInput.should('be.visible')
  }

  isSearchResultsDisplayed(): void {
    this.searchResults.should('have.length.greaterThan', 0)
  }
}

export default new ChatPage()
