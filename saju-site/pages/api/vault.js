import { getUid, authEnabled } from '../../lib/auth';
import { listJSON } from '../../lib/redis';
import { saveToVault } from '../../lib/vault';

// 보관함: 로그인한 사람이 본 풀이를 최대 50개까지 남긴다.
// GET → 목록(본문 제외) / GET ?id= → 하나 전체 / POST → 저장
export default async function handler(req, res) {
  if (!authEnabled()) return res.status(200).json({ enabled: false, items: [] });
  const uid = await getUid(req, res);
  if (!uid) return res.status(401).json({ error: '로그인이 필요해요.' });
  const key = `vault:${uid}`;

  try {
    if (req.method === 'GET') {
      const items = await listJSON(key);
      if (req.query.id) {
        const it = items.find(i => i.id === req.query.id);
        return it ? res.status(200).json(it) : res.status(404).json({ error: '없는 풀이예요.' });
      }
      return res.status(200).json({ enabled: true, items: items.map(({ text, ...rest }) => rest) });
    }
    if (req.method === 'POST') {
      const { kind, title, subtitle, input, gan, text } = req.body || {};
      if (!kind || !text) return res.status(400).json({ error: '저장할 내용이 없어요.' });
      const item = await saveToVault(uid, { kind, title, subtitle, input, gan, text });
      return res.status(200).json({ ok: true, id: item.id });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('vault api error', e);
    res.status(500).json({ error: '잠시 후 다시 시도해주세요.' });
  }
}
