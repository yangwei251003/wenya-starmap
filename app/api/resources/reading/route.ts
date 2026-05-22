import { NextRequest, NextResponse } from 'next/server'
import { parseRss } from '@/lib/rss'

export const dynamic = 'force-dynamic'

const FEEDS: Record<string, string> = {
  learning: 'https://feeds.bbci.co.uk/learningenglish/rss.xml',
  news: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  top: 'https://feeds.bbci.co.uk/news/rss.xml',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic') || 'learning'
    const feedUrl = FEEDS[topic] || FEEDS.learning

    const response = await fetch(feedUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: '阅读资源暂时不可用' },
        { status: 502 }
      )
    }

    const xml = await response.text()
    const items = parseRss(xml).slice(0, 8)

    return NextResponse.json({
      success: true,
      data: {
        source: feedUrl,
        topic,
        items,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '阅读资源获取失败' },
      { status: 500 }
    )
  }
}
