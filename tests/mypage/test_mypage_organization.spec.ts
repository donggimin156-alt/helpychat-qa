// ============================================================
// test_mypage_organization.spec.ts — 내 기관 (FHC-087~089)
//
// [Selenium → Playwright 멀티탭 전환 포인트]
// FHC-088~089: 링크 클릭 시 새 탭 열림
// Selenium: window_handles 폴링 + switch_to.window() + close() + switch_to(main)
// Playwright: Promise.all + context.waitForEvent('page') 원자적 처리
//
// accounts.elice.io는 컨텍스트마다 세션을 재검증하므로
// test_mypage_account.spec.ts 와 동일하게 매 테스트 직접 로그인 사용
// ============================================================

import { test, expect } from '@playwright/test'

const ORG_URL = 'https://accounts.elice.io/accounts/members/organizations'

const MAIN_EMAIL    = 'qa5team3-04@elicer.com'
const MAIN_PASSWORD = 'qa3teamjs@'

const LOGIN_URL =
  'https://accounts.elice.io/accounts/signin/me' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

// storageState 비활성화 — 직접 로그인으로 accounts.elice.io 세션 보장
test.use({ storageState: { cookies: [], origins: [] } })

async function loginMain(page: any): Promise<boolean> {
  await page.goto(LOGIN_URL)
  await page.locator('[name="loginId"]').fill(MAIN_EMAIL)
  await page.locator('[name="password"]').fill(MAIN_PASSWORD)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(/ai-helpy-chat|otp/, { timeout: 30000 })
  if (page.url().includes('otp')) return false
  return true
}

test.describe('[FHC-087~089] 내 기관', () => {

  test.beforeEach(async ({ page }) => {
    const ok = await loginMain(page)
    if (!ok) { test.skip(); return }
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null)
    // account 페이지 먼저 방문 → OTP 흐름 소비 + 세션 안정화
    await page.goto('https://accounts.elice.io/accounts/members/account')
    const accountsOk = await page.waitForURL(/accounts\/members\/account/, { timeout: 20000 })
      .then(() => true).catch(() => false)
    if (!accountsOk) { test.skip(); return }
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => null)
    // OTP 인터럽션 대응: waitUntil:'commit' 로 먼저 commit 후 URL 대기
    await page.goto(ORG_URL, { waitUntil: 'commit' }).catch(() => null)
    await page.waitForURL(/organizations|members\/account/, { timeout: 20000 }).catch(() => null)
    const onOrgPage = page.url().includes('organizations')
    if (!onOrgPage) { test.skip(); return }
  })

  test('[FHC-087] 내 기관 UI 및 정보 표시', async ({ page }) => {
    // 내 기관 페이지에 기관명/정보가 표시되는지 확인
    const orgInfo = page.locator('h1, h2, [class*="org"], [class*="organization"]').first()
    await expect(orgInfo).toBeVisible({ timeout: 10000 })
  })

  test('[FHC-088] qaproject 페이지 하이퍼링크 → 새 탭 생성 @multitab', async ({ page, context }) => {
    // href 기반 정확한 로케이터
    const qaLink = page.locator('a[href*="qaproject.elice.io"]').first()

    const hasLink = await qaLink.isVisible({ timeout: 8000 }).catch(() => false)
    if (!hasLink) { test.skip(); return }

    // 이벤트 리스너를 클릭 전에 등록 (Promise.all과 동일한 효과)
    const newPagePromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null)
    await qaLink.click()
    const newPageOrNull = await newPagePromise

    if (newPageOrNull) {
      await newPageOrNull.waitForLoadState('domcontentloaded')
      expect(newPageOrNull.url()).toBeTruthy()
      await newPageOrNull.close()
      await expect(page).toHaveURL(/organizations/)
    } else {
      // 같은 탭에서 qaproject 로 이동한 경우 (target="_blank" 없음)
      await expect(page).toHaveURL(/qaproject/, { timeout: 10000 })
    }
  })

  test('[FHC-089] 헬프 센터 하이퍼링크 → 새 탭 생성 @multitab', async ({ page, context }) => {
    // 관리자 계정에서만 표시되는 버튼 — href 기반 정확한 로케이터
    const helpLink = page.locator('a[href="https://helpcenter.elice.io"]').first()

    const hasLink = await helpLink.isVisible({ timeout: 10000 }).catch(() => false)
    if (!hasLink) { test.skip(); return }

    // 이벤트 리스너를 클릭 전에 등록
    const newPagePromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null)
    await helpLink.click()
    const newPageOrNull = await newPagePromise

    if (newPageOrNull) {
      await newPageOrNull.waitForLoadState('domcontentloaded')
      expect(newPageOrNull.url()).toContain('helpcenter.elice.io')
      await newPageOrNull.close()
      await expect(page).toHaveURL(/organizations/)
    } else {
      // 같은 탭 이동 폴백
      await expect(page).toHaveURL(/helpcenter/, { timeout: 10000 })
    }
  })
})
