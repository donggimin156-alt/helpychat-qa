// ============================================================
// test_token_load.spec.ts — 토큰 사용량 페이지 반복 조회 부하 테스트 (FHC-099)
// ============================================================

import { test, expect } from '@playwright/test'
import { TokenPage } from '../../pages/TokenPage'
import { loginMain } from '../helpers/auth'

// accounts.elice.io 세션이 기능 테스트 완료 시점에 만료되므로 재로그인
test.use({ storageState: { cookies: [], origins: [] } })

const REPEAT = 5

test('[FHC-099] 토큰 사용량 페이지 반복 조회 부하 테스트', async ({ page }) => {
  test.setTimeout(180000)
  const ok = await loginMain(page)
  if (!ok) { test.skip(); return }

  await page.goto('/ai-helpy-chat')
  const token = new TokenPage(page)
  let failCount = 0

  for (let i = 1; i <= REPEAT; i++) {
    try {
      await page.goto('/ai-helpy-chat')
      await token.clickLnbToken()
      await token.isTokenTableDisplayed()
    } catch {
      failCount++
    }
  }

  expect(failCount).toBe(0)
})
