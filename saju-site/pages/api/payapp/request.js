import { requestPayment } from '../../../lib/payapp';
import { setJSON, getJSON } from '../../../lib/redis';
import { getUid, authEnabled } from '../../../lib/auth';

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

    // 결제는 로그인한 사람만 (결제한 풀이를 보관함에 확실히 남기려고)
    const uid = await getUid(req, res);
    if (authEnabled() && !uid) {
      return res.status(401).json({ error: '결제하려면 로그인이 필요해요.', needLogin: true });
    }

    // 서버가 만들어 둔 풀이에 정해진 가격이 있으면 그 가격으로만 결제한다 (화면에서 보낸 가격은 믿지 않음)
    let payPrice = price;
    try {
      const saved = await getJSON(`payapp:stash:${orderId}`);
      if (saved && saved.meta && saved.meta.price) payPrice = saved.meta.price;
    } catch {}

    if (stash) {
      await setJSON(`payapp:stash:${orderId}`, stash, 60 * 60 * 24); // 24시간 보관
    }

    // 이 주문이 누구 건지 적어 두고, 결제가 끝나면 보관함에 영구 저장한다
    if (uid) {
      await setJSON(`payapp:owner:${orderId}`, { uid, goodname, price: payPrice }, 60 * 60 * 24 * 7);
    }

    const result = await requestPayment({ goodname, price: payPrice, recvphone: phoneDigits, orderId, returnPath });

    if (result.state !== '1') {
      return res.status(400).json({ error: result.errorMessage || '결제 요청에 실패했어요.' });
    }

    res.status(200).json({ payurl: result.payurl, mul_no: result.mul_no });
  } catch (e) {
    console.error('payapp request error', e);
    res.status(500).json({ error: '결제 요청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' });
  }
}
