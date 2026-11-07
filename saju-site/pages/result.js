import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { DAY_TYPES, ELEMENT_COLOR, TypeIcon, helperTypes, drawStoryCard } from '../lib/dayTypes';
import NewYearPopup from '../lib/NewYearPopup';

const OHAENG_COLOR = {
  '목': '#4a9e4a', '화': '#e05a2b', '토': '#c4962a',
  '금': '#a0a0c0', '수': '#3a7ab8'
};

const CHEONGAN_OHAENG = {
  '갑':'목','을':'목','병':'화','정':'화','무':'토',
  '기':'토','경':'금','신':'금','임':'수','계':'수'
};
const JIJI_OHAENG = {
  '자':'수','축':'토','인':'목','묘':'목','진':'토','사':'화',
  '오':'화','미':'토','신':'금','유':'금','술':'토','해':'수'
};

// 천간 10개 + 지지 12개 한 줄 성향 — 일주(일간+일지)를 바로 풀어서
// AI 해석이 나오기 전에도 "나는 어떤 사람"이 즉시 보이게 하기 위한 데이터
const CHEONGAN_TRAIT = {
  '갑':'큰 나무처럼 곧고 당당해서 자연스럽게 리더 역할을 맡는 타입',
  '을':'덩굴 식물처럼 유연하고 세심하며 계획을 세우는 힘이 뛰어난 타입',
  '병':'강한 태양처럼 따뜻하고 활발해서 주변에 에너지를 퍼뜨리는 타입',
  '정':'촛불처럼 섬세하고 따뜻한 마음으로 사람을 챙기는 타입',
  '무':'큰 산처럼 듬직해서 곁에 있으면 안정감과 신뢰를 주는 타입',
  '기':'논밭의 흙처럼 다정하고 현실적인 감각으로 일을 풀어가는 타입',
  '경':'날카로운 강철처럼 강단 있고 직설적으로 밀고 나가는 타입',
  '신':'보석처럼 반짝여서 세련되고 세심한 감각을 지닌 타입',
  '임':'큰 강물처럼 여유롭고 포용력 있게 사람을 품는 타입',
  '계':'이슬비처럼 조용하지만 지혜롭게 상황을 꿰뚫어 보는 타입',
};
const JIJI_TRAIT = {
  '자':'잔잔한 호수처럼 총명하고 민첩하게 상황을 살피는 관찰자형',
  '축':'묵묵한 밭처럼 느리지만 단단하고 인내심이 강한 타입',
  '인':'숲속의 호랑이처럼 용맹하고 직관적으로 앞장서는 리더형',
  '묘':'봄의 들꽃처럼 유연하고 따뜻한 감성을 지닌 타입',
  '진':'하늘을 나는 용처럼 야망이 크고 에너지가 넘치는 타입',
  '사':'조용한 불꽃처럼 지혜롭고 집중력이 강한 전략가형',
  '오':'달리는 말처럼 열정적이고 솔직하게 행동하는 타입',
  '미':'푸른 초원의 양처럼 부드럽고 배려심이 깊은 평화주의자형',
  '신':'재주 많은 원숭이처럼 재치 있고 두뇌 회전이 빠른 타입',
  '유':'반짝이는 닭처럼 깔끔하고 세련된 완벽주의자형',
  '술':'충직한 개처럼 신뢰감 있고 의리가 깊은 수호자형',
  '해':'넉넉한 강물처럼 포용력 있고 순한 낙천가형',
};

const LOADING_MESSAGES = [
  '천기소녀가 하늘의 기운을 읽고 있어요...',
  '사주팔자를 하나하나 짚어보는 중이에요...',
  '거의 다 왔어요, 조금만 기다려주세요...',
];

// 스트리밍되는 해석 텍스트를 섹션(이모지로 시작하는 줄) 단위로 잘라
// 카톡처럼 말풍선이 하나씩 툭툭 나타나는 형태로 보여주기 위한 헬퍼
const SECTION_EMOJI = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
function splitIntoBubbles(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const bubbles = [];
  let current = '';
  lines.forEach(line => {
    if (SECTION_EMOJI.test(line.trim()) && current.trim()) {
      bubbles.push(current.trim());
      current = line + '\n';
    } else {
      current += line + '\n';
    }
  });
  if (current.trim()) bubbles.push(current.trim());
  return bubbles;
}

const QUESTION_CHIPS = [
  '오늘 하루 어떻게 보내면 좋을까요?',
  '저랑 잘 맞는 사람은 어떤 타입이에요?',
  '제가 제일 조심해야 할 건 뭐예요?',
  '저한테 맞는 일이나 직업은 뭐예요?',
  '올해 돈 관리는 어떻게 하는 게 좋아요?',
];

