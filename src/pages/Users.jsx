import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Download,
  ChevronDown
} from 'lucide-react'
import { listUsers, listTeams } from '../api/admin'

// Table skeleton
function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-6 py-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// User avatar with initials
function UserAvatar({ name, className = '' }) {
  const initials = name 
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'
  
  return (
    <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm ${className}`}>
      {initials}
    </div>
  )
}

// Role badge
function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="text-sm text-orange-500">管理员</span>
    )
  }
  return <span className="text-sm text-gray-500">成员</span>
}

// Team tag
function TeamTag({ name }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
      {name}
    </span>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    let cancelled = false
    
    Promise.all([
      listUsers().catch(err => { console.error('[Users] listUsers error:', err); return [] }),
      listTeams().catch(err => { console.error('[Users] listTeams error:', err); return [] })
    ])
      .then(([userData, teamData]) => {
        console.log('[Users] API response - users:', userData, 'teams:', teamData)
        if (!cancelled) {
          setUsers(Array.isArray(userData) ? userData : [])
          setTeams(Array.isArray(teamData) ? teamData : [])
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message || '加载失败') })
      .finally(() => { if (!cancelled) setLoading(false) })
    
    return () => { cancelled = true }
  }, [])

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchSearch = !searchQuery || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery) ||
      u.wechat?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchTeam = !filterTeam || u.teamId === filterTeam
    const matchRole = !filterRole || u.role === filterRole
    const matchStatus = !filterStatus || u.status === filterStatus
    
    return matchSearch && matchTeam && matchRole && matchStatus
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-500 hover:underline cursor-pointer"
        >
          重新加载
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <Download className="w-4 h-4" />
          导出列表
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、手机号、微信昵称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
          
          {/* Filter dropdowns */}
          <div className="flex gap-3">
            {/* Team filter */}
            <div className="relative">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-[120px]"
              >
                <option value="">所有团队</option>
                {teams.map(t => (
                  <option key={t.teamId} value={t.teamId}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Role filter */}
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-[110px]"
              >
                <option value="">所有角色</option>
                <option value="admin">管理员</option>
                <option value="member">成员</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-[110px]"
              >
                <option value="">状态: 全部</option>
                <option value="active">正常</option>
                <option value="inactive">停用</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">用户</div>
          <div className="col-span-2">联系方式</div>
          <div className="col-span-3">所属团队</div>
          <div className="col-span-1">角色</div>
          <div className="col-span-2">注册时间</div>
          <div className="col-span-1 text-right">操作</div>
        </div>

        {/* Table body */}
        {loading ? (
          <TableSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            {searchQuery || filterTeam || filterRole ? '没有找到匹配的用户' : '暂无用户数据'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <div
                key={user.userId}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                {/* User info */}
                <div className="col-span-3 flex items-center gap-3">
                  <UserAvatar name={user.name} />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name || '未知用户'}</p>
                    <p className="text-xs text-gray-400 truncate">WeChat: {user.wechat || '-'}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="col-span-2 text-sm text-gray-600">
                  {user.phone || '-'}
                </div>

                {/* Team */}
                <div className="col-span-3">
                  {user.teamName ? (
                    <TeamTag name={user.teamName} />
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>

                {/* Role */}
                <div className="col-span-1">
                  <RoleBadge role={user.role} />
                </div>

                {/* Register date */}
                <div className="col-span-2 text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                </div>

                {/* Actions */}
                <div className="col-span-1 text-right">
                  <Link
                    to={`/users/${user.userId}`}
                    className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer"
                  >
                    详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
