// ============================================================
// test_settings_organization.spec.ts — 비관리자 설정 접근 불가 (FHC-075)
// ============================================================

import { test, expect } from '@playwright/test'

const NON_ADMIN_EMAIL    = 'elice_3@naver.com'
const NON_ADMIN_PASSWORD = 'asd123!!'

const LOGIN_URL =
  'https://accounts.elice.io/accounts/signin/me' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

// 비관리자 계정은 별도 세션 (공유 storageState 미사용)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('[FHC-075] 비관리자 설정 접근 불가', () => {

  test('[FHC-075] 비관리자 계정 → 톱니바퀴 버튼 미표시', async ({ page }) => {
    // 비관리자 계정으로 직접 로그인
    await page.goto(LOGIN_URL)
    await page.locator('[name="loginId"]').fill(NON_ADMIN_EMAIL)
    await page.locator('[name="password"]').fill(NON_ADMIN_PASSWORD)
    await page.getByRole('button', { name: '로그인' }).click()
    await page.waitForURL(/ai-helpy-chat|otp/, { timeout: 30000 })

    if (page.url().includes('otp')) {
      test.skip()
      return
    }

    await expect(page).toHaveURL(/ai-helpy-chat/, { timeout: 10000 })

    // 관리자가 아닐 경우 톱니바퀴 설정 버튼이 없어야 함
    // Selenium: driver.find_elements() → len == 0 assert
    // Playwright: expect(locator).toHaveCount(0)
    const gearButton = page.locator('button:has(svg[data-testid="gearIcon"])')
    await expect(gearButton).toHaveCount(0, { timeout: 5000 })
  })
})
