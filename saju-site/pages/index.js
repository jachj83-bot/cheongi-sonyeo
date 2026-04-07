import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const HOURS = [
  { label: '자시', sub: '子時', desc: '23:30~01:30', value: '자시' },
  { label: '축시', sub: '丑時', desc: '01:30~03:30', value: '축시' },
  { label: '인시', sub: '寅時', desc: '03:30~05:30', value: '인시' },
  { label: '묘시', sub: '卯時', desc: '05:30~07:30', value: '묘시' },
  { label: '진시', sub: '辰時', desc: '07:30~09:30', value: '진시' },
  { label: '사시', sub: '巳時', desc: '09:30~11:30', value: '사시' },
  { label: '오시', sub: '午時', desc: '11:30~13:30', value: '오시' },
  { label: '미시', sub: '未時', desc: '13:30~15:30', value: '미시' },
  { label: '신시', sub: '申時', desc: '15:30~17:30', value: '신시' },
  { label: '유시', sub: '酉時', desc: '17:30~19:30', value: '유시' },
  { label: '술시', sub: '戌時', desc: '19:30~21:30', value: '술시' },
  { label: '해시', sub: '亥時', desc: '21:30~23:30', value: '해시' },
  { label: '모름', sub: '', desc: '시간 불명', value: '모름' },
];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState('landing');
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '', gender: '', calendar: '양력' });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.name || !form.year || !form.month || !form.day || !form.gender || !form.hour) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    router.push('/result?' + new URLSearchParams(form).toString());
  };

  return (
    <>
      <Head>
        <title>천기소녀 — AI 사주 분석</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #080b14; color: #e8e0d0; font-family: -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
          input, button { font-family: inherit; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        `}</style>
      </Head>

      {/* 헤더 */}
      <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(8,11,20,0.95)',backdropFilter:'blur(10px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{color:'#FFE000',fontSize:'18px',fontWeight:'bold',letterSpacing:'-0.5px'}}>🔮 천기소녀</div>
        <a href="/gunghap" style={{color:'rgba(232,224,208,0.5)',textDecoration:'none',fontSize:'13px',background:'rgba(255,255,255,0.06)',padding:'6px 14px',borderRadius:'20px'}}>궁합보기</a>
      </div>

      {/* 랜딩 */}
      {step === 'landing' && (
        <div style={{padding:'48px 20px 80px'}}>
          <div style={{textAlign:'center',marginBottom:'48px'}}>
            <div style={{display:'inline-block',background:'rgba(255,224,0,0.1)',border:'1px solid rgba(255,224,0,0.25)',color:'#FFE000',padding:'5px 16px',borderRadius:'20px',fontSize:'12px',marginBottom:'20px',letterSpacing:'0.5px'}}>✨ 2026 병오년 무료 사주</div>
            <h1 style={{fontSize:'34px',fontWeight:'800',lineHeight:'1.35',marginBottom:'16px',letterSpacing:'-1px'}}>하늘의 비밀을<br/><span style={{color:'#FFE000'}}>천기소녀</span>가<br/>읽어드립니다</h1>
            <p style={{fontSize:'14px',color:'rgba(232,224,208,0.55)',lineHeight:'1.9',marginBottom:'32px'}}>이 페이지가 당신에게 뜬 건<br/>운명이 바뀌기 시작했다는 신호입니다</p>
            <button onClick={()=>setStep('input')} style={{width:'100%',maxWidth:'320px',background:'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'16px',border:'none',borderRadius:'14px',fontSize:'17px',fontWeight:'800',cursor:'pointer',letterSpacing:'-0.3px'}}>무료로 사주 보기 →</button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}}>
            {[{icon:'🪐',title:'일주별 분석',price:'₩9,900'},{icon:'💑',title:'궁합 분석',price:'₩14,900'}].map((s,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'18px 14px',textAlign:'center'}}>
                <div style={{fontSize:'24px',marginBottom:'8px'}}>{s.icon}</div>
                <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'6px'}}>{s.title}</div>
                <div style={{color:'#FFE000',fontSize:'14px',fontWeight:'700'}}>{s.price}</div>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'18px 14px',textAlign:'center'}}>
            <div style={{fontSize:'24px',marginBottom:'8px'}}>📄</div>
            <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'6px'}}>AI 리포트 PDF</div>
            <div style={{color:'#FFE000',fontSize:'14px',fontWeight:'700'}}>₩29,900</div>
          </div>
        </div>
      )}

      {/* 입력폼 */}
      {step === 'input' && (
        <div style={{padding:'20px 20px 80px',maxWidth:'480px',margin:'0 auto'}}>
          <button onClick={()=>setStep('landing')} style={{background:'none',border:'none',color:'rgba(232,224,208,0.4)',cursor:'pointer',fontSize:'14px',marginBottom:'20px',padding:'4px 0',display:'flex',alignItems:'center',gap:'6px'}}>← 뒤로</button>
          <h2 style={{fontSize:'24px',fontWeight:'800',marginBottom:'28px',letterSpacing:'-0.5px'}}>생년월일시를<br/>알려주세요</h2>

          {/* 이름 */}
          <div style={{marginBottom:'18px'}}>
            <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>이름</label>
            <input type="text" placeholder="홍길동" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'14px 16px',color:'#e8e0d0',fontSize:'15px',outline:'none'}}/>
          </div>

          {/* 양력/음력 */}
          <div style={{marginBottom:'18px'}}>
            <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>양력 / 음력</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              {['양력','음력'].map(c=>(
                <button key={c} onClick={()=>setForm({...form,calendar:c})}
                  style={{padding:'13px',background:form.calendar===c?'rgba(255,224,0,0.15)':'rgba(255,255,255,0.05)',border:`1.5px solid ${form.calendar===c?'#FFE000':'rgba(255,255,255,0.1)'}`,borderRadius:'12px',color:form.calendar===c?'#FFE000':'rgba(232,224,208,0.6)',fontSize:'15px',cursor:'pointer',fontWeight:form.calendar===c?'700':'400'}}>
                  {c}
                </button>
              ))}
            </div>
            {form.calendar==='음력' && <div style={{marginTop:'8px',padding:'8px 12px',background:'rgba(255,224,0,0.06)',border:'1px solid rgba(255,224,0,0.15)',borderRadius:'8px',fontSize:'12px',color:'rgba(255,224,0,0.65)'}}>⚠️ 윤달 여부도 기억해두세요</div>}
          </div>

          {/* 생년월일 */}
          <div style={{marginBottom:'18px'}}>
            <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>생년월일</label>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'8px'}}>
              {[['year','년','1995'],['month','월','03'],['day','일','15']].map(([k,l,p])=>(
                <div key={k} style={{position:'relative'}}>
                  <input type="number" placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                    style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'14px 16px',color:'#e8e0d0',fontSize:'15px',outline:'none'}}/>
                  <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',fontSize:'12px',color:'rgba(232,224,208,0.35)'}}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 시간 */}
          <div style={{marginBottom:'18px'}}>
            <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>태어난 시간</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
              {HOURS.map(h=>(
                <button key={h.value} onClick={()=>setForm({...form,hour:h.value})}
                  style={{padding:'10px 6px',background:form.hour===h.value?'rgba(255,224,0,0.15)':'rgba(255,255,255,0.04)',border:`1.5px solid ${form.hour===h.value?'#FFE000':'rgba(255,255,255,0.08)'}`,borderRadius:'10px',color:form.hour===h.value?'#FFE000':'rgba(232,224,208,0.65)',cursor:'pointer',textAlign:'center'}}>
                  <div style={{fontSize:'13px',fontWeight:form.hour===h.value?'700':'400'}}>{h.label}</div>
                  <div style={{fontSize:'10px',color:form.hour===h.value?'rgba(255,224,0,0.6)':'rgba(232,224,208,0.3)',marginTop:'2px'}}>{h.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 성별 */}
          <div style={{marginBottom:'28px'}}>
            <label style={{display:'block',fontSize:'12px',color:'rgba(232,224,208,0.5)',marginBottom:'8px',letterSpacing:'0.5px'}}>성별</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              {['남','여'].map(g=>(
                <button key={g} onClick={()=>setForm({...form,gender:g})}
                  style={{padding:'13px',background:form.gender===g?'rgba(255,224,0,0.15)':'rgba(255,255,255,0.05)',border:`1.5px solid ${form.gender===g?'#FFE000':'rgba(255,255,255,0.1)'}`,borderRadius:'12px',color:form.gender===g?'#FFE000':'rgba(232,224,208,0.6)',fontSize:'15px',cursor:'pointer',fontWeight:form.gender===g?'700':'400'}}>
                  {g}자
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{color:'#ff6b6b',fontSize:'13px',marginBottom:'16px',padding:'10px 14px',background:'rgba(255,107,107,0.08)',borderRadius:'8px'}}>⚠️ {error}</p>}

          <button onClick={handleSubmit} style={{width:'100%',background:'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'16px',border:'none',borderRadius:'14px',fontSize:'16px',fontWeight:'800',cursor:'pointer',letterSpacing:'-0.3px'}}>
            사주 분석 시작하기 🔮
          </button>
        </div>
      )}

      <div style={{textAlign:'center',padding:'32px 20px',borderTop:'1px solid rgba(255,255,255,0.05)',color:'rgba(232,224,208,0.2)',fontSize:'12px'}}>© 2026 천기소녀 · AI 사주 분석</div>
    </>
  );
}
