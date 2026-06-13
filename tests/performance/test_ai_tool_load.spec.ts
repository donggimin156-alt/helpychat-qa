// ============================================================
// test_ai_tool_load.spec.ts — AI 도구 연속 생성 부하 테스트 (FHC-097)
// ============================================================

import { test, expect } from '@playwright/test'
import { ToolBasePage } from '../../pages/ToolBasePage'
import { loginMain } from '../helpers/auth'

// accounts.elice.io 세션이 기능 테스트 완료 시점에 만료되므로 재로그인
test.use({ storageState: { cookies: [], origins: [] } })

const TOOL_NAME    = '행동특성 및 종합의견'
const SCHOOL       = '중학교'
const STUDENT      = '포커스 1차 프로젝트'
const REQUEST_TEXT = '엘리스 부트 캠프'
const REPEAT       = 3

test('[FHC-097] AI 도구 연속 생성 부하 테스트', async ({ page }) => {
  test.setTimeout(600000)
  const ok = await loginMain(page)
  if (!ok) { test.skip(); return }

  const tool = new ToolBasePage(page)
  await tool.navigateToTools()

  expect(await tool.isToolsListDisplayed()).toBeTruthy()
  await tool.clickToolMenu(TOOL_NAME)
  await expect(page).toHaveURL(/tools/, { timeout: 10000 })

  // 수업 정보 입력 (1회)
  const schoolDD = page.locator('[aria-haspopup="listbox"]').first()
  if (await schoolDD.isVisible({ timeout: 3000 }).catch(() => false)) {
    await schoolDD.click()
    await page.getByRole('option', { name: SCHOOL }).click()
  }

  const nextButton = page.getByRole('button', { name: /다음/ })
  await expect(nextButton).toBeEnabled({ timeout: 5000 })
  await nextButton.click()

  const confirmModal = page.getByRole('button', { name: /확인|계속/ })
  if (await confirmModal.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmModal.click()
  }

  const studentNameInput = page.locator('input[placeholder*="이름"], input[placeholder*="학생"]').first()
  if (await studentNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await studentNameInput.fill(STUDENT)
  }

  const keywordBtn = page.getByRole('button', { name: /키워드|선택/ }).first()
  if (await keywordBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await keywordBtn.click()
    await page.locator('[role="checkbox"], input[type="checkbox"]').first().click()
    const saveBtn = page.getByRole('button', { name: /저장|확인/ })
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click()
    }
  }

  const requestInput = page.locator('textarea[placeholder*="요청"]').first()
  if (await requestInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await requestInput.fill(REQUEST_TEXT)
  }

  const addStudentBtn = page.getByRole('button', { name: /학생 추가|추가/ }).first()
  if (await addStudentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await addStudentBtn.click()
  }

  // 생성 3회 반복
  let failCount = 0
  const resultBtn = page.getByRole('button', { name: /생성 결과 받기|결과 받기/ })

  for (let i = 1; i <= REPEAT; i++) {
    try {
      if (await resultBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 180000 }),
          resultBtn.click(),
        ])
        const fileName = download.suggestedFilename()
        expect(fileName).toMatch(/\.(xlsx?|csv)$/i)
      }
    } catch {
      failCount++
    }
  }

  expect(failCount).toBe(0)
})
