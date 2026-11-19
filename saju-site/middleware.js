import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 사주아이처럼 들어오자마자 로그인부터. 로그인 안 했으면 /login으로 보낸다.
// 카카오·구글 키와 NEXTAUTH_SECRET이 베르셀에 없으면 아무것도 막지 않는다.
export async function middleware(req) {
  const enabled = !!process.env.NEXTAUTH_SECRET && !!(process.env.KAKAO_CLIENT_ID || (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET));
  if (!enabled) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  const url = req.nextUrl.clone();
  const back = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = '/login';
  url.search = back && back !== '/' ? `?callbackUrl=${encodeURIComponent(back)}` : '';
  return NextResponse.redirect(url);
}

// 로그인 화면, 약관·개인정보·환불, API, 이미지 같은 정적 파일은 로그인 없이 열린다
export const config = {
  matcher: ['/((?!api|_next|login|terms|privacy|refund|favicon|robots|sitemap|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|json|mp4)$).*)'],
};
