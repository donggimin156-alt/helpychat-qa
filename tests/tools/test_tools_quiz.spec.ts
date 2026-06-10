// ============================================================
// test_tools_quiz.spec.ts — 퀴즈 생성 도구 (FHC-055~057)
// ============================================================

import { test, expect } from '@playwright/test'
import { ToolBasePage } from '../../pages/ToolBasePage'

const TOOL_NAME = '퀴즈 생성'
const CONTENT   = '퀴즈'

test.describe('[FHC-055~057] 퀴즈 생성', () => {

  test('[FHC-055~057] 퀴즈 생성 해피패스', { timeout: 180000 }, async ({ page }) => {
    const tool = new ToolBasePage(page)
    await tool.navigateToTools()

    // [FHC-055] 퀴즈 생성 페이지 진입
    await tool.clickToolMenu(TOOL_NAME)
    await expect(page).toHaveURL(/tools/, { timeout: 10000 })

    // [FHC-056] 문제 유형, 난이도, 주제 입력
    // 문제 유형 선택 (드롭다운)
    const typeDropdown = page.locator('[aria-haspopup="listbox"]').first()
    if (await typeDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await typeDropdown.click()
      await page.locator('[role="option"]').first().click()
    }

    // 난이도 선택
    const diffDropdown = page.locator('[aria-haspopup="listbox"]').nth(1)
    if (await diffDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await diffDropdown.click()
      await page.locator('[role="option"]').first().click()
    }

    // 주제 입력
    await page.locator('textarea, input[placeholder*="주제"]').first().fill(CONTENT)

    // [FHC-057] 생성 버튼 활성화 확인 및 클릭
    expect(await tool.isGenerateBtnEnabled()).toBeTruthy()
    await tool.clickGenerate()

    // 생성 시작 확인
    expect(await tool.isGenerating()).toBeTruthy()

    // 생성 완료 (최대 2분)
    const generated = await tool.waitForGenerated(120000)
    expect(generated).toBeTruthy()
  })
})
