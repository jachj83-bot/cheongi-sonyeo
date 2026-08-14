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

const TAROT_CARDS = [
  { name: '바보', nameEn: 'The Fool', img: '/cheongi_tarot_00_fool.png' },
  { name: '마법사', nameEn: 'The Magician', img: '/cheongi_tarot_01_magician.png' },
  { name: '여사제', nameEn: 'The High Priestess', img: '/cheongi_tarot_02_high_priestess.png' },
  { name: '여황제', nameEn: 'The Empress', img: '/cheongi_tarot_03_empress.png' },
  { name: '황제', nameEn: 'The Emperor', img: '/cheongi_tarot_04_emperor.png' },
  { name: '교황', nameEn: 'The Hierophant', img: '/cheongi_tarot_05_hierophant.png' },
  { name: '연인', nameEn: 'The Lovers', img: '/cheongi_tarot_06_lovers.png' },
  { name: '전차', nameEn: 'The Chariot', img: '/cheongi_tarot_07_chariot.png' },
  { name: '힘', nameEn: 'Strength', img: '/cheongi_tarot_08_strength.png' },
  { name: '은둔자', nameEn: 'The Hermit', img: '/cheongi_tarot_09_hermit.png' },
  { name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', img: '/cheongi_tarot_10_wheel.png' },
  { name: '정의', nameEn: 'Justice', img: '/cheongi_tarot_11_justice.png' },
  { name: '매달린 사람', nameEn: 'The Hanged Man', img: '/cheongi_tarot_12_hanged_man.png' },
  { name: '죽음', nameEn: 'Death', img: '/cheongi_tarot_13_death.png' },
  { name: '절제', nameEn: 'Temperance', img: '/cheongi_tarot_14_temperance.png' },
  { name: '악마', nameEn: 'The Devil', img: '/cheongi_tarot_15_devil.png' },
  { name: '탑', nameEn: 'The Tower', img: '/cheongi_tarot_16_tower.png' },
  { name: '별', nameEn: 'The Star', img: '/cheongi_tarot_17_star.png' },
  { name: '달', nameEn: 'The Moon', img: '/cheongi_tarot_18_moon.png' },
  { name: '태양', nameEn: 'The Sun', img: '/cheongi_tarot_19_sun.png' },
  { name: '심판', nameEn: 'Judgement', img: '/cheongi_tarot_20_judgement.png' },
  { name: '세계', nameEn: 'The World', img: '/cheongi_tarot_21_world.png' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LOADING_MESSAGES = [
  '사주와 카드의 기운을 함께 읽고 있어요...',
  '두 가지 신호를 하나로 엮어보는 중이에요...',
  '거의 다 왔어요, 조금만 기다려주세요...',
];

export default function Tonghap() {
  const [step, setStep] = useState('input');
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '', gender: '', calendar: '양력' });
  const [error, setError] = useState('');
  const [deck, setDeck] = useState([]);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
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

  const goToCards = () => {
    if (!form.name || !form.year || !form.month || !form.day || !form.gender || !form.hour) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setError('');
    setDeck(shuffle(TAROT_CARDS).map(c => ({ ...c, reversed: Math.random() > 0.7 })));
    setStep('pick');
  };

  const pickCard = async (card) => {
    setPicked(card);
    setStep('result');
    setLoading(true);
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tonghap_tarot',
          ...form,
          card: card.name,
          cardEn: card.nameEn,
          reversed: card.reversed
        })
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
        <title>사주+타로 통합분석 — 천기소녀</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Noto+Serif+KR:wght@300;400;700&family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0B0A1F; color: #EDE9F2; font-family: 'Noto Sans KR', sans-serif; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
          select option { background: #0B0A1F; color: #EDE9F2; }
          .tcard { transition: transform 0.2s; cursor: pointer; }
          .tcard:hover { transform: translateY(-4px); }
        `}</style>
      </Head>

      <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(11,10,31,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(232,200,126,0.1)',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <img src="/logo_symbol.png" alt="천기소녀" style={{width:'26px',height:'26px',objectFit:'contain'}} />
          <div style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'17px',color:'#E8C87E',fontWeight:'600',letterSpacing:'2px'}}>천기소녀</div>
        </a>
        <div style={{fontSize:'12px',color:'rgba(196,154,232,0.7)',letterSpacing:'1px'}}>✦ 사주+타로 통합</div>
      </div>

      {step === 'input' && (
        <div style={{minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'480px',margin:'0 auto',padding:'40px 20px 80px'}}>
            <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(196,154,232,0.5)',marginBottom:'12px'}}>가장 정밀한 통합 분석</div>
            <h2 style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'30px',fontWeight:'600',marginBottom:'8px',color:'#E8C87E',letterSpacing:'-0.5px'}}>사주로 흐름을,<br/>타로로 지금을 봅니다</h2>
            <p style={{fontSize:'12px',color:'rgba(237,233,242,0.3)',marginBottom:'36px',letterSpacing:'1px'}}>생년월일시를 넣고, 카드 한 장을 뽑아 통합 리딩을 받아보세요</p>

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

            <button onClick={goToCards} style={{width:'100%',background:'linear-gradient(135deg,rgba(232,200,126,0.15),rgba(155,109,214,0.15))',color:'#E8C87E',padding:'16px',border:'1px solid rgba(196,154,232,0.4)',borderRadius:'2px',fontSize:'14px',fontWeight:'500',cursor:'pointer',letterSpacing:'2px',fontFamily:'inherit'}}>
              카드 뽑으러 가기 →
            </button>
          </div>
        </div>
      )}

      {step === 'pick' && (
        <div style={{minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'480px',margin:'0 auto',padding:'32px 20px 80px'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'20px',color:'#c49ae8',marginBottom:'8px'}}>직감이 가는 카드 한 장을 고르세요</h2>
              <p style={{fontSize:'13px',color:'rgba(237,233,242,0.35)'}}>{form.name}님의 사주와 지금 이 카드가 만나요</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
              {deck.slice(0, 16).map((card, idx) => (
                <div key={idx} onClick={() => pickCard(card)} className="tcard"
                  style={{background:'linear-gradient(135deg,#1a1030,#2d1a4a)',border:'1.5px solid rgba(196,154,232,0.25)',borderRadius:'8px',padding:'14px 6px',textAlign:'center'}}>
                  <div style={{fontSize:'24px',marginBottom:'4px'}}>🎴</div>
                  <div style={{fontSize:'10px',color:'rgba(196,154,232,0.5)'}}>{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div style={{minHeight:'100vh',background:'#0B0A1F'}}>
          <div style={{maxWidth:'600px',margin:'0 auto',padding:'32px 20px 80px'}}>
            {picked && (
              <div style={{textAlign:'center',marginBottom:'24px'}}>
                <img src={picked.img} alt={picked.name} style={{width:'110px',aspectRatio:'2/3',objectFit:'cover',borderRadius:'8px',border:'1px solid rgba(232,200,126,0.3)',boxShadow:'0 10px 30px rgba(0,0,0,0.5)',transform:picked.reversed?'rotate(180deg)':'none',marginBottom:'10px'}} />
                <div style={{fontSize:'14px',color:'#c49ae8',fontWeight:'700'}}>{picked.name}{picked.reversed?' (역방향)':''}</div>
              </div>
            )}

            <div style={{background:'rgba(232,200,126,0.05)',border:'1px solid rgba(232,200,126,0.15)',borderRadius:'4px',padding:'20px',marginBottom:'20px'}}>
              <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#E8C87E',marginBottom:'4px'}}>{form.name}님의 사주+타로 통합분석</h2>
              <p style={{color:'rgba(237,233,242,0.4)',fontSize:'13px'}}>{form.year}년 {form.month}월 {form.day}일생</p>
            </div>

            {loading ? (
              <div style={{textAlign:'center',padding:'60px 0'}}>
                <div style={{fontSize:'44px',marginBottom:'20px'}}>✦</div>
                <p style={{fontSize:'15px',color:'rgba(232,200,126,0.6)'}}>{LOADING_MESSAGES[loadingMsgIdx]}</p>
              </div>
            ) : (
              <>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',marginBottom:'20px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap',color:'#EDE9F2'}}>
                  {result}
                </div>

                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>{setStep('input');setResult('');setPicked(null);}} style={{flex:1,background:'rgba(232,200,126,0.1)',color:'#E8C87E',padding:'14px',border:'1px solid rgba(232,200,126,0.3)',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
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
