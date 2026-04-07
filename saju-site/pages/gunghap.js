import { useState } from 'react';
import Head from 'next/head';

const HOURS = [
  { label: '자시', desc: '23:30~01:30', value: '자시' },
  { label: '축시', desc: '01:30~03:30', value: '축시' },
  { label: '인시', desc: '03:30~05:30', value: '인시' },
  { label: '묘시', desc: '05:30~07:30', value: '묘시' },
  { label: '진시', desc: '07:30~09:30', value: '진시' },
  { label: '사시', desc: '09:30~11:30', value: '사시' },
  { label: '오시', desc: '11:30~13:30', value: '오시' },
  { label: '미시', desc: '13:30~15:30', value: '미시' },
  { label: '신시', desc: '15:30~17:30', value: '신시' },
  { label: '유시', desc: '17:30~19:30', value: '유시' },
  { label: '술시', desc: '19:30~21:30', value: '술시' },
  { label: '해시', desc: '21:30~23:30', value: '해시' },
  { label: '모름', desc: '시간 불명', value: '모름' },
];

const PersonForm = ({ title, color, data, setter }) => (
  <div style={{background:'rgba(255,255,255,0.03)',border:`1.5px solid ${color}30`,borderRadius:'16px',padding:'20px',marginBottom:'12px'}}>
    <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'16px',color}}>{title}</div>

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

    <div style={{marginBottom:'14px'}}>
      <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>생년월일</label>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'8px'}}>
        {[['year','년','1995'],['month','월','03'],['day','일','15']].map(([k,l,p])=>(
          <div key={k} style={{position:'relative'}}>
            <input type="number" placeholder={p} value={data[k]} onChange={e=>setter({...data,[k]:e.target.value})}
              style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'14px 16px',color:'#e8e0d0',fontSize:'15px',outline:'none'}}/>
            <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',fontSize:'12px',color:'rgba(232,224,208,0.3)'}}>{l}</span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>태어난 시간</label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
        {HOURS.map(h=>(
          <button key={h.value} onClick={()=>setter({...data,hour:h.value})}
            style={{padding:'10px 6px',background:data.hour===h.value?`${color}20`:'rgba(255,255,255,0.04)',border:`1.5px solid ${data.hour===h.value?color:'rgba(255,255,255,0.08)'}`,borderRadius:'10px',color:data.hour===h.value?color:'rgba(232,224,208,0.65)',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:'13px',fontWeight:data.hour===h.value?'700':'400'}}>{h.label}</div>
            <div style={{fontSize:'10px',color:data.hour===h.value?`${color}90`:'rgba(232,224,208,0.3)',marginTop:'2px'}}>{h.desc}</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default function Gunghap() {
  const [me, setMe] = useState({ year:'', month:'', day:'', hour:'', calendar:'양력' });
  const [partner, setPartner] = useState({ year:'', month:'', day:'', hour:'', calendar:'양력' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!me.year||!me.month||!me.day||!partner.year||!partner.month||!partner.day) {
      setError('생년월일을 모두 입력해주세요.');
      return;
    }
    setError(''); setLoading(true); setResult('');
    try {
      const res = await fetch('/api/saju', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({type:'gunghap',me,partner})
      });
      const data = await res.json();
      setResult(data.result);
    } catch { setError('오류가 발생했습니다. 다시 시도해주세요.'); }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>궁합 분석 — 천기소녀</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#080b14;color:#e8e0d0;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}`}</style>
      </Head>

      <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(8,11,20,0.95)',backdropFilter:'blur(10px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <a href="/" style={{color:'#FFE000',fontSize:'18px',fontWeight:'bold',textDecoration:'none'}}>🔮 천기소녀</a>
        <div style={{fontSize:'14px',color:'rgba(232,224,208,0.5)'}}>💑 궁합</div>
      </div>

      <div style={{padding:'28px 20px 80px',maxWidth:'480px',margin:'0 auto'}}>
        <h2 style={{fontSize:'24px',fontWeight:'800',marginBottom:'8px',letterSpacing:'-0.5px'}}>궁합 분석</h2>
        <p style={{fontSize:'14px',color:'rgba(232,224,208,0.45)',marginBottom:'28px',lineHeight:'1.7'}}>두 사람의 사주로 궁합을 분석해드려요</p>

        <PersonForm title="💛 나의 정보" color="#FFE000" data={me} setter={setMe} />
        <PersonForm title="💜 상대방 정보" color="#9b7ee8" data={partner} setter={setPartner} />

        {error && <p style={{color:'#ff6b6b',fontSize:'13px',marginBottom:'16px',padding:'10px 14px',background:'rgba(255,107,107,0.08)',borderRadius:'8px'}}>⚠️ {error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          style={{width:'100%',background:loading?'rgba(200,150,42,0.5)':'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'16px',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:loading?'default':'pointer',marginBottom:'24px'}}>
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
