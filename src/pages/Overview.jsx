import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Loader2
} from 'lucide-react'
import { getOverview, listTeams } from '../api/admin'

// Stat card component matching design
function StatCard({ icon: Icon, label, value, trend, iconBgColor, iconColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

// Team item component
function TeamItem({ team, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold text-sm">
          {(team.name || '?').charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {team.name}
          </p>
          <p className="text-sm text-gray-500">{team.description || '暂无描述'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-gray-400">活跃度</p>
          <p className="text-sm font-semibold text-green-500">{team.activityRate || 0}%</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  )
}

// Loading skeleton
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

function TeamListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-2 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function Overview() {
  const [overview, setOverview] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [ov, tl] = await Promise.all([
          getOverview().catch(() => ({})),
          listTeams().catch(() => [])
        ])
        if (!cancelled) {
          setOverview(ov || {})
          setTeams(Array.isArray(tl) ? tl : [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message || '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

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
    <div className="max-w-5xl space-y-8">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>

      {/* Stats grid - matching design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Building2}
              label="团队总数"
              value={overview?.teamCount ?? 0}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              icon={Users}
              label="用户总数"
              value={overview?.userCount ?? 0}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              icon={TrendingUp}
              label="本月活跃用户"
              value={overview?.activeUserCount ?? 0}
              trend={overview?.activeUserGrowth ? `较上月 +${overview.activeUserGrowth}%` : null}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
          </>
        )}
      </div>

      {/* Recent active teams - matching design */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">最近活跃团队</h2>
          <Link 
            to="/teams" 
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <TeamListSkeleton />
        ) : teams.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            暂无团队数据
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {teams.slice(0, 5).map((team) => (
              <Link key={team.teamId} to={`/teams/${team.teamId}`}>
                <TeamItem team={team} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
