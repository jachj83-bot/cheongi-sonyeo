import Head from 'next/head';
import { BUSINESS as B } from './business';

// 약관·개인정보처리방침·환불 규정이 함께 쓰는 틀
export default function PolicyPage({ title, children }) {
  return (
    <>
      <Head>
        <title>{`${title} | 천기소녀`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing:border-box; margin:0; padding:0; }
          body { background:#0B0A1F; color:#EDE9F2; font-family:'Noto Sans KR',sans-serif; word-break:keep-all; }
          .pol { max-width:720px; margin:0 auto; padding:28px 20px 60px; }
          .pol-top { display:flex; align-items:center; gap:8px; color:#E8C87E; text-decoration:none; font-family:'Noto Serif KR',serif; font-weight:700; letter-spacing:2px; margin-bottom:28px; }
          .pol h1 { font-family:'Noto Serif KR',serif; font-size:26px; color:#E8C87E; margin-bottom:6px; }
          .pol .date { font-size:12px; color:rgba(237,233,242,.4); margin-bottom:28px; }
          .pol h2 { font-size:16px; color:#EDE9F2; margin:28px 0 10px; }
          .pol p, .pol li, .pol td, .pol th { font-size:14px; line-height:1.85; color:rgba(237,233,242,.72); }
          .pol ul, .pol ol { padding-left:20px; }
          .pol table { width:100%; border-collapse:collapse; margin:8px 0; }
          .pol th, .pol td { border:1px solid rgba(232,200,126,.15); padding:8px 10px; text-align:left; vertical-align:top; font-size:13px; }
          .pol th { color:#E8C87E; background:rgba(232,200,126,.05); font-weight:500; }
          .pol .tbl { overflow-x:auto; }
          .pol nav { display:flex; gap:14px; flex-wrap:wrap; margin-top:36px; padding-top:18px; border-top:1px solid rgba(232,200,126,.1); }
          .pol nav a { color:rgba(237,233,242,.6); font-size:13px; }
        `}</style>
      </Head>
      <main className="pol">
        <a href="/" className="pol-top"><img src="/logo_symbol.png" alt="" width="24" height="24" />천기소녀</a>
        <h1>{title}</h1>
        <div className="date">시행일 {B.effectiveDate}</div>
        {children}
        <nav>
          <a href="/terms">이용약관</a>
          <a href="/privacy">개인정보처리방침</a>
          <a href="/refund">환불 규정</a>
        </nav>
      </main>
    </>
  );
}

// 문의처 한 줄 (이메일·전화 중 채워진 것만)
export function Contact() {
  const c = [B.email, B.phone].filter(Boolean).join(', ');
  return <>{c || '사이트 하단의 문의처'}</>;
}
