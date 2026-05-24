export function GET() {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#07111f"/>
    <path d="M32 50V31" stroke="#00f5a0" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 31c-9 0-15-6-16-15 9 1 15 7 16 15Z" fill="#00f5a0"/>
    <path d="M32 31c9 0 15-6 16-15-9 1-15 7-16 15Z" fill="#fde047"/>
    <circle cx="47" cy="13" r="3" fill="#fde047"/>
    <circle cx="16" cy="48" r="2" fill="#dffdf3"/>
  </svg>`

  return new Response(icon, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
