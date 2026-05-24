import { NextRequest, NextResponse } from 'next/server'
import { parseRss } from '@/lib/rss'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const FEEDS: Record<string, string> = {
  learning: 'https://www.esl-lab.com/feed/',
  news: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  top: 'https://feeds.bbci.co.uk/news/rss.xml',
}

const FALLBACK_FEEDS = [
  'https://www.esl-lab.com/feed/',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/rss.xml',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic') || 'learning'
    const feedUrl = FEEDS[topic] || FEEDS.learning
    const candidates = Array.from(new Set([feedUrl, ...FALLBACK_FEEDS]))
    const cacheKey = `reading:${topic}`

    if (supabaseAdmin) {
      const { data: cached } = await supabaseAdmin
        .from('resource_cache')
        .select('payload, expires_at')
        .eq('cache_key', cacheKey)
        .maybeSingle()

      if (cached?.payload && (!cached.expires_at || new Date(cached.expires_at) > new Date())) {
        return NextResponse.json({
          success: true,
          data: cached.payload,
          cached: true,
        })
      }
    }

    for (const candidate of candidates) {
      const response = await fetch(candidate, {
        headers: {
          'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
          'User-Agent': 'WenyaStarmap/1.0 (+https://wenya-starmap-e6f3.vercel.app)',
        },
        next: { revalidate: 1800 },
      })

      if (!response.ok) {
        continue
      }

      const xml = await response.text()
      const items = parseRss(xml).slice(0, 8)

      if (items.length > 0) {
        const payload = {
          source: candidate,
          topic,
          items,
        }

        if (supabaseAdmin) {
          await supabaseAdmin.from('resource_cache').upsert({
            cache_key: cacheKey,
            resource_type: 'reading',
            source: candidate,
            payload,
            expires_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
          }, { onConflict: 'cache_key' })
        }

        return NextResponse.json({
          success: true,
          data: payload,
          cached: false,
        })
      }
    }

    return NextResponse.json(
      { success: false, error: '阅读资源暂时不可用' },
      { status: 502 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '阅读资源获取失败' },
      { status: 500 }
    )
  }
}
