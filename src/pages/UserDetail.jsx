import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  MessageCircle,
  Phone,
  Calendar,
  Activity
} from 'lucide-react'
import { getUserDetail, getUserAttendance } from '../api/admin'

// Stat card for attendance
function AttendanceStat({ value, label, valueColor = 'text-gray-900' }) {
  return (
    <div className="text-center py-4 px-6 border-r border-gray-100 last:border-0">
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

// Status badge component
function StatusBadge({ status }) {
  const isActive = status === 'active' || !status
  return (
    <span className={`text-sm font-medium ${isActive ? 'text-green-500' : 'text-red-500'}`}>
      {isActive ? '正常' : '停用'}
    </span>
  )
}

// Attendance status badge
function AttendanceStatusBadge({ status }) {
  const statusConfig = {
    office: { label: '到岗', bgColor: 'bg-green-100', textColor: 'text-green-600' },
    remote: { label: '远程', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    leave: { label: '请假', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
    trip: { label: '出差', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  }
  
  const config = statusConfig[status] || { label: status, bgColor: 'bg-gray-100', textColor: 'text-gray-600' }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 ${config.bgColor} ${config.textColor} text-xs font-medium rounded-lg`}>
      {config.label}
    </span>
  )
}

// Activity log item
function LogItem({ text, time }) {
  return (
    <div className="flex items-start gap-2 py-2">
      <span className="text-gray-400 mt-0.5">•</span>
      <div>
        <p className="text-sm text-gray-600">{text}</p>
        {time && <p className="text-xs text-gray-400 mt-0.5">{time}</p>}
      </div>
    </div>
  )
}

// Loading skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UserDetail() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    
    // Get current month
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    Promise.all([
      getUserDetail(userId),
      getUserAttendance(userId, month).catch(() => null)
    ])
      .then(([userData, attendanceData]) => {
        if (!cancelled) {
          setUser(userData)
          setAttendance(attendanceData)
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message || '加载失败') })
      .finally(() => { if (!cancelled) setLoading(false) })
    
    return () => { cancelled = true }
  }, [userId])

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/users" className="text-blue-500 hover:underline cursor-pointer">
          返回用户列表
        </Link>
      </div>
    )
  }

  if (!user) return null

  // Mock data for attendance stats (will be replaced with real API data)
  const stats = attendance?.stats || {
    office: 20,
    remote: 2,
    leave: 0,
    rate: 98
  }

  // Mock recent records (will be replaced with real API data)
  const recentRecords = attendance?.records || [
    { date: '2024-03-10', status: 'office', time: '08:55', location: '公司' },
    { date: '2024-03-09', status: 'remote', time: '09:00', location: '家' },
    { date: '2024-03-08', status: 'office', time: '08:50', location: '公司' },
  ]

  // Mock activity logs
  const activityLogs = [
    { text: '修改了个人头像', time: '2024-03-10' },
    { text: '加入了新团队', time: '2024-03-01' },
    { text: '完善了个人资料', time: '2024-02-15' },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back link */}
      <Link
        to="/users"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        返回用户列表
      </Link>

      {/* User info card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
              {(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name || '未知用户'}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {user.wechat || '-'}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {user.phone || '-'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  注册于 {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-gray-400">状态</p>
              <StatusBadge status={user.status} />
            </div>
            <div className="text-right">
              <p className="text-gray-400">最近活跃</p>
              <p className="font-medium text-gray-900">{user.lastActiveAt || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly attendance stats */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 p-6 border-b border-gray-100">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h2 className="font-semibold text-gray-900">本月考勤统计</h2>
            </div>
            <div className="grid grid-cols-4">
              <AttendanceStat value={stats.office} label="出勤天数" valueColor="text-green-500" />
              <AttendanceStat value={stats.remote} label="远程天数" valueColor="text-blue-500" />
              <AttendanceStat value={stats.leave} label="请假天数" valueColor="text-orange-500" />
              <AttendanceStat value={`${stats.rate}%`} label="出勤率" />
            </div>
          </div>

          {/* Recent attendance records */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">最近打卡记录</h2>
            </div>
            
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>日期</div>
              <div>状态</div>
              <div>打卡时间</div>
              <div>地点</div>
            </div>

            {/* Table body */}
            <div className="divide-y divide-gray-100">
              {recentRecords.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  暂无打卡记录
                </div>
              ) : (
                recentRecords.map((record, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 px-6 py-4 items-center"
                  >
                    <div className="text-sm text-gray-900">{record.date}</div>
                    <div><AttendanceStatusBadge status={record.status} /></div>
                    <div className="text-sm text-gray-600">{record.time}</div>
                    <div className="text-sm text-gray-500">{record.location}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Team info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">所属团队</h3>
            {user.teamName ? (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900">{user.teamName}</p>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <span>{user.role === 'admin' ? '管理员' : '成员'}</span>
                  <span>{user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('zh-CN') : '-'} 加入</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">暂未加入团队</p>
            )}
          </div>

          {/* Activity logs */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">行为日志</h3>
            </div>
            <div>
              {activityLogs.map((log, index) => (
                <LogItem key={index} text={log.text} time={log.time} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
