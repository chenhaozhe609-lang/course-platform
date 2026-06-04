import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16：原 middleware 更名为 proxy，约定与功能一致。
// 这里只做「乐观校验」——仅判断 session cookie 是否存在，
// 真正的身份/权限校验由页面与 DAL（getCurrentUser）在数据源处完成。

const PROTECTED_PREFIXES = ["/me", "/courses/new", "/reviews"];
const AUTH_PAGES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("session")?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
