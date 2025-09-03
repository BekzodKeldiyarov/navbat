import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware removed - access control is handled on the client side
  // Users can access /reservation and will see login form if no access token
  return NextResponse.next();
}

export const config = {
  matcher: [
    // No protected routes - access control is handled on client side
  ],
};
