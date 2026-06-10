import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LogoutPage extends BasePage {
  constructor(page: Page) { super(page) }

  get profileButton()   { return this.page.locator("button.MuiAvatar-root") }
  get logoutButton()    { return this.page.locator("[data-testid='arrow-right-from-bracketIcon']") }
  get passwordInput()   { return this.page.locator("[name='password']") }
  get loginButton()     { return this.page.locator("button[type='submit']") }
  get switchAccountBtn(){ return this.page.getByText(/Sign in with a different account/) }
  get loginErrorMsg()   { return this.page.locator("p.Mui-error") }

  async clickProfile(): Promise<void> {
    await this.profileButton.click()
  }

  async clickLogout(): Promise<void> {
    await this.logoutButton.click()
  }

  async isLogoutUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/signin\/history/, { timeout: 10000 })
  }

  async enterPassword(pwd: string): Promise<void> {
    await this.passwordInput.fill(pwd)
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton.click()
  }

  async isLoginErrorDisplayed(): Promise<void> {
    await expect(this.loginErrorMsg).toBeVisible()
  }

  async clickSwitchAccount(): Promise<void> {
    await this.switchAccountBtn.click()
  }

  async isLoginPageDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/accounts\.elice\.io/, { timeout: 10000 })
  }

  async isLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/ai-helpy-chat/, { timeout: 15000 })
  }
}
