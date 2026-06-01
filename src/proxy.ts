import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { ROLE_WEIGHT } from "@/lib/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/setup")) {
    return NextResponse.next();
  }

  if (request.headers.has("x-middleware-subrequest")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!token.role || ROLE_WEIGHT[token.role] < ROLE_WEIGHT.MODERATOR) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
