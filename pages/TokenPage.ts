import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class TokenPage extends BasePage {
  constructor(page: Page) { super(page) }

  readonly ADMIN_URL   = '/ai-helpy-chat/admin/general'
  readonly HISTORY_URL = '/ai-helpy-chat/admin/history'

  get lnbTokenLink()      { return this.page.locator("a[href*='admin']").first() }
  get tokenTable()        { return this.page.locator("table.MuiTable-root") }
  get allHistoryButton()  { return this.page.locator("//button[contains(normalize-space(),'전체 이용 내역') or contains(normalize-space(),'All History')] | //a[contains(normalize-space(),'전체 이용 내역') or contains(normalize-space(),'All History')]").first() }
  get chatInput()         { return this.page.locator("textarea[name='input']") }

  async isLnbTokenDisplayed(): Promise<boolean> {
    try {
      const el = this.lnbTokenLink
      await el.waitFor({ timeout: 5000 })
      const text = await el.textContent() || ''
      return text.includes('token') || text.includes('토큰')
    } catch { return false }
  }

  async getLnbTokenText(): Promise<string> {
    return (await this.lnbTokenLink.textContent()) || ''
  }

  async clickLnbToken(): Promise<void> {
    await this.lnbTokenLink.click()
    await expect(this.page).toHaveURL(/admin\/general/, { timeout: 10000 })
  }

  async clickAllHistoryButton(): Promise<void> {
    await this.allHistoryButton.click()
    await expect(this.page).toHaveURL(/admin\/history/, { timeout: 10000 })
  }

  async isTokenTableDisplayed(): Promise<void> {
    await expect(this.tokenTable).toBeVisible()
  }

  async sendChatMessage(message: string): Promise<void> {
    await this.visit('/ai-helpy-chat')
    await this.chatInput.fill(message)
    await this.page.keyboard.press('Enter')
  }

  async waitForAIResponse(): Promise<void> {
    await this.page.waitForURL(/ai-helpy-chat\/chats\//, { timeout: 60000 })
    await this.page.waitForSelector('div[data-with-artifact]', { timeout: 60000 })
  }

  async getTableRowCount(): Promise<number> {
    await this.tokenTable.waitFor({ timeout: 10000 })
    return await this.page.locator('table.MuiTable-root tr.MuiTableRow-root').count()
  }
}
