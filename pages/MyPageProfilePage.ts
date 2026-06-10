import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const ACCOUNT_URL = 'https://accounts.elice.io/accounts/members/account'

export class MyPageProfilePage extends BasePage {
  constructor(page: Page) { super(page) }

  get profileButton()          { return this.page.locator("button.MuiAvatar-root") }
  get accountManagementMenu()  { return this.page.getByText(/계정 관리/).first() }
  get paymentHistoryMenu()     { return this.page.getByText(/결제 내역/) }
  get languageSettingMenu()    { return this.page.getByText(/언어 설정/) }
  get customerCenterMenu()     { return this.page.getByText(/고객 센터/) }
  get logoutMenu()             { return this.page.getByText(/로그아웃/) }
  get saveSuccessMsg()         { return this.page.getByText(/저장되었습니다|Saved successfully/) }
  get nameLabel()              { return this.page.getByText(/이름/).first() }
  get emailLabel()             { return this.page.getByText(/이메일/).first() }
  get fileInput()              { return this.page.locator("input[type='file']") }
  get profileImageEditButton() { return this.page.locator("//span[contains(@class,'MuiBadge-badge')][.//*[contains(@data-testid,'pen-to-squareIcon')]]") }
  get removeProfileImageMenu() { return this.page.locator("//li[@role='menuitem'][.//*[contains(text(),'프로필 이미지 제거')]]") }

  async clickProfileButton(): Promise<void> {
    await this.profileButton.click()
  }

  async moveToAccountManagement(): Promise<void> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.clickProfileButton().then(() => this.accountManagementMenu.click()),
    ])
    await newPage.waitForLoadState()
    // 새 탭이 열리는 경우 처리
    Object.assign(this, { page: newPage })
  }

  async uploadProfileImage(imagePath: string): Promise<void> {
    await this.fileInput.setInputFiles(imagePath)
  }

  async removeProfileImage(): Promise<void> {
    await this.profileImageEditButton.click()
    await this.removeProfileImageMenu.click()
  }

  async isSaveSuccessMessageDisplayed(): Promise<void> {
    await expect(this.saveSuccessMsg).toBeVisible({ timeout: 10000 })
  }
}
