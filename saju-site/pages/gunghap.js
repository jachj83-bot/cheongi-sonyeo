import { useState } from 'react';
import Head from 'next/head';
import { calculateSaju, calculateGunghap } from '../lib/saju-calculator';

export default function Gunghap() {
  const [person1, setPerson1] = useState({ name: '', year: '', month: '', day: '', hour: '12' });
  const [person2, setPerson2] = useState({ name: '', year: '', month: '', day: '', hour: '12' });
  const [result, setResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const analyze = async () => {
    const saju1 = calculateSaju(+person1.year, +person1.month, +person1.day, +person1.hour);
    const saju2 = calculateSaju(+person2.year, +person2.month, +person2.day, +person2.hour);
    const gunghap = calculateGunghap(saju1, saju2);
    setResult({ saju1, saju2, gunghap });

    // 무료: 점수만 보여주고 AI 분석은 페이월
    setTimeout(() => setShowPaywall(true), 1500);
  };

  const purchaseAndAnalyze = async () => {
    // 실제로는 토스페이먼츠 결제 후 진행
    setShowPaywall(false);
    setLoading(true);
    const saju1 = calculateSaju(+person1.year, +person1.month, +person1.day, +person1.hour);
    const saju2 = calculateSaju(+person2.year, +person2.month, +person2.day, +person2.hour);

    const res = await fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saju, type: 'gunghap', saju2, name: person1.name, name2: person2.name })
    });
    const data = await res.json();
    setAiAnalysis(data.analysis);
    setLoading(false);
  };

  const scoreColor = (score) => {
    if (score >= 85) return '#d4af60';
    if (score >= 70) return '#4a9e5c';
    if (score >= 55) return '#6088c0';
    return '#c05050';
  };

  return (
    <>
      <Head>
        <title>궁합 분석 — 사주한잔</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="wrapper">
        <div className="bg-orb orb1" /><div className="bg-orb orb2" />
        <header className="header">
          <a href="/" className="logo">🔮 사주한잔</a>
        </header>
        <main className="main">
          <div className="page-hero">
            <h1>💑 사주 궁합 분석</h1>
            <p>두 사람의 사주로 알아보는 진짜 궁합</p>
          </div>

          {!result ? (
            <div className="input-section">
              <div className="persons-grid">
                {[
                  { label: '첫 번째 사람', state: person1, set: setPerson1 },
                  { label: '두 번째 사람', state: person2, set: setPerson2 }
                ].map(({ label, state, set }) => (
                  <div key={label} className="person-card">
                    <h3>{label}</h3>
                    <div className="form-group">
                      <label>이름</label>
                      <input type="text" placeholder="홍길동" value={state.name} onChange={e => set({...state, name: e.target.value})} />
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>년</label><input type="number" placeholder="1995" value={state.year} onChange={e => set({...state, year: e.target.value})} /></div>
                      <div className="form-group"><label>월</label><input type="number" placeholder="03" value={state.month} onChange={e => set({...state, month: e.target.value})} /></div>
                      <div className="form-group"><label>일</label><input type="number" placeholder="15" value={state.day} onChange={e => set({...state, day: e.target.value})} /></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="analyze-btn" onClick={analyze}>궁합 분석하기 💑</button>
            </div>
          ) : (
            <div className="result-section">
              {/* 궁합 점수 */}
              <div className="score-card">
                <div className="score-circle" style={{ borderColor: scoreColor(result.gunghap.score) }}>
                  <div className="score-num" style={{ color: scoreColor(result.gunghap.score) }}>
                    {result.gunghap.score}
                  </div>
                  <div className="score-label">점</div>
                </div>
                <div className="score-info">
                  <h2>{result.gunghap.grade}</h2>
                  <p>{result.gunghap.comment}</p>
                  <div className="ilju-compare">
                    <span className="ilju-tag">{person1.name} · {result.saju1.ilju}일주</span>
                    <span className="heart">💕</span>
                    <span className="ilju-tag">{person2.name} · {result.saju2.ilju}일주</span>
                  </div>
                </div>
              </div>

              {/* 페이월 */}
              {showPaywall && !aiAnalysis && (
                <div className="paywall-card">
                  <div className="paywall-blur">
                    <p>두 사람의 오행 에너지가 서로를...</p>
                    <p>연애할 때 가장 큰 매력 포인트는...</p>
                    <p>결혼 후 함께하면 더욱 빛나는 부분은...</p>
                  </div>
                  <div className="paywall-overlay">
                    <div className="paywall-icon">🔒</div>
                    <h3>AI 상세 궁합 분석</h3>
                    <ul>
                      <li>✓ 오행 상성 심층 분석</li>
                      <li>✓ 연애·결혼 궁합 완전 분석</li>
                      <li>✓ 갈등 포인트 & 해결책</li>
                      <li>✓ 2026년 두 사람의 최적 시기</li>
                    </ul>
                    <button className="buy-btn" onClick={purchaseAndAnalyze}>
                      ₩14,900 — 전체 궁합 보기
                    </button>
                    <p className="paywall-note">토스페이 · 카카오페이 결제 가능</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="ai-loading">
                  <div className="dot-pulse"><span /><span /><span /></div>
                  <p>AI가 궁합을 깊이 분석 중...</p>
                </div>
              )}

              {aiAnalysis && (
                <div className="ai-result">
                  <h2 className="section-title">💑 AI 궁합 분석 결과</h2>
                  {aiAnalysis.split('\n').map((line, i) => line.trim() && <p key={i}>{line}</p>)}
                </div>
              )}

              <button className="retry-btn" onClick={() => { setResult(null); setAiAnalysis(''); setShowPaywall(false); }}>
                다시 분석하기
              </button>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`* { margin:0; padding:0; box-sizing:border-box; } body { background:#080b14; color:#e8e0d0; font-family:'Noto Sans KR',sans-serif; }`}</style>
      <style jsx>{`
        .wrapper { min-height:100vh; position:relative; overflow:hidden; }
        .bg-orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
        .orb1 { width:400px; height:400px; background:rgba(180,80,150,0.1); top:-100px; right:-100px; }
        .orb2 { width:300px; height:300px; background:rgba(80,120,200,0.08); bottom:0; left:-50px; }
        .header { position:relative; z-index:10; padding:20px 40px; border-bottom:1px solid rgba(255,255,255,0.06); }
        .logo { font-family:'Noto Serif KR',serif; font-size:20px; font-weight:700; color:#d4af60; text-decoration:none; }
        .main { position:relative; z-index:1; max-width:760px; margin:0 auto; padding:48px 24px 80px; }
        .page-hero { text-align:center; margin-bottom:40px; }
        .page-hero h1 { font-family:'Noto Serif KR',serif; font-size:36px; font-weight:700; margin-bottom:8px; }
        .page-hero p { color:rgba(232,224,208,0.5); font-size:16px; }
        .persons-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
        .person-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; }
        .person-card h3 { font-size:15px; font-weight:500; margin-bottom:16px; color:rgba(232,224,208,0.7); }
        .form-group { margin-bottom:14px; }
        .form-group label { display:block; font-size:12px; color:rgba(232,224,208,0.5); margin-bottom:6px; }
        .form-group input { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px 12px; color:#e8e0d0; font-size:14px; font-family:'Noto Sans KR',sans-serif; outline:none; }
        .form-group input:focus { border-color:rgba(212,175,96,0.4); }
        .form-row { display:grid; grid-template-columns:2fr 1fr 1fr; gap:8px; }
        .analyze-btn { width:100%; background:linear-gradient(135deg,#c8962a,#e8c060); color:#1a1200; padding:16px; border:none; border-radius:12px; font-size:16px; font-weight:700; cursor:pointer; font-family:'Noto Sans KR',sans-serif; }
        .score-card { display:flex; gap:28px; align-items:center; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:32px; margin-bottom:24px; }
        .score-circle { width:100px; height:100px; border-radius:50%; border:3px solid; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
        .score-num { font-family:'Noto Serif KR',serif; font-size:36px; font-weight:700; line-height:1; }
        .score-label { font-size:12px; color:rgba(232,224,208,0.5); }
        .score-info h2 { font-family:'Noto Serif KR',serif; font-size:24px; margin-bottom:8px; }
        .score-info p { font-size:14px; color:rgba(232,224,208,0.7); line-height:1.6; margin-bottom:14px; }
        .ilju-compare { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .ilju-tag { background:rgba(212,175,96,0.12); border:1px solid rgba(212,175,96,0.25); color:#d4af60; padding:4px 14px; border-radius:20px; font-size:13px; }
        .heart { font-size:18px; }
        .paywall-card { position:relative; border-radius:16px; overflow:hidden; margin-bottom:24px; }
        .paywall-blur { padding:24px; filter:blur(5px); background:rgba(255,255,255,0.03); pointer-events:none; }
        .paywall-blur p { font-size:15px; line-height:2; color:rgba(232,224,208,0.7); }
        .paywall-overlay { position:absolute; inset:0; background:rgba(8,11,20,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:32px; text-align:center; backdrop-filter:blur(4px); }
        .paywall-icon { font-size:36px; }
        .paywall-overlay h3 { font-family:'Noto Serif KR',serif; font-size:22px; }
        .paywall-overlay ul { list-style:none; }
        .paywall-overlay li { font-size:14px; color:rgba(232,224,208,0.7); line-height:2; }
        .buy-btn { background:linear-gradient(135deg,#c8962a,#e8c060); color:#1a1200; padding:14px 32px; border:none; border-radius:50px; font-size:16px; font-weight:700; cursor:pointer; font-family:'Noto Sans KR',sans-serif; }
        .paywall-note { font-size:12px; color:rgba(232,224,208,0.4); }
        .ai-loading { display:flex; flex-direction:column; align-items:center; gap:12px; padding:32px; }
        .dot-pulse { display:flex; gap:6px; }
        .dot-pulse span { width:8px; height:8px; border-radius:50%; background:#d4af60; animation:blink 1.2s infinite; }
        .dot-pulse span:nth-child(2) { animation-delay:0.2s; }
        .dot-pulse span:nth-child(3) { animation-delay:0.4s; }
        @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        .ai-result { margin-bottom:24px; }
        .section-title { font-family:'Noto Serif KR',serif; font-size:22px; margin-bottom:16px; }
        .ai-result p { font-size:15px; line-height:1.9; color:rgba(232,224,208,0.85); margin-bottom:10px; }
        .retry-btn { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:rgba(232,224,208,0.6); padding:12px 24px; font-size:14px; cursor:pointer; font-family:'Noto Sans KR',sans-serif; }
      `}</style>
    </>
  );
}
