// ============================================================
// test_settings_load.spec.ts — 설정 탭 부하 테스트 (FHC-094)
// ============================================================

import { test, expect } from '@playwright/test'
import { SettingsPage } from '../../pages/SettingsPage'
import { loginMain, handleAdminReauth } from '../helpers/auth'

// accounts.elice.io 세션이 기능 테스트 완료 시점에 만료되므로 재로그인
test.use({ storageState: { cookies: [], origins: [] } })

const REPEAT = 3

test('[FHC-094] 설정 탭 부하 테스트', async ({ page }) => {
  test.setTimeout(180000)
  const ok = await loginMain(page)
  if (!ok) { test.skip(); return }

  const settings = new SettingsPage(page)

  // SPA 완전 로딩 대기 후 이동 (완전 로딩 전 admin 접근 시 step-up 재인증 발생)
  const gotoChat = async () => {
    await page.goto('/ai-helpy-chat')
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => null)
  }

  // navigateToSettings + 재인증 처리 래퍼
  // navigateToSettings가 /admin/ URL을 순간 감지 후 pass하더라도
  // 실제 accounts 리다이렉트 발생 시 재인증 처리
  const settingsNavWithReauth = async () => {
    await settings.navigateToSettings().catch(() => null)
    if (page.url().includes('accounts.elice.io') && page.url().includes('signin')) {
      if (!await handleAdminReauth(page)) throw new Error('step-up 재인증 실패')
      await gotoChat()
      await settings.navigateToSettings()
    }
  }

  let failCount = 0

  for (let i = 1; i <= REPEAT; i++) {
    try {
      // 일반 탭
      await gotoChat()
      await settingsNavWithReauth()
      await settings.isSettingsPageDisplayed()

      // 이용내역 탭
      await settings.navigateToHistoryTab()
      await settings.isHistoryPageDisplayed()

      // 모델 설정 탭
      await gotoChat()
      await settingsNavWithReauth()
      await settings.navigateToModelsTab()
      await expect(page).toHaveURL(/admin/, { timeout: 10000 })

      // 구독 관리 탭
      await settings.navigateToSubscriptionTab()
      await expect(page).toHaveURL(/admin/, { timeout: 5000 })

      // 구성원 관리 탭
      await gotoChat()
      await settingsNavWithReauth()
      await settings.navigateToMemberTab()
      await expect(page).toHaveURL(/admin/, { timeout: 10000 })
    } catch {
      failCount++
    }
  }

  expect(failCount).toBe(0)
})
