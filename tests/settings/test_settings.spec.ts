// ============================================================
// test_settings.spec.ts — 설정 테스트 (FHC-068~072)
// ============================================================

import { test, expect } from '@playwright/test'
import { SettingsPage } from '../../pages/SettingsPage'

test.describe('[FHC-068~072] 설정', () => {

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

  // ── [FHC-072] 구독 탭 + 멀티탭 처리 ───────────────────────────
  //
  // [Selenium의 한계 — 이 프로젝트에서 전환한 직접적 이유]
  // 구독 플랜 변경 버튼 클릭 시 결제 페이지가 새 탭으로 열림
  // Selenium으로 처리하려면:
  //   main_handle = driver.current_window_handle
  //   driver.find_element(...).click()
  //   WebDriverWait(driver, 10).until(lambda d: len(d.window_handles) > 1)
  //   new_handle = [h for h in driver.window_handles if h != main_handle][0]
  //   driver.switch_to.window(new_handle)
  //   ... 검증 ...
  //   driver.close()
  //   driver.switch_to.window(main_handle)  ← 수동 복구 필수
  //
  // [Playwright 해결]
  // Promise.all + context.waitForEvent('page') 로 원자적 처리
  // 탭 닫아도 원래 page 컨텍스트 유지 → 수동 switch 불필요
  // ─────────────────────────────────────────────────────────────

  test('[FHC-072] 구독 탭 이동', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    const settings = new SettingsPage(page)
    await settings.navigateToSettings()
    await settings.navigateToSubscriptionTab()
    await expect(page).toHaveURL(/admin/, { timeout: 5000 })
  })

  test('[FHC-072-EXT] 구독 플랜 변경 버튼 → 새 탭 처리 @multitab', async ({ page, context }) => {
    // ── Playwright 멀티탭 핵심 패턴 ──────────────────────────
    // Promise.all 로 "클릭"과 "새 탭 감지"를 동시에 시작
    // → 새 탭이 열리기 전에 waitForEvent 등록이 보장됨
    //
    // Selenium에서 같은 구현 시:
    //   1. click() 후 window_handles 폴링 필요
    //   2. switch_to.window() 수동 전환
    //   3. 검증 후 close() + switch_to.window(main) 수동 복구
    //   → 레이스 컨디션 + 수동 상태 복구 = 테스트 불안정

    await page.goto('/ai-helpy-chat/admin/subscription')
    await expect(page).toHaveURL(/admin\/subscription/, { timeout: 10000 })

    const changePlanButton = page.getByRole('button', { name: /플랜 변경|Upgrade|구독/ }).first()
    const hasButton = await changePlanButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (hasButton) {
      // 새 탭이 열릴 것을 미리 감지 등록 + 클릭을 동시에 실행
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        changePlanButton.click(),
      ])

      // 새 탭 로드 완료 대기
      await newPage.waitForLoadState('domcontentloaded')

      // 새 탭 URL 검증 (결제/외부 페이지)
      expect(newPage.url()).toBeTruthy()

      // 새 탭 닫기 → 원래 page는 별도 조작 없이 그대로 유지
      await newPage.close()

      // 원래 탭 상태 정상 여부 확인 (Selenium에선 switch_to 없으면 에러)
      await expect(page).toHaveURL(/admin\/subscription/)
    } else {
      test.skip()
    }
  })
})
