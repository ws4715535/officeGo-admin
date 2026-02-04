import { Shield } from 'lucide-react'

export default function Admins() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">管理员管理</h1>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">功能开发中</h3>
        <p className="text-gray-500">管理员管理功能即将上线，敬请期待</p>
      </div>
    </div>
  )
}
