// ============================================================
// test_token.spec.ts — 토큰 사용량 테스트 (FHC-018~021)
// ============================================================

import { test, expect } from '@playwright/test'
import { TokenPage } from '../../pages/TokenPage'

const TEST_MESSAGE = '안녕하세요, 토큰 사용량 테스트입니다.'

test.describe('[FHC-018~021] 토큰 사용량', () => {

  test('[FHC-018] LNB 토큰 사용량 표시 확인', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const token = new TokenPage(page)
    const displayed = await token.isLnbTokenDisplayed()
    expect(displayed).toBeTruthy()
  })

  test('[FHC-019] AI 대화 후 토큰 사용량 증가 확인', { timeout: 120000 }, async ({ page }) => {
    const token = new TokenPage(page)

    // 대화 전 행 수 기록
    await page.goto('/ai-helpy-chat/admin/general')
    await token.clickAllHistoryButton()
    const beforeRows = await token.getTableRowCount()

    // AI 대화
    await token.sendChatMessage(TEST_MESSAGE)
    await token.waitForAIResponse()

    // 대화 후 행 수 비교
    await page.goto('/ai-helpy-chat/admin/general')
    await token.clickAllHistoryButton()
    await page.waitForTimeout(2000)
    const afterRows = await token.getTableRowCount()

    expect(afterRows).toBeGreaterThan(beforeRows)
  })

  test('[FHC-020] LNB 토큰 클릭 → 설정 페이지 이동', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const token = new TokenPage(page)
    await token.clickLnbToken()
    await expect(page).toHaveURL(/admin\/general/, { timeout: 10000 })
    await token.isTokenTableDisplayed()
  })

  test('[FHC-021] 전체 이용 내역 버튼 클릭', async ({ page }) => {
    await page.goto('/ai-helpy-chat/admin/general')
    const token = new TokenPage(page)
    await token.clickAllHistoryButton()
    await expect(page).toHaveURL(/admin\/history/, { timeout: 10000 })
  })
})
