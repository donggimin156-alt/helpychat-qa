import { Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class SettingsPage extends BasePage {
  constructor(page: Page) { super(page) }

  get gearButton()       { return this.page.locator('button:has(svg[data-testid="gearIcon"])') }
  get settingsMenuItem() { return this.page.locator('a[role="menuitem"]:has(svg[data-testid="gearIcon"])') }
  get modelTab()         { return this.page.getByRole('tab', { name: /모델 설정|Model/ }) }
  get subscriptionTab()  { return this.page.getByRole('tab', { name: /구독|Subscription/ }) }
  get memberTab()        { return this.page.getByRole('tab', { name: /구성원|Member/ }) }
  get toastMsg()         { return this.page.locator("[class*='toast'], [class*='Snackbar'], [role='alert']").first() }
  get modelToggles()     { return this.page.locator("input[type='checkbox'][name*='model'], input[type='checkbox'][class*='model']") }
  get tokenLimitToggle() { return this.page.locator("input[type='checkbox'][name*='token'], input[type='checkbox'][name*='limit']").first() }

  async navigateToSettings(): Promise<void> {
    await this.gearButton.click()
    await this.settingsMenuItem.click()
    await expect(this.page).toHaveURL(/admin/, { timeout: 10000 })
  }

  async navigateToModelsTab(): Promise<void> {
    await this.modelTab.click()
    await expect(this.page).toHaveURL(/admin\/model/, { timeout: 5000 }).catch(() => {})
  }

  async navigateToSubscriptionTab(): Promise<void> {
    await this.subscriptionTab.click()
  }

  async navigateToMemberTab(): Promise<void> {
    await this.memberTab.click()
  }

  async getToastMessage(): Promise<string> {
    await this.toastMsg.waitFor({ timeout: 5000 })
    return (await this.toastMsg.textContent()) || ''
  }

  async activateDisabledModel(): Promise<string | null> {
    const checkboxes = this.page.locator("input[type='checkbox']")
    const count = await checkboxes.count()
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i)
      if (!(await cb.isChecked())) {
        await cb.click()
        return `model-${i}`
      }
    }
    return null
  }

  async deactivateActiveModel(): Promise<string | null> {
    const checkboxes = this.page.locator("input[type='checkbox']")
    const count = await checkboxes.count()
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i)
      if (await cb.isChecked()) {
        await cb.click()
        return `model-${i}`
      }
    }
    return null
  }

  async isSettingsPageDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/admin/, { timeout: 10000 })
  }

  async isHistoryPageDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/admin\/history/, { timeout: 10000 })
  }

  async navigateToHistoryTab(): Promise<void> {
    await this.page.goto('/ai-helpy-chat/admin/history')
    await this.isHistoryPageDisplayed()
  }
}
