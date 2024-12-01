import { NextResponse } from 'next/server'

export async function middleware() {
  const res = NextResponse.next()

  return res
}

export const config = {
  matcher: [],
}
