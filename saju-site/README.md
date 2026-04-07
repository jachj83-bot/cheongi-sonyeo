import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const HOURS = [
  { label: '자시 (子時)', desc: '23:30 ~ 01:30', value: '자시' },
  { label: '축시 (丑時)', desc: '01:30 ~ 03:30', value: '축시' },
  { label: '인시 (寅時)', desc: '03:30 ~ 05:30', value: '인시' },
  { label: '묘시 (卯時)', desc: '05:30 ~ 07:30', value: '묘시' },
  { label: '진시 (辰時)', desc: '07:30 ~ 09:30', value: '진시' },
  { label: '사시 (巳時)', desc: '09:30 ~ 11:30', value: '사시' },
  { label: '오시 (午時)', desc: '11:30 ~ 13:30', value: '오시' },
  { label: '미시 (未時)', desc: '13:30 ~ 15:30', value: '미시' },
  { label: '신시 (申時)', desc: '15:30 ~ 17:30', value: '신시' },
  { label: '유시 (酉時)', desc: '17:30 ~ 19:30', value: '유시' },
  { label: '술시 (戌時)', desc: '19:30 ~ 21:30', value: '술시' },
  { label: '해시 (亥時)', desc: '21:30 ~ 23:30', value: '해시' },
  { label: '모름', desc: '시간을 모를 경우', value: '모름' },
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
    const params = new URLSearchParams(form);
    router.push('/result?' + params.toString());
  };

  const inp = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'12px 16px', color:'#e8e0d0', fontSize:'15px', outline:'none' };

  return (
    <>
      <Head>
        <title>천기소녀 — AI 사주 분석</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{minHeight:'100vh',background:'#080b14',color:'#e8e0d0',fontFamily:'sans-serif'}}>
        <div style={{padding:'20px 32px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{color:'#FFE000',fontSize:'20px',fontWeight:'bold'}}>🔮 천기소녀</div>
          <a href="/gunghap" style={{color:'rgba(232,224,208,0.6)',textDecoration:'none',fontSize:'14px'}}>궁합보기</a>
        </div>

        {step === 'landing' && (
          <div style={{maxWidth:'600px',margin:'0 auto',padding:'80px 24px',textAlign:'center'}}>
            <div style={{display:'inline-block',background:'rgba(255,224,0,0.1)',border:'1px solid rgba(255,224,0,0.3)',color:'#FFE000',padding:'6px 18px',borderRadius:'20px',fontSize:'13px',marginBottom:'28px'}}>✨ 2026 병오년 무료 사주</div>
            <h1 style={{fontSize:'42px',fontWeight:'bold',lineHeight:'1.4',marginBottom:'20px'}}>하늘의 비밀을<br/><span style={{color:'#FFE000'}}>천기소녀</span>가<br/>읽어드립니다</h1>
            <p style={{fontSize:'16px',color:'rgba(232,224,208,0.6)',lineHeight:'1.8',marginBottom:'40px'}}>이 페이지가 당신에게 뜬 건<br/>운명이 바뀌기 시작했다는 신호입니다</p>
            <button onClick={() => setStep('input')} style={{background:'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'16px 48px',border:'none',borderRadius:'50px',fontSize:'18px',fontWeight:'bold',cursor:'pointer'}}>무료로 사주 보기 →</button>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginTop:'80px'}}>
              {[{icon:'🪐',title:'일주별 분석',desc:'60개 일주 완전 해석',price:'₩9,900'},{icon:'💑',title:'궁합 분석',desc:'두 사람의 운명 비교',price:'₩14,900'},{icon:'📄',title:'AI 리포트',desc:'20페이지 PDF',price:'₩29,900'}].map((s,i)=>(
                <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'24px 16px',textAlign:'center'}}>
                  <div style={{fontSize:'28px',marginBottom:'10px'}}>{s.icon}</div>
                  <div style={{fontWeight:'bold',marginBottom:'6px'}}>{s.title}</div>
                  <div style={{fontSize:'13px',color:'rgba(232,224,208,0.5)',marginBottom:'12px'}}>{s.desc}</div>
                  <div style={{color:'#FFE000',fontWeight:'bold'}}>{s.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'input' && (
          <div style={{maxWidth:'480px',margin:'0 auto',padding:'60px 24px'}}>
            <button onClick={() => setStep('landing')} style={{background:'none',border:'none',color:'rgba(232,224,208,0.5)',cursor:'pointer',fontSize:'14px',marginBottom:'24px'}}>← 뒤로</button>
            <h2 style={{fontSize:'26px',fontWeight:'bold',marginBottom:'32px'}}>생년월일시를 알려주세요</h2>

            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'rgba(232,224,208,0.6)',marginBottom:'8px'}}>이름</label>
              <input type="text" placeholder="홍길동" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp}/>
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'rgba(232,224,208,0.6)',marginBottom:'8px'}}>양력 / 음력</label>
              <div style={{display:'flex',gap:'10px'}}>
                {['양력','음력'].map(c=>(
                  <button key={c} onClick={()=>setForm({...form,calendar:c})}
                    style={{flex:1,padding:'12px',background:form.calendar===c?'rgba(255,224,0,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${form.calendar===c?'rgba(255,224,0,0.5)':'rgba(255,255,255,0.12)'}`,borderRadius:'10px',color:form.calendar===c?'#FFE000':'rgba(232,224,208,0.7)',fontSize:'15px',cursor:'pointer',fontWeight:form.calendar===c?'bold':'normal'}}>
                    {c}
                  </button>
                ))}
              </div>
              {form.calendar === '음력' && (
                <div style={{marginTop:'8px',padding:'8px 12px',background:'rgba(255,224,0,0.07)',border:'1px solid rgba(255,224,0,0.2)',borderRadius:'8px',fontSize:'12px',color:'rgba(255,224,0,0.7)'}}>
                  ⚠️ 음력 윤달에 태어나셨다면 윤달 여부도 기억해두세요
                </div>
              )}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
              {[['year','년','1995'],['month','월','03'],['day','일','15']].map(([k,l,p])=>(
                <div key={k}>
                  <label style={{display:'block',fontSize:'13px',color:'rgba(232,224,208,0.6)',marginBottom:'8px'}}>{l}</label>
                  <input type="number" placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={inp}/>
                </div>
              ))}
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'13px',color:'rgba(232,224,208,0.6)',marginBottom:'8px'}}>태어난 시간</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
                {HOURS.map(h=>(
                  <button key={h.value} onClick={()=>setForm({...form,hour:h.value})}
                    style={{padding:'10px 12px',background:form.hour===h.value?'rgba(255,224,0,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${form.hour===h.value?'rgba(255,224,0,0.5)':'rgba(255,255,255,0.1)'}`,borderRadius:'10px',color:form.hour===h.value?'#FFE000':'rgba(232,224,208,0.7)',cursor:'pointer',textAlign:'left'}}>
                    <div style={{fontSize:'13px',fontWeight:form.hour===h.value?'bold':'normal'}}>{h.label}</div>
                    <div style={{fontSize:'11px',color:'rgba(232,224,208,0.4)',marginTop:'2px'}}>{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'28px'}}>
              <label style={{display:'block',fontSize:'13px',color:'rgba(232,224,208,0.6)',marginBottom:'8px'}}>성별</label>
              <div style={{display:'flex',gap:'10px'}}>
                {['남','여'].map(g=>(
                  <button key={g} onClick={()=>setForm({...form,gender:g})} style={{flex:1,padding:'12px',background:form.gender===g?'rgba(255,224,0,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${form.gender===g?'rgba(255,224,0,0.5)':'rgba(255,255,255,0.12)'}`,borderRadius:'10px',color:form.gender===g?'#FFE000':'rgba(232,224,208,0.7)',fontSize:'15px',cursor:'pointer'}}>{g}자</button>
                ))}
              </div>
            </div>

            {error && <p style={{color:'#e87070',fontSize:'13px',marginBottom:'16px'}}>{error}</p>}
            <button onClick={handleSubmit} style={{width:'100%',background:'linear-gradient(135deg,#c8962a,#FFE000)',color:'#1a1200',padding:'16px',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'bold',cursor:'pointer'}}>사주 분석 시작하기 🔮</button>
          </div>
        )}

        <div style={{textAlign:'center',padding:'40px',borderTop:'1px solid rgba(255,255,255,0.06)',color:'rgba(232,224,208,0.3)',fontSize:'13px'}}>© 2026 천기소녀 · AI 사주 분석</div>
      </div>
    </>
  );
}
