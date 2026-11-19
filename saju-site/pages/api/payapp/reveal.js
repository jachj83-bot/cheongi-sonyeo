import { getJSON, setJSON } from '../../../lib/redis';
import { saveToVault } from '../../../lib/vault';

// 결제 완료 여부 확인 + 결제 전에 미리 저장해둔 콘텐츠(stash) 반환.
// 클라이언트는 결제창으로 이동했다가 returnurl로 돌아온 뒤, orderId로
// 이 API를 짧은 간격으로 폴링해서 결제완료 통보(callback.js)가 도착했는지 확인한다.
// 로그인한 사람의 주문이면 결제된 풀이를 보관함에 한 번 저장해서 24시간이 지나도 다시 볼 수 있게 한다.
export default async function handler(req, res) {
  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: 'orderId가 필요합니다.' });

  try {
    const paidInfo = await getJSON(`payapp:paid:${orderId}`);
    if (!paidInfo || !paidInfo.paid) {
      return res.status(402).json({ paid: false });
    }
    const stash = await getJSON(`payapp:stash:${orderId}`);

    try {
      const owner = await getJSON(`payapp:owner:${orderId}`);
      if (owner?.uid && stash?.full && !(await getJSON(`payapp:saved:${orderId}`))) {
        const m = stash.meta || {};
        const who = m.name ? `${m.name}님` : '';
        await saveToVault(owner.uid, {
          kind: 'paid',
          title: owner.goodname || '유료 풀이',
          subtitle: [who, m.year ? `${m.year}.${m.month}.${m.day}생` : ''].filter(Boolean).join(' · '),
          input: m,
          text: stash.full,
          paid: true,
        });
        await setJSON(`payapp:saved:${orderId}`, true, 60 * 60 * 24 * 7);
      }
    } catch (e) {
      console.error('vault save after payment failed', e);
    }

    res.status(200).json({ paid: true, stash });
  } catch (e) {
    console.error('payapp reveal error', e);
    res.status(500).json({ error: '결제 확인 중 오류가 발생했어요.' });
  }
}
