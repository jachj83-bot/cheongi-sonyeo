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

  const S = {
    input: { width: '100%', background: 'rgba(232,200,126,0.06)', border: '1px solid rgba(232,200,126,0.2)', borderRadius: '4px', padding: '14px 16px', color: '#EDE9F2', fontSize: '15px', outline: 'none', fontFamily: 'inherit' },
    selectBtn: (active) => ({ padding: '10px 6px', background: active ? 'rgba(232,200,126,0.15)' : 'rgba(232,200,126,0.04)', border: `1px solid ${active ? 'rgba(232,200,126,0.6)' : 'rgba(232,200,126,0.12)'}`, borderRadius: '4px', color: active ? '#E8C87E' : 'rgba(237,233,242,0.5)', cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: active ? '600' : '400', fontFamily: 'inherit' }),
    label: { display: 'block', fontSize: '11px', color: 'rgba(232,200,126,0.5)', marginBottom: '8px', letterSpacing: '2px' },
    select: { width: '100%', background: 'rgba(232,200,126,0.06)', border: '1px solid rgba(232,200,126,0.2)', borderRadius: '4px', padding: '14px 16px', color: '#EDE9F2', fontSize: '14px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' },
  };

  return (
    <>
      <Head>
        <title>천기소녀 — 명리학 사주 분석</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Noto+Serif+KR:wght@300;400;700&family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0B0A1F; color: #EDE9F2; font-family: 'Noto Sans KR', sans-serif; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          .fade-up { animation: fadeUp 0.8s cubic-bezier(0.23,1,0.32,1) forwards; }
          select option { background: #0B0A1F; color: #EDE9F2; }
        `}</style>
      </Head>

      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(11,10,31,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(232,200,126,0.1)',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <img src="/logo_symbol.png.png" alt="천기소녀" style={{width:'28px',height:'28px',objectFit:'contain'}} />
          <div>
            <div style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'18px',color:'#E8C87E',fontWeight:'600',letterSpacing:'2px',lineHeight:'1'}}>천기소녀</div>
            <div style={{fontSize:'9px',color:'rgba(232,200,126,0.4)',letterSpacing:'3px',marginTop:'2px'}}>CHEONGI SONYEO</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <a href="/gunghap" style={{color:'rgba(237,233,242,0.5)',textDecoration:'none',fontSize:'12px',padding:'7px 14px',border:'1px solid rgba(232,200,126,0.15)',borderRadius:'2px',letterSpacing:'1px'}}>궁합</a>
          <a href="/tarot" style={{color:'rgba(237,233,242,0.5)',textDecoration:'none',fontSize:'12px',padding:'7px 14px',border:'1px solid rgba(232,200,126,0.15)',borderRadius:'2px',letterSpacing:'1px'}}>타로</a>
        </div>
      </div>

      {step === 'landing' && (
        <>
          <div style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundImage:'url(/hero_cosmos.png.png)',backgroundSize:'cover',backgroundPosition:'center right'}} />
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(90deg, rgba(11,10,31,0.92) 0%, rgba(11,10,31,0.75) 50%, rgba(11,10,31,0.3) 100%)'}} />
            <div style={{position:'relative',zIndex:5,display:'grid',gridTemplateColumns:'1fr 1fr',maxWidth:'1100px',margin:'0 auto',padding:'100px 32px 60px',alignItems:'center',gap:'40px',width:'100%'}}>
              <div className="fade-up">
                <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.6)',marginBottom:'24px',display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{width:'24px',height:'1px',background:'rgba(232,200,126,0.4)',display:'inline-block'}} />
                  명리학 기반 사주 분석
                </div>
                <h1 style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'54px',fontWeight:'600',lineHeight:'1.25',color:'#EDE9F2',marginBottom:'20px',letterSpacing:'-1px'}}>
                  하늘의 기운을<br/>
                  <span style={{color:'#E8C87E'}}>천기소녀</span>가<br/>
                  읽어드립니다
                </h1>
                <p style={{fontSize:'14px',color:'rgba(237,233,242,0.45)',lineHeight:'1.9',marginBottom:'36px',maxWidth:'360px',fontWeight:'300'}}>
                  생년월일 하나로 당신의 타고난 운명과<br/>
                  올해의 흐름을 정통 명리학으로 분석해드려요.<br/>
                  이 페이지를 찾아온 것도 인연입니다.
                </p>
                <button onClick={()=>setStep('input')} style={{background:'rgba(232,200,126,0.1)',border:'1px solid rgba(232,200,126,0.5)',color:'#E8C87E',padding:'15px 36px',fontSize:'13px',letterSpacing:'2px',cursor:'pointer',fontFamily:'inherit',borderRadius:'2px'}}>
                  무료로 사주 보기 →
                </button>
              </div>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center'}} className="fade-up">
                <img src="/oracle_girl.png.png" alt="천기소녀" style={{width:'100%',maxWidth:'360px',borderRadius:'4px',border:'1px solid rgba(232,200,126,0.15)'}} />
              </div>
            </div>
          </div>

          <div style={{background:'rgba(11,10,31,0.95)',borderTop:'1px solid rgba(232,200,126,0.1)',borderBottom:'1px solid rgba(232,200,126,0.1)'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',maxWidth:'1100px',margin:'0 auto'}}>
              {[['3,200+','누적 상담'],['4.9★','평균 별점'],['98%','재방문율'],['22장','타로 카드']].map(([n,l],i)=>(
                <div key={i} style={{padding:'28px 20px',textAlign:'center',borderRight:i<3?'1px solid rgba(232,200,126,0.08)':'none'}}>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'32px',color:'#E8C87E',fontWeight:'600',marginBottom:'4px'}}>{n}</div>
                  <div style={{fontSize:'11px',color:'rgba(237,233,242,0.35)',letterSpacing:'1.5px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:'#0B0A1F',padding:'60px 24px'}}>
            <div style={{maxWidth:'1100px',margin:'0 auto'}}>
              <div style={{textAlign:'center',marginBottom:'40px'}}>
                <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>REVIEWS</div>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'28px',color:'#E8C87E',fontWeight:'400'}}>실제 후기</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                {[
                  {text:'"이렇게 맞을 수가... 올해 이직 얘기까지 다 맞췄어요"',name:'김*연 · 32세'},
                  {text:'"궁합 봤는데 소름이었어요. 덕분에 화해했거든요"',name:'박*현 · 28세'},
                ].map((r,i)=>(
                  <div key={i} style={{background:'linear-gradient(180deg,rgba(40,34,72,.4),rgba(24,20,46,.5))',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',backdropFilter:'blur(10px)'}}>
                    <div style={{color:'#E8C87E',fontSize:'14px',marginBottom:'10px',letterSpacing:'2px'}}>★★★★★</div>
                    <div style={{fontSize:'14px',color:'rgba(237,233,242,0.6)',lineHeight:'1.8',fontWeight:'300'}}>{r.text}</div>
                    <div style={{fontSize:'12px',color:'rgba(232,200,126,0.35)',marginTop:'12px',letterSpacing:'1px'}}>{r.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{background:'rgba(11,10,31,0.98)',padding:'60px 24px',borderTop:'1px solid rgba(232,200,126,0.08)'}}>
            <div style={{maxWidth:'1100px',margin:'0 auto'}}>
              <div style={{textAlign:'center',marginBottom:'40px'}}>
                <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>SERVICES</div>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'28px',color:'#E8C87E',fontWeight:'400'}}>천기소녀 메뉴</div>
              </div>
              <div style={{marginBottom:'12px'}}>
                <div style={{fontSize:'10px',letterSpacing:'3px',color:'rgba(232,200,126,0.4)',marginBottom:'14px'}}>사주 · 운세</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                  {[
                    {icon:'🪐',tag:'무료 기본 포함',name:'일주 분석',desc:'타고난 기질과 올해 흐름 분석',price:'₩9,900',onClick:()=>setStep('input')},
                    {icon:'💑',tag:'두 사람 비교',name:'궁합 분석',desc:'연인·배우자·친구 궁합 점수 공개',price:'₩14,900',onClick:()=>router.push('/gunghap')}
                  ].map((p,i)=>(
                    <div key={i} onClick={p.onClick} style={{background:'linear-gradient(180deg,rgba(40,34,72,.4),rgba(24,20,46,.5))',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',cursor:'pointer',backdropFilter:'blur(10px)'}}>
                      <div style={{fontSize:'24px',marginBottom:'12px'}}>{p.icon}</div>
                      <div style={{fontSize:'10px',color:'rgba(232,200,126,0.4)',letterSpacing:'2px',marginBottom:'8px'}}>{p.tag}</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>{p.name}</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',marginBottom:'14px',fontWeight:'300'}}>{p.desc}</div>
                      <div style={{fontSize:'16px',color:'#E8C87E',fontWeight:'600'}}>{p.price}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:'linear-gradient(180deg,rgba(40,34,72,.4),rgba(24,20,46,.5))',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',backdropFilter:'blur(10px)',marginBottom:'32px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:'10px',color:'rgba(232,200,126,0.4)',letterSpacing:'2px',marginBottom:'8px'}}>정밀 분석 리포트</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>AI 리포트 PDF</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',fontWeight:'300'}}>30페이지 분량의 정밀 사주 리포트 · 이메일 발송</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'16px',color:'#E8C87E',fontWeight:'600',marginBottom:'4px'}}>₩29,900</div>
                      <div style={{fontSize:'11px',color:'rgba(232,200,126,0.3)',letterSpacing:'1px'}}>준비중</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{fontSize:'10px',letterSpacing:'3px',color:'rgba(155,109,214,0.5)',marginBottom:'14px'}}>타로</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                  {[
                    {icon:'🃏',tag:'오늘의 한 장',name:'오늘의 타로',desc:'지금 이 순간 나에게 필요한 메시지',price:'무료',onClick:()=>router.push('/tarot')},
                    {icon:'💜',tag:'연애·관계',name:'연애 타로',desc:'그 사람의 마음과 우리의 앞날',price:'₩7,900',onClick:null}
                  ].map((p,i)=>(
                    <div key={i} onClick={p.onClick||undefined} style={{background:'linear-gradient(180deg,rgba(60,34,100,.4),rgba(36,20,60,.5))',border:'1px solid rgba(155,109,214,0.15)',borderRadius:'4px',padding:'24px',cursor:p.onClick?'pointer':'default',opacity:p.onClick?1:0.6,backdropFilter:'blur(10px)'}}>
                      <div style={{fontSize:'24px',marginBottom:'12px'}}>{p.icon}</div>
                      <div style={{fontSize:'10px',color:'rgba(155,109,214,0.5)',letterSpacing:'2px',marginBottom:'8px'}}>{p.tag}</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>{p.name}</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',marginBottom:'14px',fontWeight:'300'}}>{p.desc}</div>
                      <div style={{fontSize:'16px',color:'#c49ae8',fontWeight:'600'}}>{p.price}</div>
                      {!p.onClick && <div style={{fontSize:'11px',color:'rgba(155,109,214,0.3)',letterSpacing:'1px',marginTop:'4px'}}>준비중</div>}
                    </div>
                  ))}
                </div>
                <div style={{background:'linear-gradient(180deg,rgba(60,34,100,.4),rgba(36,20,60,.5))',border:'1px solid rgba(155,109,214,0.15)',borderRadius:'4px',padding:'24px',backdropFilter:'blur(10px)',opacity:0.6}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:'10px',color:'rgba(155,109,214,0.5)',letterSpacing:'2px',marginBottom:'8px'}}>통합 분석</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>사주 + 타로 통합 분석</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',fontWeight:'300'}}>사주로 흐름을 보고 타로로 현재를 짚는 가장 정밀한 분석</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'16px',color:'#c49ae8',fontWeight:'600',marginBottom:'4px'}}>₩19,900</div>
                      <div style={{fontSize:'11px',color:'rgba(155,109,214,0.3)',letterSpacing:'1px'}}>준비중</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{textAlign:'center',padding:'32px 20px',borderTop:'1px solid rgba(232,200,126,0.08)',color:'rgba(237,233,242,0.2)',fontSize:'11px',letterSpacing:'2px',background:'#0B0A1F'}}>
            © 2026 천기소녀 · CHEONGI SONYEO
          </div>
        </>
      )}

      {step === 'input' && (
        <div style={{paddingTop:'80px',minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'480px',margin:'0 auto',padding:'40px 20px 80px'}}>
            <button onClick={()=>setStep('landing')} style={{background:'none',border:'none',color:'rgba(232,200,126,0.5)',cursor:'pointer',fontSize:'13px',marginBottom:'32px',padding:'4px 0',letterSpacing:'1px',fontFamily:'inherit'}}>← 뒤로</button>
            <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>SAJU ANALYSIS</div>
            <h2 style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'32px',fontWeight:'600',marginBottom:'8px',color:'#E8C87E',letterSpacing:'-0.5px'}}>생년월일시를<br/>알려주세요</h2>
            <p style={{fontSize:'12px',color:'rgba(237,233,242,0.3)',marginBottom:'36px',letterSpacing:'1px'}}>하늘의 기운을 정확히 읽기 위해 필요합니다</p>

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
              사주 분석 시작하기 →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
