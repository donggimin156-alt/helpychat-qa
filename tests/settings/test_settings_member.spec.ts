// ============================================================
// test_settings_member.spec.ts — 구성원 관리 (FHC-073~074)
//
// [Selenium 대비 개선점]
// Selenium: time.sleep(1~3) 로 React 상태 변경 대기
//           driver.execute_script("return arguments[0].checked") 로 체크 상태 확인
// Playwright: isChecked() 로 직접 확인, 이벤트 기반 대기로 sleep 불필요
// ============================================================

import { test, expect } from '@playwright/test'
import { SettingsMemberPage } from '../../pages/SettingsMemberPage'

test.describe('[FHC-073~074] 구성원 토큰 한도 관리', () => {

  test.beforeEach(async ({ page }) => {
    const settings = new SettingsMemberPage(page)
    await settings.navigateToMemberPage()
  })

  test('[FHC-073] 토큰 한도 토글 비활성화', async ({ page }) => {
    const settings = new SettingsMemberPage(page)

    // 활성화 상태로 만든 뒤 비활성화
    await settings.setTokenLimitToggle(true)
    await settings.setTokenLimitToggle(false)

    // Selenium: driver.execute_script("return arguments[0].checked", toggle)
    // Playwright: locator.isChecked() — 직관적
    expect(await settings.getTokenLimitState()).toBe(false)
    await settings.saveAndVerify()
  })

  test('[FHC-074] 토큰 한도 토글 활성화', async ({ page }) => {
    const settings = new SettingsMemberPage(page)

    await settings.setTokenLimitToggle(false)
    await settings.setTokenLimitToggle(true)

    expect(await settings.getTokenLimitState()).toBe(true)
    await settings.saveAndVerify()
  })
})
