import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const SIGNUP_URL =
  'https://accounts.elice.io/accounts/signup/method' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

export class SignupPage extends BasePage {
  constructor(page: Page) { super(page) }

  get emailInput()          { return this.page.locator("input[placeholder='이메일']") }
  get passwordInput()       { return this.page.locator("input[placeholder='비밀번호']") }
  get nameInput()           { return this.page.locator("input[placeholder='이름']") }
  get createEmailButton()   { return this.page.getByRole('button', { name: /이메일로 가입하기|Create account with email/ }) }
  get agreeAllCheckbox()    { return this.page.locator("//span[text()='전체 동의']/ancestor::label") }
  get createAccountButton() { return this.page.getByRole('button', { name: /회원가입/ }) }
  get emailError()          { return this.page.locator("//p[contains(text(),'이메일 주소가 올바르지 않습니다.')]") }
  get nameError()           { return this.page.locator("//span[contains(text(),'예기치 못한 문제가 발생하였습니다.')]") }

  async open(): Promise<void> {
    await this.visit(SIGNUP_URL)
  }

  async clickCreateAccountWithEmail(): Promise<void> {
    await this.createEmailButton.click()
  }

  async fillSignupForm(email: string, password: string, name: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.nameInput.fill(name)
  }

  async agreeTerms(type: 'all' | 'required' = 'all'): Promise<void> {
    if (type === 'all') {
      await this.agreeAllCheckbox.click()
    } else {
      const checkboxes = this.page.locator("//span[contains(text(), '[필수]')]/ancestor::label")
      const count = await checkboxes.count()
      for (let i = 0; i < count; i++) await checkboxes.nth(i).click()
      await this.page.locator("//span[contains(text(), '만 14세 이상입니다.')]/ancestor::label").click()
    }
  }

  async clickCreateAccountButton(): Promise<void> {
    await this.createAccountButton.click()
  }

  async isSignupSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/isFirstLogin=true/, { timeout: 15000 })
  }
}
