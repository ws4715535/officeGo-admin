import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  Settings,
  Calendar,
  Search,
  Clock
} from 'lucide-react'
import { getTeamDetail, getTeamStats, removeMember } from '../api/admin'

// Simple bar chart component
function BarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  
  // 将日期字符串转换为星期几
  const getWeekDay = (dateStr) => {
    if (!dateStr) return ''
    // 如果是 YYYY-MM-DD 格式
    if (dateStr.includes('-')) {
      const date = new Date(dateStr)
      return weekDays[date.getDay()]
    }
    // 如果已经是 Mon/Tue 等格式，转为中文
    const engDays = { Mon: '一', Tue: '二', Wed: '三', Thu: '四', Fri: '五', Sat: '六', Sun: '日' }
    return engDays[dateStr] || dateStr
  }

  // 格式化日期显示 (MM/DD)
  const formatDate = (dateStr) => {
    if (!dateStr || !dateStr.includes('-')) return ''
    const parts = dateStr.split('-')
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`
  }
  
  return (
    <div className="flex items-end justify-between gap-2 h-40 pt-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="text-xs text-gray-600 font-medium">{item.value}</div>
          <div className="w-full flex justify-center">
            <div 
              className="w-10 bg-blue-400 rounded-t-lg transition-all duration-300 hover:bg-blue-500"
              style={{ height: `${(item.value / maxValue) * 120}px`, minHeight: item.value > 0 ? '8px' : '4px' }}
            />
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-700">周{getWeekDay(item.day)}</div>
            <div className="text-[10px] text-gray-400">{formatDate(item.day)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Stat item for sidebar
function StatItem({ label, value, valueColor = 'text-gray-900' }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-semibold ${valueColor}`}>{value}</span>
    </div>
  )
}

// Activity log item
function LogItem({ action, user, time }) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <p className="text-sm font-medium text-gray-900">{action}</p>
      <p className="text-xs text-gray-400 mt-1">{user} · {time}</p>
    </div>
  )
}

// Loading skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="h-5 w-20 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamDetail() {
  const { teamId } = useParams()
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [memberSearch, setMemberSearch] = useState('')

  useEffect(() => {
    if (!teamId) return
    let cancelled = false
    
    Promise.all([
      getTeamDetail(teamId),
      getTeamStats(teamId, 7).catch(() => null) // Stats可能失败，不影响主数据
    ])
      .then(([detail, statsData]) => {
        if (!cancelled) {
          setData(detail)
          setStats(statsData)
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message || '加载失败') })
      .finally(() => { if (!cancelled) setLoading(false) })
    
    return () => { cancelled = true }
  }, [teamId])

  const handleRemoveMember = async (userId) => {
    if (!confirm('确定要移出该成员吗？')) return
    try {
      await removeMember(teamId, userId)
      // Refresh data
      const detail = await getTeamDetail(teamId)
      setData(detail)
    } catch (err) {
      alert(err.message || '操作失败')
    }
  }

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/teams" className="text-blue-500 hover:underline cursor-pointer">
          返回团队列表
        </Link>
      </div>
    )
  }

  if (!data) return null

  const { baseInfo, members } = data
  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(memberSearch.toLowerCase())
  )

  // 使用真实 API 数据，如果没有则生成过去7天的空数据
  const trendData = stats?.trend || (() => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      result.push({ day: d.toISOString().split('T')[0], value: 0 })
    }
    return result
  })()

  // Mock logs (will be replaced with real API data)
  const activityLogs = [
    { action: '修改了团队名称', user: '王人力', time: '2023-10-15 10:00' },
    { action: '移除了成员 User 101', user: '王人力', time: '2023-10-16 14:30' },
    { action: '更新了考勤规则', user: '系统管理员', time: '2023-10-20 09:15' },
  ]

  const adminCount = members.filter(m => m.role === 'admin').length
  const attendanceRate = stats?.attendanceRate || 92

  return (
    <div className="max-w-6xl space-y-6">
      {/* Back link */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        返回团队列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team info card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{baseInfo.name}</h1>
                  <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                    正常运营
                  </span>
                </div>
                <p className="text-gray-500 mt-2">{baseInfo.description || '暂无团队描述'}</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Settings className="w-4 h-4" />
                团队设置
              </button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                创建于 {baseInfo.createdAt ? new Date(baseInfo.createdAt).toLocaleDateString('zh-CN') : '-'}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg font-mono">
                {baseInfo.inviteCode}
              </div>
            </div>
          </div>

          {/* Attendance trend chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h2 className="font-semibold text-gray-900">近7天出勤趋势</h2>
            </div>
            <BarChart data={trendData} />
          </div>

          {/* Members list */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">成员列表</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索成员"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">成员</div>
              <div className="col-span-2">角色</div>
              <div className="col-span-3">加入时间</div>
              <div className="col-span-3 text-right">操作</div>
            </div>

            {/* Table body */}
            <div className="divide-y divide-gray-100">
              {filteredMembers.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  暂无成员
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    {/* Member info */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {(member.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{member.name || 'Unknown'}</span>
                    </div>

                    {/* Role */}
                    <div className="col-span-2 text-sm text-gray-600">
                      {member.role === 'admin' ? '管理员' : '成员'}
                    </div>

                    {/* Join date */}
                    <div className="col-span-3 text-sm text-gray-500">
                      {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('zh-CN') : '-'}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 text-right">
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        移出
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Stats overview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">统计概览</h3>
            <div className="divide-y divide-gray-100">
              <StatItem label="成员总数" value={members.length} />
              <StatItem label="管理员数" value={adminCount} />
              <StatItem label="本月出勤率" value={`${attendanceRate}%`} valueColor="text-green-500" />
            </div>
          </div>

          {/* Activity logs */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">操作日志</h3>
            </div>
            <div>
              {activityLogs.map((log, index) => (
                <LogItem key={index} {...log} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
