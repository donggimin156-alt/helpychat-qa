// ============================================================
// test_chat_load.spec.ts — 채팅 메시지 연속 전송 부하 테스트 (FHC-095)
// ============================================================

import { test, expect } from '@playwright/test'
import { ChatPage } from '../../pages/ChatPage'
import { loginMain } from '../helpers/auth'

// accounts.elice.io 세션이 기능 테스트 완료 시점에 만료되므로 재로그인
test.use({ storageState: { cookies: [], origins: [] } })

const REPEAT       = 10
const TEST_MESSAGE = '안녕하세요'

test('[FHC-095] 채팅 메시지 연속 전송 부하 테스트', async ({ page }) => {
  test.setTimeout(600000)
  const ok = await loginMain(page)
  if (!ok) { test.skip(); return }

  let failCount = 0

  for (let i = 1; i <= REPEAT; i++) {
    try {
      const chat = new ChatPage(page)
      await chat.open()
      // 로그인 페이지로 리다이렉트됐으면 세션 만료 — 해당 회차 실패 처리
      if (page.url().includes('accounts')) { failCount++; continue }
      await page.locator('button:has([data-testid="xmark-largeIcon"])').first()
        .click().catch(() => null)
      await chat.clickNewChat()
      await chat.sendMessage(TEST_MESSAGE)
      await chat.waitForAIResponse()
    } catch {
      failCount++
    }
  }

  expect(failCount).toBe(0)
})
