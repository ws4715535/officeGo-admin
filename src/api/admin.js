import app, { ensureAnonymousAuth } from '../cloudbase'

const TOKEN_KEY = 'officego_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function callAdminApi(action, payload = {}) {
  await ensureAnonymousAuth()
  const token = getToken()
  const res = await app.callFunction({
    name: 'admin-api',
    data: { action, payload, token }
  })
  const result = res.result
  if (result.code !== 200 && result.code !== 0) {
    throw new Error(result.msg || 'Request failed')
  }
  return result.data
}

export async function login(password) {
  console.log('[admin] 调用 admin-api login, env:', import.meta.env.VITE_CLOUD_ENV_ID)
  await ensureAnonymousAuth()
  let res
  try {
    res = await app.callFunction({
      name: 'admin-api',
      data: { action: 'login', payload: { password } }
    })
    console.log('[admin] callFunction 原始返回:', res)
  } catch (err) {
    console.error('[admin] callFunction 异常:', err)
    throw err
  }
  const result = res.result
  console.log('[admin] result:', result, 'code:', result?.code)
  if (result.code !== 200) {
    const msg = result.msg || 'Login failed'
    console.error('[admin] 登录失败 code=', result.code, 'msg=', msg)
    throw new Error(msg)
  }
  setToken(result.data.token)
  return result.data
}

// ============ 概览 ============
export async function getOverview() {
  return callAdminApi('getOverview')
}

// ============ 团队管理 ============
export async function listTeams(params = {}) {
  // params: { search, sortBy, sortOrder }
  return callAdminApi('listTeams', params)
}

export async function getTeamDetail(teamId) {
  return callAdminApi('getTeamDetail', { teamId })
}

export async function getTeamStats(teamId, days = 7) {
  // 获取团队近N天出勤趋势
  return callAdminApi('getTeamStats', { teamId, days })
}

export async function updateTeamStatus(teamId, status) {
  // status: 'active' | 'disabled'
  return callAdminApi('updateTeamStatus', { teamId, status })
}

export async function removeMember(teamId, userId) {
  return callAdminApi('removeMember', { teamId, userId })
}

// ============ 用户管理 ============
export async function listUsers(params = {}) {
  // params: { search, teamId, role, status }
  return callAdminApi('listUsers', params)
}

export async function getUserDetail(userId) {
  return callAdminApi('getUserDetail', { userId })
}

export async function getUserAttendance(userId, month) {
  // month: 'YYYY-MM'
  return callAdminApi('getUserAttendance', { userId, month })
}

// ============ 考勤统计 ============
export async function getAttendanceStats(payload) {
  return callAdminApi('getAttendanceStats', payload)
}

// ============ 管理员管理 (预留) ============
export async function listAdmins() {
  return callAdminApi('listAdmins')
}
