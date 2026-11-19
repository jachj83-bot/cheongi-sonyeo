import NextAuth from 'next-auth';
import { authOptions, authEnabled } from '../../../lib/auth';

const handler = NextAuth(authOptions);

export default function auth(req, res) {
  if (!authEnabled()) {
    // 키가 아직 없으면 로그인 기능 자체를 꺼 둔다
    if (req.query.nextauth?.[0] === 'session') return res.status(200).json({});
    return res.status(404).json({ error: '로그인 준비 중이에요.' });
  }
  return handler(req, res);
}
