// ============================================================
// test_tools_behavior.spec.ts — 행동특성 및 종합의견 도구 (FHC-037~044)
// ============================================================

import { test, expect } from '@playwright/test'
import { ToolBasePage } from '../../pages/ToolBasePage'
import path from 'path'
import os from 'os'

const TOOL_NAME    = '행동특성 및 종합의견'
const SCHOOL       = '중학교'
const STUDENT      = '포커스 1차 프로젝트'
const REQUEST_TEXT = '엘리스 부트 캠프'
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads')

test.describe('[FHC-037~044] 행동특성 및 종합의견', () => {

  test('[FHC-037~044] 행동특성 및 종합의견 생성 해피 케이스', { timeout: 180000 }, async ({ page }) => {
    const tool = new ToolBasePage(page)
    await tool.navigateToTools()

    // [FHC-037] 도구 목록 표시 확인 및 도구 클릭
    expect(await tool.isToolsListDisplayed()).toBeTruthy()
    await tool.clickToolMenu(TOOL_NAME)
    await expect(page).toHaveURL(/tools/, { timeout: 10000 })

    // [FHC-038] 수업 정보 입력 (교과급)
    const schoolDD = page.locator('[aria-haspopup="listbox"]').first()
    if (await schoolDD.isVisible({ timeout: 3000 }).catch(() => false)) {
      await schoolDD.click()
      await page.getByRole('option', { name: SCHOOL }).click()
    }

    // '다음으로' 버튼 활성화 확인
    const nextButton = page.getByRole('button', { name: /다음/ })
    await expect(nextButton).toBeEnabled({ timeout: 5000 })

    // [FHC-039] '다음으로' 클릭 → 학생 정보 입력 페이지
    await nextButton.click()

    // 수정 확인 모달 처리
    const confirmModal = page.getByRole('button', { name: /확인|계속/ })
    if (await confirmModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmModal.click()
    }

    // [FHC-041] 학생 이름 입력
    const studentNameInput = page.locator('input[placeholder*="이름"], input[placeholder*="학생"]').first()
    if (await studentNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await studentNameInput.fill(STUDENT)
    }

    // [FHC-041~042] 인성·태도 키워드 선택 및 저장
    const keywordBtn = page.getByRole('button', { name: /키워드|선택/ }).first()
    if (await keywordBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await keywordBtn.click()
      await page.locator('[role="checkbox"], input[type="checkbox"]').first().click()
      const saveBtn = page.getByRole('button', { name: /저장|확인/ })
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveBtn.click()
      }
    }

    // 기타 요청 사항
    const requestInput = page.locator('textarea[placeholder*="요청"]').first()
    if (await requestInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await requestInput.fill(REQUEST_TEXT)
    }

    // [FHC-043] 학생 추가 버튼
    const addStudentBtn = page.getByRole('button', { name: /학생 추가|추가/ }).first()
    if (await addStudentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addStudentBtn.click()
    }

    // [FHC-044] 생성 결과 받기 → xlsx 다운로드
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
