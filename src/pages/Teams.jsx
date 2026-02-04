import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Download,
  Copy,
  Ban,
  ChevronDown
} from 'lucide-react'
import { listTeams } from '../api/admin'

// Table skeleton
function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-6 py-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Status badge
function StatusBadge({ status }) {
  if (status === 'disabled') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
        已禁用
      </span>
    )
  }
  return null
}

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')

  useEffect(() => {
    let cancelled = false
    listTeams({ sortBy })
      .then((data) => { if (!cancelled) setTeams(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setTeams([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [sortBy])

  // Filter teams based on search
  const filteredTeams = teams.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.inviteCode?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCopyCode = (code, e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(code)
  }

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
        <h1 className="text-2xl font-bold text-gray-900">团队管理</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <Download className="w-4 h-4" />
          导出数据
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索团队名称、邀请码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
          
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="createdAt">按创建时间排序</option>
              <option value="memberCount">按成员数排序</option>
              <option value="name">按名称排序</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Teams table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">团队名称</div>
          <div className="col-span-2">邀请码</div>
          <div className="col-span-1">成员数</div>
          <div className="col-span-2">管理员</div>
          <div className="col-span-2">创建时间</div>
          <div className="col-span-2 text-right">操作</div>
        </div>

        {/* Table body */}
        {loading ? (
          <TableSkeleton />
        ) : filteredTeams.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            {searchQuery ? '没有找到匹配的团队' : '暂无团队数据'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTeams.map((team) => (
              <div
                key={team.teamId}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Team name */}
                <div className="col-span-3 flex items-center gap-2">
                  <span className="font-medium text-gray-900">{team.name}</span>
                  <StatusBadge status={team.status} />
                </div>

                {/* Invite code */}
                <div className="col-span-2 font-mono text-sm text-gray-600">
                  {team.inviteCode}
                </div>

                {/* Member count */}
                <div className="col-span-1 text-sm text-gray-600">
                  {team.memberCount}
                </div>

                {/* Admin */}
                <div className="col-span-2 text-sm text-gray-600">
                  {team.adminName || '-'}
                </div>

                {/* Created date */}
                <div className="col-span-2 text-sm text-gray-500">
                  {team.createdAt ? new Date(team.createdAt).toLocaleDateString('zh-CN') : '-'}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => handleCopyCode(team.inviteCode, e)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="复制邀请码"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/teams/${team.teamId}`}
                    className="px-3 py-1.5 text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    详情
                  </Link>
                  <button
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="禁用团队"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
