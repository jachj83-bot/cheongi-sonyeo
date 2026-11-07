import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { DAY_TYPES, TYPE_ORDER, ELEMENT_COLOR, TypeIcon } from '../lib/dayTypes';
import NewYearPopup from '../lib/NewYearPopup';

// 히어로 배경에 반짝이는 별 — 서버/클라이언트 렌더 결과가 같도록 고정 시드로 위치를 만든다
const STARS = (() => {
  let s = 7;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return Array.from({ length: 46 }, () => ({
    top: rnd() * 100, left: rnd() * 100,
    size: 1 + rnd() * 2.2, delay: rnd() * 5, dur: 2.5 + rnd() * 3,
  }));
})();

// 메뉴 카드용 선 아이콘 (48x48)
const SVC_ICONS = {
  me: 'M24 14a10 10 0 1 0 0.01 0 M6 30 C14 20 34 20 42 18 M10 36 C18 26 38 26 44 22 M38 8 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 Z',
  match: 'M18 14a10 10 0 1 0 0.01 0 M30 14a10 10 0 1 0 0.01 0 M24 32 C24 32 20 38 24 42 C28 38 24 32 24 32',
  year: 'M24 6 V12 M24 36 V42 M6 24 H12 M36 24 H42 M24 16a8 8 0 1 0 0.01 0 M34 10 a10 10 0 0 1 4 14 a8 8 0 0 0 -4 -14',
  next: 'M24 4 L28 18 L42 20 L30 28 L34 42 L24 34 L14 42 L18 28 L6 20 L20 18 Z',
  scroll: 'M12 8 H34 a4 4 0 0 1 4 4 V36 a4 4 0 0 1 -4 4 H14 a4 4 0 0 1 -4 -4 V12 a4 4 0 0 1 2 -4 Z M16 16 H32 M16 22 H32 M16 28 H26',
  card: 'M10 10 H28 V40 H10 Z M20 8 L36 12 L30 42 M19 20 L19 28 M15 24 L23 24',
  heart: 'M24 40 C10 30 6 22 10 15 C14 9 21 10 24 16 C27 10 34 9 38 15 C42 22 38 30 24 40 Z',
  coin: 'M24 8a16 16 0 1 0 0.01 0 M24 14 V34 M30 18 C30 15 18 15 18 20 C18 25 30 23 30 28 C30 33 18 33 18 30',
  eye: 'M4 24 C12 12 36 12 44 24 C36 36 12 36 4 24 Z M24 18a6 6 0 1 0 0.01 0 M24 4 V8 M10 8 L12 11 M38 8 L36 11',
  pdf: 'M14 6 H30 L38 14 V42 H14 Z M30 6 V14 H38 M20 24 H32 M20 30 H32 M20 36 H28',
};
function Ico({ d, color = '#E8C87E', size = 30 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

// 오행 상생도 꼭짓점 (오각형)
const OH = ['목','화','토','금','수'].map((el, i) => {
  const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
  return { el, x: 100 + 70 * Math.cos(a), y: 100 + 70 * Math.sin(a) };
});

// 소녀 이미지 뒤에서 천천히 도는 천간 링
const RING_CHARS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

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

  // 스크롤해서 화면에 들어오는 섹션을 아래에서 위로 떠오르게
  useEffect(() => {
    if (step !== 'landing') return;
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [step]);

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
          body { background: #0B0A1F; color: #EDE9F2; font-family: 'Noto Sans KR', sans-serif; word-break: keep-all; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          .fade-up { animation: fadeUp 0.8s cubic-bezier(0.23,1,0.32,1) forwards; }
          select option { background: #0B0A1F; color: #EDE9F2; }

          /* ── 움직임 ── */
          @keyframes twinkle { 0%,100%{opacity:.15;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
          @keyframes slowZoom { from{transform:scale(1)} to{transform:scale(1.12)} }
          @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes glowPulse { 0%,100%{box-shadow:0 0 24px rgba(232,200,126,.15),0 0 0 1px rgba(232,200,126,.15)} 50%{box-shadow:0 0 48px rgba(232,200,126,.35),0 0 0 1px rgba(232,200,126,.35)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          @keyframes spinRev { to{transform:rotate(-360deg)} }
          @keyframes shimmer { 0%{transform:translateX(-120%) skewX(-20deg)} 60%,100%{transform:translateX(320%) skewX(-20deg)} }
          @keyframes ctaPulse { 0%,100%{box-shadow:0 0 0 0 rgba(232,200,126,.35)} 50%{box-shadow:0 0 0 10px rgba(232,200,126,0)} }
          @keyframes lineUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shootingStar { 0%{transform:translate(0,0) rotate(-35deg);opacity:0} 5%{opacity:1} 20%{transform:translate(-360px,250px) rotate(-35deg);opacity:0} 100%{opacity:0} }

          .hero-bg { animation: slowZoom 24s ease-in-out infinite alternate; transform-origin: 70% 50%; }
          .star { position:absolute; border-radius:50%; background:#fff6dc; animation-name:twinkle; animation-iteration-count:infinite; animation-timing-function:ease-in-out; }
          .shooting { position:absolute; top:12%; right:8%; width:140px; height:1px; background:linear-gradient(90deg,rgba(255,246,220,0),rgba(255,246,220,.9)); animation: shootingStar 9s ease-out infinite 2s; }
          .title-line { display:inline-block; opacity:0; animation: lineUp .9s cubic-bezier(.23,1,.32,1) forwards; }
          .oracle-wrap { position:relative; width:100%; max-width:360px; }
          .ring-pos { position:absolute; left:50%; top:50%; width:150%; aspect-ratio:1; transform:translate(-50%,-50%); pointer-events:none; }
          .ring-pos2 { width:122%; }
          .oracle-ring { position:absolute; inset:0; border-radius:50%; border:1px dashed rgba(232,200,126,.18); animation: spin 80s linear infinite; }
          .oracle-ring span { position:absolute; font-family:'Noto Serif KR',serif; font-size:14px; color:rgba(232,200,126,.5); text-shadow:0 0 8px rgba(232,200,126,.4); }
          .oracle-ring2 { position:absolute; inset:0; border-radius:50%; border:1px solid rgba(155,109,214,.22); animation: spinRev 40s linear infinite; }
          .oracle-ring2::before { content:''; position:absolute; top:-4px; left:50%; width:8px; height:8px; border-radius:50%; background:#E8C87E; box-shadow:0 0 12px #E8C87E; }
          .oracle-img { position:relative; display:block; width:100%; border-radius:4px; animation: floatY 6s ease-in-out infinite, glowPulse 4s ease-in-out infinite; }
          .hero-cta { position:relative; overflow:hidden; animation: ctaPulse 2.4s ease-in-out infinite; transition: background .3s, transform .2s; }
          .hero-cta::after { content:''; position:absolute; top:0; left:0; width:40%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,240,200,.35),transparent); animation: shimmer 3.2s ease-in-out infinite; }
          .hero-cta:hover { background: rgba(232,200,126,0.28) !important; transform: translateY(-2px); }
          @keyframes revealUp { from{opacity:0;translate:0 36px} to{opacity:1;translate:0 0} }
          .reveal { opacity:0; }
          .reveal.in { animation: revealUp .9s cubic-bezier(.23,1,.32,1) forwards; animation-delay: var(--d, 0ms); }
          .svc-card { transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
          .svc-card:hover { transform: translateY(-4px); border-color: rgba(232,200,126,.45) !important; box-shadow: 0 10px 30px rgba(0,0,0,.35), 0 0 24px rgba(232,200,126,.12); }
          .svc-card:active { transform: scale(.98); }
          .svc-icon { display:inline-block; transition: transform .4s ease; }
          .svc-card:hover .svc-icon { transform: scale(1.2) rotate(-8deg); }

          .step-card { background:linear-gradient(180deg,rgba(40,34,72,.35),rgba(24,20,46,.45)); border:1px solid rgba(232,200,126,0.1); border-radius:8px; padding:20px 20px 24px; text-align:center; }
          .step-art { height:160px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
          .step-no { font-family:'Cormorant Garamond',serif; font-size:13px; color:rgba(232,200,126,.5); letter-spacing:3px; margin-bottom:4px; }
          .step-title { font-family:'Noto Serif KR',serif; font-size:17px; color:#EDE9F2; margin-bottom:8px; font-weight:700; }
          .step-desc { font-size:12px; color:rgba(237,233,242,.45); line-height:1.7; }
          @keyframes pillarPop { 0%,15%{opacity:0;transform:translateY(10px) rotateY(90deg)} 30%,85%{opacity:1;transform:none} 100%{opacity:0;transform:translateY(-6px)} }
          .mini-pillar { display:flex; flex-direction:column; gap:5px; animation: pillarPop 5s ease-in-out infinite; animation-delay: var(--d); }
          .mini-pillar span { width:38px; height:38px; display:flex; align-items:center; justify-content:center; border:1.5px solid; border-radius:6px; font-family:'Noto Serif KR',serif; font-size:19px; font-weight:700; background:rgba(11,10,31,.6); }
          @keyframes nodePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
          .ohaeng-node { animation: nodePulse 2s ease-in-out infinite; }
          .ohaeng-orbit { transform-origin:100px 100px; animation: spin 6s linear infinite; }
          .ohaeng-star { animation: dashMove 3s linear infinite; }
          @keyframes dashMove { to{stroke-dashoffset:-36} }
          .demo-bubble { font-size:12px; padding:9px 12px; border-radius:12px; max-width:85%; opacity:0; animation: bubbleCycle 6s ease-in-out infinite; text-align:left; }
          .demo-bubble.left { align-self:flex-end; background:rgba(155,109,214,.25); color:#EDE9F2; border-radius:12px 4px 12px 12px; }
          .demo-bubble.right { align-self:flex-start; background:rgba(232,200,126,.1); border:1px solid rgba(232,200,126,.2); color:rgba(237,233,242,.8); border-radius:4px 12px 12px 12px; animation-delay:1.4s; }
          @keyframes bubbleCycle { 0%,5%{opacity:0;transform:translateY(8px)} 15%,85%{opacity:1;transform:none} 100%{opacity:0} }
          .demo-typing { align-self:flex-start; display:flex; gap:4px; padding:4px 8px; }
          .demo-typing i { width:6px; height:6px; border-radius:50%; background:rgba(232,200,126,.6); animation: typingDot 1.2s ease-in-out infinite; }
          .demo-typing i:nth-child(2) { animation-delay:.2s } .demo-typing i:nth-child(3) { animation-delay:.4s }
          @keyframes typingDot { 0%,100%{opacity:.2;transform:translateY(0)} 50%{opacity:1;transform:translateY(-4px)} }
          .type-tile { display:flex; flex-direction:column; align-items:center; gap:6px; padding:18px 6px 14px; background:rgba(255,255,255,.02); border:1px solid rgba(232,200,126,.1); border-radius:10px; cursor:pointer; font-family:inherit; transition: transform .25s, border-color .25s, box-shadow .25s, background .25s; }
          .type-tile:hover { transform: translateY(-4px); border-color: var(--tc); box-shadow: 0 0 22px color-mix(in srgb, var(--tc) 35%, transparent); background: color-mix(in srgb, var(--tc) 8%, transparent); }
          .type-tile-icon { display:inline-flex; transition: transform .4s; }
          .type-tile:hover .type-tile-icon { transform: scale(1.15) rotate(-6deg); }
          .phone { position:relative; max-width:300px; margin:0 auto; width:100%; background:#130f2a; border:1px solid rgba(232,200,126,.25); border-radius:22px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba(155,109,214,.15); }
          .phone-tag { position:absolute; top:10px; right:10px; font-size:10px; color:#0B0A1F; background:#E8C87E; border-radius:8px; padding:2px 8px; z-index:2; }
          .pv-bar { transform-origin:left; animation: barFill 2.5s cubic-bezier(.23,1,.32,1) infinite alternate; }
          @keyframes barFill { from{transform:scaleX(.15)} to{transform:scaleX(1)} }
          @media (max-width: 760px) {
            .steps-grid { grid-template-columns: 1fr !important; }
            .types-grid { grid-template-columns: repeat(2,1fr) !important; }
            .preview-grid { grid-template-columns: 1fr !important; text-align:center; }
            .preview-grid ul { display:inline-block; text-align:left; }
          }

          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation: none !important; transition: none !important; }
            .reveal, .title-line, .demo-bubble { opacity:1 !important; transform:none !important; }
          }

          @media (max-width: 760px) {
            .hero-grid { grid-template-columns: 1fr !important; padding: 90px 20px 32px !important; text-align: center; gap: 18px !important; min-height: auto !important; }
            .hero-content { display: flex !important; flex-direction: column !important; }
            .hero-eyebrow { justify-content: center !important; order: 1; }
            .hero-title { font-size: 28px !important; order: 2; margin-bottom: 14px !important; }
            .hero-cta { width: 100%; order: 3; margin-top: 2px; }
            .hero-desc { max-width: none !important; margin-left: auto; margin-right: auto; order: 4; margin-top: 18px !important; font-size: 13px !important; }
            .hero-image { order: 0; }
            .hero-image img { max-width: 150px !important; margin: 0 auto; }
            .hero-image .oracle-wrap { max-width: 150px; margin: 18px auto 10px; }
            .oracle-ring span { font-size: 10px !important; }
            .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
            .stats-grid > div:nth-child(2) { border-right: none !important; }
            .stats-grid > div:nth-child(3) { border-right: 1px solid rgba(232,200,126,0.08) !important; }
          }

          @media (max-width: 420px) {
            .site-header { padding: 14px 14px !important; }
            .site-header-sub { display: none !important; }
            .site-nav { gap: 6px !important; }
            .site-nav a { padding: 6px 9px !important; font-size: 11px !important; letter-spacing: 0 !important; }
          }
        `}</style>
      </Head>

      <div className="site-header" style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(11,10,31,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(232,200,126,0.1)',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'10px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',minWidth:0,flexShrink:1}}>
          <img src="/logo_symbol.png" alt="천기소녀" style={{width:'28px',height:'28px',objectFit:'contain',flexShrink:0}} />
          <div style={{minWidth:0}}>
            <div style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'18px',color:'#E8C87E',fontWeight:'600',letterSpacing:'2px',lineHeight:'1',whiteSpace:'nowrap'}}>천기소녀</div>
            <div className="site-header-sub" style={{fontSize:'9px',color:'rgba(232,200,126,0.4)',letterSpacing:'3px',marginTop:'2px',whiteSpace:'nowrap'}}>CHEONGI SONYEO</div>
          </div>
        </div>
        <div className="site-nav" style={{display:'flex',gap:'8px',flexShrink:0}}>
          <a href="/gunghap" style={{color:'rgba(237,233,242,0.5)',textDecoration:'none',fontSize:'12px',padding:'7px 14px',border:'1px solid rgba(232,200,126,0.15)',borderRadius:'2px',letterSpacing:'1px',whiteSpace:'nowrap'}}>궁합</a>
          <a href="/tarot" style={{color:'rgba(237,233,242,0.5)',textDecoration:'none',fontSize:'12px',padding:'7px 14px',border:'1px solid rgba(232,200,126,0.15)',borderRadius:'2px',letterSpacing:'1px',whiteSpace:'nowrap'}}>타로</a>
        </div>
      </div>

      {step === 'landing' && (
        <>
          <div style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden'}}>
            <div className="hero-bg" style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundImage:'url(/hero_cosmos.jpg)',backgroundSize:'cover',backgroundPosition:'center right'}} />
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(90deg, rgba(11,10,31,0.92) 0%, rgba(11,10,31,0.75) 50%, rgba(11,10,31,0.3) 100%)'}} />
            <div aria-hidden="true" style={{position:'absolute',inset:0,zIndex:2,pointerEvents:'none',overflow:'hidden'}}>
              {STARS.map((st,i)=>(
                <span key={i} className="star" style={{top:`${st.top}%`,left:`${st.left}%`,width:`${st.size}px`,height:`${st.size}px`,animationDelay:`${st.delay}s`,animationDuration:`${st.dur}s`}} />
              ))}
              <span className="shooting" />
            </div>
            <div className="hero-grid" style={{position:'relative',zIndex:5,display:'grid',gridTemplateColumns:'1fr 1fr',maxWidth:'1100px',margin:'0 auto',padding:'100px 32px 60px',alignItems:'center',gap:'40px',width:'100%'}}>
              <div className="hero-content fade-up">
                <div className="hero-eyebrow" style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.6)',marginBottom:'24px',display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{width:'24px',height:'1px',background:'rgba(232,200,126,0.4)',display:'inline-block'}} />
                  명리학 기반 사주 분석
                </div>
                <h1 className="hero-title" style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'54px',fontWeight:'600',lineHeight:'1.25',color:'#EDE9F2',marginBottom:'20px',letterSpacing:'-1px'}}>
                  <span className="title-line" style={{animationDelay:'.15s'}}>하늘의 기운을</span><br/>
                  <span className="title-line" style={{animationDelay:'.4s'}}><span style={{color:'#E8C87E'}}>천기소녀</span>가</span><br/>
                  <span className="title-line" style={{animationDelay:'.65s'}}>읽어드립니다</span>
                </h1>
                <p className="hero-desc" style={{fontSize:'14px',color:'rgba(237,233,242,0.45)',lineHeight:'1.9',marginBottom:'36px',maxWidth:'360px',fontWeight:'300'}}>
                  생년월일 하나로 당신의 타고난 운명과<br/>
                  올해의 흐름을 정통 명리학으로 분석해드려요.<br/>
                  이 페이지를 찾아온 것도 인연입니다.
                </p>
                <button className="hero-cta" onClick={()=>setStep('input')} style={{background:'rgba(232,200,126,0.15)',border:'1px solid rgba(232,200,126,0.5)',color:'#E8C87E',padding:'16px 36px',fontSize:'14px',letterSpacing:'2px',cursor:'pointer',fontFamily:'inherit',borderRadius:'2px',fontWeight:'600'}}>
                  무료로 사주 보기 →
                </button>
              </div>
              <div className="hero-image fade-up" style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                <div className="oracle-wrap">
                  <div className="ring-pos" aria-hidden="true">
                    <div className="oracle-ring">
                      {RING_CHARS.map((c,i)=>{
                        const a = i * 2 * Math.PI / RING_CHARS.length;
                        return <span key={i} style={{left:`${50 + 50*Math.sin(a)}%`,top:`${50 - 50*Math.cos(a)}%`,transform:`translate(-50%,-50%) rotate(${i*360/RING_CHARS.length}deg)`}}>{c}</span>;
                      })}
                    </div>
                  </div>
                  <div className="ring-pos ring-pos2" aria-hidden="true"><div className="oracle-ring2" /></div>
                  <img className="oracle-img" src="/oracle_girl.jpg" alt="천기소녀" />
                </div>
              </div>
            </div>
          </div>

          <div style={{background:'rgba(11,10,31,0.95)',borderTop:'1px solid rgba(232,200,126,0.1)',borderBottom:'1px solid rgba(232,200,126,0.1)'}}>
            <div className="stats-grid reveal" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',maxWidth:'1100px',margin:'0 auto'}}>
              {[['만세력','천문 데이터로 계산'],['10타입','일간 성향 분석'],['22장','메이저 아르카나'],['무료','가입 없이 바로']].map(([n,l],i)=>(
                <div key={i} style={{padding:'28px 20px',textAlign:'center',borderRight:i<3?'1px solid rgba(232,200,126,0.08)':'none'}}>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'32px',color:'#E8C87E',fontWeight:'600',marginBottom:'4px'}}>{n}</div>
                  <div style={{fontSize:'11px',color:'rgba(237,233,242,0.35)',letterSpacing:'1.5px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 이렇게 읽어요 — 3단계 그래픽 */}
          <div style={{background:'#0B0A1F',padding:'64px 24px 40px'}}>
            <div style={{maxWidth:'1100px',margin:'0 auto'}}>
              <div className="reveal" style={{textAlign:'center',marginBottom:'36px'}}>
                <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>HOW IT WORKS</div>
                <div style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'28px',color:'#E8C87E'}}>천기소녀는 이렇게 읽어요</div>
              </div>
              <div className="steps-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
                <div className="reveal step-card" style={{'--d':'0ms'}}>
                  <div className="step-art">
                    <div style={{display:'flex',gap:'6px'}}>
                      {[['甲','子','#6fbf73','#5aa0e0'],['丙','午','#ef7a4a','#ef7a4a'],['戊','辰','#d9a646','#d9a646'],['庚','申','#c9c9e3','#c9c9e3']].map(([g,j,c1,c2],i)=>(
                        <div key={i} className="mini-pillar" style={{'--d':`${i*0.2}s`}}>
                          <span style={{color:c1,borderColor:c1}}>{g}</span><span style={{color:c2,borderColor:c2}}>{j}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="step-no">01</div>
                  <div className="step-title">여덟 글자 계산</div>
                  <div className="step-desc">생년월일시를 만세력으로 바꿔 네 기둥, 여덟 글자를 세워요</div>
                </div>
                <div className="reveal step-card" style={{'--d':'120ms'}}>
                  <div className="step-art">
                    <svg width="150" height="150" viewBox="0 0 200 200" aria-hidden="true">
                      <polygon points={OH.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(232,200,126,.25)" strokeWidth="1.5" />
                      <polygon className="ohaeng-star" points={[0,2,4,1,3].map(i=>`${OH[i].x},${OH[i].y}`).join(' ')} fill="none" stroke="rgba(239,122,74,.35)" strokeWidth="1" strokeDasharray="4 5" />
                      <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(232,200,126,.12)" />
                      <g className="ohaeng-orbit"><circle cx="100" cy="30" r="4" fill="#E8C87E" /></g>
                      {OH.map((p,i)=>(
                        <g key={p.el} className="ohaeng-node" style={{animationDelay:`${i*0.4}s`,transformOrigin:`${p.x}px ${p.y}px`}}>
                          <circle cx={p.x} cy={p.y} r="17" fill="#0B0A1F" stroke={ELEMENT_COLOR[p.el]} strokeWidth="2" />
                          <text x={p.x} y={p.y+5} textAnchor="middle" fontSize="15" fill={ELEMENT_COLOR[p.el]} fontFamily="'Noto Serif KR', serif">{p.el}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="step-no">02</div>
                  <div className="step-title">오행 균형 분석</div>
                  <div className="step-desc">목·화·토·금·수 중 무엇이 강하고 약한지, 십성까지 계산해요</div>
                </div>
                <div className="reveal step-card" style={{'--d':'240ms'}}>
                  <div className="step-art" style={{flexDirection:'column',gap:'8px',alignItems:'stretch',padding:'0 18px'}}>
                    <div className="demo-bubble left">올해 이직해도 괜찮을까요?</div>
                    <div className="demo-bubble right">하반기에 들어오는 기운이 좋아요. 9월 이후가…</div>
                    <div className="demo-typing"><i/><i/><i/></div>
                  </div>
                  <div className="step-no">03</div>
                  <div className="step-title">풀이하고, 물어보고</div>
                  <div className="step-desc">결과를 읽은 뒤 궁금한 건 천기소녀에게 1:1로 바로 물어봐요</div>
                </div>
              </div>
            </div>
          </div>

          {/* 10가지 타입 */}
          <div style={{background:'linear-gradient(180deg,#0B0A1F,#120f2e 50%,#0B0A1F)',padding:'56px 24px'}}>
            <div style={{maxWidth:'1100px',margin:'0 auto'}}>
              <div className="reveal" style={{textAlign:'center',marginBottom:'32px'}}>
                <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>10 TYPES</div>
                <div style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'28px',color:'#E8C87E',marginBottom:'10px'}}>궁중에 태어났다면 나는 누구였을까</div>
                <p style={{fontSize:'13px',color:'rgba(237,233,242,0.45)',lineHeight:'1.8'}}>태어난 날의 천간으로 장군부터 도사까지 열 가지 인물 중 내 자리를 찾아드려요. 결과는 이미지로 저장해 스토리에 올릴 수 있어요</p>
              </div>
              <div className="types-grid" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px'}}>
                {TYPE_ORDER.map((g,i)=>{ const t = DAY_TYPES[g]; const c = ELEMENT_COLOR[t.el]; return (
                  <button key={g} onClick={()=>setStep('input')} className="reveal type-tile" style={{'--d':`${(i%5)*80}ms`,'--tc':c}}>
                    <span className="type-tile-icon"><TypeIcon gan={g} size={44} /></span>
                    <span style={{fontFamily:"'Noto Serif KR', serif",fontSize:'15px',color:'#EDE9F2',fontWeight:'700'}}>{t.name}</span>
                    <span style={{fontSize:'11px',color:c}}>{t.title}</span>
                  </button>
                ); })}
              </div>
            </div>
          </div>

          {/* 결과 미리보기 */}
          <div style={{background:'#0B0A1F',padding:'56px 24px'}}>
            <div className="preview-grid" style={{maxWidth:'900px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'36px',alignItems:'center'}}>
              <div className="reveal">
                <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>PREVIEW</div>
                <div style={{fontFamily:"'Cormorant Garamond', 'Noto Serif KR', serif",fontSize:'28px',color:'#E8C87E',marginBottom:'14px',lineHeight:'1.4'}}>결과는 이렇게 나와요</div>
                <ul style={{listStyle:'none',fontSize:'14px',color:'rgba(237,233,242,0.6)',lineHeight:'2.1'}}>
                  <li>· 나의 일간 타입과 스토리용 이미지</li>
                  <li>· 네 기둥 사주원국표와 십성</li>
                  <li>· 오행 강약 그래프와 신강·신약</li>
                  <li>· 천기소녀의 풀이와 1:1 질문</li>
                </ul>
                <button onClick={()=>setStep('input')} className="hero-cta" style={{marginTop:'22px',background:'rgba(232,200,126,0.15)',border:'1px solid rgba(232,200,126,0.5)',color:'#E8C87E',padding:'14px 30px',fontSize:'14px',letterSpacing:'2px',cursor:'pointer',fontFamily:'inherit',borderRadius:'2px',fontWeight:'600'}}>내 결과 보기 →</button>
              </div>
              <div className="reveal phone" style={{'--d':'150ms'}}>
                <div className="phone-tag">예시 화면</div>
                <div style={{textAlign:'center',padding:'18px 14px 14px',background:'radial-gradient(circle at 50% 0%, rgba(239,122,74,.25), transparent 65%)',borderBottom:'1px solid rgba(232,200,126,.1)'}}>
                  <div style={{fontSize:'10px',letterSpacing:'2px',color:'#c4956a',marginBottom:'8px'}}>나의 일간 타입</div>
                  <TypeIcon gan="병" size={54} style={{filter:'drop-shadow(0 0 6px #ef7a4a)'}} />
                  <div style={{fontFamily:"'Noto Serif KR', serif",fontSize:'22px',fontWeight:'900',color:'#ef7a4a',marginTop:'4px'}}>임금형</div>
                  <div style={{fontSize:'11px',color:'rgba(237,233,242,.6)'}}>어디에 있든 자연스럽게 중심이 되는 존재감</div>
                </div>
                <div style={{display:'flex',gap:'5px',padding:'12px 14px'}}>
                  {[['갑','오','#6fbf73','#ef7a4a'],['병','인','#ef7a4a','#6fbf73'],['계','미','#5aa0e0','#d9a646'],['을','해','#6fbf73','#5aa0e0']].map(([g,j,c1,c2],i)=>(
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',gap:'4px'}}>
                      <span style={{border:`1px solid ${c1}`,color:c1,borderRadius:'4px',textAlign:'center',fontFamily:'serif',fontWeight:'900',padding:'4px 0'}}>{g}</span>
                      <span style={{border:`1px solid ${c2}`,color:c2,borderRadius:'4px',textAlign:'center',fontFamily:'serif',fontWeight:'900',padding:'4px 0'}}>{j}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:'0 14px 14px'}}>
                  {[['목',3.4],['화',3.1],['토',1.6],['금',0.3],['수',2.6]].map(([k,v])=>(
                    <div key={k} style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'}}>
                      <span style={{width:'14px',fontSize:'10px',color:ELEMENT_COLOR[k]}}>{k}</span>
                      <span style={{flex:1,height:'5px',background:'rgba(255,255,255,.06)',borderRadius:'3px',overflow:'hidden'}}><span className="pv-bar" style={{display:'block',height:'100%',width:`${v/6*100}%`,background:ELEMENT_COLOR[k]}} /></span>
                    </div>
                  ))}
                  <div style={{marginTop:'10px',background:'rgba(232,200,126,.06)',border:'1px solid rgba(232,200,126,.15)',borderRadius:'4px 12px 12px 12px',padding:'9px 11px',fontSize:'11px',color:'rgba(237,233,242,.75)',lineHeight:'1.6'}}>병화 일간에 인목이 받쳐주는 사주예요. 따뜻하고 추진력이 강한 편이라…</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{background:'rgba(11,10,31,0.98)',padding:'60px 24px',borderTop:'1px solid rgba(232,200,126,0.08)'}}>
            <div style={{maxWidth:'1100px',margin:'0 auto'}}>
              <div className="reveal" style={{textAlign:'center',marginBottom:'40px'}}>
                <div style={{fontSize:'10px',letterSpacing:'4px',color:'rgba(232,200,126,0.4)',marginBottom:'12px'}}>SERVICES</div>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'28px',color:'#E8C87E',fontWeight:'400'}}>천기소녀 메뉴</div>
              </div>
              <div style={{marginBottom:'12px'}}>
                <div style={{fontSize:'10px',letterSpacing:'3px',color:'rgba(232,200,126,0.4)',marginBottom:'14px'}}>사주 · 운세</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                  {[
                    {icon:SVC_ICONS.me,tag:'완전 무료',name:'나의 운세',desc:'타고난 기질과 오행 에너지 분석',price:'무료',onClick:()=>setStep('input')},
                    {icon:SVC_ICONS.match,tag:'완전 무료',name:'궁합 분석',desc:'연인·배우자·친구 궁합 점수 공개',price:'무료',onClick:()=>router.push('/gunghap')},
                    {icon:SVC_ICONS.year,tag:'2026 병오년 · 올해',name:'올해 운세',desc:'남은 상반기·하반기 흐름을 자세히 풀이',price:'₩9,900',onClick:()=>router.push('/sinnyeon?year=2026')},
                    {icon:SVC_ICONS.next,tag:'2027 정미년 · 내년',name:'신년운세',desc:'다가올 상반기·하반기 흐름을 미리 풀이',price:'₩9,900',onClick:()=>router.push('/sinnyeon?year=2027')},
                    {icon:SVC_ICONS.scroll,tag:'전통 방식',name:'토정비결',desc:'괘를 뽑아 계절별 신수를 풀이',price:'₩9,900',onClick:()=>router.push('/tojeong')}
                  ].map((p,i)=>(
                    <div key={i} onClick={p.onClick} className="reveal svc-card" style={{'--d':`${(i%2)*120}ms`,background:'linear-gradient(180deg,rgba(40,34,72,.4),rgba(24,20,46,.5))',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',cursor:'pointer',backdropFilter:'blur(10px)'}}>
                      <div style={{marginBottom:'12px'}}><span className="svc-icon"><Ico d={p.icon} /></span></div>
                      <div style={{fontSize:'10px',color:'rgba(232,200,126,0.4)',letterSpacing:'2px',marginBottom:'8px'}}>{p.tag}</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>{p.name}</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',marginBottom:'14px',fontWeight:'300'}}>{p.desc}</div>
                      <div style={{fontSize:'16px',color:'#E8C87E',fontWeight:'600'}}>{p.price}</div>
                    </div>
                  ))}
                </div>
                <div className="reveal" style={{background:'linear-gradient(180deg,rgba(40,34,72,.4),rgba(24,20,46,.5))',border:'1px solid rgba(232,200,126,0.1)',borderRadius:'4px',padding:'24px',backdropFilter:'blur(10px)',marginBottom:'32px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',gap:'16px',alignItems:'center'}}><Ico d={SVC_ICONS.pdf} /><div>
                      <div style={{fontSize:'10px',color:'rgba(232,200,126,0.4)',letterSpacing:'2px',marginBottom:'8px'}}>정밀 분석 리포트</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>AI 리포트 PDF</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',fontWeight:'300'}}>30페이지 분량의 정밀 사주 리포트 · 이메일 발송</div>
                    </div></div>
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
                    {icon:SVC_ICONS.card,tag:'오늘의 한 장 · 무료',name:'오늘의 운세',desc:'지금 이 순간 나에게 필요한 메시지',price:'무료',onClick:()=>router.push('/tarot?cat=daily')},
                    {icon:SVC_ICONS.heart,tag:'연애·관계 · 무료',name:'연애 타로',desc:'그 사람의 마음과 우리의 앞날',price:'무료',onClick:()=>router.push('/tarot?cat=love')}
                  ].map((p,i)=>(
                    <div key={i} onClick={p.onClick} className="reveal svc-card" style={{'--d':`${(i%2)*120}ms`,background:'linear-gradient(180deg,rgba(60,34,100,.4),rgba(36,20,60,.5))',border:'1px solid rgba(155,109,214,0.15)',borderRadius:'4px',padding:'24px',cursor:'pointer',backdropFilter:'blur(10px)'}}>
                      <div style={{marginBottom:'12px'}}><span className="svc-icon"><Ico d={p.icon} color="#c49ae8" /></span></div>
                      <div style={{fontSize:'10px',color:'rgba(155,109,214,0.5)',letterSpacing:'2px',marginBottom:'8px'}}>{p.tag}</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>{p.name}</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',marginBottom:'14px',fontWeight:'300'}}>{p.desc}</div>
                      <div style={{fontSize:'16px',color:'#c49ae8',fontWeight:'600'}}>{p.price}</div>
                    </div>
                  ))}
                </div>
                <div onClick={()=>router.push('/tarot?cat=wealth')} className="reveal svc-card" style={{background:'linear-gradient(180deg,rgba(60,34,100,.4),rgba(36,20,60,.5))',border:'1px solid rgba(155,109,214,0.15)',borderRadius:'4px',padding:'24px',backdropFilter:'blur(10px)',marginBottom:'32px',cursor:'pointer'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',gap:'16px',alignItems:'center'}}><span className="svc-icon"><Ico d={SVC_ICONS.coin} color="#c49ae8" /></span><div>
                      <div style={{fontSize:'10px',color:'rgba(155,109,214,0.5)',letterSpacing:'2px',marginBottom:'8px'}}>재물 · 투자 · 무료</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>재물 타로</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',fontWeight:'300'}}>지금 흐름과 다가올 재물운을 세 장으로 짚어드려요</div>
                    </div></div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'16px',color:'#c49ae8',fontWeight:'600'}}>무료</div>
                    </div>
                  </div>
                </div>
                <div onClick={()=>router.push('/tonghap')} className="reveal svc-card" style={{background:'linear-gradient(180deg,rgba(60,34,100,.4),rgba(36,20,60,.5))',border:'1px solid rgba(155,109,214,0.15)',borderRadius:'4px',padding:'24px',backdropFilter:'blur(10px)',cursor:'pointer'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',gap:'16px',alignItems:'center'}}><span className="svc-icon"><Ico d={SVC_ICONS.eye} color="#c49ae8" /></span><div>
                      <div style={{fontSize:'10px',color:'rgba(155,109,214,0.5)',letterSpacing:'2px',marginBottom:'8px'}}>통합 분석 · 가장 정밀</div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:'18px',color:'#EDE9F2',marginBottom:'6px'}}>사주 + 타로 통합 분석</div>
                      <div style={{fontSize:'12px',color:'rgba(237,233,242,0.4)',fontWeight:'300'}}>사주로 흐름을 보고 타로로 현재를 짚는 가장 정밀한 분석</div>
                    </div></div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'16px',color:'#c49ae8',fontWeight:'600'}}>₩24,900</div>
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
      <NewYearPopup enabled={step === 'landing'} />
    </>
  );
}
