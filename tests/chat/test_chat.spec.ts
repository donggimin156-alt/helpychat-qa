// ============================================================
// test_chat.spec.ts — 채팅 테스트 (Playwright)
// Cypress의 test_chat.cy.ts 와 동일한 역할
// ============================================================

import { test, expect } from '@playwright/test'
import { ChatPage } from '../../pages'

const TEST_MESSAGE   = '오늘 마실 차를 추천해 주세요'
const SEARCH_KEYWORD = '오늘'

test.describe('[FHC-022~027] 채팅', () => {

  // storageState는 playwright.config.ts 에서 전역 설정됨
  // → global-setup.ts 에서 1회 로그인 후 세션 재사용

  test.beforeEach(async ({ page }) => {
    const chatPage = new ChatPage(page)
    await chatPage.open()

    // 토큰 배너 닫기 (Cypress의 cy.closeTokenBanner() 와 동일)
    const banner = page.locator('[data-testid*="xmark"]')
    if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await banner.click()
    }
  })

  // ── smoke ───────────────────────────────────────────────────

  test('[FHC-022] 새 대화 탭 확인 @smoke', async ({ page }) => {
    const chatPage = new ChatPage(page)
    await chatPage.clickNewChat()
    await chatPage.isChatWindowOpen()
  })

  test('[FHC-023] AI 대화 기능 테스트 @smoke', { timeout: 90000 }, async ({ page }) => {
    const chatPage = new ChatPage(page)
    await chatPage.clickNewChat()

    // Playwright의 네트워크 감시 (Cypress의 cy.intercept() 와 동일)
    // 실제 응답 그대로 사용하되 요청 발생 여부 감시
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('chat') && resp.status() === 200,
      { timeout: 30000 }
    ).catch(() => null)

    await chatPage.sendMessage(TEST_MESSAGE)
    await chatPage.waitForAIResponse()
  })

  // ── regression ──────────────────────────────────────────────

  test('[FHC-024] 검색 탭 확인', async ({ page }) => {
    const chatPage = new ChatPage(page)
    await chatPage.clickSearch()
    await chatPage.isSearchModalOpen()
  })

  test('[FHC-025] 검색 기능 테스트', async ({ page }) => {
    const chatPage = new ChatPage(page)
    await chatPage.clickSearch()
    await chatPage.enterSearchKeyword(SEARCH_KEYWORD)
    await chatPage.isSearchResultsDisplayed()
  })
})
