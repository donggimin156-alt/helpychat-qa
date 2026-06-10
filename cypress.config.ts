// ============================================================
// cypress.config.ts — Cypress 전역 설정
// Python의 pytest.ini + config/settings.py 역할
// ============================================================

import { defineConfig } from 'cypress'
import { allureCypress } from 'allure-cypress/reporter'
import { beforeRunHook, afterRunHook } from 'cypress-mochawesome-reporter/cjs'

// ── 환경별 URL 설정 (dev / staging / prod) ───────────────────
// 실행 시 --env environment=staging 으로 선택
// 예: npx cypress run --env environment=staging
const ENVIRONMENTS: Record<string, string> = {
  dev:     'https://qaproject.elice.io',      // 개발 환경
  staging: 'https://qaproject.elice.io',      // 스테이징 (실제로는 다른 URL)
  prod:    'https://qaproject.elice.io',      // 운영
}

export default defineConfig({
  e2e: {
    // ── 기본 URL ─────────────────────────────────────────────
    baseUrl: ENVIRONMENTS['dev'],

    // ── 브라우저 / 대기 설정 ──────────────────────────────────
    viewportWidth:         1920,
    viewportHeight:        1080,
    defaultCommandTimeout: 10000,
    pageLoadTimeout:       30000,

    // ── 테스트 파일 경로 ──────────────────────────────────────
    specPattern: 'cypress/e2e/**/*.cy.ts',

    // ── 실패 시 스크린샷 저장 ─────────────────────────────────
    screenshotOnRunFailure: true,

    // mochawesome HTML 리포트 설정 (Java 불필요)
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
    },

    setupNodeEvents(on, config) {
      // Allure 리포트 (Java 설치 시 사용 가능)
      allureCypress(on, config, { resultsDir: 'allure-results' })

      // mochawesome 훅
      on('before:run', async (details) => { await beforeRunHook(details) })
      on('after:run',  async ()         => { await afterRunHook() })

      // 환경 변수로 baseUrl 동적 변경
      const env = config.env.environment || 'dev'
      config.baseUrl = ENVIRONMENTS[env] || ENVIRONMENTS['dev']

      return config
    },
  },

  // ── 전역 상수 (Cypress.env('키') 로 접근) ───────────────────
  env: {
    LOGIN_URL:
      'https://accounts.elice.io/accounts/signin/me' +
      '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
      '&lang=ko-KR&org=qaproject',

    // 기본 환경
    environment: 'dev',
  },
})
