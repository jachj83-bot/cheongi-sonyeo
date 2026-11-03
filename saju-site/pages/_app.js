import { Analytics } from '@vercel/analytics/react';

// 방문자 수를 베르셀 대시보드에서 바로 확인할 수 있게 해주는 코드.
// 결제 전환율을 계산하려면 "몇 명이 들어왔는지"를 먼저 알아야 해서 추가함.
export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
