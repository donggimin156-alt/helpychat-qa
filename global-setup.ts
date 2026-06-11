// ============================================================
// global-setup.ts — 테스트 시작 전 로그인 세션 한 번만 생성
//
// Cypress의 cy.session() 과 동일한 역할이지만
// 이론적으로 더 완벽한 방식:
// → 테스트 바깥(전역 설정)에서 실행되므로
//   테스트 순서와 완전히 무관하게 세션 보장
// ============================================================

import { chromium } from '@playwright/test'

const LOGIN_URL =
  'https://accounts.elice.io/accounts/signin/me' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

export default async function globalSetup(): Promise<void> {
  const browser = await chromium.launch()

  // ── 기본 계정 세션 저장 (qa5team3-04) ────────────────────────
  const page = await browser.newPage()
  await page.goto(LOGIN_URL)
  await page.locator('[name="loginId"]').fill('qa5team3-04@elicer.com')
  await page.locator('[name="password"]').fill('qa3teamjs@')
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL(/ai-helpy-chat/, { timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null)
  // accounts.elice.io 세션을 storageState에 포함시키기 위해 사전 접속
  // 직접 로그인 직후 OTP SSO를 소비 → 이후 테스트에서 accounts 페이지 직접 이동 가능
  await page.goto('https://accounts.elice.io/accounts/members/account')
  // OTP redirect 포함: accounts.elice.io/ → accounts/members/account
  const accountsOk = await page.waitForURL(/accounts\/members\/account/, { timeout: 20000 })
    .then(() => true).catch(() => false)
  if (!accountsOk) {
    console.log('⚠️  accounts.elice.io 세션 초기화 실패 — FHC-087~089, FHC-093 테스트는 skip될 수 있음')
  } else {
    console.log('✅ accounts.elice.io 세션 초기화 완료')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null)
  }
  await page.context().storageState({ path: 'storage-state.json' })
  await page.close()

  // ── dummy 계정 세션 저장 시도 (test_dummy@naver.com) ─────────
  // OTP가 발생하면 storage-state-dummy.json 생성 스킵
  try {
    const dummyPage = await browser.newPage()
    await dummyPage.goto(LOGIN_URL)
    await dummyPage.locator('[name="loginId"]').fill('test_dummy@naver.com')
    await dummyPage.locator('[name="password"]').fill('test@1234')
    await dummyPage.getByRole('button', { name: '로그인' }).click()
    await dummyPage.waitForURL(/ai-helpy-chat|otp/, { timeout: 30000 })
    if (dummyPage.url().includes('otp')) {
      console.log('⚠️  test_dummy 계정 OTP 필요 — dummy 세션 스킵')
    } else {
      await dummyPage.waitForTimeout(2000)
      await dummyPage.context().storageState({ path: 'storage-state-dummy.json' })
      console.log('✅ test_dummy 세션 저장 완료 (storage-state-dummy.json)')
    }
    await dummyPage.close()
  } catch {
    console.log('⚠️  test_dummy 계정 세션 생성 실패 — 해당 테스트는 UI 로그인으로 실행')
  }

  await browser.close()

  console.log('✅ 로그인 세션 저장 완료 (storage-state.json)')
}
