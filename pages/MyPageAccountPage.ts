import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const ACCOUNT_URL  = 'https://accounts.elice.io/accounts/members/account'
const LANGUAGE_URL = 'https://accounts.elice.io/accounts/members/language'
const LOGIN_URL =
  'https://accounts.elice.io/accounts/signin/me' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

export class MyPageAccountPage extends BasePage {
  constructor(page: Page) { super(page) }

  get nameInput()          { return this.page.locator("input[name='fullname']") }
  get currentPwInput()     { return this.page.locator("input[autocomplete='current-password']") }
  get newPwInput()         { return this.page.locator("input[name='newPassword']") }
  get confirmPwInput()     { return this.page.locator("input[name='confirmPassword']") }
  get completeButton()     { return this.page.locator("button[type='submit'].MuiLoadingButton-root") }
  get saveSuccessToast()   { return this.page.getByText(/저장되었습니다|Saved successfully|saved/) }
  get promotionToggle()    {
    // Selenium과 동일한 다중 선택자 (marketing / promotion / promotionAlarm / 텍스트 기반)
    return this.page.locator([
      "input[type='checkbox'][name='marketing']",
      "input[type='checkbox'][name='promotion']",
      "input[type='checkbox'][name='promotionAlarm']",
      "label:has-text('프로모션 알림 받기') input[type='checkbox']",
    ].join(', ')).first()
  }
  get languageSelect()     { return this.page.locator("div#mui-component-select-locale, div[aria-haspopup='listbox']") }

  async navigateToAccount(): Promise<void> {
    await this.page.goto(ACCOUNT_URL)
    // signin으로 리디렉션 시 accounts 세션이 없는 것 — 상위에서 skip 처리
    await expect(this.page).toHaveURL(/members\/account/, { timeout: 15000 })
    // 콘텐츠 완전 로드 대기 (로딩 중 편집 버튼 미노출 방지)
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null)
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto(LOGIN_URL)
    await this.page.locator('[name="loginId"]').fill(email)
    await this.page.locator('[name="password"]').fill(password)
    await this.page.getByRole('button', { name: '로그인' }).click()
    await expect(this.page).toHaveURL(/ai-helpy-chat/, { timeout: 30000 })
  }

  async clickNameEdit(): Promise<void> {
    // Selenium의 click_name_edit(): SVG 기반 우선, fallback으로 MuiIconButton
    await this.page.evaluate(() => {
      const svgs = document.querySelectorAll('svg[data-testid="EditOutlinedIcon"]')
      if (svgs.length > 0) {
        const btn = (svgs[0] as Element).closest('button') as HTMLElement | null
        if (btn) { btn.click(); return }
      }
      const btns = document.querySelectorAll<HTMLButtonElement>('button.MuiIconButton-root')
      if (btns[0]) btns[0].click()
    })
    // 편집 폼(input)이 나타날 때까지 대기
    await this.nameInput.waitFor({ timeout: 10000 })
  }

  async enterName(name: string): Promise<void> {
    await this.nameInput.clear()
    await this.nameInput.fill(name)
  }

  async saveName(): Promise<void> {
    await this.completeButton.click()
  }

  async clickPasswordEdit(): Promise<void> {
    await this.page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLButtonElement>('button.MuiIconButton-root')
      if (btns[3]) btns[3].click()
    })
  }

  async changePassword(currentPw: string, newPw: string): Promise<void> {
    await this.currentPwInput.fill(currentPw)
    await this.newPwInput.fill(newPw)
    await this.confirmPwInput.fill(newPw)
    await this.completeButton.click()
    await this.page.waitForTimeout(1000)
  }

  async getPromotionState(): Promise<boolean> {
    return await this.promotionToggle.isChecked()
  }

  async togglePromotion(): Promise<void> {
    await this.page.evaluate(() => {
      const cb = document.querySelector<HTMLInputElement>(
        "input[type='checkbox'][name='marketing'], input[type='checkbox'][name='promotion']"
      )
      if (cb) cb.click()
    })
  }

  async changeLanguage(lang: string): Promise<void> {
    // Selenium: navigate_to_language() → change_language() — submit 버튼 없음, 드롭다운 선택 시 자동 저장
    await this.page.goto(LANGUAGE_URL)
    await expect(this.page).toHaveURL(/members\/language/, { timeout: 10000 })
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null)
    // 현재 값과 관계없이 저장이 트리거되도록 중간 언어로 먼저 변경
    const mid = lang === 'en-US' ? 'ko-KR' : 'en-US'
    await this.languageSelect.first().click()
    await this.page.locator(`li[data-value='${mid}']`).first().click()
    await this.page.waitForTimeout(400)
    await this.languageSelect.first().click()
    await this.page.locator(`li[data-value='${lang}']`).first().click()
    await this.page.waitForTimeout(500)
  }

  async isSaveSuccessToastDisplayed(): Promise<void> {
    await expect(this.saveSuccessToast.first()).toBeVisible({ timeout: 10000 })
  }

  async isSavedSuccessfullyDisplayed(): Promise<void> {
    await expect(this.page.getByText(/Saved successfully|저장되었습니다/).first()).toBeVisible({ timeout: 10000 })
  }
}
