import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

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
          body {background:#1a0a00;color:#f0e6d3;font-family:'Noto Sans KR',sans-serif;}
          @keyframes bubbleIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          .chat-bubble { animation: bubbleIn 0.4s ease forwards; }
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
              <div style={{fontSize:'48px',marginBottom:'20px'}}>🔮</div>
              <p style={{fontSize:'16px',color:'#c4956a'}}>{LOADING_MESSAGES[loadingMsgIdx]}</p>
            </div>
          ) : (
            <>
              {/* 사주원국 표 */}
              {sajuData && (
                <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
                  <div style={{textAlign:'center',fontFamily:'serif',fontSize:'14px',color:'#e8c97a',marginBottom:'16px',letterSpacing:'2px'}}>✦ 사주원국 ✦</div>

                  {/* 주 레이블 */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                    {['시주','일주','월주','년주'].map(l=>(
                      <div key={l} style={{flex:1,textAlign:'center',fontSize:'11px',color:'#7a5030',letterSpacing:'1px'}}>{l}</div>
                    ))}
                  </div>

                  {/* 천간/지지 카드 */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
                    {[
                      {label:'시주', pillar:sajuData.pillars.hour, sipsin:sajuData.sipsin?.[3]},
                      {label:'일주', pillar:sajuData.pillars.day, sipsin:sajuData.sipsin?.[2]},
                      {label:'월주', pillar:sajuData.pillars.month, sipsin:sajuData.sipsin?.[1]},
                      {label:'년주', pillar:sajuData.pillars.year, sipsin:sajuData.sipsin?.[0]},
                    ].map((p,i)=>(
                      <PillarCard key={i} {...p} />
                    ))}
                  </div>

                  {/* 오행 강약 바 */}
                  <div style={{borderTop:'1px solid #3d1500',paddingTop:'14px'}}>
                    <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'10px',letterSpacing:'1px',textAlign:'center'}}>오행 강약</div>
                    {Object.entries(sajuData.strength).map(([k,v])=>(
                      <div key={k} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                        <div style={{width:'20px',fontSize:'12px',color:OHAENG_COLOR[k],fontWeight:'700'}}>{k}</div>
                        <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'4px',height:'8px',overflow:'hidden'}}>
                          <div style={{width:`${Math.min(v/6*100,100)}%`,height:'100%',background:OHAENG_COLOR[k],borderRadius:'4px',transition:'width 0.5s'}} />
                        </div>
                        <div style={{width:'24px',fontSize:'11px',color:'#c4956a',textAlign:'right'}}>{v}</div>
                      </div>
                    ))}
                    <div style={{textAlign:'center',marginTop:'10px'}}>
                      <span style={{fontSize:'12px',color:'#e8c97a',background:'rgba(139,46,0,0.3)',padding:'3px 12px',borderRadius:'10px',border:'1px solid #3d1500'}}>{sajuData.singang} 사주</span>
                    </div>
                  </div>
                </div>
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
                <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
                  <div style={{textAlign:'center',fontFamily:'serif',fontSize:'14px',color:'#e8c97a',marginBottom:'16px',letterSpacing:'2px'}}>✦ 천기소녀와 대화하기 ✦</div>

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
                  <button onClick={()=>router.push('/sinnyeon')} style={{background:'#8b2e00',color:'#e8c97a',padding:'14px 24px',border:'1.5px solid #c4712a',borderRadius:'4px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'serif'}}>
                    신년운세 보기 · ₩9,900
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
    </>
  );
}
