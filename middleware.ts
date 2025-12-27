import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  
  // 如果是移动端访问桌面端页面，重定向到移动端
  if (isMobile) {
    const { pathname } = request.nextUrl
    
    // 移动端重定向映射
    const mobileRedirects: { [key: string]: string } = {
      '/': '/mobile',
      '/dashboard': '/mobile-dashboard',
      '/study': '/mobile-study',
      '/growth-starmap': '/mobile-growth-starmap'
    }
    
    // 如果有对应的移动端页面，进行重定向
    if (mobileRedirects[pathname]) {
      const url = request.nextUrl.clone()
      url.pathname = mobileRedirects[pathname]
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - mobile (already mobile pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|mobile).*)',
  ],
}