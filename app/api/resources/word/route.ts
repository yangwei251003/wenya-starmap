import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { searchVocabulary } from '@/lib/vocab-word-bank'

export const dynamic = 'force-dynamic'

type DictionaryEntry = {
  word: string
  phonetic?: string
  phonetics?: Array<{ text?: string; audio?: string }>
  meanings?: Array<{
    partOfSpeech?: string
    definitions?: Array<{
      definition?: string
      example?: string
      synonyms?: string[]
      antonyms?: string[]
    }>
    synonyms?: string[]
    antonyms?: string[]
  }>
}

type DatamuseWord = {
  word: string
  score?: number
  tags?: string[]
}

async function readCache(cacheKey: string) {
  if (!supabaseAdmin) return null

  const { data } = await supabaseAdmin
    .from('resource_cache')
    .select('payload, expires_at')
    .eq('cache_key', cacheKey)
    .maybeSingle()

  if (data?.payload && (!data.expires_at || new Date(data.expires_at) > new Date())) {
    return data.payload
  }

  return null
}

async function writeCache(cacheKey: string, payload: Record<string, unknown>) {
  if (!supabaseAdmin) return

  await supabaseAdmin.from('resource_cache').upsert({
    cache_key: cacheKey,
    resource_type: 'dictionary',
    source: 'dictionaryapi.dev+datamuse',
    payload,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  }, { onConflict: 'cache_key' })
}

async function fetchDictionary(word: string) {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    { headers: { Accept: 'application/json' }, next: { revalidate: 60 * 60 * 24 } }
  )

  if (!response.ok) return null

  const data = (await response.json()) as DictionaryEntry[]
  const entry = data[0]
  const meaning = entry?.meanings?.[0]
  const definition = meaning?.definitions?.[0]

  return {
    word: entry?.word || word,
    phonetic: entry?.phonetic || entry?.phonetics?.find((item) => item.text)?.text || '',
    audioUrl: entry?.phonetics?.find((item) => item.audio)?.audio || '',
    partOfSpeech: meaning?.partOfSpeech || '',
    definition: definition?.definition || '',
    example: definition?.example || '',
    synonyms: [...(definition?.synonyms || []), ...(meaning?.synonyms || [])],
    antonyms: [...(definition?.antonyms || []), ...(meaning?.antonyms || [])],
    raw: entry,
  }
}

async function fetchDatamuse(path: string) {
  const response = await fetch(`https://api.datamuse.com/words?${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 60 * 24 * 7 },
  })

  if (!response.ok) return []

  const data = (await response.json()) as DatamuseWord[]
  return data.map((item) => item.word).filter(Boolean).slice(0, 8)
}

function localFallback(word: string) {
  const local = searchVocabulary(word).find((item) => item.word.toLowerCase() === word.toLowerCase())

  if (!local) {
    return {
      word,
      phonetic: '',
      audioUrl: '',
      partOfSpeech: '',
      definition: '',
      example: `Try using ${word} in your own English sentence today.`,
      synonyms: [],
      antonyms: [],
      relatedWords: [],
      confusingWords: [],
      source: 'fallback',
    }
  }

  return {
    word: local.word,
    phonetic: local.phonetic,
    audioUrl: local.audioUrl || '',
    partOfSpeech: '',
    definition: local.meaning,
    example: local.example,
    synonyms: [],
    antonyms: [],
    relatedWords: [],
    confusingWords: local.confusingWords || [],
    source: 'local',
  }
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 12)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const word = searchParams.get('word')?.trim()

    if (!word) {
      return NextResponse.json({ error: 'word is required' }, { status: 400 })
    }

    const cacheKey = `word:${word.toLowerCase()}`
    const cached = await readCache(cacheKey)

    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true })
    }

    const [dictionary, relatedWords, similarWords] = await Promise.all([
      fetchDictionary(word),
      fetchDatamuse(`ml=${encodeURIComponent(word)}`),
      fetchDatamuse(`sp=${encodeURIComponent(word)}*&max=8`),
    ])

    const fallback = localFallback(word)
    const payload = {
      ...fallback,
      ...(dictionary || {}),
      definition: dictionary?.definition || fallback.definition,
      example: dictionary?.example || fallback.example,
      synonyms: unique([...(dictionary?.synonyms || []), ...relatedWords.slice(0, 5)]),
      antonyms: unique(dictionary?.antonyms || []),
      relatedWords: unique(relatedWords),
      confusingWords: unique([...fallback.confusingWords, ...similarWords.filter((item) => item.toLowerCase() !== word.toLowerCase())]),
      source: dictionary ? 'dictionaryapi.dev+datamuse' : fallback.source,
    }

    await writeCache(cacheKey, payload)

    return NextResponse.json({
      success: true,
      data: payload,
      cached: false,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '单词查询失败' },
      { status: 500 }
    )
  }
}
