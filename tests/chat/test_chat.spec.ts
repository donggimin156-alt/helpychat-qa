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

  test('[FHC-026] 검색 결과 → 기존 대화 선택', async ({ page }) => {
    const chatPage = new ChatPage(page)
    await chatPage.clickSearch()
    await chatPage.enterSearchKeyword(SEARCH_KEYWORD)
    await chatPage.isSearchResultsDisplayed()

    // 첫 번째 검색 결과 클릭
    await chatPage.searchResults.first().click()

    // 대화 상세 화면으로 전환 확인
    await expect(page).toHaveURL(/chats\//, { timeout: 10000 })
  })

  test('[FHC-027] LNB 대화 목록 확인 및 클릭', async ({ page }) => {
    const chatPage = new ChatPage(page)

    // LNB 대화 목록 표시 확인
    // Selenium: driver.find_elements() → assert len > 0
    // Playwright: expect(locator).not.toHaveCount(0)
    const lnbChatList = page.locator('nav a[href*="chats/"], [class*="chat-list"] a').first()
    await expect(lnbChatList).toBeVisible({ timeout: 10000 })

    // 랜덤 대화 클릭 → 상세 화면 전환 확인
    await lnbChatList.click()
    await expect(page).toHaveURL(/chats\//, { timeout: 10000 })
  })
})
