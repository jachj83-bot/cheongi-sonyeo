import { setJSON } from '../../../lib/redis';

// 페이앱 결제통보(feedbackurl). 페이앱 서버가 결제 완료 시 이 주소로 직접
// POST를 보낸다 (사용자 브라우저를 거치지 않음).
//
// 검증: 판매자 관리 사이트 "설정" 탭의 "연동 VALUE" 값(PAYAPP_LINKVAL)과
// 통보로 전달되는 linkval이 일치할 때만 정상 호출로 간주한다.
// (페이앱 공식 연동 매뉴얼 2.4 결제통보 항목 기준)
//
// 응답은 반드시 순수 문자열 "SUCCESS" 여야 페이앱이 정상 처리로 인식한다.
// 그렇지 않으면 최대 10회까지 재시도하므로, 실패 상황에서도 200 + SUCCESS로
// 응답해서 불필요한 재시도 폭주를 막는다 (검증 실패 건은 저장만 하지 않는다).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(200).send('SUCCESS');
    return;
  }

  const body = req.body || {};
  const { userid, linkval, pay_state, mul_no, price, var1 } = body;

  const expectedUserid = process.env.PAYAPP_USERID;
  const expectedLinkval = process.env.PAYAPP_LINKVAL;
  const verified = expectedUserid && expectedLinkval && userid === expectedUserid && linkval === expectedLinkval;

  if (!verified) {
    console.error('페이앱 콜백 검증 실패 (userid/linkval 불일치)', { userid, mul_no, var1 });
    res.status(200).send('SUCCESS');
    return;
  }

  try {
    // pay_state: 1=요청, 4=결제완료, 8/16/32=요청취소, 9/64=승인취소, 10=결제대기, 70/71=부분취소
    if (var1 && pay_state === '4') {
      await setJSON(`payapp:paid:${var1}`, {
        paid: true,
        mul_no,
        price,
        paidAt: new Date().toISOString(),
      }, 60 * 60 * 24);
    }
  } catch (e) {
    console.error('payapp callback redis error', e);
  }

  res.status(200).send('SUCCESS');
}
