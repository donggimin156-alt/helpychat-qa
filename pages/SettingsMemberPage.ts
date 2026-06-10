// ============================================================
// SettingsMemberPage.ts — 설정 > 구성원 관리 Page Object (Playwright)
//
// [Selenium → Playwright 전환 포인트]
// Selenium: driver.execute_script("arguments[0].click()", toggle)
//           + driver.execute_script("return arguments[0].checked", toggle)
// Playwright: locator.isChecked() / locator.click() — JS 실행 불필요
//
// Selenium: time.sleep(1) 로 토스트 등장 대기
// Playwright: expect(toast).toBeVisible() — 이벤트 기반 대기
// ============================================================

import { Page, expect } from '@playwright/test'
import { SettingsPage } from './SettingsPage'

export class SettingsMemberPage extends SettingsPage {

  constructor(page: Page) { super(page) }

  // ── 로케이터 ────────────────────────────────────────────────
  get tokenLimitToggleInput() {
    return this.page.locator("span.MuiSwitch-sizeMedium input[type='checkbox']").first()
  }
  get saveButton() {
    return this.page.getByRole('button', { name: '저장' })
  }
  get savedToast() {
    return this.page.locator('#notistack-snackbar')
  }

  // ── 액션 ────────────────────────────────────────────────────
  async navigateToMemberPage(): Promise<void> {
    await this.page.goto('/ai-helpy-chat/admin/users')
    await expect(this.page).toHaveURL(/admin\/users/, { timeout: 10000 })
  }

  async getTokenLimitState(): Promise<boolean> {
    return await this.tokenLimitToggleInput.isChecked()
  }

  async setTokenLimitToggle(activate: boolean): Promise<void> {
    const current = await this.getTokenLimitState()
    if (current !== activate) {
      // Selenium: driver.execute_script("arguments[0].click()", toggle)
      // Playwright: locator.click() — 직접 클릭 가능
      await this.tokenLimitToggleInput.click()
    }
  }

  async saveAndVerify(): Promise<void> {
    // Selenium: 이전 토스트가 사라질 때까지 sleep() 후 저장 버튼 클릭
    // Playwright: 토스트가 보이지 않을 때까지 비동기 대기 후 클릭
    await this.savedToast.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    await this.saveButton.click()
    await expect(this.savedToast).toBeVisible({ timeout: 10000 })
    const msg = await this.savedToast.textContent()
    expect(msg).toContain('저장되었습니다')
  }
}
