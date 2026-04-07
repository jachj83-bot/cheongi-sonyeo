import { useState } from 'react';
import Head from 'next/head';

export default function Gunghap() {
  const [me, setMe] = useState({ year: '', month: '', day: '', calendar: '양력' });
  const [partner, setPartner] = useState({ year: '', month: '', day: '', calendar: '양력' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!me.year || !me.month || !me.day || !partner.year || !partner.month || !partner.day) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gunghap', me, partner })
      });
      const data = await res.json();
      setResult(data.result);
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  const inp = { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'14px 16px', color:'#e8e0d0', fontSize:'15px', outline:'none' };

  const PersonForm = ({ title, color, data, setter }) => (
    <div style={{background:'rgba(255,255,255,0.03)',border:`1.5px solid ${color}30`,borderRadius:'16px',padding:'20px',marginBottom:'12px'}}>
      <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'16px',color:color}}>{title}</div>

      <div style={{marginBottom:'14px'}}>
        <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>양력 / 음력</label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          {['양력','음력'].map(c=>(
            <button key={c} onClick={()=>setter({...data,calendar:c})}
              style={{padding:'11px',background:data.calendar===c?`${color}20`:'rgba(255,255,255,0.05)',border:`1.5px solid ${data.calendar===c?color:'rgba(255,255,255,0.1)'}`,borderRadius:'10px',color:data.calendar===c?color:'rgba(232,224,208,0.6)',fontSize:'14px',cursor:'pointer',fontWeight:data.calendar===c?'700':'400'}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>생년월일</label>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'8px'}}>
          {[['year','년','1995'],['month','월','03'],['day','일','15']].map(([k,l,p])=>(
            <div key={k} style={{position:'relative'}}>
              <input type="number" placeholder={p} value={data[k]} onChange={e=>setter({...data,[k]:e.target.value})} style={inp}/>
              <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',fontSize:'12px',color:'rgba(232,224,208,0.3)'}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>궁합 분석 — 천기소녀</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #080b14; color: #e8e0d0; font-family: -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; } input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }`}</style>
      </Head>

      <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(8,11,20,0.95)',backdropFilter:'blur(10px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <a href="/" style={{color:'#FFE000',fontSize:'18px',fontWeight:'bold',textDecoration:'none',letterSpacing:'-0.5px'}}>🔮 천기소녀</a>
        <div style={{fontSize:'14px',color:'rgba(232,224,208,0.5)'}}>💑 궁합 분석</div>
      </div>

      <div style={{padding:'28px 20px 80px',maxWidth:'480px',margin:'0 auto'}}>
        <h2 style={{fontSize:'24px',fontWeight:'800',marginBottom:'8px',letterSpacing:'-0.5px'}}>궁합 분석</h2>
        <p style={{fontSize:'14px',color:'rgba(232,224,208,0.45)',marginBottom:'28px',lineHeight:'1.7'}}>두 사람의 사주로 궁합을 분석해드려요</p>

        <PersonForm title="💛 나의 생년월일" color="#FFE000" data={me} setter={setMe} />
        <PersonForm title="💜 상대방 생년월일" color="#9b7ee8" data={partner} setter={setPartner} />

        {error && <p style={{color:'#ff6b6b',fontSize:'13px',marginBottom:'16px',padding:'10px 14px',background:'rgba(255,107,107,0.08)',borderRadius:'8px'}}>⚠️ {error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          style={{width:'100%',background:loading?'rgba(200,150,42,0.5)':'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'16px',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:loading?'default':'pointer',letterSpacing:'-0.3px',marginBottom:'24px'}}>
          {loading ? '🔮 분석 중...' : '궁합 분석하기 💑'}
        </button>

        {loading && (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>🔮</div>
            <p style={{fontSize:'16px',color:'rgba(232,224,208,0.6)'}}>천기소녀가 두 사람의 기운을 읽고 있어요...</p>
          </div>
        )}

        {result && !loading && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'24px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap'}}>
            {result}
          </div>
        )}
      </div>

      <div style={{textAlign:'center',padding:'32px 20px',borderTop:'1px solid rgba(255,255,255,0.05)',color:'rgba(232,224,208,0.2)',fontSize:'12px'}}>© 2026 천기소녀 · AI 사주 분석</div>
    </>
  );
}
