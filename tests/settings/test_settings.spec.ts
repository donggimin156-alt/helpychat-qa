// ============================================================
// test_settings.spec.ts — 설정 테스트 (FHC-068~075)
// ============================================================

import { test, expect } from '@playwright/test'
import { SettingsPage } from '../../pages/SettingsPage'

test.describe('[FHC-068~075] 설정', () => {

  test('[FHC-068] 설정 페이지 이동 확인 @smoke', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const settings = new SettingsPage(page)
    await settings.navigateToSettings()
    await settings.isSettingsPageDisplayed()
  })

  test('[FHC-069] 이용 내역 탭 이동', async ({ page }) => {
    const settings = new SettingsPage(page)
    await settings.navigateToHistoryTab()
    await settings.isHistoryPageDisplayed()
  })

  test('[FHC-070] 비활성화 모델 활성화', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const settings = new SettingsPage(page)
    await settings.navigateToSettings()
    await settings.navigateToModelsTab()
    const result = await settings.activateDisabledModel()
    if (result) {
      const toast = await settings.getToastMessage()
      expect(toast).toContain('활성화')
    }
  })

  test('[FHC-071] 활성화 모델 비활성화', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const settings = new SettingsPage(page)
    await settings.navigateToSettings()
    await settings.navigateToModelsTab()
    const result = await settings.deactivateActiveModel()
    if (result) {
      const toast = await settings.getToastMessage()
      expect(toast).toContain('비활성화')
    }
  })

  test('[FHC-072] 구독 탭 이동', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const settings = new SettingsPage(page)
    await settings.navigateToSettings()
    await settings.navigateToSubscriptionTab()
    await expect(page).toHaveURL(/admin/, { timeout: 5000 })
  })
})
