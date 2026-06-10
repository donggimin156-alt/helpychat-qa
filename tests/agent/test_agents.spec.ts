// ============================================================
// test_agents.spec.ts — 에이전트 탐색 테스트 (FHC-065~067)
// ============================================================

import { test, expect } from '@playwright/test'
import { AgentPage } from '../../pages/AgentPage'

test.describe('[FHC-065~067] 에이전트 탐색', () => {

  test('[FHC-065] 에이전트 탐색 탭 확인', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const agent = new AgentPage(page)
    await agent.clickAgentsTabFromLnb()
    await agent.isAgentListDisplayed()
  })

  test('[FHC-066] 에이전트 기능 동작 확인', async ({ page }) => {
    const agent = new AgentPage(page)
    await agent.openChatAgent()
    const displayed = await agent.isMainFeaturesDisplayed()
    expect(displayed).toBeTruthy()
  })

  test('[FHC-067] 에이전트 대화창 확인', { timeout: 90000 }, async ({ page }) => {
    const agent = new AgentPage(page)
    await agent.openChatAgent()
    await agent.clickQuickReply(0)
    await agent.waitForAIResponse()
    await agent.isLnbChatroomVisible()
  })
})
