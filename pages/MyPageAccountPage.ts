import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const ACCOUNT_URL = 'https://accounts.elice.io/accounts/members/account'
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
  get promotionToggle()    { return this.page.locator("input[type='checkbox'][name='marketing'], input[type='checkbox'][name='promotion'], input[type='checkbox'][name='promotionAlarm']").first() }
  get languageSelect()     { return this.page.locator("div#mui-component-select-locale, div[aria-haspopup='listbox']") }

  async navigateToAccount(): Promise<void> {
    await this.page.goto(ACCOUNT_URL)
    await expect(this.page).toHaveURL(/members\/account/, { timeout: 15000 })
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto(LOGIN_URL)
    await this.page.locator('[name="loginId"]').fill(email)
    await this.page.locator('[name="password"]').fill(password)
    await this.page.getByRole('button', { name: '로그인' }).click()
    await expect(this.page).toHaveURL(/ai-helpy-chat/, { timeout: 30000 })
  }

  async clickNameEdit(): Promise<void> {
    await this.page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLButtonElement>('button.MuiIconButton-root')
      if (btns[0]) btns[0].click()
    })
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
    await this.languageSelect.click()
    await this.page.locator(`li[data-value='${lang}']`).click()
    await this.page.locator("button[type='submit']").click()
  }

  async isSaveSuccessToastDisplayed(): Promise<void> {
    await expect(this.saveSuccessToast).toBeVisible({ timeout: 10000 })
  }

  async isSavedSuccessfullyDisplayed(): Promise<void> {
    await expect(this.page.getByText(/Saved successfully|저장되었습니다/)).toBeVisible({ timeout: 10000 })
  }
}
