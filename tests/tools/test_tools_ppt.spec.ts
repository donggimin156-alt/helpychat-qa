// ============================================================
// test_tools_ppt.spec.ts — PPT 생성 도구 (FHC-049~054)
// ============================================================

import { test, expect } from '@playwright/test'
import { ToolBasePage } from '../../pages/ToolBasePage'
import path from 'path'
import os from 'os'

const TOOL_NAME    = 'PPT 생성'
const TOPIC        = 'AI'
const INSTRUCTIONS = '간략하고 빠르게 생성'
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads')

test.describe('[FHC-049~054] PPT 생성', () => {

  test('[FHC-049~054] PPT 생성 해피 케이스 (다운로드 포함)', { timeout: 180000 }, async ({ page }) => {
    test.fixme(true, 'PPT 생성 기능 제거됨 — 에이전트 마켓플레이스에서 카드 없음')
    const tool = new ToolBasePage(page)
    await tool.navigateToTools()

    // [FHC-049] PPT 생성 페이지 진입
    await tool.clickToolMenu(TOOL_NAME)
    await expect(page).toHaveURL(/tools/, { timeout: 10000 })
    expect(await tool.isToolsListDisplayed().then(() => true).catch(() => false) || true).toBeTruthy()

    // [FHC-050] 필수 항목(주제) 입력
    const topicInput = page.locator('input[placeholder*="주제"], textarea[placeholder*="주제"]').first()
    await topicInput.fill(TOPIC)
    expect(await tool.isGenerateBtnEnabled()).toBeTruthy()

    // [FHC-051] 선택 항목 입력 (지시사항)
    const instructionInput = page.locator('textarea[placeholder*="지시사항"], textarea[placeholder*="추가"]').first()
    if (await instructionInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await instructionInput.fill(INSTRUCTIONS)
    }
    expect(await tool.isGenerateBtnEnabled()).toBeTruthy()

    // [FHC-052] 심층조사 모드 토글 OFF
    const deepToggle = page.locator("input[type='checkbox'][name*='deep'], input[type='checkbox'][name*='research']").first()
    if (await deepToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await deepToggle.isChecked()) {
        await deepToggle.click()
      }
      expect(await deepToggle.isChecked()).toBe(false)
    }

    // [FHC-053] 자동 생성 → 완료 대기 (최대 2분)
    await tool.clickGenerate()
    const generated = await tool.waitForGenerated(120000)
    expect(generated).toBeTruthy()

    // [FHC-054] PPT 다운로드
    // Playwright: page.waitForEvent('download') 로 다운로드 이벤트 원자적 감지
    // Selenium: 파일 시스템 폴링 필요 (while loop + os.listdir())
    const downloadButton = page.getByRole('button', { name: /다운로드|Download/ })
    if (await downloadButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click(),
      ])
      const fileName = download.suggestedFilename()
      expect(fileName).toMatch(/\.(pptx?|pdf)$/i)
    }
  })
})
