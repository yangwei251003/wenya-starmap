export interface RssItem {
  title: string
  link: string
  description: string
  pubDate?: string
}

export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link'),
      description: stripCdata(extractTag(itemXml, 'description')),
      pubDate: extractTag(itemXml, 'pubDate') || undefined,
    })
  }

  return items
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? decodeXml(stripCdata(match[1])) : ''
}

function stripCdata(value: string): string {
  return value.replace(/^<!\[CDATA\[/i, '').replace(/\]\]>$/i, '').trim()
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
