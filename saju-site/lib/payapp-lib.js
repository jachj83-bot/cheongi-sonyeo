// 페이앱(PayApp) 결제요청 REST API 헬퍼
// 공식 연동 매뉴얼 기준 (https://api.payapp.kr/oapi/apiLoad.html, cmd=payrequest)
// 필수 파라미터: userid, goodname, price, recvphone

const PAYAPP_API_URL = 'https://api.payapp.kr/oapi/apiLoad.html';

function getSiteUrl() {
  return process.env.SITE_URL || 'https://cheongi-sonyeo.vercel.app';
}

// orderId를 var1으로 실어 보내서, 결제 완료 통보(feedbackurl)가 올 때
// 어떤 주문 건인지 구분할 수 있게 한다.
async function requestPayment({ goodname, price, recvphone, orderId, returnPath }) {
  const userid = process.env.PAYAPP_USERID;
  if (!userid) throw new Error('PAYAPP_USERID 환경변수가 설정되어 있지 않습니다.');

  const siteUrl = getSiteUrl();
  const params = new URLSearchParams({
    cmd: 'payrequest',
    userid,
    goodname,
    price: String(price),
    recvphone,
    feedbackurl: `${siteUrl}/api/payapp/callback`,
    returnurl: `${siteUrl}${returnPath}`,
    var1: orderId,
    checkretry: 'y',
    smsuse: 'n',
  });

  const res = await fetch(PAYAPP_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const text = await res.text();
  return Object.fromEntries(new URLSearchParams(text));
}

module.exports = { requestPayment };
