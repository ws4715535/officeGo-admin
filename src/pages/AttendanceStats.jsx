import { useState, useEffect } from 'react'
import { getAttendanceStats } from '../api/admin'

function getMonthRange(month) {
  if (!month) {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return { start: `${y}-${m}-01`, end: `${y}-${m}-31` }
  }
  return { start: `${month}-01`, end: `${month}-31` }
}

export default function AttendanceStats() {
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const { start, end } = getMonthRange(month)
    setLoading(true)
    getAttendanceStats({ startDate: start, endDate: end })
      .then((d) => setData(d))
      .catch((err) => setError(err.message || '加载失败'))
      .finally(() => setLoading(false))
  }, [month])

  if (loading && !data) return <div className="p-8 text-gray-500">加载中...</div>
  if (error && !data) return <div className="p-8 text-red-600">{error}</div>

  const stats = data?.stats || {}
  const byDate = data?.byDate || {}
  const dates = Object.keys(byDate).sort()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">考勤统计</h2>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          月份：
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-1">到岗</p>
          <p className="text-3xl font-bold text-gray-900">{stats.office ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-1">远程</p>
          <p className="text-3xl font-bold text-gray-900">{stats.remote ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-1">请假</p>
          <p className="text-3xl font-bold text-gray-900">{stats.leave ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-1">总记录数</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total ?? 0}</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">按日明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">日期</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">到岗</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">远程</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">请假</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dates.map((date) => (
                <tr key={date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{byDate[date].office ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{byDate[date].remote ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{byDate[date].leave ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dates.length === 0 && !loading && (
          <p className="px-6 py-8 text-gray-500 text-center">暂无数据</p>
        )}
      </section>
    </div>
  )
}
