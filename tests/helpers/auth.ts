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

// ── accounts step-up 재인증 처리 ─────────────────────────────────────────
// admin 페이지 접근 또는 반복 탐색 시 "Nice to meet you again" 비밀번호 재입력 처리
// 재인증 성공 시 true, 해당 없으면 false 반환
// accounts step-up 재인증 처리 (/signin/history — 비밀번호만 필요)
// 또는 전체 로그인(/signin/me — 이메일+비밀번호)도 처리
// signin 경로가 아닌 accounts 페이지에서는 false 반환 (members/account 등)
async function handleReauth(page: Page, email: string, password: string): Promise<boolean> {
  const url = page.url()
  if (!url.includes('accounts.elice.io')) return false
  if (!url.includes('signin')) return false  // signin 경로에서만 처리

  // 이메일 필드가 있으면 전체 로그인 페이지 → pressSequentially로 React onChange 트리거
  const emailInput = page.locator('[name="loginId"]')
  if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await emailInput.pressSequentially(email, { delay: 30 })
  }

  // 비밀번호 입력 (step-up 또는 전체 로그인)
  const pwInput = page.locator('[name="password"]').or(page.locator('input[type="password"]')).first()
  if (!await pwInput.isVisible({ timeout: 5000 }).catch(() => false)) return false
  await pwInput.pressSequentially(password, { delay: 80 })
  await page.waitForTimeout(400)

  const loginBtn = page.getByRole('button', { name: /Login|로그인/i })
  await loginBtn.click()
  // 전체 로그인 후 step-up (/signin/history)으로 리다이렉트될 수 있으므로 /accounts/* 광범위하게 허용
  await page.waitForURL(/qaproject\.elice\.io|accounts\.elice\.io\/accounts/, { timeout: 30000 })

  // 전체 로그인 → step-up 2단계 리다이렉트 처리 (비밀번호만 재입력)
  if (page.url().includes('accounts.elice.io') && page.url().includes('signin')) {
    const pwInput2 = page.locator('[name="password"]').or(page.locator('input[type="password"]')).first()
    if (await pwInput2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pwInput2.pressSequentially(password, { delay: 80 })
      await page.waitForTimeout(400)
      await page.getByRole('button', { name: /Login|로그인/i }).click()
      await page.waitForURL(/qaproject\.elice\.io|accounts\.elice\.io\/accounts\/members/, { timeout: 30000 })
    }
  }
  return true
}

export async function handleAdminReauth(page: Page): Promise<boolean> {
  return handleReauth(page, users.default.id, users.default.pw)
}

export async function handleDummyReauth(page: Page): Promise<boolean> {
  return handleReauth(page, users.dummy.id, users.dummy.pw)
}
