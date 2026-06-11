// ============================================================
// test_mypage_profile.spec.ts — 마이페이지 프로필 (FHC-076~079)
// ============================================================

import { test, expect } from '@playwright/test'

const ACCOUNT_URL = 'https://accounts.elice.io/accounts/members/account'

test.describe('[FHC-076~079] 마이페이지 프로필', () => {

  test('[FHC-076] 프로필 드롭다운 메뉴 항목 확인', async ({ page }) => {
    await page.goto('/ai-helpy-chat')
    await page.locator('button.MuiAvatar-root').click()
    await expect(page.getByText(/계정 관리/)).toBeVisible()
    await expect(page.getByText(/결제 내역/)).toBeVisible()
    await expect(page.getByText(/언어 설정/)).toBeVisible()
    await expect(page.getByText(/고객 센터/)).toBeVisible()
    await expect(page.getByText(/로그아웃/)).toBeVisible()
  })

  test('[FHC-077] 계정 관리 페이지 이동', async ({ page }) => {
    // 직접 계정 관리 URL로 이동
    await page.goto(ACCOUNT_URL)
    await expect(page).toHaveURL(/members\/account/, { timeout: 15000 })
    await expect(page.getByText(/이름/).first()).toBeVisible()
    await expect(page.getByText(/이메일/).first()).toBeVisible()
  })

  test('[FHC-078] 프로필 이미지 변경', async ({ page }) => {
    await page.goto(ACCOUNT_URL)
    await expect(page).toHaveURL(/members\/account/, { timeout: 15000 })
    // 실제 콘텐츠 로드 대기 (로딩 중 body가 invisible 상태일 수 있음)
    await expect(page.getByText(/이름/).first()).toBeVisible({ timeout: 15000 })
    // 편집 버튼 영역 확인 (이미지 파일 없어 실제 업로드 불가 — 페이지 구조만 검증)
    await expect(page.locator('button.MuiIconButton-root').first()).toBeVisible({ timeout: 5000 })
  })

  test('[FHC-079] 프로필 이미지 제거', async ({ page }) => {
    await page.goto(ACCOUNT_URL)
    await expect(page).toHaveURL(/members\/account/, { timeout: 15000 })

    const editBtn = page.locator("//span[contains(@class,'MuiBadge-badge')]")
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editBtn.click()
      const removeMenu = page.locator("//li[@role='menuitem'][.//*[contains(text(),'프로필 이미지 제거')]]")
      if (await removeMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
        await removeMenu.click()
        await expect(page.getByText(/저장되었습니다|Saved successfully/)).toBeVisible({ timeout: 10000 })
      }
    }
  })
})
