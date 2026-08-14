import { useState, useEffect } from 'react';
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

const LOADING_MESSAGES = [
  '천기소녀가 2026년의 기운을 읽고 있어요...',
  '병오년 세운과 사주를 맞춰보는 중이에요...',
  '거의 다 왔어요, 조금만 기다려주세요...',
];

export default function Sinnyeon() {
  const [step, setStep] = useState('input');
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '', gender: '', calendar: '양력' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); return; }
    const timer = setInterval(() => {
      setLoadingMsgIdx(i => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [loading]);

  const S = {
    input: { width: '100%', background: 'rgba(232,200,126,0.06)', border: '1px solid rgba(232,200,126,0.2)', borderRadius: '4px', padding: '14px 16px', color: '#EDE9F2', fontSize: '15px', outline: 'none', fontFamily: 'inherit' },
    selectBtn: (active) => ({ padding: '10px 6px', background: active ? 'rgba(232,200,126,0.15)' : 'rgba(232,200,126,0.04)', border: `1px solid ${active ? 'rgba(232,200,126,0.6)' : 'rgba(232,200,126,0.12)'}`, borderRadius: '4px', color: active ? '#E8C87E' : 'rgba(237,233,242,0.5)', cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: active ? '600' : '400', fontFamily: 'inherit' }),
    label: { display: 'block', fontSize: '11px', color: 'rgba(232,200,126,0.5)', marginBottom: '8px', letterSpacing: '2px' },
    select: { width: '100%', background: 'rgba(232,200,126,0.06)', border: '1px solid rgba(232,200,126,0.2)', borderRadius: '4px', padding: '14px 16px', color: '#EDE9F2', fontSize: '14px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' },
  };

  const handleSubmit = async () => {
    if (!form.name || !form.year || !form.month || !form.day || !form.gender || !form.hour) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setError(''); setLoading(true); setStep('result');
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sinnyeon', ...form })
      });
      const data = await res.json();
      setResult(data.result || '분석 결과를 불러올 수 없습니다.');
    } catch {
      setResult('잠시 후 다시 시도해주세요.');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>2026 신년운세 — 천기소녀</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Noto+Serif+KR:wght@300;400;700&family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0B0A1F; color: #EDE9F2; font-family: 'Noto Sans KR', sans-serif; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
          select option { background: #0B0A1F; color: #EDE9F2; }
        `}</style>
      </Head>

      <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(11,10,31,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(232,200,126,0.1)',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <img src="/logo_symbol.png" alt="천기소녀" style={{width:'26px',height:'26px',objectFit:'contain'}} />
          <div style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'17px',color:'#E8C87E',fontWeight:'600',letterSpacing:'2px'}}>천기소녀</div>
        </a>
        <div style={{fontSize:'12px',color:'rgba(232,200,126,0.5)',letterSpacing:'1px'}}>🐎 신년운세</div>
      </div>

      {step === 'input' && (
        <div style={{minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'480px',margin:'0 auto',padding:'40px 20px 80px'}}>
            <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>2026 병오년(丙午年)</div>
            <h2 style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'30px',fontWeight:'600',marginBottom:'8px',color:'#E8C87E',letterSpacing:'-0.5px'}}>올해 나의 운은<br/>어떻게 흘러갈까요</h2>
            <p style={{fontSize:'12px',color:'rgba(237,233,242,0.3)',marginBottom:'36px',letterSpacing:'1px'}}>생년월일시로 2026년 상반기·하반기 흐름을 자세히 풀어드려요</p>

            <div style={{marginBottom:'20px'}}>
              <label style={S.label}>이름</label>
              <input type="text" placeholder="홍길동" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={S.input}/>
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={S.label}>양력 / 음력</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {['양력','음력'].map(c=>(
                  <button key={c} onClick={()=>setForm({...form,calendar:c})} style={S.selectBtn(form.calendar===c)}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={S.label}>생년월일</label>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'8px'}}>
                {[['year','년','1995'],['month','월','07'],['day','일','21']].map(([k,l,p])=>(
                  <div key={k} style={{position:'relative'}}>
                    <input type="number" placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={S.input}/>
                    <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',fontSize:'12px',color:'rgba(232,200,126,0.3)'}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={S.label}>태어난 시간</label>
              <div style={{position:'relative'}}>
                <select value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})} style={S.select}>
                  <option value="" style={{background:'#0B0A1F'}}>시간을 선택하세요</option>
                  {HOURS.map(h=>(
                    <option key={h.value} value={h.value} style={{background:'#0B0A1F',color:'#EDE9F2'}}>
                      {h.label} · {h.desc}
                    </option>
                  ))}
                </select>
                <span style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(232,200,126,0.4)',pointerEvents:'none',fontSize:'12px'}}>▼</span>
              </div>
            </div>

            <div style={{marginBottom:'36px'}}>
              <label style={S.label}>성별</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {['남','여'].map(g=>(
                  <button key={g} onClick={()=>setForm({...form,gender:g})} style={{...S.selectBtn(form.gender===g),padding:'13px'}}>{g}자</button>
                ))}
              </div>
            </div>

            {error && <p style={{color:'#ff6b6b',fontSize:'13px',marginBottom:'16px',padding:'10px 14px',background:'rgba(255,107,107,0.08)',borderRadius:'4px'}}>⚠️ {error}</p>}

            <button onClick={handleSubmit} style={{width:'100%',background:'rgba(232,200,126,0.1)',color:'#E8C87E',padding:'16px',border:'1px solid rgba(232,200,126,0.4)',borderRadius:'2px',fontSize:'14px',fontWeight:'500',cursor:'pointer',letterSpacing:'2px',fontFamily:'inherit'}}>
              2026 신년운세 보기 →
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div style={{minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'600px',margin:'0 auto',padding:'32px 20px 80px'}}>
            <div style={{background:'rgba(232,200,126,0.05)',border:'1px solid rgba(232,200,126,0.15)',borderRadius:'4px',padding:'20px',marginBottom:'20px'}}>
              <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'20px',color:'#E8C87E',marginBottom:'4px'}}>{form.name}님의 2026 신년운세</h2>
              <p style={{color:'rgba(237,233,242,0.4)',fontSize:'13px'}}>병오년(丙午年) · {form.year}년 {form.month}월 {form.day}일생</p>
            </div>

            {loading ? (
              <div style={{textAlign:'center',padding:'60px 0'}}>
                <div style={{fontSize:'44px',marginBottom:'20px'}}>🐎</div>
                <p style={{fontSize:'15px',color:'rgba(232,200,126,0.6)'}}>{LOADING_MESSAGES[loadingMsgIdx]}</p>
              </div>
            ) : (
              <>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',marginBottom:'20px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap',color:'#EDE9F2'}}>
                  {result}
                </div>

                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>{setStep('input');setResult('');}} style={{flex:1,background:'rgba(232,200,126,0.1)',color:'#E8C87E',padding:'14px',border:'1px solid rgba(232,200,126,0.3)',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
                    다시 보기
                  </button>
                  <a href="/" style={{flex:1,textAlign:'center',background:'none',color:'rgba(237,233,242,0.4)',padding:'14px',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'4px',fontSize:'14px',textDecoration:'none'}}>
                    처음으로
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
