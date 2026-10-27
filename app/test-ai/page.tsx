'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export default function TestAIPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testMessage, setTestMessage] = useState('Hello, how are you?')

  const testAIConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testMessage,
          level: 'intermediate',
          context: 'general',
        }),
      })

      const data = await response.json()

      setTestResult({
        success: response.ok,
        status: response.status,
        data,
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="AI接口测试"
        subtitle="测试问芽星图的星语对话入口"
        titleColor="purple"
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">测试消息</h3>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="输入测试消息"
            className="w-full px-4 py-3 bg-cosmos-800/50 border border-cosmos-600/50 rounded-lg text-white placeholder-cosmos-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">测试应用API</h3>
          <p className="text-cosmos-300 mb-4">测试 /api/ai/chat 接口是否可用</p>
          <Button
            onClick={testAIConnection}
            disabled={isLoading}
            variant="sprout"
            className="w-full"
          >
            {isLoading ? '测试中...' : '开始测试'}
          </Button>
        </Card>

        {testResult && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">测试结果</h3>
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${testResult.success ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`font-medium ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {testResult.success ? '成功' : '失败'}
                </span>
              </div>

              {testResult.status && (
                <p className="text-cosmos-300 text-sm mb-2">
                  HTTP状态: {testResult.status}
                </p>
              )}

              {testResult.error && (
                <p className="text-red-400 text-sm mb-2">
                  错误: {testResult.error}
                </p>
              )}

              <details className="mt-4">
                <summary className="text-cosmos-300 cursor-pointer hover:text-white">
                  查看详细响应
                </summary>
                <pre className="mt-2 p-3 bg-cosmos-900/50 rounded text-xs text-cosmos-300 overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </details>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
