import { requestPayment } from '../../../lib/payapp';
import { setJSON } from '../../../lib/redis';

// 결제 요청 생성.
// orderId는 클라이언트에서 미리 만들어 보낸다 (crypto.randomUUID()).
// stash가 있으면 결제 완료 후 돌려받을 데이터(사주 전체 풀이, 채팅 질문 등)를
// 미리 Redis에 저장해둔다 — 결제 완료 시점엔 이미 만들어져 있던 콘텐츠를 꺼내 쓰는 구조.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId, goodname, price, recvphone, returnPath, stash } = req.body || {};

    if (!orderId || !goodname || !price || !recvphone || !returnPath) {
      return res.status(400).json({ error: '필수 값이 없습니다.' });
    }

    const phoneDigits = String(recvphone).replace(/[^0-9]/g, '');
    if (phoneDigits.length < 9) {
      return res.status(400).json({ error: '휴대폰번호를 정확히 입력해주세요.' });
    }

    if (stash) {
      await setJSON(`payapp:stash:${orderId}`, stash, 60 * 60 * 24); // 24시간 보관
    }

    const result = await requestPayment({ goodname, price, recvphone: phoneDigits, orderId, returnPath });

    if (result.state !== '1') {
      return res.status(400).json({ error: result.errorMessage || '결제 요청에 실패했어요.' });
    }

    res.status(200).json({ payurl: result.payurl, mul_no: result.mul_no });
  } catch (e) {
    console.error('payapp request error', e);
    res.status(500).json({ error: '결제 요청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' });
  }
}
