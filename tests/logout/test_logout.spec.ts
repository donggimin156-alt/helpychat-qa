// ============================================================
// test_logout.spec.ts — 로그아웃 테스트 (FHC-014~017)
// 세션 격리: 공유 storageState 사용 안 함 (병렬 실행 시 충돌 방지)
// ============================================================

import { test, expect } from '@playwright/test'
import { LogoutPage } from '../../pages/LogoutPage'
import users from '../../fixtures/users.json'
import { loginDefault } from '../helpers/auth'

// 격리된 세션 사용 (공유 session 오염 방지)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('[FHC-014~017] 로그아웃', () => {

  test('[FHC-014] 로그아웃 완료 URL 검증 @smoke', async ({ page }) => {
    await loginDefault(page)
    const logout = new LogoutPage(page)
    await logout.clickProfile()
    await logout.clickLogout()
    await logout.isLogoutUrl()
  })

  test.describe('로그아웃 후 재로그인', () => {

    // 각 테스트마다 UI 로그인 → 로그아웃 → 재로그인 시나리오 준비
    test.beforeEach(async ({ page }) => {
      await loginDefault(page)
      const logout = new LogoutPage(page)
      await logout.clickProfile()
      await logout.clickLogout()
      await expect(page).toHaveURL(/signin\/history/, { timeout: 10000 })
    })

    test('[FHC-015] 잘못된 비밀번호 재로그인 오류', async ({ page }) => {
      const logout = new LogoutPage(page)
      await logout.enterPassword('12345678')
      await logout.clickLoginButton()
      await logout.isLoginErrorDisplayed()
    })

    test('[FHC-016] 올바른 비밀번호 재로그인', async ({ page }) => {
      const logout = new LogoutPage(page)
      await logout.enterPassword(users.default.pw)
      await logout.clickLoginButton()
      await logout.isLoginSuccess()
    })

    test('[FHC-017] 다른 계정으로 전환', async ({ page }) => {
      const logout = new LogoutPage(page)
      await logout.clickSwitchAccount()
      await logout.isLoginPageDisplayed()
    })
  })
})
