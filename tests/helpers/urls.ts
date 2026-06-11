// 공통 URL 상수 — Single Source of Truth
// global-setup.ts, 각 spec 파일에서 공유

export const LOGIN_URL =
  'https://accounts.elice.io/accounts/signin/me' +
  '?continue_to=https%3A%2F%2Fqaproject.elice.io%2Fai-helpy-chat' +
  '&lang=ko-KR&org=qaproject'

export const ACCOUNT_URL  = 'https://accounts.elice.io/accounts/members/account'
export const LANGUAGE_URL = 'https://accounts.elice.io/accounts/members/language'
export const ORG_URL      = 'https://accounts.elice.io/accounts/members/organizations'
