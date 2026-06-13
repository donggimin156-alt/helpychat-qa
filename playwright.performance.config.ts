// ============================================================
// playwright.performance.config.ts — 부하 테스트 전용 설정
// 실행: npx playwright test --config=playwright.performance.config.ts
//
// 병렬 실행 불가 이유:
//   - AI 응답 대기, accounts.elice.io 세션 등 실제 서버 응답 시간 포함
//   - 동시 실행 시 서버 부하 중첩으로 결과 오염
//   → workers: 1 (순차 실행) 고정
// ============================================================

import { defineConfig, devices } from '@playwright/test'

const ENVIRONMENTS: Record<string, string> = {
  dev:     'https://qaproject.elice.io',
  staging: 'https://qaproject.elice.io',
  prod:    'https://qaproject.elice.io',
}

const env = process.env.ENVIRONMENT || 'dev'

export default defineConfig({
  testDir: './tests/performance',

  globalSetup: './global-setup',

  workers: 1,

  retries: 1,

  use: {
    baseURL: ENVIRONMENTS[env],
    storageState: 'storage-state.json',
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    actionTimeout:     10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'performance',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],

  reporter: [
    ['html',  { outputFolder: 'playwright-report-performance', open: 'never' }],
    ['list'],
  ],
})
