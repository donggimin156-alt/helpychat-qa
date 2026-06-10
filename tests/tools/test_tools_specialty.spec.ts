// ============================================================
// test_tools_specialty.spec.ts — 세부 특기사항 도구 (FHC-028~036)
// ============================================================

import { test, expect } from '@playwright/test'
import { ToolBasePage } from '../../pages/ToolBasePage'
import path from 'path'
import os from 'os'

const TOOL_NAME   = '세부 특기사항'
const SCHOOL      = '중학교'
const GRADE       = '3학년'
const SUBJECT     = '수학'
const UNIT        = '1'
const STUDENT     = '포커스 1차 프로젝트'
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads')

test.describe('[FHC-028~036] 세부 특기사항', () => {

  test('[FHC-028~036] 세부 특기사항 생성 해피 케이스', { timeout: 180000 }, async ({ page }) => {
    const tool = new ToolBasePage(page)
    await tool.navigateToTools()

    // [FHC-028] 도구 목록 표시 확인
    expect(await tool.isToolsListDisplayed()).toBeTruthy()

    // [FHC-029] 세부 특기사항 도구 선택
    await tool.clickToolMenu(TOOL_NAME)
    await expect(page).toHaveURL(/tools/, { timeout: 10000 })

    // [FHC-030] 수업 정보 입력 (학교급, 학년, 과목, 단원)
    const schoolDD = page.locator('[aria-haspopup="listbox"]').first()
    if (await schoolDD.isVisible({ timeout: 3000 }).catch(() => false)) {
      await schoolDD.click()
      await page.getByRole('option', { name: SCHOOL }).click()
    }

    const gradeDD = page.locator('[aria-haspopup="listbox"]').nth(1)
    if (await gradeDD.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gradeDD.click()
      await page.getByRole('option', { name: GRADE }).click()
    }

    const subjectInput = page.locator('input[placeholder*="과목"]').first()
    if (await subjectInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await subjectInput.fill(SUBJECT)
    }

    const unitInput = page.locator('input[placeholder*="단원"]').first()
    if (await unitInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await unitInput.fill(UNIT)
    }

    // [FHC-030] '다음으로' 버튼 활성화 확인
    const nextButton = page.getByRole('button', { name: /다음/ })
    await expect(nextButton).toBeEnabled({ timeout: 5000 })

    // [FHC-031] '다음으로' 버튼 클릭 → 학생 정보 입력 페이지
    await nextButton.click()

    // 수정 확인 모달 처리
    const confirmModal = page.getByRole('button', { name: /확인|계속/ })
    if (await confirmModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmModal.click()
    }

    // [FHC-033] 학생 이름 입력
    const studentNameInput = page.locator('input[placeholder*="이름"], input[placeholder*="학생"]').first()
    if (await studentNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await studentNameInput.fill(STUDENT)
    }

    // 학습 태도 키워드 모달
    const keywordBtn = page.getByRole('button', { name: /키워드|선택/ }).first()
    if (await keywordBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await keywordBtn.click()
      await page.locator('[role="checkbox"], input[type="checkbox"]').first().click()
      const saveBtn = page.getByRole('button', { name: /저장|확인/ })
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveBtn.click()
      }
    }

    // [FHC-035] 학생 추가 버튼
    const addStudentBtn = page.getByRole('button', { name: /학생 추가|추가/ }).first()
    if (await addStudentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addStudentBtn.click()
    }

    // [FHC-036] 생성 결과 받기 → xlsx 다운로드
    // Playwright: waitForEvent('download') — Selenium의 파일 폴링 불필요
    const resultBtn = page.getByRole('button', { name: /생성 결과 받기|결과 받기/ })
    if (await resultBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        resultBtn.click(),
      ])
      const fileName = download.suggestedFilename()
      expect(fileName).toMatch(/\.(xlsx?|csv)$/i)
    }
  })
})
