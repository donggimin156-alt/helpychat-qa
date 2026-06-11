// ============================================================
// ChatPage.ts — 채팅 페이지 Page Object (Playwright)
// ============================================================

import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ChatPage extends BasePage {

  constructor(page: Page) {
    super(page)
  }

  // ── 로케이터 ────────────────────────────────────────────────
  get newChatTab()    { return this.page.locator("//span[normalize-space(text())='새 대화' or normalize-space(text())='New Chat']/ancestor::a") }
  get chatInput()     { return this.page.locator("textarea[name='input']") }
  get searchTab()     { return this.page.locator("//span[normalize-space(text())='검색' or normalize-space(text())='Search']/ancestor::*[@role='button' or self::a][1]") }
  get searchInput()   { return this.page.locator("//*[@role='dialog']//input") }
  get searchResults() { return this.page.locator("[role='dialog'] a[href*='chats/']") }

  // ── 액션 ────────────────────────────────────────────────────
  async open(): Promise<void> {
    await this.visit('/ai-helpy-chat')
  }

  async clickNewChat(): Promise<void> {
    await this.newChatTab.click()
  }

  async sendMessage(message: string): Promise<void> {
    await this.chatInput.fill(message)
    await this.page.keyboard.press('Enter')
  }

  async clickSearch(): Promise<void> {
    await this.searchTab.click()
  }

  async enterSearchKeyword(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword)
  }

  // ── 검증 ────────────────────────────────────────────────────
  async isChatWindowOpen(): Promise<void> {
    await expect(this.chatInput).toBeVisible()
  }

  // Cypress: cy.intercept() 없이 waitForResponse로 AI 응답 대기
  async waitForAIResponse(): Promise<void> {
    // URL이 /chats/ 로 바뀔 때까지 대기 (대화방 생성)
    await this.page.waitForURL(/ai-helpy-chat\/chats\//, { timeout: 60000 })
    // AI 응답 컨테이너 등장 대기
    await this.page.waitForSelector('div[data-with-artifact]', { timeout: 60000 })
  }

  async isSearchModalOpen(): Promise<void> {
    await expect(this.searchInput).toBeVisible()
  }

  async isSearchResultsDisplayed(): Promise<void> {
    await expect(this.searchResults.first()).toBeVisible()
  }
}
