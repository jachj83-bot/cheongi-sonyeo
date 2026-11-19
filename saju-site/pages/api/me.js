import { getUid, authEnabled } from '../../lib/auth';
import { getJSON, setJSON, delKeys } from '../../lib/redis';

// 내 정보: GET 불러오기 / POST 생년월일 저장 / DELETE 회원 탈퇴(정보와 보관함 모두 삭제)
export default async function handler(req, res) {
  if (!authEnabled()) return res.status(200).json({ enabled: false });
  const uid = await getUid(req, res);
  if (!uid) return res.status(401).json({ error: '로그인이 필요해요.' });
  const key = `user:${uid}`;

  try {
    if (req.method === 'GET') {
      const u = (await getJSON(key)) || {};
      return res.status(200).json({ enabled: true, uid, name: u.name || '', birth: u.birth || null, createdAt: u.createdAt || null });
    }
    if (req.method === 'POST') {
      const { name, year, month, day, hour, gender, calendar } = req.body || {};
      if (!year || !month || !day) return res.status(400).json({ error: '생년월일이 필요해요.' });
      const u = (await getJSON(key)) || { uid, createdAt: new Date().toISOString() };
      u.birth = { name: String(name || '').slice(0, 20), year, month, day, hour: hour || '모름', gender: gender || '', calendar: calendar || '양력' };
      await setJSON(key, u);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      await delKeys(key, `vault:${uid}`);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('me api error', e);
    res.status(500).json({ error: '잠시 후 다시 시도해주세요.' });
  }
}
