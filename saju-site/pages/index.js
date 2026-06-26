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

const S = {
  wrap: { background: '#1a0a00', minHeight: '100vh', color: '#f0e6d3', fontFamily: "'Noto Sans KR', -apple-system, sans-serif" },
  header: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(26,10,0,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #3d1500', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#e8c97a', fontSize: '18px', fontWeight: '900', letterSpacing: '2px', fontFamily: 'serif' },
  badge: { display: 'inline-block', background: '#8b2e00', color: '#e8c97a', fontSize: '12px', padding: '5px 16px', borderRadius: '20px', marginBottom: '20px', letterSpacing: '1px', border: '1px solid #c4712a' },
  heroTitle: { fontSize: '34px', fontWeight: '900', lineHeight: '1.4', marginBottom: '12px', fontFamily: 'serif', color: '#f0e6d3' },
  divider: { width: '60px', height: '2px', background: '#8b2e00', margin: '16px auto' },
  ctaBtn: { width: '100%', maxWidth: '320px', background: '#8b2e00', color: '#e8c97a', padding: '16px', border: '1.5px solid #c4712a', borderRadius: '4px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px', fontFamily: 'serif' },
  label: { display: 'block', fontSize: '12px', color: 'rgba(240,230,211,0.5)', marginBottom: '8px', letterSpacing: '1px' },
  selectBtn: (active) => ({ padding: '10px 6px', background: active ? 'rgba(139,46,0,0.3)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${active ? '#c4712a' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', color: active ? '#e8c97a' : 'rgba(240,230,211,0.6)', cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: active ? '700' : '400' }),
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #3d1500', borderRadius: '6px', padding: '14px 16px', color: '#f0e6d3', fontSize: '15px', outline: 'none' },
};

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
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #1a0a00; color: #f0e6d3; font-family: 'Noto Sans KR', -apple-system, sans-serif; }
          input, button { font-family: inherit; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        `}</style>
      </Head>

      <div style={S.wrap}>
        {/* 헤더 */}
        <div style={S.header}>
          <div style={S.logo}>🔮 천기소녀</div>
          <div style={{display:'flex',gap:'8px'}}>
            <a href="/gunghap" style={{color:'#c4956a',textDecoration:'none',fontSize:'13px',background:'rgba(139,46,0,0.2)',padding:'6px 12px',borderRadius:'4px',border:'1px solid #3d1500'}}>💑 궁합</a>
            <a href="/tarot" style={{color:'#c49ae8',textDecoration:'none',fontSize:'13px',background:'rgba(61,21,96,0.2)',padding:'6px 12px',borderRadius:'4px',border:'1px solid #3d1560'}}>🃏 타로</a>
          </div>
        </div>

        {/* 랜딩 */}
        {step === 'landing' && (
          <div>
            <div style={{textAlign:'center',padding:'48px 20px 32px',background:'linear-gradient(180deg,#1a0a00 0%,#2d0f00 100%)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(139,46,0,0.06) 40px,rgba(139,46,0,0.06) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(139,46,0,0.06) 40px,rgba(139,46,0,0.06) 41px)',pointerEvents:'none'}} />
              <div style={S.badge}>✦ 2026 병오년 무료 사주 ✦</div>
              <h1 style={S.heroTitle}>하늘의 기운을<br/><span style={{color:'#e8c97a'}}>천기소녀</span>가<br/>읽어드립니다</h1>
              <div style={S.divider} />
              <p style={{fontSize:'14px',color:'#c4956a',lineHeight:'1.8',marginBottom:'8px'}}>생년월일 하나로 알 수 있는<br/>나의 타고난 운명과 올해의 흐름</p>
              <p style={{fontSize:'13px',color:'#a07050',fontStyle:'italic',marginBottom:'28px'}}>"이 페이지를 찾아온 것도 인연입니다"</p>
              <button onClick={()=>setStep('input')} style={S.ctaBtn}>무료로 사주 보기 →</button>
            </div>

            <div style={{display:'flex',justifyContent:'center',gap:'28px',padding:'16px 20px',background:'#120600',borderBottom:'1px solid #2d0f00'}}>
              {[['3,200+','누적 상담'],['4.9★','평균 별점'],['98%','재방문율']].map(([n,l])=>(
                <div key={l} style={{textAlign:'center'}}>
                  <div style={{fontFamily:'serif',fontSize:'20px',color:'#e8c97a',fontWeight:'900'}}>{n}</div>
                  <div style={{fontSize:'11px',color:'#7a5030',marginTop:'2px'}}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{background:'#120600',padding:'24px 20px',borderBottom:'1px solid #2d0f00'}}>
              <div style={{textAlign:'center',fontSize:'13px',color:'#c4956a',marginBottom:'16px',letterSpacing:'2px'}}>✦ 실제 후기 ✦</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {[
                  {text:'"이렇게 맞을 수가... 올해 이직 얘기까지 다 맞췄어요"',name:'김*연 · 32세'},
                  {text:'"궁합 봤는데 소름이었어요. 덕분에 화해했거든요"',name:'박*현 · 28세'},
                ].map((r,i)=>(
                  <div key={i} style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'4px',padding:'14px'}}>
                    <div style={{color:'#e8c97a',fontSize:'12px',marginBottom:'6px'}}>★★★★★</div>
                    <div style={{fontSize:'12px',color:'#c4956a',lineHeight:'1.7'}}>{r.text}</div>
                    <div style={{fontSize:'11px',color:'#7a5030',marginTop:'8px'}}>{r.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{padding:'28px 20px',background:'#1a0a00'}}>
              <div style={{textAlign:'center',fontFamily:'serif',fontSize:'16px',color:'#e8c97a',marginBottom:'20px',letterSpacing:'2px'}}>✦ 천기소녀 메뉴 ✦</div>

              <div style={{fontSize:'11px',color:'#c4956a',background:'#2d0f00',border:'1px solid #3d1500',padding:'3px 10px',borderRadius:'10px',display:'inline-block',marginBottom:'14px',letterSpacing:'1px'}}>🪐 사주 · 운세</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                {[
                  {icon:'🪐',tag:'무료 기본 포함',name:'일주 분석',desc:'타고난 기질과\n올해 흐름 분석',price:'₩9,900',onClick:()=>setStep('input')},
                  {icon:'💑',tag:'두 사람 비교',name:'궁합 분석',desc:'연인·배우자·친구\n궁합 점수 공개',price:'₩14,900',onClick:()=>router.push('/gunghap')}
                ].map((p,i)=>(
                  <div key={i} onClick={p.onClick} style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'4px',padding:'18px 14px',textAlign:'center',cursor:'pointer'}}>
                    <div style={{fontSize:'28px',marginBottom:'10px'}}>{p.icon}</div>
                    <div style={{fontSize:'10px',color:'#8b2e00',background:'#2d0f00',padding:'2px 8px',borderRadius:'10px',display:'inline-block',marginBottom:'6px',border:'1px solid #3d1500'}}>{p.tag}</div>
                    <div style={{fontSize:'14px',color:'#f0e6d3',fontWeight:'700',marginBottom:'4px'}}>{p.name}</div>
                    <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'10px',lineHeight:'1.6',whiteSpace:'pre'}}>{p.desc}</div>
                    <div style={{fontSize:'15px',color:'#e8c97a',fontWeight:'700'}}>{p.price}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'4px',padding:'18px 14px',textAlign:'center',marginBottom:'24px'}}>
                <div style={{fontSize:'28px',marginBottom:'10px'}}>📜</div>
                <div style={{fontSize:'14px',color:'#f0e6d3',fontWeight:'700',marginBottom:'4px'}}>AI 리포트 PDF</div>
                <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'10px'}}>30페이지 분량의 정밀 사주 리포트 · 이메일 발송</div>
                <div style={{fontSize:'15px',color:'#e8c97a',fontWeight:'700'}}>₩29,900</div>
                <div style={{fontSize:'11px',color:'#5a3020',marginTop:'6px'}}>준비중</div>
              </div>

              <div style={{fontSize:'11px',color:'#c49ae8',background:'#1a0a2a',border:'1px solid #3d1560',padding:'3px 10px',borderRadius:'10px',display:'inline-block',marginBottom:'14px',letterSpacing:'1px'}}>🃏 타로</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                {[
                  {icon:'🃏',tag:'오늘의 한 장',name:'오늘의 타로',desc:'지금 이 순간\n나에게 필요한 메시지',price:'무료',onClick:()=>router.push('/tarot')},
                  {icon:'💜',tag:'연애·관계',name:'연애 타로',desc:'그 사람의 마음과\n우리의 앞날',price:'₩7,900',onClick:null}
                ].map((p,i)=>(
                  <div key={i} onClick={p.onClick||undefined} style={{background:'#1a0a2a',border:'1px solid #3d1560',borderRadius:'4px',padding:'18px 14px',textAlign:'center',cursor:p.onClick?'pointer':'default',opacity:p.onClick?1:0.6}}>
                    <div style={{fontSize:'28px',marginBottom:'10px'}}>{p.icon}</div>
                    <div style={{fontSize:'10px',color:'#7b3fa0',background:'#1a0a2a',padding:'2px 8px',borderRadius:'10px',display:'inline-block',marginBottom:'6px',border:'1px solid #3d1560'}}>{p.tag}</div>
                    <div style={{fontSize:'14px',color:'#f0e6d3',fontWeight:'700',marginBottom:'4px'}}>{p.name}</div>
                    <div style={{fontSize:'11px',color:'#9070a0',marginBottom:'10px',lineHeight:'1.6',whiteSpace:'pre'}}>{p.desc}</div>
                    <div style={{fontSize:'15px',color:'#c49ae8',fontWeight:'700'}}>{p.price}</div>
                    {!p.onClick && <div style={{fontSize:'11px',color:'#5a3060',marginTop:'6px'}}>준비중</div>}
                  </div>
                ))}
              </div>
              <div style={{background:'#1a0a2a',border:'1px solid #3d1560',borderRadius:'4px',padding:'18px 14px',textAlign:'center',opacity:0.6}}>
                <div style={{fontSize:'28px',marginBottom:'10px'}}>✨</div>
                <div style={{fontSize:'14px',color:'#f0e6d3',fontWeight:'700',marginBottom:'4px'}}>사주 + 타로 통합 분석</div>
                <div style={{fontSize:'11px',color:'#9070a0',marginBottom:'10px'}}>사주로 흐름을 보고 타로로 현재를 짚는 · 가장 정밀한 분석</div>
                <div style={{fontSize:'15px',color:'#c49ae8',fontWeight:'700'}}>₩19,900</div>
                <div style={{fontSize:'11px',color:'#5a3060',marginTop:'6px'}}>준비중</div>
              </div>
            </div>
          </div>
        )}

        {/* 입력폼 */}
        {step === 'input' && (
          <div style={{padding:'20px 20px 80px',maxWidth:'480px',margin:'0 auto'}}>
            <button onClick={()=>setStep('landing')} style={{background:'none',border:'none',color:'#c4956a',cursor:'pointer',fontSize:'14px',marginBottom:'20px',padding:'4px 0'}}>← 뒤로</button>
            <h2 style={{fontFamily:'serif',fontSize:'24px',fontWeight:'900',marginBottom:'6px',color:'#e8c97a'}}>생년월일시를<br/>알려주세요</h2>
            <p style={{fontSize:'13px',color:'#7a5030',marginBottom:'28px'}}>하늘의 기운을 정확히 읽기 위해 필요합니다</p>

            <div style={{marginBottom:'18px'}}>
              <label style={S.label}>이름</label>
              <input type="text" placeholder="홍길동" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={S.input}/>
            </div>

            <div style={{marginBottom:'18px'}}>
              <label style={S.label}>양력 / 음력</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {['양력','음력'].map(c=>(
                  <button key={c} onClick={()=>setForm({...form,calendar:c})} style={S.selectBtn(form.calendar===c)}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'18px'}}>
              <label style={S.label}>생년월일</label>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'8px'}}>
                {[['year','년','1995'],['month','월','07'],['day','일','21']].map(([k,l,p])=>(
                  <div key={k} style={{position:'relative'}}>
                    <input type="number" placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={S.input}/>
                    <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',fontSize:'12px',color:'#7a5030'}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'18px'}}>
              <label style={S.label}>태어난 시간</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                {HOURS.map(h=>(
                  <button key={h.value} onClick={()=>setForm({...form,hour:h.value})} style={{...S.selectBtn(form.hour===h.value),padding:'10px 6px'}}>
                    <div style={{fontSize:'13px'}}>{h.label}</div>
                    {h.sub && <div style={{fontSize:'10px',opacity:0.6,marginTop:'1px'}}>{h.sub}</div>}
                    <div style={{fontSize:'10px',opacity:0.5,marginTop:'1px'}}>{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'28px'}}>
              <label style={S.label}>성별</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {['남','여'].map(g=>(
                  <button key={g} onClick={()=>setForm({...form,gender:g})} style={{...S.selectBtn(form.gender===g),padding:'13px'}}>{g}자</button>
                ))}
              </div>
            </div>

            {error && <p style={{color:'#ff6b6b',fontSize:'13px',marginBottom:'16px',padding:'10px 14px',background:'rgba(255,107,107,0.08)',borderRadius:'8px'}}>⚠️ {error}</p>}

            <button onClick={handleSubmit} style={{width:'100%',background:'#8b2e00',color:'#e8c97a',padding:'16px',border:'1.5px solid #c4712a',borderRadius:'4px',fontSize:'16px',fontWeight:'800',cursor:'pointer',letterSpacing:'1px',fontFamily:'serif'}}>
              사주 분석 시작하기 🔮
            </button>
          </div>
        )}

        <div style={{textAlign:'center',padding:'24px 20px',borderTop:'1px solid #2d0f00',color:'#5a3020',fontSize:'12px'}}>© 2026 천기소녀 · AI 사주 분석</div>
      </div>
    </>
  );
}
