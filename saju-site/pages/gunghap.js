import { useState } from 'react';
import Head from 'next/head';

export default function Gunghap() {
  const [me, setMe] = useState({ year: '', month: '', day: '' });
  const [partner, setPartner] = useState({ year: '', month: '', day: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!me.year || !partner.year) return;
    setLoading(true);
    const res = await fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'gunghap', me, partner })
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <>
      <Head><title>궁합 분석 — 천기소녀</title></Head>
      <div style={{minHeight:'100vh',background:'#080b14',color:'#e8e0d0',fontFamily:'sans-serif'}}>
        <div style={{padding:'20px 32px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" style={{color:'#FFE000',fontSize:'20px',fontWeight:'bold',textDecoration:'none'}}>🔮 천기소녀</a>
        </div>
        <div style={{maxWidth:'560px',margin:'0 auto',padding:'60px 24px'}}>
          <h2 style={{fontSize:'28px',fontWeight:'bold',marginBottom:'8px'}}>궁합 분석</h2>
          <p style={{color:'rgba(232,224,208,0.5)',fontSize:'14px',marginBottom:'40px'}}>두 사람의 사주로 궁합을 분석해드려요</p>

          {[['나의 생년월일',me,setMe],['상대방 생년월일',partner,setPartner]].map(([label,val,setter],i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'24px',marginBottom:'16px'}}>
              <div style={{fontSize:'14px',fontWeight:'bold',marginBottom:'16px',color:i===0?'#FFE000':'rgba(232,224,208,0.8)'}}>{label}</div>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'10px'}}>
                {[['year','년','1995'],['month','월','03'],['day','일','15']].map(([k,l,p])=>(
                  <div key={k}>
                    <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'6px'}}>{l}</label>
                    <input type="number" placeholder={p} value={val[k]} onChange={e=>setter({...val,[k]:e.target.value})}
                      style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'8px',padding:'10px',color:'#e8e0d0',fontSize:'14px',outline:'none'}}/>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={handleSubmit} style={{width:'100%',background:'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'16px',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'bold',cursor:'pointer',marginTop:'8px'}}>
            궁합 분석하기 💑
          </button>

          {loading && <div style={{textAlign:'center',padding:'40px',fontSize:'18px'}}>🔮 분석 중...</div>}
          {result && !loading && (
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'28px',marginTop:'24px',lineHeight:'1.9',whiteSpace:'pre-wrap'}}>
              {result}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
