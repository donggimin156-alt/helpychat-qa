// ============================================================
// test_tools_lesson.spec.ts — 수업지도안 도구 (FHC-045~048)
// ============================================================

import { test, expect } from '@playwright/test'
import { ToolBasePage } from '../../pages/ToolBasePage'
import path from 'path'

const TOOL_NAME     = '수업지도안'
const COMMENT       = '없음'
const FIXTURE_FILE  = path.join(__dirname, '../../fixtures/file_choose_test.pdf')

test.describe('[FHC-045~048] 수업지도안', () => {

  test('[FHC-045~048] 수업지도안 생성 해피 케이스', { timeout: 180000 }, async ({ page }) => {
    const tool = new ToolBasePage(page)
    await tool.navigateToTools()

    // [FHC-045] 수업지도안 페이지 진입
    await tool.clickToolMenu(TOOL_NAME)
    await expect(page).toHaveURL(/tools/, { timeout: 10000 })

    // [FHC-046] 필수 항목 선택 (학교급, 학년, 과목, 교육 내용, 수업 차시, 생성 방식)
    // lesson 드롭다운은 combobox role 사용 (aria-haspopup="listbox" 아닌 경우 대응)
    const dropdowns = page.locator('[role="combobox"]')
    const dropdownCount = await dropdowns.count()
    for (let i = 0; i < Math.min(dropdownCount, 3); i++) {
      const dd = dropdowns.nth(i)
      if (await dd.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dd.click()
        const firstOption = page.locator('[role="option"]').first()
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click()
        } else {
          await dd.press('Escape')
        }
      }
    }

    // 교육 내용 입력 — 실제 placeholder: "수업 주제를 입력해주세요."
    // getByPlaceholder: input/textarea 구분 없이 placeholder 기반 검색
    const contentInput = page.getByPlaceholder(/수업 주제|교육 내용/)
    if (await contentInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await contentInput.fill('수학 기초 연산')
    }

    expect(await tool.isGenerateBtnEnabled()).toBeTruthy()

    // [FHC-047] 선택 항목 입력 (참고 자료, 기타 요청 사항)
    // 파일 업로드 (Playwright: setInputFiles — Selenium보다 훨씬 간단)
    const fileInput = page.locator("input[type='file']")
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await fileInput.setInputFiles(FIXTURE_FILE)
      } catch {
        // 파일이 없는 경우 스킵
      }
    }

    const commentInput = page.locator('textarea[placeholder*="요청"], textarea[placeholder*="기타"]').last()
    if (await commentInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await commentInput.fill(COMMENT)
    }
    expect(await tool.isGenerateBtnEnabled()).toBeTruthy()

    // [FHC-048] 생성 → 완료 대기 (최대 2분)
    await tool.clickGenerate()
    const generated = await tool.waitForGenerated(120000)
    expect(generated).toBeTruthy()
  })
})
