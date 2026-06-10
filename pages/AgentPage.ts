import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const AGENTS_URL     = 'https://qaproject.elice.io/ai-helpy-chat/agents'
const CHAT_AGENT_URL = 'https://qaproject.elice.io/ai-helpy-chat/agents/e1d3633d-7448-4b94-a91b-9458f268377a'

export class AgentPage extends BasePage {
  constructor(page: Page) { super(page) }

  get lnbAgentsLink()  { return this.page.locator("a[href='/ai-helpy-chat/agents']") }
  get agentGrid()      { return this.page.locator("div[data-testid='virtuoso-scroller']") }
  get agentCards()     { return this.page.locator("//div[contains(@class,'virtuoso-grid-item')]//a") }
  get quickReplyBtns() { return this.page.locator("//main//button[contains(@class,'MuiButtonBase-root') and @type='button' and string-length(normalize-space(.)) > 0]") }
  get aiResponse()     { return this.page.locator("div[data-with-artifact]") }
  get lnbChatItems()   { return this.page.locator("//aside//a[contains(@href,'chatrooms')]") }
  get mainFeatures()   { return this.page.locator("//main//button[contains(@class,'MuiButtonBase-root') and @type='button' and string-length(normalize-space(.)) > 0]") }

  async navigateToBase(): Promise<void> {
    await this.visit('/ai-helpy-chat')
  }

  async openChatAgent(): Promise<void> {
    await this.page.goto(CHAT_AGENT_URL)
    await expect(this.page).toHaveURL(/agents\//, { timeout: 10000 })
  }

  async clickAgentsTabFromLnb(): Promise<void> {
    await this.lnbAgentsLink.click()
    await expect(this.page).toHaveURL(/\/agents/, { timeout: 10000 })
  }

  async isAgentListDisplayed(): Promise<void> {
    await expect(this.agentGrid).toBeVisible({ timeout: 15000 })
    await expect(this.agentCards.first()).toBeVisible()
  }

  async isMainFeaturesDisplayed(): Promise<boolean> {
    try {
      await this.mainFeatures.first().waitFor({ timeout: 10000 })
      return (await this.mainFeatures.count()) > 0
    } catch { return false }
  }

  async clickQuickReply(index = 0): Promise<void> {
    await this.quickReplyBtns.first().waitFor({ timeout: 10000 })
    const count = await this.quickReplyBtns.count()
    if (count > index) await this.quickReplyBtns.nth(index).click()
  }

  async waitForAIResponse(): Promise<void> {
    await this.page.waitForURL(/chatrooms/, { timeout: 60000 })
    await this.page.waitForSelector('div[data-with-artifact]', { timeout: 60000 })
  }

  async isLnbChatroomVisible(): Promise<void> {
    await expect(this.lnbChatItems.first()).toBeVisible({ timeout: 10000 })
  }
}
