import { auth } from '@/app/auth'

export default auth((req) => {
  // auth() verifies the token and handles redirects automatically
  // via authConfig.callbacks.authorized()
})

export const config = {
  matcher: [
    // Match all routes except api, _next/static, _next/image, favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
