// ============================================================
// test_chat.cy.ts — 채팅 테스트 (TypeScript + cy.intercept)
// ============================================================

import { ChatPage } from '../../support/pages'

const TEST_MESSAGE   = '오늘 마실 차를 추천해 주세요'
const SEARCH_KEYWORD = '오늘'

describe('[FHC-022~027] 채팅', () => {

  beforeEach(() => {
    cy.login()
    cy.closeTokenBanner()
    ChatPage.open()
  })

  // ── smoke ───────────────────────────────────────────────────

  it('[FHC-022] 새 대화 탭 확인', { tags: 'smoke' }, () => {
    ChatPage.clickNewChat()
    ChatPage.isChatWindowOpen()
  })

  // cy.intercept() 실제 활용 예시
  // AI 응답 API를 가짜 응답으로 대체 → 서버 기다릴 필요 없음
  // → Python에서 mock을 쓰는 것과 동일한 개념
  it('[FHC-023] AI 대화 기능 테스트 (Stub)', { tags: 'smoke' }, () => {
    // 실제 AI API 경로를 가짜 응답으로 가로챔
    // DevTools Network 탭에서 실제 요청 URL 확인 후 수정 필요
    cy.intercept('POST', '**/chat**', {
      statusCode: 200,
      body: { message: 'AI 테스트 응답입니다.' },
    }).as('chatAPI')

    ChatPage.clickNewChat()
    ChatPage.sendMessage(TEST_MESSAGE)

    // API 요청이 발생했는지 확인
    cy.wait('@chatAPI').its('response.statusCode').should('eq', 200)
  })

  // cy.intercept() — 실제 서버 응답 그대로 사용 (stub 없음)
  it('[FHC-023] AI 대화 기능 테스트 (Real)', () => {
    // 요청 감시만 하고 응답은 실제 서버 것을 사용
    cy.intercept('POST', '**/chat**').as('chatAPI')

    ChatPage.clickNewChat()
    ChatPage.sendMessage(TEST_MESSAGE)
    ChatPage.waitForAIResponse()
  })

  // ── regression ──────────────────────────────────────────────

  it('[FHC-024] 검색 탭 확인', () => {
    ChatPage.clickSearch()
    ChatPage.isSearchModalOpen()
  })

  it('[FHC-025] 검색 기능 테스트', () => {
    ChatPage.clickSearch()
    ChatPage.enterSearchKeyword(SEARCH_KEYWORD)
    ChatPage.isSearchResultsDisplayed()
  })
})
