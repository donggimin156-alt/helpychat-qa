// ============================================================
// test_settings_organization.spec.ts — 비관리자 설정 접근 불가 (FHC-075)
// ============================================================

import { test, expect } from '@playwright/test'
import users from '../../fixtures/users.json'
import { loginWithOTPCheck } from '../helpers/auth'

// 비관리자 계정은 별도 세션 (공유 storageState 미사용)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('[FHC-075] 비관리자 설정 접근 불가', () => {

  test('[FHC-075] 비관리자 계정 → 톱니바퀴 버튼 미표시', async ({ page }) => {
    const ok = await loginWithOTPCheck(page, users.nonAdmin.id, users.nonAdmin.pw)
    if (!ok) { test.skip(); return }

    await expect(page).toHaveURL(/ai-helpy-chat/, { timeout: 10000 })

    // 관리자가 아닐 경우 톱니바퀴 설정 버튼이 없어야 함
    // Selenium: driver.find_elements() → len == 0 assert
    // Playwright: expect(locator).toHaveCount(0)
    const gearButton = page.locator('button:has(svg[data-testid="gearIcon"])')
    await expect(gearButton).toHaveCount(0, { timeout: 5000 })
  })
})
