import { NextRequest, NextResponse } from 'next/server'

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
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const word = searchParams.get('word')?.trim()

    if (!word) {
      return NextResponse.json({ error: 'word is required' }, { status: 400 })
    }

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到单词释义',
          fallback: true,
        },
        { status: response.status === 404 ? 404 : 502 }
      )
    }

    const data = (await response.json()) as DictionaryEntry[]
    const entry = data[0]

    const primaryMeaning = entry?.meanings?.[0]
    const primaryDefinition = primaryMeaning?.definitions?.[0]
    const audio = entry?.phonetics?.find(item => item.audio)?.audio || ''

    return NextResponse.json({
      success: true,
      data: {
        word: entry?.word || word,
        phonetic: entry?.phonetic || entry?.phonetics?.find(item => item.text)?.text || '',
        audioUrl: audio,
        partOfSpeech: primaryMeaning?.partOfSpeech || '',
        definition: primaryDefinition?.definition || '',
        example: primaryDefinition?.example || '',
        synonyms: primaryDefinition?.synonyms || [],
        antonyms: primaryDefinition?.antonyms || [],
        raw: entry,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '单词查询失败' },
      { status: 500 }
    )
  }
}
