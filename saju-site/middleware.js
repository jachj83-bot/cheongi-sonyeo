import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 사주아이처럼 들어오자마자 로그인부터. 로그인 안 했으면 /login으로 보낸다.
// 카카오·구글 키가 베르셀에 없으면 아무것도 막지 않는다.
// lib/auth.js의 authSecret()과 같은 값을 만든다 (미들웨어는 Web Crypto만 쓸 수 있음)
async function authSecret() {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;
  const t = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (!t) return '';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('cheongi-auth:' + t));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(req) {
  const hasProvider = !!(process.env.KAKAO_CLIENT_ID || (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET));
  if (!hasProvider) return NextResponse.next();
  const secret = await authSecret();
  if (!secret) return NextResponse.next();

  const token = await getToken({ req, secret });
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
