import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';

interface AuthToken {
  isAdmin?: boolean;
  adminData?: {
    company_id: string;
  };
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect dashboard routes
  if (path.startsWith('/dashboard')) {
    const token = await getToken({ req: request }) as AuthToken | null;

    if (!token) {
      const signInUrl = new URL(ROUTES.AUTH.SIGNIN, request.url);
      signInUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
