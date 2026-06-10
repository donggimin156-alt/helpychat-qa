// ============================================================
// test_tools_deep.spec.ts — 심층 조사 도구 (FHC-058~064)
// ============================================================

import { test, expect } from '@playwright/test'
import { ToolBasePage } from '../../pages/ToolBasePage'

const TOOL_NAME   = '심층 조사'
const TOPIC       = '날씨'
const MESSAGE     = '대한민국 서울의 2026년 5월의 날씨'
const TOPIC_500   = '가'.repeat(500)
const TOPIC_501   = '가'.repeat(501)

test.describe('[FHC-058~064] 심층 조사', () => {

  // ── Happy Path (FHC-058~061) ─────────────────────────────────
  test.describe('Happy Path', () => {

    test('[FHC-058~061] 심층 조사 페이지 진입 → 입력 → 생성 시작', async ({ page }) => {
      const tool = new ToolBasePage(page)
      await tool.navigateToTools()

      // [FHC-058] 심층 조사 페이지 진입
      await tool.clickToolMenu(TOOL_NAME)
      await expect(page).toHaveURL(/tools/, { timeout: 10000 })

      // [FHC-059~060] 주제 및 지시사항 입력
      await page.locator('textarea, input[placeholder*="주제"]').first().fill(TOPIC)
      const messageInput = page.locator('textarea').nth(1)
      if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await messageInput.fill(MESSAGE)
      }

      // [FHC-061] 생성 버튼 활성화 확인 및 클릭
      expect(await tool.isGenerateBtnEnabled()).toBeTruthy()
      await tool.clickGenerate()

      // 생성 시작(스피너) 확인
      expect(await tool.isGenerating()).toBeTruthy()
    })

    test('[FHC-061s] 심층 조사 생성 완료 확인 @slow', { timeout: 660000 }, async ({ page }) => {
      const tool = new ToolBasePage(page)
      await tool.navigateToTools()
      await tool.clickToolMenu(TOOL_NAME)

      await page.locator('textarea, input[placeholder*="주제"]').first().fill(TOPIC)
      const messageInput = page.locator('textarea').nth(1)
      if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await messageInput.fill(MESSAGE)
      }
      await tool.clickGenerate()

      // Selenium: while loop + time.sleep(5) 로 10분 폴링
      // Playwright: waitForSelector 이벤트 기반 대기 (최대 10분)
      const generated = await tool.waitForGenerated(600000)
      expect(generated).toBeTruthy()
    })
  })

  // ── Sad Case (FHC-062~064) ───────────────────────────────────
  test.describe('Sad Case', () => {

    test('[FHC-062] 주제 공백 입력 → 오류 메시지 표시', async ({ page }) => {
      const tool = new ToolBasePage(page)
      await tool.navigateToTools()
      await tool.clickToolMenu(TOOL_NAME)

      await page.locator('textarea, input[placeholder*="주제"]').first().fill(' ')
      await tool.clickGenerate()

      expect(await tool.isErrorAlertDisplayed()).toBeTruthy()
    })

    test('[FHC-063] 주제 500자 입력 → 생성 버튼 활성화 (경계값)', async ({ page }) => {
      const tool = new ToolBasePage(page)
      await tool.navigateToTools()
      await tool.clickToolMenu(TOOL_NAME)

      await page.locator('textarea, input[placeholder*="주제"]').first().fill(TOPIC_500)
      expect(await tool.isGenerateBtnEnabled()).toBeTruthy()
    })

    test('[FHC-064] 주제 501자 입력 → 생성 버튼 비활성화 (경계값)', async ({ page }) => {
      const tool = new ToolBasePage(page)
      await tool.navigateToTools()
      await tool.clickToolMenu(TOOL_NAME)

      await page.locator('textarea, input[placeholder*="주제"]').first().fill(TOPIC_501)

      // Selenium: assert not element.is_enabled()
      // Playwright: expect(locator).toBeDisabled()
      await expect(tool.generateButton).toBeDisabled({ timeout: 5000 })
    })
  })
})
