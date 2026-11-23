import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PageHero from '../lib/PageHero';

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

// 이번 달 나의 운세는? (1,900원) — 신년운세와 같은 흐름: 무료 미리보기 → 결제 → 전체 보기
const LOADING = [
  '천기소녀가 이번 달 기운을 읽고 있어요...',
  '날짜마다 일진을 하나씩 맞춰보는 중이에요...',
  '좋은 날과 조심할 날을 고르고 있어요...',
];

const PRICE = 1900;
// 21일부터는 다음 달 운세를 보여준다 (서버와 같은 규칙)
const thisMonth = () => { const k = new Date(Date.now() + 9 * 3600000); const m = k.getUTCMonth() + 1; return k.getUTCDate() >= 21 ? (m % 12) + 1 : m; };

function makeOrderId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'ord-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

export default function Wolun() {
  const router = useRouter();
  const [step, setStep] = useState('input');
  const [mon, setMon] = useState(null);
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '', gender: '', calendar: '양력' });
  const [result, setResult] = useState('');
  const [preview, setPreview] = useState('');
  const [locked, setLocked] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); return; }
    const timer = setInterval(() => {
      setLoadingMsgIdx(i => Math.min(i + 1, LOADING.length - 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [loading]);

  // 달 이름은 화면이 뜬 뒤에 정한다 (미리 만든 페이지와 날짜가 달라도 어긋나지 않게)
  useEffect(() => { setMon(thisMonth()); }, []);

  // 무료 결과 화면에서 넘어오면 생년월일을 채워 두고, 로그인했으면 저장된 생년월일을 쓴다
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.year && q.month && q.day) {
      setForm(f => ({ ...f, name: q.name || f.name, year: q.year, month: q.month, day: q.day, hour: q.hour || f.hour, gender: q.gender || f.gender, calendar: q.calendar || f.calendar }));
      return;
    }
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d && d.birth) setForm(f => (f.year ? f : { ...f, ...d.birth }));
    }).catch(() => {});
  }, [router.isReady]);

  // 결제창에서 돌아왔을 때 (returnurl에 orderId가 붙어서 돌아옴) 결제 확인 폴링
  useEffect(() => {
    if (!router.isReady) return;
    const oid = router.query.orderId;
    if (!oid) return;
    setOrderId(oid);
    setStep('result');
    setRestoring(true);
    pollReveal(oid, 0);
  }, [router.isReady]);

  const pollReveal = async (oid, attempt) => {
    try {
      const res = await fetch('/api/payapp/reveal?orderId=' + encodeURIComponent(oid));
      if (res.status === 200) {
        const data = await res.json();
        if (data.paid && data.stash) {
          setResult(data.stash.full || '');
          setLocked(false);
          if (data.stash.meta) {
            const { target, ...rest } = data.stash.meta;
            setForm(f => ({ ...f, ...rest }));
            if (target) setMon(parseInt(String(target).split('-')[1], 10) || thisMonth());
          }
          setRestoring(false);
          return;
        }
      }
    } catch {}
    if (attempt < 20) {
      setTimeout(() => pollReveal(oid, attempt + 1), 1500);
    } else {
      setRestoring(false);
      setPayError('결제 확인이 늦어지고 있어요. 잠시 후 새로고침 해주세요.');
    }
  };

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
    const oid = makeOrderId();
    setOrderId(oid);
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'wolun', ...form, orderId: oid })
      });
      const data = await res.json();
      if (data.target?.month) setMon(data.target.month);
      if (data.locked) {
        setPreview(data.preview || '');
        setLocked(true);
      } else {
        setResult(data.full || data.preview || '분석 결과를 불러올 수 없습니다.');
        setLocked(false);
      }
      setLoading(false);
    } catch {
      setResult('잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const startPayment = async () => {
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 9) {
      setPayError('휴대폰번호를 정확히 입력해주세요.');
      return;
    }
    setPaying(true); setPayError('');
    try {
      const res = await fetch('/api/payapp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          goodname: `${mon || thisMonth()}월 나의 운세 전체보기`,
          price: PRICE,
          recvphone: phoneDigits,
          returnPath: `/wolun?orderId=${orderId}`,
        })
      });
      const data = await res.json();
      if (res.status === 401 && data.needLogin) {
        window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
      }
      if (!res.ok || !data.payurl) {
        setPayError(data.error || '결제 요청에 실패했어요.');
        setPaying(false);
        return;
      }
      window.location.href = data.payurl;
    } catch {
      setPayError('결제 요청 중 오류가 발생했어요.');
      setPaying(false);
    }
  };

  return (
    <>
      <Head>
        <title>이번 달 나의 운세는? — 천기소녀</title>
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
        <div style={{fontSize:'12px',color:'rgba(232,200,126,0.5)',letterSpacing:'1px'}}>🌙 이번 달 운세</div>
      </div>

      {step === 'input' && (
        <div style={{minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'480px',margin:'0 auto',padding:'24px 20px 80px'}}>
            <PageHero img="month" alt="이번 달 나의 운세" />
            <div style={{display:'inline-block',fontSize:'11px',fontWeight:'700',color:'#1a1430',background:'#E8C87E',borderRadius:'10px',padding:'3px 10px',marginBottom:'12px'}}>NEW · ₩1,900</div>
            <h2 style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'30px',fontWeight:'600',marginBottom:'8px',color:'#E8C87E',letterSpacing:'-0.5px'}}>이번 달<br/>나의 운세는?</h2>
            <p style={{fontSize:'13px',color:'rgba(237,233,242,0.55)',marginBottom:'14px',lineHeight:'1.7'}}>{mon ? `${mon}월` : '이번 달'} 한 달, 돈·연애·일 흐름과 조심할 날까지</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'30px'}}>
              {['한 줄 요약','돈 흐름','연애·관계','일·공부','좋은 날 3개 · 조심할 날 2개','행운 컬러·숫자'].map(t=>(
                <span key={t} style={{fontSize:'11px',color:'#E8C87E',border:'1px solid rgba(232,200,126,0.35)',borderRadius:'12px',padding:'3px 9px'}}>{t}</span>
              ))}
            </div>

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
              {mon ? `${mon}월` : '이번 달'} 운세 보기 →
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div style={{minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'600px',margin:'0 auto',padding:'32px 20px 80px'}}>
            <div style={{background:'rgba(232,200,126,0.05)',border:'1px solid rgba(232,200,126,0.15)',borderRadius:'4px',padding:'20px',marginBottom:'20px'}}>
              <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'20px',color:'#E8C87E',marginBottom:'4px'}}>{form.name || '의뢰인'}님의 {mon ? `${mon}월` : '이번 달'} 운세</h2>
              <p style={{color:'rgba(237,233,242,0.4)',fontSize:'13px'}}>{form.year}년 {form.month}월 {form.day}일생</p>
            </div>

            {(loading || restoring) ? (
              <div style={{textAlign:'center',padding:'60px 0'}}>
                <div style={{fontSize:'44px',marginBottom:'20px'}}>🌙</div>
                <p style={{fontSize:'15px',color:'rgba(232,200,126,0.6)'}}>{restoring ? '결제를 확인하고 있어요...' : LOADING[loadingMsgIdx]}</p>
              </div>
            ) : locked ? (
              <>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',marginBottom:'4px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap',color:'#EDE9F2'}}>
                  {preview}
                </div>
                <div style={{position:'relative',background:'linear-gradient(180deg,rgba(11,10,31,0) 0%,rgba(11,10,31,0.97) 60%)',height:'80px',marginTop:'-80px',marginBottom:'8px',pointerEvents:'none'}} />

                <div style={{background:'rgba(232,200,126,0.06)',border:'1px solid rgba(232,200,126,0.3)',borderRadius:'6px',padding:'24px',marginBottom:'20px',textAlign:'center'}}>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'17px',color:'#E8C87E',marginBottom:'6px'}}>연애·일 흐름, 좋은 날과 조심할 날, 행운 포인트까지</div>
                  <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',marginBottom:'18px'}}>나머지 내용은 결제 후 바로 확인하실 수 있어요</div>

                  <input
                    type="tel"
                    value={phone}
                    onChange={e=>setPhone(e.target.value)}
                    placeholder="결제 알림 받을 휴대폰번호 (- 없이 숫자만)"
                    style={{...S.input,marginBottom:'10px',textAlign:'center'}}
                  />
                  {payError && <p style={{color:'#ff6b6b',fontSize:'12px',marginBottom:'10px'}}>{payError}</p>}
                  <button onClick={startPayment} disabled={paying} style={{width:'100%',background:'#8b2e00',color:'#E8C87E',padding:'16px',border:'1.5px solid #c4712a',borderRadius:'4px',fontSize:'15px',fontWeight:'700',cursor:paying?'default':'pointer',opacity:paying?0.6:1,fontFamily:'inherit'}}>
                    {paying ? '결제창 여는 중...' : `₩${PRICE.toLocaleString()} 결제하고 전체 보기`}
                  </button>
                </div>

                <a href="/" style={{display:'block',textAlign:'center',background:'none',color:'rgba(237,233,242,0.4)',padding:'14px',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'4px',fontSize:'14px',textDecoration:'none'}}>
                  처음으로
                </a>
              </>
            ) : (
              <>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',marginBottom:'20px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap',color:'#EDE9F2'}}>
                  {result}
                </div>

                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>{setStep('input');setResult('');setPreview('');setLocked(false);setOrderId(null);router.replace('/wolun');}} style={{flex:1,background:'rgba(232,200,126,0.1)',color:'#E8C87E',padding:'14px',border:'1px solid rgba(232,200,126,0.3)',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
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
