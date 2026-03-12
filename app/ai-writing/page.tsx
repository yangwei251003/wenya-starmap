'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sparkles, PenLine, CheckCircle, AlertTriangle } from 'lucide-react'
import { AIWritingReview } from '@/types'

const defaultPrompt = 'Write about your favorite hobby and explain why you enjoy it.'

export default function AIWritingPage() {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [essay, setEssay] = useState('')
  const [review, setReview] = useState<AIWritingReview | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSimulated, setIsSimulated] = useState(false)

  const handleReview = async () => {
    if (!prompt.trim() || !essay.trim()) return
    setLoading(true)
    setReview(null)
    try {
      const response = await fetch('/api/ai/writing-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, essay, level: 'intermediate' })
      })
      const data = await response.json()
      setReview(data.data)
      setIsSimulated(!!data.isSimulated)
    } catch (error) {
      console.error('AI写作批改失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="AI写作工坊"
        subtitle="评分 + 纠错 + 改写，一键提升表达"
        titleColor="purple"
        backUrl="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">写作题目</h3>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full min-h-[80px] p-3 rounded-lg bg-cosmos-800/60 border border-cosmos-600/50 text-white placeholder-cosmos-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
          />
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-sprout-400" />
            <h3 className="text-white font-semibold">你的作文</h3>
          </div>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="请输入你的英文作文..."
            className="w-full min-h-[200px] p-3 rounded-lg bg-cosmos-800/60 border border-cosmos-600/50 text-white placeholder-cosmos-500 focus:border-sprout-400 focus:ring-2 focus:ring-sprout-400/20 transition-all"
          />
          <div className="mt-4">
            <Button variant="star" onClick={handleReview} disabled={loading || !essay.trim()}>
              {loading ? '批改中...' : '开始AI批改'}
            </Button>
          </div>
        </Card>

        {review && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI批改结果</h3>
                <p className="text-cosmos-400 text-sm">
                  {isSimulated ? '演示模式结果' : 'AI实时批改'}
                </p>
              </div>
              <div className="ml-auto text-3xl font-bold text-star-400">
                {review.score}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-cosmos-800/50 rounded-lg p-4">
                <h4 className="text-cosmos-200 font-medium mb-2">主要问题</h4>
                <ul className="text-cosmos-300 text-sm space-y-1">
                  {review.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-cosmos-800/50 rounded-lg p-4">
                <h4 className="text-cosmos-200 font-medium mb-2">高级表达</h4>
                <ul className="text-cosmos-300 text-sm space-y-1">
                  {review.advancedExpressions.map((exp, idx) => (
                    <li key={idx}>• {exp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-cosmos-200 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                逐句纠错
              </h4>
              <div className="space-y-3">
                {review.corrections.map((c, idx) => (
                  <div key={idx} className="bg-cosmos-900/40 rounded-lg p-3">
                    <p className="text-cosmos-400 text-sm mb-1">原句：</p>
                    <p className="text-cosmos-200">{c.original}</p>
                    <p className="text-cosmos-400 text-sm mt-2 mb-1">修改：</p>
                    <p className="text-sprout-300">{c.corrected}</p>
                    <p className="text-cosmos-500 text-sm mt-1">说明：{c.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-cosmos-200 font-medium mb-2">优化版本</h4>
              <div className="bg-cosmos-800/50 rounded-lg p-4 text-cosmos-200 whitespace-pre-wrap">
                {review.improvedVersion}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
