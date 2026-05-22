export function extractJsonText(raw: string): string | null {
  if (!raw) return null

  const trimmed = raw.trim()
  const fenceStripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  try {
    JSON.parse(fenceStripped)
    return fenceStripped
  } catch {
    const start = fenceStripped.indexOf('{')
    const end = fenceStripped.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) {
      return null
    }

    const candidate = fenceStripped.slice(start, end + 1)
    try {
      JSON.parse(candidate)
      return candidate
    } catch {
      return null
    }
  }
}
