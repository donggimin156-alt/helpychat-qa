// 공통 로그인 헬퍼 — 여러 spec 파일에서 재사용
import { Page, expect } from '@playwright/test'
import { LOGIN_URL, ACCOUNT_URL } from './urls'
import users from '../../fixtures/users.json'

// ── OTP-aware 범용 로그인 ──────────────────────────────────────
// OTP 발생 시 false 반환, 정상 로그인 시 true 반환
export async function loginWithOTPCheck(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  await page.goto(LOGIN_URL)
  await page.locator('[name="loginId"]').fill(email)
  await page.locator('[name="password"]').fill(password)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(/ai-helpy-chat|otp/, { timeout: 30000 })
  return !page.url().includes('otp')
}

// ── 기본 계정 로그인 (성공 expect 포함, logout/language 테스트용) ──
export async function loginDefault(page: Page): Promise<void> {
  await page.goto(LOGIN_URL)
  await page.locator('[name="loginId"]').fill(users.default.id)
  await page.locator('[name="password"]').fill(users.default.pw)
  await page.getByRole('button', { name: '로그인' }).click()
  await expect(page).toHaveURL(/ai-helpy-chat/, { timeout: 30000 })
}

// ── dummy 계정 로그인 (account/withdraw/language 테스트용) ──────
// OTP 발생 시 false 반환
export async function loginDummy(page: Page): Promise<boolean> {
  return loginWithOTPCheck(page, users.dummy.id, users.dummy.pw)
}

// ── main(qa5) 계정 로그인 + accounts 세션 안정화 (organization 테스트용) ──
// OTP 발생 시 false 반환
export async function loginMain(page: Page): Promise<boolean> {
  const ok = await loginWithOTPCheck(page, users.default.id, users.default.pw)
  if (!ok) return false
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null)
  await page.goto(ACCOUNT_URL)
  return page.waitForURL(/accounts\/members\/account/, { timeout: 20000 })
    .then(() => true).catch(() => false)
}
