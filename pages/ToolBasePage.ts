// ============================================================
// ToolBasePage.ts — 모든 AI 도구 Page Object의 공통 부모
// ============================================================

import { Page, expect, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

const TOOLS_URL = '/ai-helpy-chat/tools'

export class ToolBasePage extends BasePage {

  constructor(page: Page) { super(page) }

  // ── 공통 로케이터 ────────────────────────────────────────────
  get generateButton() {
    return this.page.getByRole('button', { name: /자동 생성|생성|수업지도안 생성/ })
  }
  get spinner() {
    return this.page.locator('[role="progressbar"], .MuiCircularProgress-root, svg.animate-spin')
  }
  get errorAlert() {
    return this.page.getByText(/답변 생성에 문제가 발생했습니다|오류가 발생했습니다/)
  }
  get resultArea() {
    return this.page.locator('[data-with-artifact], .result-content, pre, [class*="result"]')
  }
  get toolCards() {
    return this.page.locator('[class*="ToolCard"], [class*="tool-card"], a[href*="/tools/"]')
  }

  // ── 공통 액션 ────────────────────────────────────────────────
  async navigateToTools(): Promise<void> {
    await this.page.goto(TOOLS_URL)
    await expect(this.page).toHaveURL(/tools/, { timeout: 10000 })
  }

  async clickToolMenu(toolName: string): Promise<void> {
    await this.page.getByText(toolName, { exact: false }).first().click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async isToolsListDisplayed(): Promise<boolean> {
    return await this.toolCards.first().isVisible({ timeout: 10000 }).catch(() => false)
  }

  async isGenerateBtnEnabled(): Promise<boolean> {
    return await this.generateButton.isEnabled({ timeout: 5000 }).catch(() => false)
  }

  async clickGenerate(): Promise<void> {
    await this.generateButton.scrollIntoViewIfNeeded()
    await this.generateButton.click()
  }

  async isGenerating(): Promise<boolean> {
    return await this.spinner.isVisible({ timeout: 5000 }).catch(() => false)
  }

  // Selenium: while loop + time.sleep(5) 폴링
  // Playwright: waitForSelector 로 이벤트 기반 대기
  async waitForGenerated(timeoutMs = 120000): Promise<boolean> {
    try {
      await this.spinner.waitFor({ state: 'hidden', timeout: timeoutMs })
      return true
    } catch {
      return false
    }
  }

  async isErrorAlertDisplayed(): Promise<boolean> {
    return await this.errorAlert.isVisible({ timeout: 10000 }).catch(() => false)
  }
}
