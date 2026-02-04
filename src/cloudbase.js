import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUD_ENV_ID
console.log('[cloudbase] init env:', envId || '(未设置)')
if (!envId) {
  console.warn('VITE_CLOUD_ENV_ID not set')
}

const app = cloudbase.init({ env: envId })
export default app

export function getApp() {
  return app
}

/** 确保已匿名登录，以便 callFunction 能带上凭证（避免 unauthenticated / credentials not found） */
let anonymousAuthPromise = null
export async function ensureAnonymousAuth() {
  if (!envId) return
  if (!anonymousAuthPromise) {
    anonymousAuthPromise = app.auth().signInAnonymously().catch((err) => {
      console.warn('[cloudbase] signInAnonymously failed:', err)
      anonymousAuthPromise = null
      throw err
    })
  }
  return anonymousAuthPromise
}
