// ============================================================
// ToolBasePage.ts — 모든 AI 도구 Page Object의 공통 부모
// ============================================================

import { Page, expect, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

// Selenium BaseToolPage: TOOLS_URL = f"{BASE_URL}/agents" — 에이전트 마켓플레이스
const TOOLS_URL = '/ai-helpy-chat/agents'

export class ToolBasePage extends BasePage {

  constructor(page: Page) { super(page) }

  // ── 공통 로케이터 ────────────────────────────────────────────
  get generateButton() {
    return this.page.getByRole('button', { name: /자동 생성|생성|수업지도안 생성/ })
  }
  // main 영역으로 범위 한정 — 사이드바 토큰 progressbar(항상 보임)와 구분
  get spinner() {
    return this.page.locator('main .MuiCircularProgress-root, main svg.animate-spin')
  }
  get errorAlert() {
    return this.page.getByText(/답변 생성에 문제가 발생했습니다|오류가 발생했습니다/)
  }
  get resultArea() {
    return this.page.locator('[data-with-artifact], .result-content, pre, [class*="result"]')
  }
  // Selenium: //a[contains(@href,'ai-helpy-chat/agents/')] — 에이전트 카드 링크
  get toolCards() {
    return this.page.locator("a[href*='ai-helpy-chat/agents/']")
  }

  // ── 공통 액션 ────────────────────────────────────────────────
  async navigateToTools(): Promise<void> {
    await this.page.goto(TOOLS_URL)
    await expect(this.page).toHaveURL(/agents/, { timeout: 10000 })
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null)
  }

  async clickToolMenu(toolName: string): Promise<void> {
    // Selenium: //a[.//p[text()='tool_name']] — <a> 안에 <p>로 도구 이름 포함
    const toolLink = this.page.locator(`//a[.//p[text()='${toolName}']]`)
    await toolLink.first().waitFor({ timeout: 30000 })
    await toolLink.first().click()
    // Selenium: wait until EC.url_contains("/tools/")
    await expect(this.page).toHaveURL(/\/tools\//, { timeout: 15000 })
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null)
    // 토큰 한도 배너 닫기 (Selenium: //*[@data-testid='xmark-largeIcon']/ancestor::button[1])
    await this.page.locator('button:has([data-testid="xmark-largeIcon"])').first()
      .click().catch(() => null)
    // 세부특기사항/행동특성: 이전 데이터가 있으면 학생 정보 탭에서 시작
    // "입력 내역 초기화" 버튼이 활성화되어 있으면 클릭 → 빈 수업 정보 탭으로 리셋
    // 비활성화(이미 첫 탭) 또는 없으면(수업지도안 등 다른 도구) 그대로 진행
    const resetBtn = this.page.getByRole('button', { name: /입력 내역 초기화/ })
    try {
      await expect(resetBtn).toBeEnabled({ timeout: 3000 })
      await resetBtn.click()
      // 확인 모달 ("초기화 하기") 처리 — isVisible(2s) → waitFor(5s) 로 강화
      try {
        const confirmBtn = this.page.getByRole('button', { name: /초기화 하기/ })
        await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
        await confirmBtn.click()
      } catch {
        // 모달이 나타나지 않은 경우 무시
      }
      // 리셋 후 수업 정보 탭(첫 드롭다운)이 보일 때까지 대기
      await this.page.locator('[aria-haspopup="listbox"]').first()
        .waitFor({ state: 'visible', timeout: 5000 }).catch(() => null)
    } catch {
      // 초기화 버튼 없거나 비활성화 → 그대로 진행
    }
  }

  async isToolsListDisplayed(): Promise<boolean> {
    return await this.toolCards.first().isVisible({ timeout: 10000 }).catch(() => false)
  }

  async isGenerateBtnEnabled(): Promise<boolean> {
    // .first() — strict mode 방지 (이미 생성된 경우 "다시 생성" + 숨겨진 버튼 동시 존재 가능)
    return await this.generateButton.first().isEnabled({ timeout: 5000 }).catch(() => false)
  }

  async clickGenerate(): Promise<void> {
    await this.generateButton.first().scrollIntoViewIfNeeded()
    // 툴팁 오버레이가 클릭을 가로막을 수 있어 JS evaluate 클릭 사용 (Selenium의 js_click과 동일)
    await this.generateButton.first().evaluate((el: HTMLElement) => el.click())
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
