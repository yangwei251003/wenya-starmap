'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ExternalLink, RefreshCcw, Newspaper, Sparkles } from 'lucide-react'

type ReadingItem = {
  title: string
  link: string
  description: string
  pubDate?: string
}

export default function ReadingPage() {
  const [topic, setTopic] = useState('learning')
  const [items, setItems] = useState<ReadingItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadItems = async (nextTopic = topic) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/resources/reading?topic=${encodeURIComponent(nextTopic)}`)
      const data = await response.json()
      setItems(data.data?.items || [])
      setTopic(nextTopic)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  return (
    <div className="min-h-screen">
      <PageHeader
        title="英文阅读"
        subtitle="来自 BBC Learning English 的实时内容流"
        titleColor="star"
        backUrl="/dashboard"
      />

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <Card className="p-4 mb-6 bg-cosmos-900/60 border-cosmos-700/60">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={topic === 'learning' ? 'star' : 'cosmos'} size="sm" onClick={() => loadItems('learning')}>
              学习英语
            </Button>
            <Button variant={topic === 'news' ? 'star' : 'cosmos'} size="sm" onClick={() => loadItems('news')}>
              新闻英语
            </Button>
            <Button variant={topic === 'top' ? 'star' : 'cosmos'} size="sm" onClick={() => loadItems('top')}>
              热门内容
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadItems(topic)} className="ml-auto">
              <RefreshCcw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card className="p-8 text-center">
            <div className="w-14 h-14 border-4 border-star-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cosmos-300">正在加载阅读流...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <Card key={item.link} className="p-5 hover:border-star-400/50 transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-star-400" />
                    <span className="text-xs px-2 py-1 rounded-full bg-star-400/20 text-star-300">实时阅读</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-cosmos-500" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-cosmos-300 text-sm line-clamp-3 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-cosmos-500 text-xs">{item.pubDate || ''}</span>
                  <Link href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-star-300 hover:text-star-200 text-sm">
                    打开原文
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
