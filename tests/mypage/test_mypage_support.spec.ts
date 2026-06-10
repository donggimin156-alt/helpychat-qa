// ============================================================
// test_mypage_support.spec.ts — 고객 센터 (FHC-093)
// ============================================================

import { test, expect } from '@playwright/test'

const SUPPORT_URL = '/ai-helpy-chat'

test.describe('[FHC-093] 고객 센터', () => {

  test('[FHC-093] 고객 센터 AI 작동', async ({ page }) => {
    await page.goto(SUPPORT_URL)

    // 고객 센터 메뉴 클릭
    const supportMenu = page.getByText(/고객 센터|Support|고객센터/).first()
    await expect(supportMenu).toBeVisible({ timeout: 10000 })
    await supportMenu.click()

    // 'Start a chat' 클릭
    const startChat = page.getByText(/Start a chat|채팅 시작/)
    await expect(startChat).toBeVisible({ timeout: 10000 })
    await startChat.click()

    // AI 답변 표시 확인
    const aiResponse = page.locator('[class*="chat"], [class*="message"], [class*="response"]').first()
    await expect(aiResponse).toBeVisible({ timeout: 15000 })
  })
})
