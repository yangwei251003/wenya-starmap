'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'API测试失败' })
    } finally {
      setLoading(false)
    }
  }

  const testRegister = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test123456',
          level: 'beginner'
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: '注册测试失败' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API测试页面</h1>
        
        <div className="space-y-4 mb-8">
          <Button onClick={testAPI} isLoading={loading}>
            测试基础API
          </Button>
          <Button onClick={testRegister} isLoading={loading}>
            测试注册API
          </Button>
        </div>

        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">测试结果：</h2>
            <pre className="text-sm text-cosmos-300 bg-cosmos-800 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  )
}