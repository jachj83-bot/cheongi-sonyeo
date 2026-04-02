import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { calculateSaju } from '../lib/saju-calculator';

export default function Result() {
  const router = useRouter();
  const [saju, setSaju] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const { year, month, day, hour, name: n, gender } = router.query;
    if (!year) return;

    setName(n || '');
    const result = calculateSaju(
      parseInt(year), parseInt(month), parseInt(day), parseInt(hour || 12)
    );
    setSaju({ ...result, gender });

    // AI 분석 요청
    setLoading(true);
    fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saju: result, name: n, gender, type: 'basic' })
    })
    .then(r => r.json())
    .then(data => {
      setAiAnalysis(data.analysis || '');
      setLoading(false);
      setTimeout(() => setShowUpsell(true), 3000);
    })
    .catch(() => {
      setAiAnalysis('AI 분석을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    });
  }, [router.isReady, router.query]);

  if (!saju) return <div style={{color:'#e8e0d0',display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#080b14'}}>분석 중...</div>;

  const ohaengColors = { 목: '#4a9e5c', 화: '#e05a3a', 토: '#c8962a', 금: '#a0a0c0', 수: '#3a80be' };

  return (
    <>
      <Head>
        <title>{name}님의 사주 — 사주한잔</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="wrapper">
        <div className="bg-orb orb1" /><div className="bg-orb orb2" />

        <header className="header">
          <a href="/" className="logo">🔮 사주한잔</a>
        </header>

        <main className="main">
          {/* 이름 + 기본정보 */}
          <div className="hero-section">
            <p className="result-badge">✨ {name}님의 사주 분석 결과</p>
            <h1 className="result-name">{saju.iljuInfo.keyword}</h1>
            <p className="result-ilju">{saju.ilju}일주 · {saju.iljuInfo.title}</p>
          </div>

          {/* 사주팔자 표 */}
          <div className="saju-table-wrap">
            <h2 className="section-title">사주팔자 (四柱八字)</h2>
            <div className="saju-table">
              {[
                { label: '시주', value: saju.siju, sub: '시간' },
                { label: '일주', value: saju.ilju, sub: '나', highlight: true },
                { label: '월주', value: saju.wolju, sub: '부모·환경' },
                { label: '연주', value: saju.yeonju, sub: '사회·조상' },
              ].map(col => (
                <div key={col.label} className={`saju-col ${col.highlight ? 'highlight' : ''}`}>
                  <div className="col-label">{col.label}</div>
                  <div className="col-cheongan">{col.value[0]}</div>
                  <div className="col-jiji">{col.value[1]}</div>
                  <div className="col-sub">{col.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 오행 분포 */}
          <div className="ohaeng-section">
            <h2 className="section-title">오행 분포</h2>
            <div className="ohaeng-grid">
              {Object.entries(saju.ohaeng).map(([name, count]) => (
                <div key={name} className="ohaeng-item">
                  <div className="ohaeng-bar-bg">
                    <div className="ohaeng-bar" style={{ height: `${count * 20}%`, background: ohaengColors[name] }} />
                  </div>
                  <div className="ohaeng-name" style={{ color: ohaengColors[name] }}>{name}</div>
                  <div className="ohaeng-count">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 일주 특성 */}
          <div className="traits-section">
            <h2 className="section-title">{saju.iljuInfo.title} 핵심 특성</h2>
            <div className="traits-grid">
              <div className="trait-card">
                <h3>강점</h3>
                <p>{saju.iljuInfo.strength}</p>
              </div>
              <div className="trait-card">
                <h3>약점</h3>
                <p>{saju.iljuInfo.weakness}</p>
              </div>
            </div>
            <div className="trait-tags">
              {saju.iljuInfo.traits.map(t => (
                <span key={t} className="trait-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* AI 분석 */}
          <div className="ai-section">
            <div className="ai-header">
              <span className="ai-badge">🤖 AI 분석</span>
              <h2>AI가 읽은 당신의 사주</h2>
            </div>
            {loading ? (
              <div className="ai-loading">
                <div className="dot-pulse"><span /><span /><span /></div>
                <p>AI가 사주를 깊이 분석하고 있어요...</p>
              </div>
            ) : (
              <div className="ai-text">
                {aiAnalysis.split('\n').map((line, i) => line.trim() && <p key={i}>{line}</p>)}
              </div>
            )}
          </div>

          {/* 업셀 섹션 */}
          {showUpsell && (
            <div className="upsell-section">
              <h2 className="upsell-title">🔮 더 깊은 분석이 필요하신가요?</h2>
              <p className="upsell-sub">무료 분석은 맛보기입니다. 아래에서 더 자세한 분석을 받아보세요.</p>
              <div className="upsell-grid">
                <div className="upsell-card">
                  <div className="upsell-icon">🪐</div>
                  <h3>{saju.ilju}일주 완전 분석</h3>
                  <ul>
                    <li>✓ 일주별 연애·결혼 유형</li>
                    <li>✓ 최적 직업·사업 분야</li>
                    <li>✓ 재물운·건강운 상세분석</li>
                    <li>✓ 올해 월별 운세 12개월</li>
                  </ul>
                  <button className="upsell-btn" onClick={() => handlePurchase('ilju')}>
                    ₩9,900으로 보기
                  </button>
                </div>
                <div className="upsell-card featured">
                  <div className="upsell-best">BEST</div>
                  <div className="upsell-icon">📄</div>
                  <h3>AI 사주 리포트 (PDF)</h3>
                  <ul>
                    <li>✓ 20페이지 상세 리포트</li>
                    <li>✓ 5년 대운 흐름 분석</li>
                    <li>✓ 사주 기반 투자·이직 타이밍</li>
                    <li>✓ 적합한 배우자 유형 분석</li>
                  </ul>
                  <button className="upsell-btn gold" onClick={() => handlePurchase('report')}>
                    ₩29,900으로 보기
                  </button>
                </div>
                <div className="upsell-card">
                  <div className="upsell-icon">💑</div>
                  <h3>궁합 분석</h3>
                  <ul>
                    <li>✓ 두 사람 사주 비교</li>
                    <li>✓ 연애·결혼 궁합 점수</li>
                    <li>✓ 갈등 요인 & 해결책</li>
                    <li>✓ 최적 관계 시기 분석</li>
                  </ul>
                  <button className="upsell-btn" onClick={() => router.push('/gunghap')}>
                    ₩14,900으로 보기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 공유 */}
          <div className="share-section">
            <p>내 사주 결과 공유하기</p>
            <div className="share-btns">
              <button className="share-btn" onClick={() => shareResult('kakao')}>카카오톡</button>
              <button className="share-btn" onClick={() => shareResult('instagram')}>인스타그램</button>
              <button className="share-btn" onClick={() => copyLink()}>링크 복사</button>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>© 2026 사주한잔 · AI 기반 사주 분석 서비스</p>
        </footer>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #080b14; color: #e8e0d0; font-family: 'Noto Sans KR', sans-serif; }
      `}</style>
      <style jsx>{`
        .wrapper { min-height: 100vh; position: relative; overflow: hidden; }
        .bg-orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .orb1 { width: 500px; height: 500px; background: rgba(100,60,180,0.1); top: -200px; right: -100px; }
        .orb2 { width: 400px; height: 400px; background: rgba(180,130,40,0.06); bottom: 0; left: -100px; }

        .header { position: relative; z-index: 10; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .logo { font-family: 'Noto Serif KR', serif; font-size: 20px; font-weight: 700; color: #d4af60; text-decoration: none; }

        .main { position: relative; z-index: 1; max-width: 780px; margin: 0 auto; padding: 48px 24px 80px; }
        .section-title { font-family: 'Noto Serif KR', serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; }

        .hero-section { text-align: center; margin-bottom: 48px; }
        .result-badge { display: inline-block; background: rgba(212,175,96,0.15); border: 1px solid rgba(212,175,96,0.3); color: #d4af60; padding: 6px 18px; border-radius: 20px; font-size: 13px; margin-bottom: 16px; }
        .result-name { font-family: 'Noto Serif KR', serif; font-size: 36px; font-weight: 700; margin-bottom: 8px; }
        .result-ilju { font-size: 16px; color: rgba(232,224,208,0.6); }

        .saju-table-wrap { margin-bottom: 40px; }
        .saju-table { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .saju-col { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px 12px; text-align: center; transition: all 0.2s; }
        .saju-col.highlight { background: rgba(212,175,96,0.08); border-color: rgba(212,175,96,0.35); }
        .col-label { font-size: 12px; color: rgba(232,224,208,0.5); margin-bottom: 12px; }
        .col-cheongan { font-family: 'Noto Serif KR', serif; font-size: 28px; font-weight: 700; color: #d4af60; margin-bottom: 4px; }
        .col-jiji { font-family: 'Noto Serif KR', serif; font-size: 28px; font-weight: 700; margin-bottom: 12px; }
        .col-sub { font-size: 11px; color: rgba(232,224,208,0.4); }

        .ohaeng-section { margin-bottom: 40px; }
        .ohaeng-grid { display: flex; gap: 16px; align-items: flex-end; height: 120px; }
        .ohaeng-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .ohaeng-bar-bg { width: 100%; height: 80px; background: rgba(255,255,255,0.05); border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden; }
        .ohaeng-bar { width: 100%; border-radius: 6px; transition: height 1s ease; }
        .ohaeng-name { font-size: 14px; font-weight: 500; }
        .ohaeng-count { font-size: 18px; font-weight: 700; }

        .traits-section { margin-bottom: 40px; }
        .traits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .trait-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; }
        .trait-card h3 { font-size: 13px; color: rgba(232,224,208,0.5); margin-bottom: 10px; }
        .trait-card p { font-size: 15px; line-height: 1.6; }
        .trait-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .trait-tag { background: rgba(212,175,96,0.12); border: 1px solid rgba(212,175,96,0.25); color: #d4af60; padding: 6px 16px; border-radius: 20px; font-size: 13px; }

        .ai-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; margin-bottom: 40px; }
        .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .ai-badge { background: rgba(100,180,255,0.15); border: 1px solid rgba(100,180,255,0.25); color: #70b8f0; padding: 4px 12px; border-radius: 10px; font-size: 12px; }
        .ai-header h2 { font-family: 'Noto Serif KR', serif; font-size: 20px; }
        .ai-text p { font-size: 15px; line-height: 1.9; color: rgba(232,224,208,0.85); margin-bottom: 12px; }
        .ai-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 20px; }
        .ai-loading p { font-size: 14px; color: rgba(232,224,208,0.5); }
        .dot-pulse { display: flex; gap: 6px; }
        .dot-pulse span { width: 8px; height: 8px; border-radius: 50%; background: #d4af60; animation: blink 1.2s infinite; }
        .dot-pulse span:nth-child(2) { animation-delay: 0.2s; }
        .dot-pulse span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 1; } }

        .upsell-section { margin-bottom: 48px; }
        .upsell-title { font-family: 'Noto Serif KR', serif; font-size: 24px; margin-bottom: 8px; }
        .upsell-sub { font-size: 14px; color: rgba(232,224,208,0.5); margin-bottom: 24px; }
        .upsell-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .upsell-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; position: relative; }
        .upsell-card.featured { border-color: rgba(212,175,96,0.4); background: rgba(212,175,96,0.06); }
        .upsell-best { position: absolute; top: -10px; right: 16px; background: #d4af60; color: #1a1200; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 10px; }
        .upsell-icon { font-size: 28px; margin-bottom: 12px; }
        .upsell-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 14px; }
        .upsell-card ul { list-style: none; margin-bottom: 20px; }
        .upsell-card li { font-size: 13px; color: rgba(232,224,208,0.7); line-height: 2; }
        .upsell-btn { width: 100%; padding: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #e8e0d0; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Noto Sans KR', sans-serif; }
        .upsell-btn:hover { background: rgba(255,255,255,0.14); }
        .upsell-btn.gold { background: linear-gradient(135deg, #c8962a, #e8c060); color: #1a1200; border: none; }
        .upsell-btn.gold:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,150,42,0.3); }

        .share-section { text-align: center; }
        .share-section p { font-size: 14px; color: rgba(232,224,208,0.5); margin-bottom: 14px; }
        .share-btns { display: flex; gap: 10px; justify-content: center; }
        .share-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; color: rgba(232,224,208,0.8); padding: 8px 20px; font-size: 13px; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.2s; }
        .share-btn:hover { background: rgba(255,255,255,0.1); }

        .footer { position: relative; z-index: 1; text-align: center; padding: 40px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer p { font-size: 13px; color: rgba(232,224,208,0.3); }
      `}</style>
    </>
  );
}

function handlePurchase(type) {
  // 토스페이먼츠 연동 포인트
  alert(`결제 페이지로 이동합니다. (토스페이먼츠 연동 필요)\n상품: ${type}`);
}

function shareResult(platform) {
  const url = window.location.href;
  if (platform === 'kakao') alert('카카오 SDK 연동 필요');
  else if (platform === 'instagram') alert('인스타그램 공유: 링크 복사 후 스토리에 붙여넣기');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert('링크가 복사되었습니다!');
}
