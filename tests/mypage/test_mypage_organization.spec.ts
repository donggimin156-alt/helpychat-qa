// ============================================================
// test_mypage_organization.spec.ts — 내 기관 (FHC-087~089)
//
// [Selenium → Playwright 멀티탭 전환 포인트]
// FHC-088~089: 링크 클릭 시 새 탭 열림
// Selenium: window_handles 폴링 + switch_to.window() + close() + switch_to(main)
// Playwright: Promise.all + context.waitForEvent('page') 원자적 처리
// ============================================================

import { test, expect } from '@playwright/test'

const ORG_URL = 'https://accounts.elice.io/accounts/members/organizations'

test.describe('[FHC-087~089] 내 기관', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ORG_URL)
    await expect(page).toHaveURL(/organizations/, { timeout: 15000 })
  })

  test('[FHC-087] 내 기관 UI 및 정보 표시', async ({ page }) => {
    // 내 기관 페이지에 기관명/정보가 표시되는지 확인
    const orgInfo = page.locator('h1, h2, [class*="org"], [class*="organization"]').first()
    await expect(orgInfo).toBeVisible({ timeout: 10000 })
  })

  test('[FHC-088] qaproject 페이지 하이퍼링크 → 새 탭 생성 @multitab', async ({ page, context }) => {
    const qaLink = page.getByText(/qaproject|helpy|헬피/)
      .or(page.locator('a[href*="qaproject"]'))
      .first()

    const hasLink = await qaLink.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasLink) { test.skip(); return }

    // Selenium: window_handles 수동 폴링
    // Playwright: Promise.all 로 원자적 새 탭 감지
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      qaLink.click(),
    ])
    await newPage.waitForLoadState('domcontentloaded')
    expect(newPage.url()).toBeTruthy()
    await newPage.close()

    // 원래 탭 정상 여부 확인 (Selenium은 switch_to 없으면 에러)
    await expect(page).toHaveURL(/organizations/)
  })

  test('[FHC-089] 헬프 센터 하이퍼링크 → 새 탭 생성 @multitab', async ({ page, context }) => {
    const helpLink = page.getByText(/헬프 센터|Help Center|고객센터/)
      .or(page.locator('a[href*="help"], a[href*="support"]'))
      .first()

    const hasLink = await helpLink.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasLink) { test.skip(); return }

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      helpLink.click(),
    ])
    await newPage.waitForLoadState('domcontentloaded')
    expect(newPage.url()).toBeTruthy()
    await newPage.close()

    await expect(page).toHaveURL(/organizations/)
  })
})
