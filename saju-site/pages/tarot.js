import { useState } from 'react';
import Head from 'next/head';

const TAROT_CARDS = [
  { id: 0, name: '바보', nameEn: 'The Fool', emoji: '🌟' },
  { id: 1, name: '마법사', nameEn: 'The Magician', emoji: '🔮' },
  { id: 2, name: '여사제', nameEn: 'The High Priestess', emoji: '🌙' },
  { id: 3, name: '여황제', nameEn: 'The Empress', emoji: '🌸' },
  { id: 4, name: '황제', nameEn: 'The Emperor', emoji: '👑' },
  { id: 5, name: '교황', nameEn: 'The Hierophant', emoji: '✨' },
  { id: 6, name: '연인', nameEn: 'The Lovers', emoji: '💑' },
  { id: 7, name: '전차', nameEn: 'The Chariot', emoji: '⚡' },
  { id: 8, name: '힘', nameEn: 'Strength', emoji: '🦁' },
  { id: 9, name: '은둔자', nameEn: 'The Hermit', emoji: '🕯️' },
  { id: 10, name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', emoji: '🎡' },
  { id: 11, name: '정의', nameEn: 'Justice', emoji: '⚖️' },
  { id: 12, name: '매달린 사람', nameEn: 'The Hanged Man', emoji: '🌿' },
  { id: 13, name: '죽음', nameEn: 'Death', emoji: '🦋' },
  { id: 14, name: '절제', nameEn: 'Temperance', emoji: '🌊' },
  { id: 15, name: '악마', nameEn: 'The Devil', emoji: '🔥' },
  { id: 16, name: '탑', nameEn: 'The Tower', emoji: '⛈️' },
  { id: 17, name: '별', nameEn: 'The Star', emoji: '⭐' },
  { id: 18, name: '달', nameEn: 'The Moon', emoji: '🌕' },
  { id: 19, name: '태양', nameEn: 'The Sun', emoji: '☀️' },
  { id: 20, name: '심판', nameEn: 'Judgement', emoji: '🎺' },
  { id: 21, name: '세계', nameEn: 'The World', emoji: '🌍' },
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
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');

  const startReading = () => {
    const shuffled = shuffle(TAROT_CARDS).slice(0, 9);
    const withReverse = shuffled.map(c => ({ ...c, reversed: Math.random() > 0.7 }));
    setCards(withReverse);
    setStep('pick');
    setFlipped(null);
    setResult('');
  };

  const pickCard = async (card) => {
    if (flipped !== null) return;
    setFlipped(card.id);
    setLoading(true);
    setStep('result');

    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tarot',
          card: card.name,
          cardEn: card.nameEn,
          reversed: card.reversed,
          question: question || '오늘 하루의 흐름'
        })
      });
      const data = await res.json();
      setResult(data.result || '카드의 메시지를 읽을 수 없습니다.');
    } catch {
      setResult('잠시 후 다시 시도해주세요.');
    }
    setLoading(false);
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
          <div style={{fontSize:'13px',color:'#c49ae8'}}>🃏 오늘의 타로</div>
        </div>

        <div style={{maxWidth:'480px',margin:'0 auto',padding:'28px 20px 80px'}}>

          {step === 'intro' && (
            <div style={{textAlign:'center'}} className="fade-in">
              <div style={{fontSize:'72px',marginBottom:'24px'}} className="float">🃏</div>
              <div style={{display:'inline-block',background:'rgba(120,50,200,0.2)',border:'1px solid #6030a0',color:'#c49ae8',fontSize:'12px',padding:'5px 16px',borderRadius:'20px',marginBottom:'20px',letterSpacing:'1px'}}>✦ 메이저 아르카나 22장 ✦</div>
              <h1 style={{fontFamily:'serif',fontSize:'28px',fontWeight:'900',color:'#f0e6d3',marginBottom:'12px',lineHeight:'1.4'}}>오늘 당신에게<br/><span style={{color:'#c49ae8'}}>어떤 카드</span>가 올까요?</h1>
              <div style={{width:'40px',height:'2px',background:'#6030a0',margin:'16px auto'}} />
              <p style={{fontSize:'14px',color:'#9070b0',lineHeight:'1.8',marginBottom:'8px'}}>마음을 고요히 하고<br/>궁금한 것을 떠올려보세요</p>
              <p style={{fontSize:'13px',color:'#6040a0',fontStyle:'italic',marginBottom:'32px'}}>"카드는 이미 당신을 알고 있습니다"</p>

              <div style={{marginBottom:'24px',textAlign:'left'}}>
                <label style={{display:'block',fontSize:'12px',color:'rgba(200,180,240,0.5)',marginBottom:'8px',letterSpacing:'1px'}}>궁금한 것이 있다면 적어보세요 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 이번 달 연애운이 궁금해요"
                  value={question}
                  onChange={e=>setQuestion(e.target.value)}
                  style={{width:'100%',background:'rgba(120,50,200,0.1)',border:'1px solid #3d1560',borderRadius:'6px',padding:'14px 16px',color:'#f0e6d3',fontSize:'14px',outline:'none'}}
                />
              </div>

              <button onClick={startReading} style={{width:'100%',background:'linear-gradient(135deg,#3d1560,#6030a0)',color:'#e8c97a',padding:'16px',border:'1.5px solid #9060d0',borderRadius:'6px',fontSize:'16px',fontWeight:'800',cursor:'pointer',letterSpacing:'1px',fontFamily:'serif'}}>
                카드 펼치기 🃏
              </button>
            </div>
          )}

          {step === 'pick' && (
            <div className="fade-in">
              <div style={{textAlign:'center',marginBottom:'28px'}}>
                <h2 style={{fontFamily:'serif',fontSize:'22px',color:'#c49ae8',marginBottom:'8px'}}>끌리는 카드를 하나 선택하세요</h2>
                <p style={{fontSize:'13px',color:'#6040a0'}}>직감을 믿으세요 · 마음이 가는 카드가 당신의 카드입니다</p>
              </div>
              <div style={{display:'grid',gridTem
