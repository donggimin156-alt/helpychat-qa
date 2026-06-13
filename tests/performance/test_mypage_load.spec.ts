// ============================================================
// test_mypage_load.spec.ts — 마이페이지 탭 반복 이동 부하 테스트 (FHC-098)
// ============================================================

import { test, expect } from '@playwright/test'
import { loginDummy, handleDummyReauth } from '../helpers/auth'
import { ACCOUNT_URL, LANGUAGE_URL, ORG_URL } from '../helpers/urls'

test.use({ storageState: { cookies: [], origins: [] } })

const REPEAT = 3

test('[FHC-098] 마이페이지 탭 반복 이동 부하 테스트', async ({ page }) => {
  test.setTimeout(180000)
  const ok = await loginDummy(page)
  if (!ok) { test.skip(); return }
  let failCount = 0

  // goto 후 signin 리다이렉트 확인 및 재인증 처리 (최대 2회 재시도)
  const gotoWithReauth = async (url: string, opts?: Parameters<typeof page.goto>[1]) => {
    await page.goto(url, opts)
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!page.url().includes('accounts.elice.io') || !page.url().includes('signin')) break
      if (!await handleDummyReauth(page)) throw new Error('재인증 실패')
      await page.goto(url, opts)
    }
  }

  for (let i = 1; i <= REPEAT; i++) {
    try {
      // 계정 탭
      await gotoWithReauth(ACCOUNT_URL)
      await expect(page).toHaveURL(/members\/account/, { timeout: 15000 })

      // 내 기관 탭
      await gotoWithReauth(ORG_URL, { waitUntil: 'commit' })
      await page.waitForURL(/organizations|members\/account/, { timeout: 15000 }).catch(() => null)

      // 언어 탭
      await gotoWithReauth(LANGUAGE_URL)
      await expect(page).toHaveURL(/members\/language/, { timeout: 20000 })
    } catch {
      failCount++
    }
  }

  expect(failCount).toBe(0)
})
