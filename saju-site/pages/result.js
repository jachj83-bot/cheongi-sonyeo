import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Result() {
  const router = useRouter();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const { name, year, month, day, gender } = router.query;
    if (!name) return;

    fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, year, month, day, gender })
    })
      .then(r => r.json())
      .then(data => {
        setResult(data.result || '분석 결과를 불러올 수 없습니다.');
        setLoading(false);
      })
      .catch(() => {
        setResult('잠시 후 다시 시도해주세요.');
        setLoading(false);
      });
  }, [router.isReady]);

  const { name, year, month, day } = router.query;

  return (
    <>
      <Head><title>사주 결과 — 천기소녀</title></Head>
      <div style={{minHeight:'100vh',background:'#080b14',color:'#e8e0d0',fontFamily:'sans-serif'}}>
        <div style={{padding:'20px 32px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" style={{color:'#FFE000',fontSize:'20px',fontWeight:'bold',textDecoration:'none'}}>🔮 천기소녀</a>
        </div>

        <div style={{maxWidth:'680px',margin:'0 auto',padding:'60px 24px'}}>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'24px',marginBottom:'24px'}}>
            <h2 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'8px'}}>{name}님의 사주</h2>
            <p style={{color:'rgba(232,224,208,0.5)',fontSize:'14px'}}>{year}년 {month}월 {day}일생</p>
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:'48px',marginBottom:'20px'}}>🔮</div>
              <p style={{fontSize:'18px'}}>천기소녀가 사주를 읽고 있어요...</p>
            </div>
          ) : (
            <>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'28px',marginBottom:'24px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap'}}>
                {result}
              </div>

              <div style={{background:'rgba(255,224,0,0.05)',border:'1px solid rgba(255,224,0,0.2)',borderRadius:'16px',padding:'28px',textAlign:'center'}}>
                <h3 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'12px'}}>더 깊은 분석이 궁금하신가요?</h3>
                <p style={{color:'rgba(232,224,208,0.6)',fontSize:'14px',marginBottom:'24px'}}>일주 상세분석 · 궁합 분석 · AI 리포트 PDF</p>
                <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
                  <button style={{background:'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'12px 28px',border:'none',borderRadius:'50px',fontSize:'15px',fontWeight:'bold',cursor:'pointer'}}>일주 상세분석 ₩9,900</button>
                  <button style={{background:'rgba(255,255,255,0.08)',color:'#e8e0d0',padding:'12px 28px',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'50px',fontSize:'15px',cursor:'pointer'}}>궁합 분석 ₩14,900</button>
                </div>
              </div>

              <button onClick={() => router.push('/')} style={{width:'100%',marginTop:'16px',background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(232,224,208,0.6)',padding:'14px',borderRadius:'12px',fontSize:'14px',cursor:'pointer'}}>처음으로 돌아가기</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
