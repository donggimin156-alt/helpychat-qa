// ============================================================
// playwright.config.ts — Playwright 전역 설정
// Cypress의 cypress.config.ts 와 동일한 역할
// ============================================================

import { defineConfig, devices } from '@playwright/test'

// ── 환경별 URL (cypress.config.ts 의 ENVIRONMENTS 와 동일) ────
const ENVIRONMENTS: Record<string, string> = {
  dev:     'https://qaproject.elice.io',
  staging: 'https://qaproject.elice.io',
  prod:    'https://qaproject.elice.io',
}

const env = process.env.ENVIRONMENT || 'dev'

export default defineConfig({
  // ── 테스트 파일 경로 ───────────────────────────────────────
  testDir: './tests',

  // ── 전역 설정: 모든 테스트 전 로그인 세션 1회 생성 ─────────
  globalSetup: './global-setup',

  use: {
    // 기본 URL (cy.visit('/ai-helpy-chat') → baseURL + '/ai-helpy-chat')
    baseURL: ENVIRONMENTS[env],

    // 저장된 로그인 세션 재사용 (cy.session() 과 동일한 효과)
    storageState: 'storage-state.json',

    // 브라우저 설정
    viewport: { width: 1920, height: 1080 },

    // 실패 시 스크린샷/영상 저장
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',

    // 대기 시간 (Python의 DEFAULT_WAIT = 10초)
    actionTimeout:     10000,
    navigationTimeout: 30000,
  },

  // ── 브라우저 설정 ─────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ── 리포트 설정 (Java 불필요) ─────────────────────────────
  reporter: [
    ['html',  { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
})
