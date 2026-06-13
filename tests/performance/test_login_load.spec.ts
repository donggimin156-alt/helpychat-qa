// ============================================================
// test_login_load.spec.ts — 세션 반복 접속 부하 테스트 (FHC-096)
// Playwright는 global-setup의 storageState로 세션을 재사용하므로
// 로그인/로그아웃 반복 대신 세션 유지 상태에서 페이지 반복 접속 안정성을 검증
// ============================================================

import { test, expect } from '@playwright/test'

const REPEAT = 5

test('[FHC-096] 세션 반복 접속 부하 테스트', async ({ page }) => {
  test.setTimeout(120000)

  let failCount = 0

  for (let i = 1; i <= REPEAT; i++) {
    try {
      await page.goto('/ai-helpy-chat')
      await expect(page).toHaveURL(/ai-helpy-chat/, { timeout: 15000 })
    } catch {
      failCount++
    }
  }

  expect(failCount).toBe(0)
})
