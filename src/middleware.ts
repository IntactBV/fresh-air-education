import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { getCookieCache } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
  const session = await getCookieCache(request);

  console.log('session cookie', sessionCookie);
  console.log('session', session);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
	// if (!sessionCookie) {
	// 	return NextResponse.redirect(new URL("/", request.url));
	// }

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next();
}
export const config = {
	matcher: ["/admin"], // Specify the routes the middleware applies to
};