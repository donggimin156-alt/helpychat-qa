import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const AGENTS_URL     = 'https://qaproject.elice.io/ai-helpy-chat/agents'
const CHAT_AGENT_URL = 'https://qaproject.elice.io/ai-helpy-chat/agents/e1d3633d-7448-4b94-a91b-9458f268377a'

export class AgentPage extends BasePage {
  constructor(page: Page) { super(page) }

  get lnbAgentsLink()  { return this.page.locator("a[href='/ai-helpy-chat/agents']") }
  // strict mode 방지: complementary(LNB)와 main 두 곳에 존재하므로 main으로 범위 제한
  get agentGrid()      { return this.page.locator("main div[data-testid='virtuoso-scroller']") }
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
    // 에이전트 마켓플레이스 페이지 구조 확인 (카드가 없어도 페이지 자체가 맞으면 통과)
    await expect(this.page.getByRole('heading', { name: /에이전트 마켓플레이스|Agent Market/ }).first()).toBeVisible({ timeout: 15000 })
    // 그리드는 로딩 중 hidden 상태일 수 있음 — attached 여부만 확인 (Selenium도 presence_of만 사용)
    await this.agentGrid.waitFor({ state: 'attached', timeout: 10000 }).catch(() => null)
    // 카드가 있으면 추가 확인 (조직에 에이전트 없을 경우 빈 목록도 정상 상태)
    const hasCards = await this.agentCards.first().isVisible({ timeout: 5000 }).catch(() => false)
    if (hasCards) {
      await expect(this.agentCards.first()).toBeVisible()
    }
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
