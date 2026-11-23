import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 무료(첫 화면·무료 사주·궁합 점수·타로)는 로그인 없이 바로 쓰고,
// 유료 상품 페이지(신년운세·이번 달 운세·토정비결·통합분석)만 로그인한 뒤 들어오게 한다.
// 결제한 풀이를 보관함에 확실히 남기려고. 카카오·구글 키가 베르셀에 없으면 아무것도 막지 않는다.
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

export const config = {
  matcher: ['/sinnyeon/:path*', '/wolun/:path*', '/tojeong/:path*', '/tonghap/:path*'],
};