// 채팅 영역 맨 위에서 "여기서 뭘 할 수 있는지" 보여주는 안내 카드
const CHAT_USES = [
  { k: '연애', d: '그 사람과 나, 잘 맞을까' },
  { k: '일·진로', d: '나한테 맞는 방향' },
  { k: '돈', d: '모을 때와 쓸 때' },
  { k: '오늘', d: '하루를 보내는 법' },
];

const CHAT_EXTRA_PRICE = 1000;

function makeOrderId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'ord-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

export default function Result() {
  const router = useRouter();
  const [result, setResult] = useState('');
  const [sajuData, setSajuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [freeUsed, setFreeUsed] = useState(false);
  const [payPhone, setPayPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [chatPayProcessed, setChatPayProcessed] = useState(false);
  const [storyState, setStoryState] = useState('');

  const saveStoryCard = async (gan) => {
    if (storyState === 'saving') return;
    setStoryState('saving');
    try {
      const blob = await drawStoryCard({ gan, name: router.query.name, pillars: sajuData?.pillars });
      const file = new File([blob], `cheongi_${DAY_TYPES[gan].name}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: '천기소녀 · 나의 타입' }); setStoryState('done'); return; } catch (e) { if (e && e.name === 'AbortError') { setStoryState(''); return; } }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStoryState('done');
    } catch { setStoryState('error'); }
  };

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('cheongi_chat_free_date') === today) setFreeUsed(true);
    } catch {}
  }, []);

  // 추가 질문 결제 후 돌아왔을 때 — 결제 확인되면 미리 저장해둔 질문을 자동으로 전송
  useEffect(() => {
    if (!router.isReady || chatPayProcessed) return;
    const oid = router.query.chatOrderId;
    if (!oid || !sajuData) return;
    setChatPayProcessed(true);
    pollChatReveal(oid, 0);
  }, [router.isReady, sajuData, chatPayProcessed]);

  const pollChatReveal = async (oid, attempt) => {
    try {
      const res = await fetch('/api/payapp/reveal?orderId=' + encodeURIComponent(oid));
      if (res.status === 200) {
        const data = await res.json();
        if (data.paid && data.stash?.question) {
          sendChatQuestion(data.stash.question, true);
          return;
        }
      }
    } catch {}
    if (attempt < 20) {
      setTimeout(() => pollChatReveal(oid, attempt + 1), 1500);
    } else {
      setPayError('결제 확인이 늦어지고 있어요. 잠시 후 새로고침 해주세요.');
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const { name, year, month, day, hour, gender, calendar } = router.query;
    if (!name) return;

    (async () => {
      try {
        const res = await fetch('/api/saju', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, year, month, day, hour, gender, calendar })
        });

        const sajuHeader = res.headers.get('X-Saju-Data');
        if (sajuHeader) {
          try { setSajuData(JSON.parse(decodeURIComponent(sajuHeader))); } catch {}
        }

        // 스트리밍 응답이 아니면(에러 등) 기존 방식대로 JSON 처리
        const contentType = res.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          setResult(data.result || '분석 결과를 불러올 수 없습니다.');
          setSajuData(data.sajuData || null);
          setLoading(false);
          return;
        }

        if (!res.body) {
          setResult('잠시 후 다시 시도해주세요.');
          setLoading(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        let first = true;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setResult(acc);
          if (first) { setLoading(false); first = false; }
        }
        setLoading(false);
      } catch {
        setResult('잠시 후 다시 시도해주세요.');
        setLoading(false);
      }
    })();
  }, [router.isReady]);

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); return; }
    const timer = setInterval(() => {
      setLoadingMsgIdx(i => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [loading]);

  const { name, year, month, day } = router.query;

  const markFreeUsed = () => {
    setFreeUsed(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('cheongi_chat_free_date', today);
    } catch {}
  };

  const sendChatQuestion = async (q, skipFreeCheck) => {
    if (!q || !q.trim() || chatLoading) return;
    if (freeUsed && !skipFreeCheck) return;
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', sajuData, question: q })
      });

      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'char', text: data.result || '지금은 답하기 어려워요.' }]);
        setChatLoading(false);
        markFreeUsed();
        return;
      }

      if (!res.body) {
        setChatMessages(prev => [...prev, { role: 'char', text: '잠시 후 다시 시도해주세요.' }]);
        setChatLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setChatMessages(prev => [...prev, { role: 'char', text: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'char', text: acc };
          return next;
        });
      }
      setChatLoading(false);
      markFreeUsed();
    } catch {
      setChatMessages(prev => [...prev, { role: 'char', text: '오류가 발생했어요. 잠시 후 다시 시도해주세요.' }]);
      setChatLoading(false);
    }
  };

  const startChatPayment = async () => {
    if (!chatInput.trim()) return;
    const phoneDigits = payPhone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 9) {
      setPayError('휴대폰번호를 정확히 입력해주세요.');
      return;
    }
    setPaying(true); setPayError('');
    try {
      const oid = makeOrderId();
      const qs = new URLSearchParams(router.query).toString();
      const returnPath = `/result?${qs}${qs ? '&' : ''}chatOrderId=${oid}`;
      const res = await fetch('/api/payapp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: oid,
          goodname: '천기소녀 추가 질문',
          price: CHAT_EXTRA_PRICE,
          recvphone: phoneDigits,
          returnPath,
          stash: { question: chatInput.trim() },
        })
      });
      const data = await res.json();
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

  const strongestOhaeng = sajuData ? Object.entries(sajuData.strength).sort((a, b) => b[1] - a[1])[0][0] : null;
  const openingLine = sajuData
    ? `${name || '의뢰인'}님은 오행 중 ${strongestOhaeng} 기운이 유독 강한 ${sajuData.singang} 사주예요. 오늘은 뭐가 제일 궁금해요?`
    : '';

  // 일주(일간+일지) = "나"를 나타내는 기둥 — 천간/지지 한 줄 성향을 이어붙여
  // AI 해석이 로딩되기 전에도 바로 보여줄 수 있는 즉시 표시용 블러브
  const dayPillar = sajuData?.pillars?.day;
  const iljuBlurb = dayPillar && dayPillar.length >= 2 && CHEONGAN_TRAIT[dayPillar[0]] && JIJI_TRAIT[dayPillar[1]]
    ? `일간은 ${CHEONGAN_TRAIT[dayPillar[0]]}이고, 일지는 ${JIJI_TRAIT[dayPillar[1]]}예요. 두 기운이 합쳐진 게 ${name || '의뢰인'}님의 바탕 성향이에요.`
    : null;

  const PillarCard = ({ label, pillar, sipsin }) => {
    if (!pillar) return null;
    const gan = pillar[0];
    const ji = pillar[1];
    const ganOhaeng = CHEONGAN_OHAENG[gan];
    const jiOhaeng = JIJI_OHAENG[ji];
    return (
      <div style={{flex:1,textAlign:'center',minWidth:0}}>
        <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'6px',letterSpacing:'1px'}}>{label}</div>
        {sipsin && <div style={{fontSize:'11px',color:'#c4956a',marginBottom:'4px'}}>{sipsin.ganSipsin}</div>}
        <div style={{background:`${OHAENG_COLOR[ganOhaeng]}22`,border:`1.5px solid ${OHAENG_COLOR[ganOhaeng]}`,borderRadius:'6px',padding:'10px 4px',marginBottom:'4px'}}>
          <div style={{fontSize:'22px',fontWeight:'900',color:OHAENG_COLOR[ganOhaeng],fontFamily:'serif'}}>{gan}</div>
          <div style={{fontSize:'10px',color:OHAENG_COLOR[ganOhaeng],opacity:0.8}}>+{ganOhaeng}</div>
        </div>
        <div style={{background:`${OHAENG_COLOR[jiOhaeng]}22`,border:`1.5px solid ${OHAENG_COLOR[jiOhaeng]}`,borderRadius:'6px',padding:'10px 4px',marginBottom:'4px'}}>
          <div style={{fontSize:'22px',fontWeight:'900',color:OHAENG_COLOR[jiOhaeng],fontFamily:'serif'}}>{ji}</div>
          <div style={{fontSize:'10px',color:OHAENG_COLOR[jiOhaeng],opacity:0.8}}>+{jiOhaeng}</div>
        </div>
        {sipsin && <div style={{fontSize:'11px',color:'#9070a0',marginTop:'4px'}}>{sipsin.jiSipsin}</div>}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>사주 결과 — 천기소녀</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * {box-sizing:border-box;margin:0;padding:0;}
          body {background:#1a0a00;color:#f0e6d3;font-family:'Noto Sans KR',sans-serif;word-break:keep-all;}
          @keyframes bubbleIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes orbit { to{transform:rotate(360deg)} }
          @keyframes orbitRev { to{transform:rotate(-360deg)} }
          @keyframes corePulse { 0%,100%{transform:scale(.9);opacity:.7} 50%{transform:scale(1.1);opacity:1} }
          @keyframes msgFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
          @keyframes pillarIn { from{opacity:0;transform:perspective(600px) rotateY(90deg)} to{opacity:1;transform:perspective(600px) rotateY(0)} }
          @keyframes barGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
          @keyframes softIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
          .loader { position:relative; width:150px; height:150px; margin:0 auto 28px; }
          .loader-orbit { position:absolute; inset:0; border-radius:50%; border:1px dashed rgba(232,201,122,.25); animation: orbit 6s linear infinite; }
          .loader-orbit span { position:absolute; width:14px; height:14px; border-radius:50%; transform:translate(-50%,-50%); }
          .loader-ring { position:absolute; inset:28px; border-radius:50%; border:1px solid rgba(232,201,122,.2); animation: orbitRev 9s linear infinite; }
          .loader-ring b { position:absolute; font-family:serif; font-size:13px; color:rgba(232,201,122,.6); transform:translate(-50%,-50%); font-weight:400; }
          .loader-core { position:absolute; inset:58px; border-radius:50%; background:radial-gradient(circle,#ffe7a8,#c4956a 60%,transparent 70%); animation: corePulse 2s ease-in-out infinite; box-shadow:0 0 30px rgba(232,201,122,.5); }
          .loading-msg { animation: msgFade .6s ease; }
          .pillar-in { opacity:0; animation: pillarIn .7s cubic-bezier(.23,1,.32,1) forwards; }
          .bar-grow { transform-origin:left center; animation: barGrow 1.1s cubic-bezier(.23,1,.32,1) both; }
          .soft-in { opacity:0; animation: softIn .8s ease forwards; }
          @media (prefers-reduced-motion: reduce) { *{animation:none !important} .pillar-in,.soft-in{opacity:1 !important} }
          .chat-bubble { animation: bubbleIn 0.4s ease forwards; }
          @keyframes typeSpin { to{transform:rotate(360deg)} }
          @keyframes typeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes askGlow { 0%,100%{box-shadow:0 0 0 0 rgba(196,113,42,.0)} 50%{box-shadow:0 0 18px 0 rgba(196,113,42,.45)} }
          .type-ring { position:absolute; inset:0; border-radius:50%; border:1.5px dashed var(--tc); opacity:.6; animation: typeSpin 18s linear infinite; }
          .type-icon-wrap > div:last-child { animation: typeFloat 4s ease-in-out infinite; }
          .ask-jump { animation: askGlow 2.6s ease-in-out infinite; }
          .story-btn { transition: transform .2s, filter .2s; }
          .story-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
        `}</style>
      </Head>

      <div style={{minHeight:'100vh',background:'#1a0a00'}}>
        {/* 헤더 */}
        <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(26,10,0,0.97)',backdropFilter:'blur(10px)',borderBottom:'1px solid #3d1500',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" style={{display:'flex',alignItems:'center',gap:'8px',color:'#e8c97a',fontSize:'18px',fontWeight:'900',textDecoration:'none',fontFamily:'serif',letterSpacing:'2px'}}><img src="/logo_symbol.png" alt="" style={{width:'24px',height:'24px',objectFit:'contain'}} />천기소녀</a>
        </div>

        <div style={{maxWidth:'600px',margin:'0 auto',padding:'28px 20px 80px'}}>

          {/* 이름/날짜 */}
          <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
            <h2 style={{fontFamily:'serif',fontSize:'20px',color:'#e8c97a',marginBottom:'4px'}}>{name}님의 사주</h2>
            <p style={{color:'#7a5030',fontSize:'14px'}}>{year}년 {month}월 {day}일생</p>
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div className="loader" aria-hidden="true">
                <div className="loader-orbit">
                  {Object.values(OHAENG_COLOR).map((c,i)=>{ const a=i*2*Math.PI/5; return <span key={i} style={{left:`${50+50*Math.sin(a)}%`,top:`${50-50*Math.cos(a)}%`,background:c,boxShadow:`0 0 12px ${c}`}} />; })}
                </div>
                <div className="loader-ring">
                  {['甲','丙','戊','庚','壬','子','午','卯','酉'].map((ch,i,arr)=>{ const a=i*2*Math.PI/arr.length; return <b key={i} style={{left:`${50+50*Math.sin(a)}%`,top:`${50-50*Math.cos(a)}%`}}>{ch}</b>; })}
                </div>
                <div className="loader-core" />
              </div>
              <p key={loadingMsgIdx} className="loading-msg" style={{fontSize:'16px',color:'#c4956a'}}>{LOADING_MESSAGES[loadingMsgIdx]}</p>
            </div>
          ) : (
            <>
              {/* 나의 일간 타입 카드 */}
              {sajuData && DAY_TYPES[sajuData.pillars?.day?.[0]] && (() => {
                const gan = sajuData.pillars.day[0];
                const t = DAY_TYPES[gan];
                const col = ELEMENT_COLOR[t.el];
                const helpers = helperTypes(gan);
                return (
                  <div className="soft-in type-card" style={{'--tc':col,position:'relative',overflow:'hidden',background:`radial-gradient(circle at 50% 0%, ${col}33, transparent 60%), #1f0a00`,border:`1px solid ${col}66`,borderRadius:'10px',padding:'26px 20px 22px',marginBottom:'20px',textAlign:'center'}}>
                    <div style={{fontSize:'11px',letterSpacing:'3px',color:'#c4956a',marginBottom:'14px'}}>궁중에 태어났다면 나는</div>
                    <div className="type-icon-wrap" style={{position:'relative',width:'120px',height:'120px',margin:'0 auto 14px'}}>
                      <div className="type-ring" />
                      <div style={{position:'absolute',inset:'18px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <TypeIcon gan={gan} size={84} strokeWidth={1.8} style={{filter:`drop-shadow(0 0 8px ${col})`}} />
                      </div>
                    </div>
                    <div style={{fontSize:'14px',color:'#e0c9a8',marginBottom:'2px'}}>{name}님은</div>
                    <div style={{fontFamily:'serif',fontSize:'34px',fontWeight:'900',color:col,lineHeight:'1.2'}}>{t.name}</div>
                    <div style={{fontFamily:'serif',fontSize:'13px',color:'#c4956a',margin:'4px 0 12px'}}>{t.hanja} · {t.title}</div>
                    <p style={{fontSize:'15px',color:'#f0e6d3',lineHeight:'1.6',marginBottom:'12px'}}>{t.line}</p>
                    <div style={{display:'flex',gap:'6px',justifyContent:'center',flexWrap:'wrap',marginBottom:'14px'}}>
                      {t.tags.map(tg => <span key={tg} style={{fontSize:'12px',color:col,border:`1px solid ${col}88`,borderRadius:'14px',padding:'4px 10px'}}>#{tg}</span>)}
                    </div>
                    {helpers.length > 0 && <div style={{fontSize:'12px',color:'#a08060',marginBottom:'16px'}}>나를 살려주는 타입 · {helpers.join(', ')}</div>}
                    <button onClick={()=>saveStoryCard(gan)} className="story-btn" style={{background:col,color:'#1a0a00',border:'none',borderRadius:'24px',padding:'12px 22px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                      {storyState === 'saving' ? '이미지 만드는 중...' : '인스타 스토리용 이미지 저장'}
                    </button>
                    {storyState === 'done' && <div style={{fontSize:'12px',color:'#c4956a',marginTop:'8px'}}>저장됐어요. 스토리에 올리고 친구 타입도 물어보세요</div>}
                    {storyState === 'error' && <div style={{fontSize:'12px',color:'#ff6b6b',marginTop:'8px'}}>이미지를 만들지 못했어요. 다시 눌러주세요</div>}
                  </div>
                );
              })()}

              {/* 사주원국 표 */}
              {sajuData && (
                <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
                  <div style={{textAlign:'center',fontFamily:'serif',fontSize:'14px',color:'#e8c97a',marginBottom:'16px',letterSpacing:'2px'}}>✦ 사주원국 ✦</div>

                  {/* 천간/지지 카드 */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
                    {[
                      {label:'시주', pillar:sajuData.pillars.hour, sipsin:sajuData.sipsin?.[3]},
                      {label:'일주', pillar:sajuData.pillars.day, sipsin:sajuData.sipsin?.[2]},
                      {label:'월주', pillar:sajuData.pillars.month, sipsin:sajuData.sipsin?.[1]},
                      {label:'년주', pillar:sajuData.pillars.year, sipsin:sajuData.sipsin?.[0]},
                    ].map((p,i)=>(
                      <div key={i} className="pillar-in" style={{flex:1,minWidth:0,display:'flex',animationDelay:`${0.15 + i*0.18}s`}}><PillarCard {...p} /></div>
                    ))}
                  </div>

                  {/* 오행 강약 바 */}
                  <div style={{borderTop:'1px solid #3d1500',paddingTop:'14px'}}>
                    <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'10px',letterSpacing:'1px',textAlign:'center'}}>오행 강약</div>
                    {Object.entries(sajuData.strength).map(([k,v])=>(
                      <div key={k} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                        <div style={{width:'20px',fontSize:'12px',color:OHAENG_COLOR[k],fontWeight:'700'}}>{k}</div>
                        <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'4px',height:'8px',overflow:'hidden'}}>
                          <div className="bar-grow" style={{width:`${Math.min(v/6*100,100)}%`,height:'100%',background:OHAENG_COLOR[k],borderRadius:'4px',animationDelay:'0.9s'}} />
                        </div>
                        <div style={{width:'24px',fontSize:'11px',color:'#c4956a',textAlign:'right'}}>{v}</div>
                      </div>
                    ))}
                    <div style={{textAlign:'center',marginTop:'10px'}}>
                      <span style={{fontSize:'12px',color:'#e8c97a',background:'rgba(139,46,0,0.3)',padding:'3px 12px',borderRadius:'10px',border:'1px solid #3d1500'}}>{sajuData.singang} 사주</span>
                    </div>
                  </div>

                  {/* 일주 한 줄 성향 — AI 해석이 뜨기 전에도 바로 보이는 즉시 표시 블러브 */}
                  {iljuBlurb && (
                    <div className="soft-in" style={{borderTop:'1px solid #3d1500',marginTop:'14px',paddingTop:'14px',animationDelay:'1.5s'}}>
                      <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'8px',letterSpacing:'1px',textAlign:'center'}}>일주로 보는 바탕 성향</div>
                      <p style={{fontSize:'13px',color:'#e0c9a8',lineHeight:'1.6',textAlign:'center'}}>{iljuBlurb}</p>
                    </div>
                  )}
                </div>
              )}

              {sajuData && (
                <a href="#ask" className="ask-jump" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px',background:'linear-gradient(90deg,#3a1600,#2d0f00)',border:'1px solid #c4712a',borderRadius:'10px',padding:'14px 16px',marginBottom:'20px',textDecoration:'none'}}>
                  <span style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <img src="/logo_symbol.png" alt="" style={{width:'28px',height:'28px'}} />
                    <span style={{textAlign:'left'}}>
                      <span style={{display:'block',fontSize:'14px',color:'#e8c97a',fontWeight:'700'}}>궁금한 건 천기소녀에게 바로 물어보세요</span>
                      <span style={{display:'block',fontSize:'12px',color:'#c4956a'}}>내 사주를 보고 1:1로 답해줘요 · 오늘 1회 무료</span>
                    </span>
                  </span>
                  <span style={{color:'#e8c97a',fontSize:'18px'}}>↓</span>
                </a>
              )}

              {/* 분석 결과 — 카톡처럼 말풍선으로 하나씩 */}
              <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'20px'}}>
                {splitIntoBubbles(result).map((bubble, i) => (
                  <div key={i} className="chat-bubble" style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                    <img src="/logo_symbol.png" alt="" style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid #3d1500',background:'#2d1500',objectFit:'contain',padding:'4px',flexShrink:0,marginTop:'2px'}} />
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'4px',paddingLeft:'2px'}}>천기소녀</div>
                      <div style={{background:'#2d1500',border:'1px solid #3d1500',borderRadius:'4px 14px 14px 14px',padding:'14px 16px',color:'#f0e6d3',fontSize:'15px',lineHeight:'1.8',whiteSpace:'pre-wrap'}}>
                        {bubble}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 천기소녀와 대화하기 */}
              {sajuData && (
                <div id="ask" style={{background:'#1f0a00',border:'1px solid #c4712a',borderRadius:'10px',padding:'20px',marginBottom:'20px',scrollMarginTop:'70px'}}>
                  <div style={{textAlign:'center',marginBottom:'16px'}}>
                    <div style={{fontSize:'11px',letterSpacing:'3px',color:'#c4956a',marginBottom:'6px'}}>1:1 사주 상담</div>
                    <div style={{fontFamily:'serif',fontSize:'20px',color:'#e8c97a',fontWeight:'700',marginBottom:'6px'}}>천기소녀에게 직접 물어보기</div>
                    <p style={{fontSize:'13px',color:'#c4956a',lineHeight:'1.6'}}>방금 본 {name}님의 사주팔자를 그대로 읽고<br/>질문 하나에 딱 맞춰 답해드려요</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'14px'}}>
                    {CHAT_USES.map(u => (
                      <div key={u.k} style={{background:'rgba(232,200,126,0.05)',border:'1px solid #3d1500',borderRadius:'8px',padding:'10px 4px',textAlign:'center'}}>
                        <div style={{fontSize:'13px',color:'#e8c97a',fontWeight:'700',marginBottom:'3px'}}>{u.k}</div>
                        <div style={{fontSize:'10px',color:'#a08060',lineHeight:'1.4'}}>{u.d}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',justifyContent:'center',gap:'6px',flexWrap:'wrap',marginBottom:'16px'}}>
                    <span style={{fontSize:'11px',color:'#1a0a00',background:'#e8c97a',borderRadius:'10px',padding:'3px 10px',fontWeight:'700'}}>오늘 1회 무료</span>
                    <span style={{fontSize:'11px',color:'#e8c97a',border:'1px solid #c4712a',borderRadius:'10px',padding:'3px 10px'}}>추가 질문 1건 ₩{CHAT_EXTRA_PRICE.toLocaleString()}</span>
                    <span style={{fontSize:'11px',color:'#e8c97a',border:'1px solid #3d1500',borderRadius:'10px',padding:'3px 10px'}}>가입 없이 바로</span>
                  </div>
                  <div style={{borderTop:'1px dashed #3d1500',marginBottom:'16px'}} />

                  <div className="chat-bubble" style={{display:'flex',gap:'10px',alignItems:'flex-start',marginBottom:'14px'}}>
                    <img src="/logo_symbol.png" alt="" style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid #3d1500',background:'#2d1500',objectFit:'contain',padding:'4px',flexShrink:0,marginTop:'2px'}} />
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'4px',paddingLeft:'2px'}}>천기소녀</div>
                      <div style={{background:'#2d1500',border:'1px solid #3d1500',borderRadius:'4px 14px 14px 14px',padding:'14px 16px',color:'#f0e6d3',fontSize:'15px',lineHeight:'1.8'}}>
                        {openingLine}
                      </div>
                    </div>
                  </div>

                  {chatMessages.map((m, i) => (
                    <div key={i} className="chat-bubble" style={{display:'flex',gap:'10px',alignItems:'flex-start',marginBottom:'14px',flexDirection:m.role==='user'?'row-reverse':'row'}}>
                      {m.role==='char' && <img src="/logo_symbol.png" alt="" style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid #3d1500',background:'#2d1500',objectFit:'contain',padding:'4px',flexShrink:0,marginTop:'2px'}} />}
                      <div style={{minWidth:0,maxWidth:'80%'}}>
                        {m.role==='char' && <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'4px',paddingLeft:'2px'}}>천기소녀</div>}
                        <div style={{background:m.role==='user'?'#8b2e00':'#2d1500',border:'1px solid #3d1500',borderRadius:m.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px',padding:'14px 16px',color:'#f0e6d3',fontSize:'15px',lineHeight:'1.8',whiteSpace:'pre-wrap'}}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div style={{fontSize:'13px',color:'#7a5030',paddingLeft:'40px',marginBottom:'10px'}}>천기소녀가 답하는 중...</div>
                  )}

                  {!freeUsed && chatMessages.length === 0 && (
                    <div style={{fontSize:'12px',color:'#a08060',marginBottom:'8px'}}>눌러서 바로 물어보기</div>
                  )}
                  {!freeUsed && chatMessages.length === 0 && (
                    <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'14px'}}>
                      {QUESTION_CHIPS.map((q, i) => (
                        <button key={i} onClick={()=>sendChatQuestion(q)} disabled={chatLoading} style={{background:'rgba(232,200,126,0.08)',border:'1px solid rgba(232,200,126,0.3)',color:'#e8c97a',borderRadius:'16px',padding:'8px 14px',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{display:'flex',gap:'8px'}}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e=>setChatInput(e.target.value)}
                      onKeyDown={e=>{ if (e.key === 'Enter' && !chatLoading && !freeUsed) sendChatQuestion(chatInput); }}
                      placeholder={freeUsed ? "결제하고 물어볼 새 질문을 적어주세요" : "궁금한 걸 물어보세요"}
                      disabled={chatLoading}
                      style={{flex:1,background:'rgba(232,200,126,0.06)',border:'1px solid rgba(232,200,126,0.2)',borderRadius:'6px',padding:'12px 14px',color:'#f0e6d3',fontSize:'14px',outline:'none',fontFamily:'inherit'}}
                    />
                    {!freeUsed && (
                      <button onClick={()=>sendChatQuestion(chatInput)} disabled={chatLoading || !chatInput.trim()} style={{background:'#8b2e00',color:'#e8c97a',border:'1.5px solid #c4712a',borderRadius:'6px',padding:'0 18px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>
                        전송
                      </button>
                    )}
                  </div>

                  {!freeUsed ? (
                    <div style={{fontSize:'11px',color:'#7a5030',marginTop:'8px',textAlign:'center'}}>오늘 무료 질문 1회</div>
                  ) : (
                    <div style={{marginTop:'12px',padding:'14px',background:'rgba(232,200,126,0.04)',border:'1px solid #3d1500',borderRadius:'6px'}}>
                      <div style={{fontSize:'12px',color:'#7a5030',marginBottom:'10px',textAlign:'center'}}>오늘 무료 질문은 다 썼어요 · 위 입력창에 새 질문을 적으시면 1건당 ₩{CHAT_EXTRA_PRICE.toLocaleString()}에 답변받을 수 있어요</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'12px',justifyContent:'center'}}>
                        {QUESTION_CHIPS.map((q, i) => (
                          <button key={i} onClick={()=>setChatInput(q)} style={{background:'rgba(232,200,126,0.08)',border:'1px solid rgba(232,200,126,0.3)',color:'#e8c97a',borderRadius:'16px',padding:'7px 12px',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>
                            {q}
                          </button>
                        ))}
                      </div>
                      <input
                        type="tel"
                        value={payPhone}
                        onChange={e=>setPayPhone(e.target.value)}
                        placeholder="결제 알림 받을 휴대폰번호 (- 없이 숫자만)"
                        style={{width:'100%',background:'rgba(232,200,126,0.06)',border:'1px solid rgba(232,200,126,0.2)',borderRadius:'6px',padding:'12px 14px',color:'#f0e6d3',fontSize:'14px',outline:'none',fontFamily:'inherit',marginBottom:'8px'}}
                      />
                      {payError && <div style={{color:'#ff6b6b',fontSize:'12px',marginBottom:'8px',textAlign:'center'}}>{payError}</div>}
                      <button onClick={startChatPayment} disabled={paying || !chatInput.trim()} style={{width:'100%',background:'#8b2e00',color:'#e8c97a',border:'1.5px solid #c4712a',borderRadius:'6px',padding:'12px',fontSize:'14px',fontWeight:'700',cursor:(paying || !chatInput.trim())?'default':'pointer',opacity:(paying || !chatInput.trim())?0.5:1,fontFamily:'inherit'}}>
                        {paying ? '결제창 여는 중...' : `₩${CHAT_EXTRA_PRICE.toLocaleString()} 결제하고 질문하기`}
                      </button>
                      {!chatInput.trim() && !paying && (
                        <div style={{fontSize:'11px',color:'#c4712a',marginTop:'6px',textAlign:'center'}}>↑ 위 입력창에 질문을 먼저 적어주세요</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 유료 CTA */}
              <div style={{background:'#2d0f00',border:'1px solid #8b2e00',borderRadius:'6px',padding:'24px',textAlign:'center',marginBottom:'16px'}}>
                <div style={{fontFamily:'serif',fontSize:'18px',color:'#e8c97a',marginBottom:'8px'}}>✦ 재물운·연애운·다가올 운세가 궁금하신가요? ✦</div>
                <p style={{color:'#7a5030',fontSize:'13px',marginBottom:'20px'}}>지금 본 건 일주 성격 분석이에요 · 더 자세한 이야기는 아래에서</p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <button onClick={()=>router.push('/sinnyeon?year=2027')} style={{background:'#8b2e00',color:'#e8c97a',padding:'14px 24px',border:'1.5px solid #c4712a',borderRadius:'4px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'serif'}}>
                    2027 정미년 신년운세 보기 · ₩9,900
                  </button>
                  <button onClick={()=>router.push('/tonghap')} style={{background:'transparent',color:'#c49ae8',padding:'14px 24px',border:'1px solid #3d1560',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
                    사주+타로 통합분석 · ₩24,900
                  </button>
                  <button onClick={()=>router.push('/gunghap')} style={{background:'transparent',color:'#7a5030',padding:'12px 24px',border:'1px solid #3d1500',borderRadius:'4px',fontSize:'13px',cursor:'pointer'}}>
                    궁합 분석 보러 가기 (무료)
                  </button>
                </div>
              </div>

              <button onClick={()=>router.push('/')} style={{width:'100%',background:'none',border:'1px solid #3d1500',color:'#7a5030',padding:'14px',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
                처음으로 돌아가기
              </button>
            </>
          )}
        </div>
      </div>
      <NewYearPopup popup={false} enabled={!loading} />
    </>
  );
}
