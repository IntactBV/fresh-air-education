import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // public
  if (
    pathname.startsWith("/autentificare") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/resetare-parola") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // doar rutele protejate ajung mai jos
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tutore") ||
    pathname.startsWith("/edu")
  ) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/autentificare", request.url));
    }

  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/tutore/:path*", "/edu/:path*", "/resetare-parola"],
};
