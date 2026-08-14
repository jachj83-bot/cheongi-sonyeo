import { useState } from 'react';
import Head from 'next/head';

const TAROT_CARDS = [
  { id: 0, name: '바보', nameEn: 'The Fool', emoji: '🌟', img: '/cheongi_tarot_00_fool.png' },
  { id: 1, name: '마법사', nameEn: 'The Magician', emoji: '🔮', img: '/cheongi_tarot_01_magician.png' },
  { id: 2, name: '여사제', nameEn: 'The High Priestess', emoji: '🌙', img: '/cheongi_tarot_02_high_priestess.png' },
  { id: 3, name: '여황제', nameEn: 'The Empress', emoji: '🌸', img: '/cheongi_tarot_03_empress.png' },
  { id: 4, name: '황제', nameEn: 'The Emperor', emoji: '👑', img: '/cheongi_tarot_04_emperor.png' },
  { id: 5, name: '교황', nameEn: 'The Hierophant', emoji: '✨', img: '/cheongi_tarot_05_hierophant.png' },
  { id: 6, name: '연인', nameEn: 'The Lovers', emoji: '💑', img: '/cheongi_tarot_06_lovers.png' },
  { id: 7, name: '전차', nameEn: 'The Chariot', emoji: '⚡', img: '/cheongi_tarot_07_chariot.png' },
  { id: 8, name: '힘', nameEn: 'Strength', emoji: '🦁', img: '/cheongi_tarot_08_strength.png' },
  { id: 9, name: '은둔자', nameEn: 'The Hermit', emoji: '🕯️', img: '/cheongi_tarot_09_hermit.png' },
  { id: 10, name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', emoji: '🎡', img: '/cheongi_tarot_10_wheel.png' },
  { id: 11, name: '정의', nameEn: 'Justice', emoji: '⚖️', img: '/cheongi_tarot_11_justice.png' },
  { id: 12, name: '매달린 사람', nameEn: 'The Hanged Man', emoji: '🌿', img: '/cheongi_tarot_12_hanged_man.png' },
  { id: 13, name: '죽음', nameEn: 'Death', emoji: '🦋', img: '/cheongi_tarot_13_death.png' },
  { id: 14, name: '절제', nameEn: 'Temperance', emoji: '🌊', img: '/cheongi_tarot_14_temperance.png' },
  { id: 15, name: '악마', nameEn: 'The Devil', emoji: '🔥', img: '/cheongi_tarot_15_devil.png' },
  { id: 16, name: '탑', nameEn: 'The Tower', emoji: '⛈️', img: '/cheongi_tarot_16_tower.png' },
  { id: 17, name: '별', nameEn: 'The Star', emoji: '⭐', img: '/cheongi_tarot_17_star.png' },
  { id: 18, name: '달', nameEn: 'The Moon', emoji: '🌕', img: '/cheongi_tarot_18_moon.png' },
  { id: 19, name: '태양', nameEn: 'The Sun', emoji: '☀️', img: '/cheongi_tarot_19_sun.png' },
  { id: 20, name: '심판', nameEn: 'Judgement', emoji: '🎺', img: '/cheongi_tarot_20_judgement.png' },
  { id: 21, name: '세계', nameEn: 'The World', emoji: '🌍', img: '/cheongi_tarot_21_world.png' },
];

const SPREAD_TYPES = [
  { id: 'daily', label: '오늘의 한 장', count: 1, positions: ['현재'] },
  { id: 'past_present_future', label: '과거 · 현재 · 미래', count: 3, positions: ['과거', '현재', '미래'] },
  { id: 'situation', label: '상황 · 장애물 · 조언', count: 3, positions: ['상황', '장애물', '조언'] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Tarot() {
  const [step, setStep] = useState('intro');
  const [spreadType, setSpreadType] = useState(SPREAD_TYPES[0]);
  const [cards, setCards] = useState([]);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');

  const startReading = () => {
    const shuffled = shuffle(TAROT_CARDS).map(c => ({ ...c, reversed: Math.random() > 0.7 }));
    setCards(shuffled);
    setPicked([]);
    setResult('');
    setStep('pick');
  };

  const pickCard = async (card) => {
    if (picked.find(p => p.id === card.id)) return;
    if (picked.length >= spreadType.count) return;

    const newPicked = [...picked, card];
    setPicked(newPicked);

    if (newPicked.length === spreadType.count) {
      setLoading(true);
      setStep('result');
      try {
        const res = await fetch('/api/saju', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'tarot',
            spread: spreadType.id,
            positions: spreadType.positions,
            cards: newPicked.map((c, i) => ({
              position: spreadType.positions[i],
              name: c.name,
              nameEn: c.nameEn,
              reversed: c.reversed
            })),
            question: question || '오늘 하루의 흐름'
          })
        });
        const data = await res.json();
        setResult(data.result || '카드의 메시지를 읽을 수 없습니다.');
      } catch {
        setResult('잠시 후 다시 시도해주세요.');
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>오늘의 타로 — 천기소녀</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0a0015; color: #f0e6d3; font-family: 'Noto Sans KR', sans-serif; }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .card-item { transition: transform 0.2s; cursor: pointer; }
          .card-item:hover { transform: translateY(-6px) scale(1.03); }
          .float { animation: float 3s ease-in-out infinite; }
          .fade-in { animation: fadeIn 0.6s ease forwards; }
        `}</style>
      </Head>

      <div style={{minHeight:'100vh',background:'#0a0015'}}>
        <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(10,0,21,0.97)',backdropFilter:'blur(10px)',borderBottom:'1px solid #2d1560',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" style={{color:'#e8c97a',fontSize:'18px',fontWeight:'900',textDecoration:'none',fontFamily:'serif',letterSpacing:'2px'}}>🔮 천기소녀</a>
          <div style={{fontSize:'13px',color:'#c49ae8'}}>🃏 타로</div>
        </div>

        <div style={{maxWidth:'480px',margin:'0 auto',padding:'28px 20px 80px'}}>

          {step === 'intro' && (
            <div style={{textAlign:'center'}} className="fade-in">
              <div style={{position:'relative',height:'140px',marginBottom:'28px',display:'flex',justifyContent:'center',alignItems:'center'}} className="float">
                <img src="/cheongi_tarot_18_moon.png" alt="" style={{position:'absolute',width:'78px',borderRadius:'8px',border:'1px solid rgba(232,200,126,0.35)',boxShadow:'0 8px 24px rgba(0,0,0,0.5)',transform:'rotate(-16deg) translateX(-46px)',opacity:0.85}} />
                <img src="/cheongi_tarot_00_fool.png" alt="" style={{position:'relative',width:'92px',borderRadius:'8px',border:'1px solid rgba(232,200,126,0.6)',boxShadow:'0 10px 30px rgba(0,0,0,0.6)',zIndex:2}} />
                <img src="/cheongi_tarot_17_star.png" alt="" style={{position:'absolute',width:'78px',borderRadius:'8px',border:'1px solid rgba(232,200,126,0.35)',boxShadow:'0 8px 24px rgba(0,0,0,0.5)',transform:'rotate(16deg) translateX(46px)',opacity:0.85}} />
              </div>
              <h1 style={{fontFamily:'serif',fontSize:'28px',fontWeight:'900',color:'#f0e6d3',marginBottom:'12px',lineHeight:'1.4'}}>오늘 당신에게<br/><span style={{color:'#c49ae8'}}>어떤 카드</span>가 올까요?</h1>
              <div style={{width:'40px',height:'2px',background:'#6030a0',margin:'16px auto'}} />
              <p style={{fontSize:'13px',color:'#6040a0',fontStyle:'italic',marginBottom:'28px'}}>"카드는 이미 당신을 알고 있습니다"</p>

              {/* 스프레드 선택 */}
              <div style={{marginBottom:'24px',textAlign:'left'}}>
                <label style={{display:'block',fontSize:'12px',color:'rgba(200,180,240,0.5)',marginBottom:'10px',letterSpacing:'1px'}}>스프레드 선택</label>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  {SPREAD_TYPES.map(s => (
                    <button key={s.id} onClick={() => setSpreadType(s)}
                      style={{padding:'12px 16px',background:spreadType.id===s.id?'rgba(120,50,200,0.3)':'rgba(120,50,200,0.08)',border:`1.5px solid ${spreadType.id===s.id?'#9060d0':'#2d1560'}`,borderRadius:'8px',color:spreadType.id===s.id?'#e8c97a':'#9070b0',cursor:'pointer',textAlign:'left',fontSize:'14px',fontWeight:spreadType.id===s.id?'700':'400',display:'flex',alignItems:'center',gap:'10px'}}>
                      <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',minWidth:'34px',height:'22px',borderRadius:'4px',fontSize:'11px',fontWeight:'700',letterSpacing:'0.5px',background:spreadType.id===s.id?'rgba(232,200,126,0.18)':'rgba(144,96,208,0.15)',color:spreadType.id===s.id?'#e8c97a':'#9070b0',border:`1px solid ${spreadType.id===s.id?'rgba(232,200,126,0.4)':'rgba(144,96,208,0.3)'}`}}>{s.count}장</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 질문 입력 */}
              <div style={{marginBottom:'24px',textAlign:'left'}}>
                <label style={{display:'block',fontSize:'12px',color:'rgba(200,180,240,0.5)',marginBottom:'8px',letterSpacing:'1px'}}>궁금한 것이 있다면 적어보세요 (선택)</label>
                <input type="text" placeholder="예: 이번 달 연애운이 궁금해요" value={question} onChange={e=>setQuestion(e.target.value)}
                  style={{width:'100%',background:'rgba(120,50,200,0.1)',border:'1px solid #3d1560',borderRadius:'6px',padding:'14px 16px',color:'#f0e6d3',fontSize:'14px',outline:'none'}}/>
              </div>

              <button onClick={startReading} style={{width:'100%',background:'linear-gradient(135deg,#3d1560,#6030a0)',color:'#e8c97a',padding:'16px',border:'1.5px solid #9060d0',borderRadius:'6px',fontSize:'16px',fontWeight:'800',cursor:'pointer',letterSpacing:'1px',fontFamily:'serif'}}>
                카드 펼치기 🃏
              </button>
            </div>
          )}

          {step === 'pick' && (
            <div className="fade-in">
              <div style={{textAlign:'center',marginBottom:'20px'}}>
                <h2 style={{fontFamily:'serif',fontSize:'20px',color:'#c49ae8',marginBottom:'8px'}}>
                  {picked.length < spreadType.count
                    ? `${spreadType.positions[picked.length]} 카드를 선택하세요`
                    : '카드를 모두 선택했어요'}
                </h2>
                <p style={{fontSize:'13px',color:'#6040a0'}}>
                  {picked.length} / {spreadType.count} 장 선택됨
                </p>
              </div>

              {/* 선택된 카드 표시 */}
              {picked.length > 0 && (
                <div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'20px'}}>
                  {picked.map((card, i) => (
                    <div key={card.id} style={{textAlign:'center',background:'rgba(120,50,200,0.2)',border:'1.5px solid #9060d0',borderRadius:'8px',padding:'8px',flex:1}}>
                      <img src={card.img} alt={card.name} style={{width:'100%',aspectRatio:'2/3',objectFit:'cover',borderRadius:'4px',marginBottom:'6px',transform:card.reversed?'rotate(180deg)':'none'}} />
                      <div style={{fontSize:'10px',color:'#c49ae8'}}>{spreadType.positions[i]}</div>
                      <div style={{fontSize:'11px',color:'#9070b0',marginTop:'2px'}}>{card.name}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
                {cards.slice(0, 16).map((card, idx) => {
                  const isPicked = picked.find(p => p.id === card.id);
                  return (
                    <div key={card.id} onClick={() => !isPicked && pickCard(card)}
                      className={isPicked ? '' : 'card-item'}
                      style={{background:isPicked?'rgba(120,50,200,0.1)':'linear-gradient(135deg,#1a0a2a,#2d1060)',border:`1.5px solid ${isPicked?'#3d1560':'#3d1560'}`,borderRadius:'8px',padding:'14px 6px',textAlign:'center',opacity:isPicked?0.4:1,cursor:isPicked?'default':'pointer'}}>
                      <div style={{fontSize:'24px',marginBottom:'4px'}}>{isPicked ? '✓' : '🎴'}</div>
                      <div style={{fontSize:'10px',color:'#6040a0'}}>{idx + 1}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="fade-in">
              {loading ? (
                <div style={{textAlign:'center',padding:'60px 0'}}>
                  <div style={{fontSize:'48px',marginBottom:'20px'}} className="float">🔮</div>
                  <p style={{fontSize:'16px',color:'#c49ae8'}}>카드의 메시지를 읽고 있어요...</p>
                </div>
              ) : (
                <>
                  {/* 뽑힌 카드들 */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'24px'}}>
                    {picked.map((card, i) => (
                      <div key={card.id} style={{flex:1,textAlign:'center',background:'rgba(120,50,200,0.15)',border:'1.5px solid #6030a0',borderRadius:'10px',padding:'12px 8px'}}>
                        <img src={card.img} alt={card.name} className="float" style={{width:'100%',aspectRatio:'2/3',objectFit:'cover',borderRadius:'6px',marginBottom:'8px',border:'1px solid rgba(232,200,126,0.2)',transform:card.reversed?'rotate(180deg)':'none'}} />
                        <div style={{fontSize:'10px',color:'#9060d0',marginBottom:'2px'}}>{spreadType.positions[i]}</div>
                        <div style={{fontSize:'12px',color:'#c49ae8',fontWeight:'700'}}>{card.name}</div>
                        {card.reversed && <div style={{fontSize:'10px',color:'#6040a0',marginTop:'2px'}}>역방향</div>}
                      </div>
                    ))}
                  </div>

                  {/* 해석 */}
                  <div style={{background:'#1a0a2a',border:'1px solid #3d1560',borderRadius:'8px',padding:'24px',marginBottom:'20px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap',color:'#f0e6d3'}}>
                    {result}
                  </div>

                  <button onClick={()=>{setStep('intro');setQuestion('');setPicked([]);}} style={{width:'100%',background:'linear-gradient(135deg,#3d1560,#6030a0)',color:'#e8c97a',padding:'14px',border:'1.5px solid #9060d0',borderRadius:'6px',fontSize:'15px',fontWeight:'700',cursor:'pointer',fontFamily:'serif',marginBottom:'12px'}}>
                    다시 뽑기 🃏
                  </button>
                  <a href="/" style={{display:'block',textAlign:'center',color:'#6040a0',fontSize:'13px',textDecoration:'none',padding:'10px'}}>← 처음으로</a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
