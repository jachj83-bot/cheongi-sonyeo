import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth/next';
import { createHash } from 'crypto';
import { getJSON, setJSON } from './redis';

// 카카오·구글 키가 베르셀에 하나라도 등록돼야 로그인이 켜진다.
// 키가 없으면 지금처럼 로그인 없이 동작한다 (배포해도 사이트가 막히지 않게).
export const hasKakao = () => !!(process.env.KAKAO_CLIENT_ID);
export const hasGoogle = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
// 로그인 쿠키를 잠그는 비밀값. NEXTAUTH_SECRET을 따로 안 넣어도 되도록, 이미 베르셀에 있는
// 저장소 토큰에서 만들어 쓴다 (middleware.js도 같은 방식으로 만든다).
const storeToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const authSecret = () => process.env.NEXTAUTH_SECRET || (storeToken() ? createHash('sha256').update('cheongi-auth:' + storeToken()).digest('hex') : '');
export const authEnabled = () => !!authSecret() && (hasKakao() || hasGoogle());

const providers = [];
if (hasKakao()) {
  providers.push(KakaoProvider({
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  }));
}
if (hasGoogle()) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

export const authOptions = {
  providers,
  secret: authSecret(),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 90 }, // 90일 동안 로그인 유지
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.uid = `${account.provider}:${account.providerAccountId}`;
        token.provider = account.provider;
        const nick = profile?.properties?.nickname || profile?.kakao_account?.profile?.nickname || profile?.name || token.name;
        if (nick) token.name = nick;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { ...(session.user || {}), uid: token.uid, provider: token.provider, name: token.name || session.user?.name || '' };
      return session;
    },
  },
  events: {
    // 처음 로그인하면 회원 정보를 만들고, 다시 오면 마지막 접속 시각만 갱신
    async signIn({ user, account, profile }) {
      try {
        const uid = `${account.provider}:${account.providerAccountId}`;
        const key = `user:${uid}`;
        const prev = (await getJSON(key)) || { createdAt: new Date().toISOString() };
        const nick = profile?.properties?.nickname || profile?.kakao_account?.profile?.nickname || user?.name || '';
        await setJSON(key, { ...prev, uid, provider: account.provider, name: nick, email: user?.email || prev.email || '', lastLoginAt: new Date().toISOString() });
      } catch (e) {
        console.error('signIn event error', e);
      }
    },
  },
};

// API에서 로그인한 사람의 uid를 꺼낸다. 로그인이 꺼져 있거나 안 했으면 null.
export async function getUid(req, res) {
  if (!authEnabled()) return null;
  try {
    const s = await getServerSession(req, res, authOptions);
    return s?.user?.uid || null;
  } catch {
    return null;
  }
}
