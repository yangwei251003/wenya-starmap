'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export default function TestAIPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [testMessage, setTestMessage] = useState('Hello, how are you?')

  const testAIConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // 测试我们的API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testMessage,
          level: 'intermediate',
          context: 'general'
        })
      })
      
      const data = await response.json()
      
      setTestResult({
        type: 'api_test',
        success: response.ok,
        status: response.status,
        data: data
      })
    } catch (error) {
      setTestResult({
        type: 'api_test',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectGLM = async () => {
    if (!apiKey) {
      alert('请输入API Key')
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      // 直接测试智谱GLM API
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            { role: 'user', content: testMessage }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      })

      const data = await response.json()
      
      setTestResult({
        type: 'direct_glm',
        success: response.ok,
        status: response.status,
        data: data
      })
    } catch (error) {
      setTestResult({
        type: 'direct_glm',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="AI接口测试" 
        subtitle="测试智谱GLM API连接"
        titleColor="purple"
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-6">
        {/* 测试消息输入 */}
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

        {/* 测试我们的API */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">测试应用API</h3>
          <p className="text-cosmos-300 mb-4">测试 /api/ai/chat 接口</p>
          <Button 
            onClick={testAIConnection} 
            disabled={isLoading}
            variant="sprout"
            className="w-full"
          >
            {isLoading ? '测试中...' : '测试应用API'}
          </Button>
        </Card>

        {/* 直接测试GLM API */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">直接测试智谱GLM API</h3>
          <p className="text-cosmos-300 mb-4">直接调用智谱API进行测试</p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入你的GLM API Key"
            className="w-full px-4 py-3 bg-cosmos-800/50 border border-cosmos-600/50 rounded-lg text-white placeholder-cosmos-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all mb-4"
          />
          <Button 
            onClick={testDirectGLM} 
            disabled={isLoading || !apiKey}
            variant="star"
            className="w-full"
          >
            {isLoading ? '测试中...' : '直接测试GLM API'}
          </Button>
        </Card>

        {/* 环境变量检查 */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">环境变量检查</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cosmos-300">GLM_API_KEY:</span>
              <span className={`${process.env.NEXT_PUBLIC_GLM_API_KEY ? 'text-green-400' : 'text-red-400'}`}>
                {process.env.NEXT_PUBLIC_GLM_API_KEY ? '已配置' : '未配置'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cosmos-300">NODE_ENV:</span>
              <span className="text-star-400">{process.env.NODE_ENV || 'development'}</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-cosmos-800/50 rounded-lg">
            <p className="text-cosmos-300 text-sm">
              <strong>注意：</strong> 出于安全考虑，客户端无法直接访问服务器环境变量。
              如果显示"未配置"，请检查 .env.local 文件中的 GLM_API_KEY 配置。
            </p>
          </div>
        </Card>

        {/* 测试结果 */}
        {testResult && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">测试结果</h3>
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${testResult.success ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`font-medium ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {testResult.success ? '成功' : '失败'}
                </span>
                <span className="text-cosmos-400">({testResult.type})</span>
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

        {/* 配置指南 */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">配置指南</h3>
          <div className="space-y-4 text-sm text-cosmos-300">
            <div>
              <h4 className="text-white font-medium mb-2">1. 获取智谱GLM API Key</h4>
              <p>访问 <a href="https://open.bigmodel.cn/" target="_blank" className="text-star-400 hover:underline">智谱AI开放平台</a> 注册并获取API Key</p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">2. 配置环境变量</h4>
              <p>在项目根目录创建 <code className="bg-cosmos-800 px-2 py-1 rounded">.env.local</code> 文件：</p>
              <pre className="mt-2 p-3 bg-cosmos-900/50 rounded text-xs overflow-auto">
{`GLM_API_KEY=your_api_key_here
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions`}
              </pre>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">3. 重启开发服务器</h4>
              <p>配置环境变量后需要重启服务器：<code className="bg-cosmos-800 px-2 py-1 rounded">npm run dev</code></p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">4. 你提供的curl命令</h4>
              <p>你的API URL是正确的，模型建议使用 <code className="bg-cosmos-800 px-2 py-1 rounded">glm-4-flash</code> 以获得更快响应。</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}