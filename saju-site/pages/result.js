import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CrossSell from '../lib/CrossSell';
import { DAY_TYPES, ELEMENT_COLOR, typeImg, helperTypes, drawStoryCard } from '../lib/dayTypes';
import NewYearPopup from '../lib/NewYearPopup';
import { buildChart, GAN_HANJA, JI_HANJA, ganOhaeng, jiOhaeng, hourNumber } from '../lib/myeongri';

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
  '풀이 중 · 천기소녀가 하늘의 기운을 읽고 있어요...',
  '풀이 중 · 사주팔자를 하나하나 짚어보는 중이에요...',
  '풀이 중 · 거의 다 왔어요. 다 쓰면 한 번에 보여드릴게요...',
];

// 스트리밍되는 해석 텍스트를 섹션(이모지로 시작하는 줄) 단위로 잘라
// 카톡처럼 말풍선이 하나씩 툭툭 나타나는 형태로 보여주기 위한 헬퍼
const SECTION_EMOJI = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
function splitIntoBubbles(text) {
  if (!text) return [];
  // 화면은 마크다운을 그리지 않으므로 AI가 붙인 **강조**, ## 제목 기호는 지운다
  const lines = text.replace(/\*\*/g, '').replace(/^#{1,3}\s*/gm, '').split('\n');
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
  { k: '연애', d: '그 사람과 나, 잘 맞을까', q: '제 연애운은 어때요? 저랑 잘 맞는 사람은 어떤 사람이에요?' },
  { k: '일·진로', d: '나한테 맞는 방향', q: '저한테 맞는 일이나 진로 방향은 뭐예요?' },
  { k: '돈', d: '모을 때와 쓸 때', q: '저는 돈을 언제 모으고 언제 쓰는 게 좋아요?' },
  { k: '오늘', d: '하루를 보내는 법', q: '오늘 하루 어떻게 보내면 좋을까요?' },
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
  const [storyImg, setStoryImg] = useState(null);
  const [shareState, setShareState] = useState('');
  const { status: authStatus } = useSession();
  // 로그인이 켜져 있는데 아직 로그인 안 했으면 '보관함에 저장' 안내를 보여준다
  const [needSave, setNeedSave] = useState(false);
  useEffect(() => {
    if (authStatus !== 'unauthenticated') { setNeedSave(false); return; }
    fetch('/api/me').then(r => setNeedSave(r.status === 401)).catch(() => {});
  }, [authStatus]);
  const [doneStreaming, setDoneStreaming] = useState(false);

  // 풀이가 다 나오면 로그인한 회원의 보관함에 자동 저장 (같은 화면에서 한 번만)
  useEffect(() => {
    if (!doneStreaming || authStatus !== 'authenticated' || !result || result.length < 200) return;
    const { name, year, month, day, hour, gender, calendar } = router.query;
    const guard = 'vault-saved:' + [name, year, month, day, hour, gender, calendar].join('|');
    try { if (sessionStorage.getItem(guard)) return; sessionStorage.setItem(guard, '1'); } catch {}
    fetch('/api/vault', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'saju', title: `${name}님의 사주`, subtitle: `${calendar || '양력'} ${year}.${month}.${day} ${hour || ''}`.trim(),
        input: { name, year, month, day, hour, gender, calendar }, gan: sajuData?.pillars?.day?.[0] || null, text: result,
      }),
    }).catch(() => {});
  }, [doneStreaming, authStatus]);

  // 친구에게 보내는 링크 — 상대가 누르면 첫 화면에 "친구는 ○○형" 배너가 뜨고 바로 입력칸으로 간다
  const shareLink = async (gan) => {
    const t = DAY_TYPES[gan];
    const url = `${window.location.origin}/?type=${encodeURIComponent(gan)}&utm_source=share&utm_medium=result`;
    const text = `나는 천기소녀에서 '${t ? t.name : ''}'이 나왔어. 너는 궁중에 태어났다면 누구였을까?`;
    try {
      if (navigator.share) { await navigator.share({ title: '천기소녀', text, url }); setShareState('done'); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(`${text} ${url}`); setShareState('copied'); }
    catch { setShareState('error'); }
  };

  const saveStoryCard = async (gan) => {
    if (storyState === 'saving') return;
    setStoryState('saving');
    try {
      const blob = await drawStoryCard({ gan, name: router.query.name, pillars: sajuData?.pillars });
      const file = new File([blob], `cheongi_${DAY_TYPES[gan].name}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: '천기소녀 · 나의 타입' }); setStoryState('done'); return; } catch (e) { if (e && e.name === 'AbortError') { setStoryState(''); return; } }
      }
      // 인스타·카톡 같은 앱 안 브라우저는 파일 다운로드를 못 해서 "페이지를 읽어들일 수 없습니다"가 뜬다.
      // 그래서 앱 안에서는 이미지를 화면에 크게 띄우고 꾹 눌러 저장하게 한다.
      const ua = navigator.userAgent || '';
      if (/Instagram|KAKAOTALK|FBAN|FBAV|FB_IAB|Line\/|NAVER\(inapp|everytimeApp|DaumApps|Threads/i.test(ua)) {
        const dataUrl = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(blob); });
        setStoryImg({ src: dataUrl, android: /Android/i.test(ua), kakao: /KAKAOTALK/i.test(ua) });
        setStoryState('');
        return;
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
    const { name, year, month, day, hour, gender, calendar, mbti } = router.query;
    if (!name) return;

    (async () => {
      try {
        const res = await fetch('/api/saju', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, year, month, day, hour, gender, calendar, mbti })
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
        }
        // 풀이가 끝까지 다 써진 뒤에 한 번에 보여준다
        setResult(acc);
        setLoading(false);
        setDoneStreaming(true);
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

  // 연애·일·돈·오늘 카드: 무료 질문이 남았으면 바로 물어보고, 다 썼으면 입력칸에 채워서 결제 안내로 보낸다
  const askTopic = (q) => {
    if (chatLoading) return;
    if (!freeUsed) {
      sendChatQuestion(q);
      setTimeout(() => { const el = document.getElementById('chat-log-end'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
      return;
    }
    setChatInput(q);
    setTimeout(() => { const el = document.getElementById('chat-input'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); } }, 50);
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
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
      }
      // 답이 다 써진 뒤에 한 번에 보여준다
      setChatMessages(prev => [...prev, { role: 'char', text: acc || '지금은 답하기 어려워요.' }]);
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

  // 원국 상세(지장간·12운성·신살), 10년 대운, 월운 — 계산만으로 나오는 표
  const chart = useMemo(() => {
    if (!sajuData?.pillars) return null;
    const q = router.query || {};
    const sol = sajuData.solar || { year: q.year, month: q.month, day: q.day };
    try {
      return buildChart({
        pillarsObj: sajuData.pillars,
        birth: { year: +sol.year, month: +sol.month, day: +sol.day, hour: sajuData.hourNum ?? hourNumber(q.hour), gender: q.gender },
      });
    } catch { return null; }
  }, [sajuData, router.query]);

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
        <div style={{fontSize:'11px',color:'#7a7a85',marginBottom:'6px',letterSpacing:'1px'}}>{label}</div>
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
          body {background:#0c0c0f;color:#f0e6d3;font-family:'Noto Sans KR',sans-serif;word-break:keep-all;}
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
          @keyframes askGlow { 0%,100%{box-shadow:0 0 0 0 rgba(232,200,126,.0)} 50%{box-shadow:0 0 18px 0 rgba(232,200,126,.35)} }
          .type-ring { position:absolute; inset:0; border-radius:50%; border:1.5px dashed var(--tc); opacity:.6; animation: typeSpin 18s linear infinite; }
          .type-char img { animation: typeFloat 4s ease-in-out infinite; }
          .ask-jump { animation: askGlow 2.6s ease-in-out infinite; }
          .story-btn { transition: transform .2s, filter .2s; }
          .story-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
          .use-card { transition: transform .15s, border-color .15s, background .15s; }
          .use-card:hover, .use-card:active { border-color:#b8975a !important; background:rgba(232,200,126,0.12) !important; transform:translateY(-2px); }
          .use-card:disabled { opacity:.5; cursor:default; }
          @media (max-width:760px) { .ny-chip { display:none !important; } }
          .mr-col { border:1px solid #2a2a31; border-radius:8px; padding:8px 3px 7px; text-align:center; background:rgba(255,255,255,0.02); min-width:0; }
          .mr-lab { font-size:11px; color:#7a7a85; margin-bottom:3px; white-space:nowrap; }
          .mr-ss { font-size:11px; font-weight:700; margin:2px 0; }
          .mr-char { font-family:'Noto Serif KR',serif; font-size:26px; font-weight:900; line-height:1.1; border-radius:6px; padding:6px 0 4px; margin:3px 2px; }
          .mr-char small { display:block; font-family:'Noto Sans KR',sans-serif; font-size:10px; font-weight:500; opacity:.85; margin-top:2px; }
          .mr-meta { font-size:11px; color:#e0c9a8; margin-top:4px; font-family:'Noto Serif KR',serif; }
          .mr-meta span { display:block; font-family:'Noto Sans KR',sans-serif; font-size:9.5px; color:#7a7a85; }
          .mr-sal { margin-top:5px; min-height:16px; display:flex; flex-direction:column; gap:2px; align-items:center; }
          .mr-sal em { font-style:normal; font-size:9.5px; color:#e8c97a; background:rgba(232,200,126,0.14); border-radius:8px; padding:1px 5px; white-space:nowrap; }
          .mr-sal i { font-style:normal; font-size:10px; color:#6a6a74; }
          .mr-card { background:#17171b; border:1px solid #2a2a31; border-radius:6px; padding:18px 14px; margin-bottom:20px; }
          .mr-title { text-align:center; font-family:serif; font-size:14px; color:#e8c97a; letter-spacing:2px; margin-bottom:6px; }
          .mr-sub { text-align:center; font-size:11.5px; color:#8a8a95; margin-bottom:14px; line-height:1.6; }
          .mr-grid5 { display:grid; grid-template-columns:repeat(5,1fr); gap:5px; }
          .mr-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:5px; }
          .mr-cell { position:relative; border:1px solid #2a2a31; border-radius:8px; padding:8px 2px 7px; text-align:center; background:rgba(255,255,255,0.02); }
          .mr-cell.on { border:1.5px solid #e8c97a; background:rgba(232,201,122,0.08); }
          .mr-now { position:absolute; top:-8px; left:50%; transform:translateX(-50%); font-size:9px; background:#e8c97a; color:#0c0c0f; border-radius:6px; padding:1px 6px; }
          .mr-age { font-size:11px; color:#8a8a95; margin-bottom:2px; }
          .mr-pil { font-family:'Noto Serif KR',serif; font-size:19px; font-weight:900; line-height:1.2; }
          .mr-s1 { font-size:10.5px; color:#e0c9a8; margin-top:3px; }
          .mr-s2 { font-size:10px; color:#7a7a85; }
          .rd-card { background:#17171b; border:1px solid #2a2a31; border-radius:10px; overflow:hidden; }
          .rd-head { display:flex; align-items:center; gap:10px; padding:12px 16px; border-bottom:1px solid #2a2a31; background:linear-gradient(90deg,#1f1f25,#17171b); }
          .rd-num { font-family:'Noto Serif KR',serif; font-size:13px; font-weight:900; color:#0c0c0f; background:#e8c97a; border-radius:6px; padding:2px 7px; }
          .rd-title { font-size:16px; font-weight:700; color:#e8c97a; }
          .rd-body { padding:14px 16px 16px; color:#f0e6d3; font-size:15px; line-height:1.85; white-space:pre-wrap; }
          .ch-nav { position:sticky; top:57px; z-index:50; display:flex; gap:6px; overflow-x:auto; margin:0 -20px 16px; padding:10px 20px; background:rgba(12,12,15,0.96); border-bottom:1px solid #2a2a31; scrollbar-width:none; }
          .ch-nav::-webkit-scrollbar { display:none; }
          .ch-nav a { flex:0 0 auto; font-size:12px; color:#e8c97a; text-decoration:none; border:1px solid #3a3a44; border-radius:14px; padding:5px 11px; white-space:nowrap; background:#1f1f25; }
        `}</style>
      </Head>

      <div style={{minHeight:'100vh',background:'#0c0c0f'}}>
        {/* 헤더 */}
        <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(12,12,15,0.97)',backdropFilter:'blur(10px)',borderBottom:'1px solid #2a2a31',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" style={{display:'flex',alignItems:'center',gap:'8px',color:'#e8c97a',fontSize:'18px',fontWeight:'900',textDecoration:'none',fontFamily:'serif',letterSpacing:'2px'}}><img src="/logo_symbol.png" alt="" style={{width:'24px',height:'24px',objectFit:'contain'}} />천기소녀</a>
        </div>

        <div style={{maxWidth:'600px',margin:'0 auto',padding:'28px 20px 80px'}}>

          {/* 이름/날짜 */}
          <div style={{background:'#17171b',border:'1px solid #2a2a31',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
            <h2 style={{fontFamily:'serif',fontSize:'20px',color:'#e8c97a',marginBottom:'4px'}}>{name}님의 사주</h2>
            <p style={{color:'#7a7a85',fontSize:'14px'}}>{year}년 {month}월 {day}일생</p>
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div className="loader" aria-hidden="true">
                <div className="loader-orbit">
                  {Object.values(OHAENG_COLOR).map((c,i)=>{ const a=i*2*Math.PI/5; return <span key={i} style={{left:`${(50+50*Math.sin(a)).toFixed(3)}%`,top:`${(50-50*Math.cos(a)).toFixed(3)}%`,background:c,boxShadow:`0 0 12px ${c}`}} />; })}
                </div>
                <div className="loader-ring">
                  {['甲','丙','戊','庚','壬','子','午','卯','酉'].map((ch,i,arr)=>{ const a=i*2*Math.PI/arr.length; return <b key={i} style={{left:`${(50+50*Math.sin(a)).toFixed(3)}%`,top:`${(50-50*Math.cos(a)).toFixed(3)}%`}}>{ch}</b>; })}
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
                  <div className="soft-in type-card" style={{'--tc':col,position:'relative',overflow:'hidden',background:`radial-gradient(circle at 50% 0%, ${col}33, transparent 60%), #17171b`,border:`1px solid ${col}66`,borderRadius:'10px',padding:'22px 20px 20px',marginBottom:'20px',textAlign:'center'}}>
                    <div style={{fontSize:'18px',fontWeight:'700',letterSpacing:'1px',color:'#e0b486',marginBottom:'10px'}}>궁중에 태어났다면 나는</div>
                    <div className="type-char" style={{position:'relative',height:'270px',margin:'0 auto 10px',display:'flex',justifyContent:'center',alignItems:'flex-end'}}>
                      <div aria-hidden="true" style={{position:'absolute',left:'50%',bottom:'6px',width:'190px',height:'26px',transform:'translateX(-50%)',borderRadius:'50%',background:`radial-gradient(ellipse, ${col}55, transparent 70%)`}} />
                      <img src={typeImg(gan)} alt={t.name} width="172" height="270" style={{position:'relative',height:'270px',width:'auto',maxWidth:'100%',filter:`drop-shadow(0 0 14px ${col}44)`}} />
                    </div>
                    <div style={{fontSize:'14px',color:'#e0c9a8',marginBottom:'2px'}}>{name}님은</div>
                    <div style={{fontFamily:'serif',fontSize:'34px',fontWeight:'900',color:col,lineHeight:'1.2'}}>{t.name}</div>
                    <div style={{fontFamily:'serif',fontSize:'13px',color:'#c4956a',margin:'4px 0 12px'}}>{t.hanja} · {t.title}</div>
                    <p style={{fontSize:'15px',color:'#f0e6d3',lineHeight:'1.6',marginBottom:'12px'}}>{t.line}</p>
                    <div style={{display:'flex',gap:'6px',justifyContent:'center',flexWrap:'wrap',marginBottom:'14px'}}>
                      {t.tags.map(tg => <span key={tg} style={{fontSize:'12px',color:col,border:`1px solid ${col}88`,borderRadius:'14px',padding:'4px 10px'}}>#{tg}</span>)}
                    </div>
                    {helpers.length > 0 && <div style={{fontSize:'12px',color:'#8a8a95',marginBottom:'16px'}}>나를 살려주는 타입 · {helpers.join(', ')}</div>}
                    <button onClick={()=>saveStoryCard(gan)} className="story-btn" style={{background:col,color:'#0c0c0f',border:'none',borderRadius:'24px',padding:'12px 22px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                      {storyState === 'saving' ? '이미지 만드는 중...' : '인스타 스토리용 이미지 저장'}
                    </button>
                    {storyState === 'done' && <div style={{fontSize:'12px',color:'#c4956a',marginTop:'8px'}}>저장됐어요. 스토리에 올리고 친구 타입도 물어보세요</div>}
                    {storyState === 'error' && <div style={{fontSize:'12px',color:'#ff6b6b',marginTop:'8px'}}>이미지를 만들지 못했어요. 다시 눌러주세요</div>}
                    <button onClick={()=>shareLink(gan)} className="story-btn" style={{display:'block',margin:'10px auto 0',background:'transparent',color:col,border:`1px solid ${col}`,borderRadius:'24px',padding:'10px 20px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                      내 친구는 어떤 타입일까? 공유하기
                    </button>
                    {shareState === 'copied' && <div style={{fontSize:'12px',color:'#c4956a',marginTop:'8px'}}>링크를 복사했어요. 카톡이나 DM에 붙여넣어 보내세요</div>}
                    {shareState === 'error' && <div style={{fontSize:'12px',color:'#ff6b6b',marginTop:'8px'}}>복사하지 못했어요. 주소창 링크를 직접 보내주세요</div>}
                  </div>
                );
              })()}

              {/* 사주원국 표 */}
              {sajuData && (
                <div style={{background:'#17171b',border:'1px solid #2a2a31',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
                  <div style={{textAlign:'center',fontFamily:'serif',fontSize:'14px',color:'#e8c97a',marginBottom:'16px',letterSpacing:'2px'}}>✦ 사주원국 ✦</div>

                  {/* 원국 상세 표: 십성 · 천간 · 지지 · 지장간 · 12운성 · 신살 */}
                  {chart ? (
                    <>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'10px'}}>
                        {[3,2,1,0].map((ci,i)=>{ const c = chart.cols[ci]; const label = ['년주','월주','일주(나)','시주'][ci];
                          if (!c) return (
                            <div key={ci} className="pillar-in mr-col" style={{animationDelay:`${0.15 + i*0.15}s`,borderColor:'#2a2a31',borderStyle:'dashed'}}>
                              <div className="mr-lab">{label}</div>
                              <div className="mr-ss" style={{color:'#7a7a85'}}>-</div>
                              <div className="mr-char" style={{color:'#7a7a85',background:'rgba(255,255,255,0.04)'}}>?<small>시간 모름</small></div>
                              <div className="mr-char" style={{color:'#7a7a85',background:'rgba(255,255,255,0.04)'}}>?<small>시간 모름</small></div>
                              <div className="mr-meta" style={{display:'block',textAlign:'center',lineHeight:'1.5',fontSize:'10px',color:'#7a7a85'}}>세 기둥으로<br />풀이했어요</div>
                            </div>
                          );
                          const go = ganOhaeng(c.gan), jo = jiOhaeng(c.ji);
                          return (
                            <div key={ci} className="pillar-in mr-col" style={{animationDelay:`${0.15 + i*0.15}s`,borderColor: ci===2 ? '#b8975a' : '#2a2a31'}}>
                              <div className="mr-lab">{label}</div>
                              <div className="mr-ss" style={{color: ci===2 ? '#e8c97a' : '#c4956a'}}>{c.ganSipsin}</div>
                              <div className="mr-char" style={{color:OHAENG_COLOR[go],background:`${OHAENG_COLOR[go]}1f`}}>{GAN_HANJA[c.gan]}<small>{c.gan}·{go}</small></div>
                              <div className="mr-char" style={{color:OHAENG_COLOR[jo],background:`${OHAENG_COLOR[jo]}1f`}}>{JI_HANJA[c.ji]}<small>{c.ji}·{jo}</small></div>
                              <div className="mr-ss" style={{color:'#b48cc8'}}>{c.jiSipsin}</div>
                              <div className="mr-meta"><span>지장간</span>{c.jijanggan.map(g=>GAN_HANJA[g]).join('')}</div>
                              <div className="mr-meta"><span>12운성</span>{c.unseong}</div>
                              <div className="mr-sal">{c.sinsal.length ? c.sinsal.map(x=><em key={x}>{x}</em>) : <i>-</i>}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{fontSize:'12px',color:'#c4956a',textAlign:'center',lineHeight:'1.7',marginBottom:'16px'}}>
                        {chart.daeun && chart.daeun.current >= 0 && <>현재 대운 {chart.daeun.list[chart.daeun.current].age}~{chart.daeun.list[chart.daeun.current].age + 9}세 {GAN_HANJA[chart.daeun.list[chart.daeun.current].pillar[0]]}{JI_HANJA[chart.daeun.list[chart.daeun.current].pillar[1]]} · </>}
                        {chart.flow.year} 세운 {GAN_HANJA[chart.flow.pillar[0]]}{JI_HANJA[chart.flow.pillar[1]]}({chart.flow.pillar})
                        <br />합충 {chart.relations.length ? chart.relations.join(' · ') : '없음'}
                      </div>
                    </>
                  ) : (
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
                  )}

                  {/* 오행 강약 바 */}
                  <div style={{borderTop:'1px solid #2a2a31',paddingTop:'14px'}}>
                    <div style={{fontSize:'11px',color:'#7a7a85',marginBottom:'10px',letterSpacing:'1px',textAlign:'center'}}>오행 강약</div>
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
                      <span style={{fontSize:'12px',color:'#e8c97a',background:'rgba(232,200,126,0.12)',padding:'3px 12px',borderRadius:'10px',border:'1px solid #2a2a31'}}>{sajuData.singang} 사주</span>
                    </div>
                  </div>

                  {/* 일주 한 줄 성향 — AI 해석이 뜨기 전에도 바로 보이는 즉시 표시 블러브 */}
                  {iljuBlurb && (
                    <div className="soft-in" style={{borderTop:'1px solid #2a2a31',marginTop:'14px',paddingTop:'14px',animationDelay:'1.5s'}}>
                      <div style={{fontSize:'11px',color:'#7a7a85',marginBottom:'8px',letterSpacing:'1px',textAlign:'center'}}>일주로 보는 바탕 성향</div>
                      <p style={{fontSize:'13px',color:'#e0c9a8',lineHeight:'1.6',textAlign:'center'}}>{iljuBlurb}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 10년 대운 흐름 */}
              {chart?.daeun && (
                <div className="mr-card">
                  <div className="mr-title">✦ 10년 대운 흐름 ✦</div>
                  <div className="mr-sub">{chart.daeun.forward ? '순행' : '역행'} · 대운수 {chart.daeun.su} · 10년마다 바뀌는 큰 운</div>
                  <div className="mr-grid5">
                    {chart.daeun.list.map((d,i)=>(
                      <div key={i} className={`mr-cell${i===chart.daeun.current ? ' on' : ''}`}>
                        {i===chart.daeun.current && <b className="mr-now">지금</b>}
                        <div className="mr-age">{d.age}세</div>
                        <div className="mr-pil"><span style={{color:OHAENG_COLOR[ganOhaeng(d.pillar[0])]}}>{GAN_HANJA[d.pillar[0]]}</span><span style={{color:OHAENG_COLOR[jiOhaeng(d.pillar[1])]}}>{JI_HANJA[d.pillar[1]]}</span></div>
                        <div className="mr-s1">{d.ganSipsin}</div>
                        <div className="mr-s2">{d.unseong}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 연도 월운표 */}
              {chart?.flow && (
                <div className="mr-card">
                  <div className="mr-title">✦ {chart.flow.year}년 월운표 ✦</div>
                  <div className="mr-sub">{chart.flow.year} 세운 {GAN_HANJA[chart.flow.pillar[0]]}{JI_HANJA[chart.flow.pillar[1]]}({chart.flow.pillar}) · {chart.flow.ganSipsin}의 해 · 달마다 절기(5일 전후)부터 바뀌어요</div>
                  <div className="mr-grid4">
                    {chart.flow.months.map(m=>(
                      <div key={m.month} className="mr-cell">
                        <div className="mr-age">{m.month}월</div>
                        <div className="mr-pil"><span style={{color:OHAENG_COLOR[ganOhaeng(m.pillar[0])]}}>{GAN_HANJA[m.pillar[0]]}</span><span style={{color:OHAENG_COLOR[jiOhaeng(m.pillar[1])]}}>{JI_HANJA[m.pillar[1]]}</span></div>
                        <div className="mr-s1">{m.ganSipsin}</div>
                        <div className="mr-s2">{m.unseong}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sajuData && (
                <a href="#ask" className="ask-jump" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px',background:'linear-gradient(90deg,#22222a,#1a1a1f)',border:'1px solid #b8975a',borderRadius:'10px',padding:'14px 16px',marginBottom:'20px',textDecoration:'none'}}>
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
              {/* 챕터 목차 — 풀이가 길어도 원하는 부분으로 바로 이동 */}
              {(() => {
                const chs = splitIntoBubbles(result).map((b, i) => ({ b, i })).filter(({ b }) => { const f = b.split('\n')[0].trim(); return SECTION_EMOJI.test(f) && !f.startsWith('✨') && b.split('\n').slice(1).join('').trim(); });
                if (chs.length < 3) return null;
                return (
                  <div className="ch-nav">
                    {chs.map(({ b, i }, k) => {
                      const title = b.split('\n')[0].replace(SECTION_EMOJI, '').replace(/[\[\]【】]/g, '').replace(/\(.*?\)/g, '').trim();
                      return <a key={i} href={`#ch-${i}`}>{String(k + 1).padStart(2, '0')} {title || '풀이'}</a>;
                    })}
                  </div>
                );
              })()}
              <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'20px'}}>
                {(() => { let n = 0; return splitIntoBubbles(result).map((bubble, i) => {
                  const lines = bubble.split('\n');
                  const first = lines[0].trim();
                  const isSection = SECTION_EMOJI.test(first);
                  const body = isSection ? lines.slice(1).join('\n').trim() : bubble;
                  // 마지막 ✨ 한 줄 안내: 번호 카드 대신 신년운세로 가는 배너
                  if (isSection && first.startsWith('✨') && !body) {
                    return (
                      <a key={i} id={`ch-${i}`} href="/sinnyeon?year=2027" className="chat-bubble" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none',background:'rgba(232,201,122,0.08)',border:'1px dashed #b8975a',borderRadius:'10px',padding:'12px 14px',color:'#e8c97a',fontSize:'14px',lineHeight:'1.6'}}>
                        <span style={{flex:1}}>{first}</span><span style={{fontSize:'18px'}}>→</span>
                      </a>
                    );
                  }
                  // 인사말("하늘의 기운을 읽었습니다.")처럼 제목 없는 짧은 글: 카드 없이 한 줄
                  if (!isSection) {
                    return (
                      <div key={i} id={`ch-${i}`} className="chat-bubble" style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'2px 4px'}}>
                        <img src="/logo_symbol.png" alt="" style={{width:'24px',height:'24px',flexShrink:0,marginTop:'2px'}} />
                        <div style={{color:'#e8c97a',fontSize:'15px',lineHeight:'1.8',whiteSpace:'pre-wrap',fontFamily:"'Noto Serif KR',serif"}}>{bubble}</div>
                      </div>
                    );
                  }
                  n += 1;
                  const title = first.replace(SECTION_EMOJI, '').replace(/[\[\]【】]/g, '').trim();
                  const emoji = (first.match(SECTION_EMOJI) || [''])[0];
                  return (
                    <div key={i} id={`ch-${i}`} className="chat-bubble rd-card" style={{scrollMarginTop:'120px'}}>
                      <div className="rd-head">
                        <span className="rd-num">{String(n).padStart(2, '0')}</span>
                        <span className="rd-title">{emoji} {title}</span>
                      </div>
                      {body && <div className="rd-body">{body}</div>}
                    </div>
                  );
                }); })()}
              </div>

              {/* 로그인 안 한 사람: 이 풀이를 보관함에 남기기 */}
              {result && doneStreaming && needSave && (
                <a href={`/login?callbackUrl=${encodeURIComponent(router.asPath)}`}
                  style={{display:'block',textDecoration:'none',background:'#FEE500',borderRadius:'12px',padding:'14px 16px',marginBottom:'12px',textAlign:'center',boxShadow:'0 8px 22px rgba(0,0,0,.35)'}}>
                  <span style={{display:'block',fontSize:'15px',fontWeight:'800',color:'rgba(0,0,0,.85)'}}>카카오로 3초 로그인하고 이 풀이 저장하기</span>
                  <span style={{display:'block',fontSize:'12px',color:'rgba(0,0,0,.6)',marginTop:'3px'}}>보관함에 계속 남고, 다음부터 생년월일이 자동으로 채워져요</span>
                </a>
              )}

              {/* 무료 풀이 다음 단계: 이번 달 나의 운세 (1,900원) */}
              {result && doneStreaming && (
                <a href={`/wolun?${new URLSearchParams(Object.fromEntries(Object.entries(router.query || {}).filter(([k]) => ['name','year','month','day','hour','gender','calendar','mbti'].includes(k)))).toString()}`}
                  style={{display:'flex',alignItems:'center',gap:'12px',textDecoration:'none',background:'linear-gradient(90deg,#22222a,#1f1f25)',border:'1px solid #b8975a',borderRadius:'12px',padding:'10px 14px 10px 10px',marginBottom:'20px',boxShadow:'0 8px 22px rgba(0,0,0,.4)'}}>
                  <img src="/svc/month.webp" alt="" width="88" height="66" style={{width:'88px',height:'66px',objectFit:'cover',borderRadius:'10px',flexShrink:0}} />
                  <span style={{flex:1,minWidth:0}}>
                    <span style={{display:'inline-block',fontSize:'10.5px',fontWeight:'700',color:'#0c0c0f',background:'#e8c97a',borderRadius:'8px',padding:'1px 7px',marginBottom:'3px'}}>₩1,900</span>
                    <span style={{display:'block',fontSize:'15px',fontWeight:'700',color:'#e8c97a'}}>이번 달 나의 운세는?</span>
                    <span style={{display:'block',fontSize:'12px',color:'#c4956a'}}>생년월일 다시 안 넣어도 돼요 · 좋은 날과 조심할 날까지</span>
                  </span>
                  <span style={{color:'#e8c97a',fontSize:'20px'}}>→</span>
                </a>
              )}

              {/* 천기소녀와 대화하기 */}
              {sajuData && (
                <div id="ask" style={{background:'#17171b',border:'1px solid #b8975a',borderRadius:'10px',padding:'20px',marginBottom:'20px',scrollMarginTop:'70px'}}>
                  <div style={{textAlign:'center',marginBottom:'16px'}}>
                    <div style={{fontSize:'11px',letterSpacing:'3px',color:'#c4956a',marginBottom:'6px'}}>1:1 사주 상담</div>
                    <div style={{fontFamily:'serif',fontSize:'20px',color:'#e8c97a',fontWeight:'700',marginBottom:'6px'}}>천기소녀에게 직접 물어보기</div>
                    <p style={{fontSize:'13px',color:'#c4956a',lineHeight:'1.6'}}>방금 본 {name}님의 사주팔자를 그대로 읽고<br/>질문 하나에 딱 맞춰 답해드려요</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'14px'}}>
                    {CHAT_USES.map(u => (
                      <button key={u.k} type="button" className="use-card" onClick={()=>askTopic(u.q)} disabled={chatLoading} style={{background:'rgba(232,200,126,0.05)',border:'1px solid #2a2a31',borderRadius:'8px',padding:'10px 4px',textAlign:'center',cursor:'pointer',fontFamily:'inherit'}}>
                        <div style={{fontSize:'13px',color:'#e8c97a',fontWeight:'700',marginBottom:'3px'}}>{u.k}</div>
                        <div style={{fontSize:'10px',color:'#8a8a95',lineHeight:'1.4'}}>{u.d}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{display:'flex',justifyContent:'center',gap:'6px',flexWrap:'wrap',marginBottom:'16px'}}>
                    <span style={{fontSize:'11px',color:'#0c0c0f',background:'#e8c97a',borderRadius:'10px',padding:'3px 10px',fontWeight:'700'}}>오늘 1회 무료</span>
                    <span style={{fontSize:'11px',color:'#e8c97a',border:'1px solid #b8975a',borderRadius:'10px',padding:'3px 10px'}}>추가 질문 1건 ₩{CHAT_EXTRA_PRICE.toLocaleString()}</span>
                    <span style={{fontSize:'11px',color:'#e8c97a',border:'1px solid #2a2a31',borderRadius:'10px',padding:'3px 10px'}}>무료 1회는 로그인 없이</span>
                  </div>
                  <div style={{borderTop:'1px dashed #2a2a31',marginBottom:'16px'}} />

                  <div className="chat-bubble" style={{display:'flex',gap:'10px',alignItems:'flex-start',marginBottom:'14px'}}>
                    <img src="/logo_symbol.png" alt="" style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid #2a2a31',background:'#1f1f25',objectFit:'contain',padding:'4px',flexShrink:0,marginTop:'2px'}} />
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:'11px',color:'#7a7a85',marginBottom:'4px',paddingLeft:'2px'}}>천기소녀</div>
                      <div style={{background:'#1f1f25',border:'1px solid #2a2a31',borderRadius:'4px 14px 14px 14px',padding:'14px 16px',color:'#f0e6d3',fontSize:'15px',lineHeight:'1.8'}}>
                        {openingLine}
                      </div>
                    </div>
                  </div>

                  {chatMessages.map((m, i) => (
                    <div key={i} className="chat-bubble" style={{display:'flex',gap:'10px',alignItems:'flex-start',marginBottom:'14px',flexDirection:m.role==='user'?'row-reverse':'row'}}>
                      {m.role==='char' && <img src="/logo_symbol.png" alt="" style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid #2a2a31',background:'#1f1f25',objectFit:'contain',padding:'4px',flexShrink:0,marginTop:'2px'}} />}
                      <div style={{minWidth:0,maxWidth:'80%'}}>
                        {m.role==='char' && <div style={{fontSize:'11px',color:'#7a7a85',marginBottom:'4px',paddingLeft:'2px'}}>천기소녀</div>}
                        <div style={{background:m.role==='user'?'#3a3020':'#1f1f25',border:'1px solid #2a2a31',borderRadius:m.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px',padding:'14px 16px',color:'#f0e6d3',fontSize:'15px',lineHeight:'1.8',whiteSpace:'pre-wrap'}}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div style={{fontSize:'13px',color:'#7a7a85',paddingLeft:'40px',marginBottom:'10px'}}>풀이 중 · 천기소녀가 답을 쓰고 있어요...</div>
                  )}
                  <div id="chat-log-end" />

                  {!freeUsed && chatMessages.length === 0 && (
                    <div style={{fontSize:'12px',color:'#8a8a95',marginBottom:'8px'}}>눌러서 바로 물어보기</div>
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
                      id="chat-input"
                      type="text"
                      value={chatInput}
                      onChange={e=>setChatInput(e.target.value)}
                      onKeyDown={e=>{ if (e.key === 'Enter' && !chatLoading && !freeUsed) sendChatQuestion(chatInput); }}
                      placeholder={freeUsed ? "결제하고 물어볼 새 질문을 적어주세요" : "궁금한 걸 물어보세요"}
                      disabled={chatLoading}
                      style={{flex:1,background:'rgba(232,200,126,0.06)',border:'1px solid rgba(232,200,126,0.2)',borderRadius:'6px',padding:'12px 14px',color:'#f0e6d3',fontSize:'14px',outline:'none',fontFamily:'inherit'}}
                    />
                    {!freeUsed && (
                      <button onClick={()=>sendChatQuestion(chatInput)} disabled={chatLoading || !chatInput.trim()} style={{background:'#3a3020',color:'#e8c97a',border:'1.5px solid #b8975a',borderRadius:'6px',padding:'0 18px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>
                        전송
                      </button>
                    )}
                  </div>

                  {!freeUsed ? (
                    <div style={{fontSize:'11px',color:'#7a7a85',marginTop:'8px',textAlign:'center'}}>오늘 무료 질문 1회</div>
                  ) : (
                    <div style={{marginTop:'12px',padding:'14px',background:'rgba(232,200,126,0.04)',border:'1px solid #2a2a31',borderRadius:'6px'}}>
                      <div style={{fontSize:'12px',color:'#7a7a85',marginBottom:'10px',textAlign:'center'}}>오늘 무료 질문은 다 썼어요 · 위 입력창에 새 질문을 적으시면 1건당 ₩{CHAT_EXTRA_PRICE.toLocaleString()}에 답변받을 수 있어요</div>
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
                      <button onClick={startChatPayment} disabled={paying || !chatInput.trim()} style={{width:'100%',background:'#3a3020',color:'#e8c97a',border:'1.5px solid #b8975a',borderRadius:'6px',padding:'12px',fontSize:'14px',fontWeight:'700',cursor:(paying || !chatInput.trim())?'default':'pointer',opacity:(paying || !chatInput.trim())?0.5:1,fontFamily:'inherit'}}>
                        {paying ? '결제창 여는 중...' : `₩${CHAT_EXTRA_PRICE.toLocaleString()} 결제하고 질문하기`}
                      </button>
                      {!chatInput.trim() && !paying && (
                        <div style={{fontSize:'11px',color:'#b8975a',marginTop:'6px',textAlign:'center'}}>↑ 위 입력창에 질문을 먼저 적어주세요</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div style={{marginBottom:'20px'}}><CrossSell birth={router.query || {}} items={['vessel','love','sinnyeon','reunion']} /></div>

              {/* 유료 CTA */}
              <div style={{background:'#1a1a1f',border:'1px solid #3a3020',borderRadius:'6px',padding:'24px',textAlign:'center',marginBottom:'16px'}}>
                <div style={{fontFamily:'serif',fontSize:'18px',color:'#e8c97a',marginBottom:'8px'}}>✦ 재물운·연애운·다가올 운세가 궁금하신가요? ✦</div>
                <p style={{color:'#7a7a85',fontSize:'13px',marginBottom:'20px'}}>지금 본 건 일주 성격 분석이에요 · 더 자세한 이야기는 아래에서</p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <button onClick={()=>router.push('/sinnyeon?year=2027')} style={{background:'#3a3020',color:'#e8c97a',padding:'14px 24px',border:'1.5px solid #b8975a',borderRadius:'4px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                    2027 정미년 신년운세 보기 · ₩9,900
                  </button>
                  <button onClick={()=>router.push('/tonghap')} style={{background:'transparent',color:'#c49ae8',padding:'14px 24px',border:'1px solid #3d1560',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
                    사주+타로 통합분석 · ₩24,900
                  </button>
                  <button onClick={()=>router.push('/gunghap')} style={{background:'transparent',color:'#7a7a85',padding:'12px 24px',border:'1px solid #2a2a31',borderRadius:'4px',fontSize:'13px',cursor:'pointer'}}>
                    궁합 분석 보러 가기 (무료)
                  </button>
                </div>
              </div>

              <button onClick={()=>router.push('/')} style={{width:'100%',background:'none',border:'1px solid #2a2a31',color:'#7a7a85',padding:'14px',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
                처음으로 돌아가기
              </button>
            </>
          )}
        </div>
      </div>
      {storyImg && (
        <div onClick={()=>setStoryImg(null)} style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(8,8,10,0.94)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:'360px',textAlign:'center'}}>
            <div style={{fontSize:'15px',color:'#e8c97a',fontWeight:'700',marginBottom:'4px'}}>이미지를 꾹 눌러서 저장하세요</div>
            <div style={{fontSize:'12px',color:'#c4956a',marginBottom:'12px',lineHeight:1.6}}>인스타 안에서는 바로 다운로드가 안 돼요.<br/>사진을 길게 누르면 저장 메뉴가 나와요.</div>
            <img src={storyImg.src} alt="천기소녀 나의 타입" style={{width:'100%',maxHeight:'62vh',objectFit:'contain',borderRadius:'10px',boxShadow:'0 10px 40px rgba(0,0,0,.6)',WebkitTouchCallout:'default',userSelect:'auto'}} />
            {(storyImg.android || storyImg.kakao) && (
              <button onClick={()=>{
                const href = window.location.href;
                window.location.href = storyImg.kakao
                  ? 'kakaotalk://web/openExternal?url=' + encodeURIComponent(href)
                  : 'intent://' + href.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
              }} style={{marginTop:'12px',width:'100%',height:'44px',borderRadius:'22px',border:'1px solid #b8975a',background:'transparent',color:'#e8c97a',fontSize:'14px',fontWeight:'700',fontFamily:'inherit'}}>
                저장 메뉴가 안 나오면 {storyImg.kakao ? '바깥 브라우저' : '크롬'}에서 열기
              </button>
            )}
            <button onClick={()=>setStoryImg(null)} style={{marginTop:'10px',width:'100%',height:'44px',borderRadius:'22px',border:'none',background:'#e8c97a',color:'#0c0c0f',fontSize:'14px',fontWeight:'700',fontFamily:'inherit'}}>닫기</button>
          </div>
        </div>
      )}
      <NewYearPopup popup={false} enabled={!loading} />
    </>
  );
}
