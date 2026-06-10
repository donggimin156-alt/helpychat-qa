import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const ACCOUNT_URL = 'https://accounts.elice.io/accounts/members/account'

export class MyPageWithdrawPage extends BasePage {
  constructor(page: Page) { super(page) }

  get withdrawConfirmInput() { return this.page.locator("input[name='email'], input[placeholder*='Delete'], input[placeholder*='delete']").first() }
  get withdrawFinalButton()  { return this.page.locator("button[type='submit'].MuiLoadingButton-root") }

  async navigateToAccount(): Promise<void> {
    await this.page.goto(ACCOUNT_URL)
    await expect(this.page).toHaveURL(/members\/account/, { timeout: 15000 })
  }

  async scrollToWithdrawArea(): Promise<void> {
    await this.page.evaluate(() => {
      const kws = ['탈퇴', 'Leave', 'Delete Account', 'Withdraw']
      const els = Array.from(document.querySelectorAll('button, h2, h3, span'))
      const target = els.find(el => kws.some(k => el.textContent?.includes(k)))
      if (target) (target as HTMLElement).scrollIntoView({ block: 'center' })
      else window.scrollTo(0, document.body.scrollHeight)
    })
    await this.page.waitForTimeout(500)
  }

  async isWithdrawAreaDisplayed(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const kws = ['탈퇴', 'Leave', 'Delete Account', 'Withdraw']
      return Array.from(document.querySelectorAll('button'))
        .some(btn => kws.some(k => btn.textContent?.includes(k)))
    })
  }

  async clickWithdrawButton(): Promise<void> {
    await this.page.evaluate(() => {
      const kws = ['탈퇴하기', '탈퇴', 'Leave', 'Delete Account', 'Withdraw']
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => kws.some(k => b.textContent?.trim() === k || b.textContent?.includes(k)))
      if (btn) btn.click()
    })
    await this.page.waitForTimeout(500)
  }

  async isWithdrawConfirmMessageDisplayed(): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        () => ['Delete', '탈퇴하려면', '정확히 입력'].some(kw => document.body.innerText.includes(kw)),
        { timeout: 5000 }
      )
      return true
    } catch { return false }
  }

  async enterWithdrawConfirmText(email: string): Promise<void> {
    await this.withdrawConfirmInput.fill(`Delete ${email}`)
  }

  async submitWithdraw(): Promise<void> {
    await this.withdrawFinalButton.click()
  }

  async isWithdrawalComplete(): Promise<boolean> {
    try {
      await expect(this.page).toHaveURL(/login|signin|withdraw/, { timeout: 10000 })
      return true
    } catch { return false }
  }

  async signup(email: string, password: string, name: string): Promise<void> {
    await this.page.locator("a[href*='/accounts/signup']").click()
    await this.page.getByRole('button', { name: /이메일로 가입하기|Create account with email/ }).click()
    await this.page.locator("input[name='loginId']").fill(email)
    await this.page.locator("input[autocomplete='new-password']").fill(password)
    await this.page.locator("input[name='fullname']").fill(name)
    await this.page.evaluate(() => {
      const cb = document.querySelector<HTMLInputElement>("input.PrivateSwitchBase-input[type='checkbox']")
      if (cb) cb.click()
    })
    await this.page.locator("button[type='submit']").click()
    await this.page.waitForTimeout(2000)
  }

  async isSignupSuccess(): Promise<boolean> {
    try {
      await expect(this.page).toHaveURL(/ai-helpy-chat|qaproject\.elice\.io/, { timeout: 15000 })
      return true
    } catch { return false }
  }
}
