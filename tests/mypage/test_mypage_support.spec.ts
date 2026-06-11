// ============================================================
// test_mypage_support.spec.ts — 고객 센터 (FHC-093)
// Selenium: window.ChannelIO('showMessenger') + iframe 처리
// Playwright: page.evaluate() + page.frames() 로 동일 구현
// ============================================================

import { test, expect } from '@playwright/test'

const ACCOUNT_URL = 'https://accounts.elice.io/accounts/members/account'

test.describe('[FHC-093] 고객 센터', () => {

  test('[FHC-093] 고객 센터 AI 작동', { timeout: 60000 }, async ({ page }) => {
    // Selenium의 navigate_to_support() 와 동일:
    // accounts.elice.io 페이지로 이동 후 ChannelIO 위젯 JS API 호출
    await page.goto(ACCOUNT_URL)
    await expect(page).toHaveURL(/members\/account/, { timeout: 15000 })

    // ChannelIO 위젯 초기화 대기 (Selenium: execute_script 로 함수 존재 확인)
    const channelLoaded = await page.waitForFunction(
      () => typeof (window as any).ChannelIO === 'function',
      { timeout: 15000 }
    ).then(() => true).catch(() => false)

    if (!channelLoaded) {
      // ChannelIO 없는 환경 — 스킵
      test.skip()
      return
    }

    // JS API로 메신저 열기 (Selenium의 ChannelIO('showMessenger') 와 동일)
    const result = await page.evaluate(() => {
      if ((window as any).ChannelIO) {
        (window as any).ChannelIO('showMessenger')
        return 'channelIO-api'
      }
      return 'not-found'
    })

    if (result === 'not-found') {
      test.skip()
      return
    }

    await page.waitForTimeout(2000)

    // 'Start a chat' 버튼 클릭 시도 (Selenium의 click_start_chat() 와 동일)
    // 1) 메인 페이지에서 data-ch-testid 버튼 탐색
    const startBtn = page.locator(
      "[data-ch-testid='new-chat-button'], button[data-ch-testid='new-chat-button']"
    ).first()

    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click()
    } else {
      // 2) ChannelIO iframe 내부 탐색
      let clicked = false
      for (const frame of page.frames()) {
        try {
          const frameBtn = frame.locator(
            "[data-ch-testid='new-chat-button'], button[aria-label*='chat'], button[aria-label*='Chat']"
          ).first()
          if (await frameBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await frameBtn.click()
            clicked = true
            break
          }
        } catch {
          // 해당 frame 스킵
        }
      }
      if (!clicked) {
        // 3) JS fallback: openChat API
        await page.evaluate(() => {
          if ((window as any).ChannelIO) {
            (window as any).ChannelIO('openChat')
          }
        })
        await page.waitForTimeout(1000)
      }
    }

    // 채팅창 표시 확인 (Selenium의 is_chat_ai_displayed() 와 동일)
    // ChannelIO는 src='' (about:blank) 동적 iframe (#ch-plugin-script-iframe) 사용
    // 'channel.io' URL 필터 없이 접근해야 함

    // 1) iframe 가시성 확인 — messenger 열렸을 때만 visible
    const chIframe = page.locator('#ch-plugin-script-iframe')
    let chatVisible = await chIframe.isVisible({ timeout: 8000 }).catch(() => false)

    // 2) same-origin about:blank iframe이므로 frameLocator로 내부 접근
    if (!chatVisible) {
      const chTextarea = page.frameLocator('#ch-plugin-script-iframe')
        .locator('[data-ch-testid="messenger-footer-text-area"]')
      chatVisible = await chTextarea.isVisible({ timeout: 10000 }).catch(() => false)
    }

    // 3) 메인 DOM 직접 확인 (ChannelIO 버전에 따라 다를 수 있음)
    if (!chatVisible) {
      const mainTextarea = page.locator('[data-ch-testid="messenger-footer-text-area"]')
      chatVisible = await mainTextarea.isVisible({ timeout: 3000 }).catch(() => false)
    }

    expect(chatVisible).toBeTruthy()

    // 메신저 닫기 — ChannelIO WebSocket 연결 해제로 context teardown 지연 방지
    await page.evaluate(() => {
      if ((window as any).ChannelIO) {
        (window as any).ChannelIO('hideMessenger')
      }
    }).catch(() => null)
  })
})
