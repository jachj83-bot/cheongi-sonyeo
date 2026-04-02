import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState('landing'); // landing | input | loading
  const [form, setForm] = useState({
    name: '', year: '', month: '', day: '', hour: '12', gender: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.year || !form.month || !form.day || !form.gender) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    const y = parseInt(form.year), m = parseInt(form.month), d = parseInt(form.day);
    if (y < 1900 || y > 2024 || m < 1 || m > 12 || d < 1 || d > 31) {
      setError('올바른 생년월일을 입력해주세요.');
      return;
    }
    setStep('loading');
    setTimeout(() => {
      const params = new URLSearchParams({
        name: form.name, year: form.year, month: form.month,
        day: form.day, hour: form.hour, gender: form.gender
      });
      router.push(`/result?${params.toString()}`);
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>사주한잔 — AI 사주 분석</title>
        <meta name="description" content="AI가 분석하는 정확한 사주풀이. 일주별 상세분석, 궁합, AI 리포트" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="wrapper">
        {/* 배경 장식 */}
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />

        {/* 헤더 */}
        <header className="header">
          <div className="logo">🔮 사주한잔</div>
          <nav className="nav">
            <a href="/gunghap">궁합보기</a>
            <a href="/ilju">일주분석</a>
            <a href="/report">AI 리포트</a>
          </nav>
        </header>

        {step === 'landing' && (
          <main className="main">
            <div className="hero">
              <div className="hero-badge">✨ AI 사주 분석 서비스</div>
              <h1 className="hero-title">
                당신의 사주에<br />
                <span className="accent">숨겨진 운명</span>을<br />
                읽어드립니다
              </h1>
              <p className="hero-sub">
                60갑자 일주 분석 · 궁합 · 재물·연애·직업운<br />
                AI가 당신만의 사주를 깊이 해석합니다
              </p>
              <button className="cta-btn" onClick={() => setStep('input')}>
                무료로 사주 보기 →
              </button>
              <p className="cta-note">기본 분석 무료 · 상세 리포트 유료</p>
            </div>

            {/* 서비스 카드 */}
            <div className="services">
              <div className="service-card">
                <div className="service-icon">🪐</div>
                <h3>일주별 상세분석</h3>
                <p>60개 일주 완전 해석. 성격·직업·연애·재물운까지</p>
                <span className="price">₩9,900</span>
              </div>
              <div className="service-card featured">
                <div className="service-badge">인기</div>
                <div className="service-icon">💑</div>
                <h3>궁합 분석</h3>
                <p>두 사람의 사주를 비교해 사랑·결혼 궁합 완전 분석</p>
                <span className="price">₩14,900</span>
              </div>
              <div className="service-card">
                <div className="service-icon">📄</div>
                <h3>AI 사주 리포트</h3>
                <p>20페이지 PDF 리포트. 올해 운세부터 10년 대운까지</p>
                <span className="price">₩29,900</span>
              </div>
            </div>

            {/* 후기 */}
            <div className="reviews">
              <div className="review">
                <div className="review-stars">★★★★★</div>
                <p>"제 일주 분석이 너무 정확해서 소름이었어요. 주변에 다 공유했어요."</p>
                <span>— 병인일주 @ji__**</span>
              </div>
              <div className="review">
                <div className="review-stars">★★★★★</div>
                <p>"궁합 분석 보고 남자친구랑 많은 걸 이해하게 됐어요. 강추합니다!"</p>
                <span>— 계유일주 @moon_**</span>
              </div>
              <div className="review">
                <div className="review-stars">★★★★☆</div>
                <p>"AI 리포트가 이렇게 자세할 줄 몰랐어요. 직업운 분석이 완전 맞아요."</p>
                <span>— 갑자일주 @star_**</span>
              </div>
            </div>
          </main>
        )}

        {step === 'input' && (
          <main className="main form-main">
            <div className="form-card">
              <button className="back-btn" onClick={() => setStep('landing')}>← 뒤로</button>
              <h2 className="form-title">생년월일을 알려주세요</h2>
              <p className="form-sub">정확한 분석을 위해 시간까지 입력하면 더 정확합니다</p>

              <div className="form-group">
                <label>이름 (닉네임)</label>
                <input
                  type="text" placeholder="홍길동"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>태어난 해</label>
                  <input type="number" placeholder="1995" min="1900" max="2024"
                    value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>월</label>
                  <input type="number" placeholder="03" min="1" max="12"
                    value={form.month} onChange={e => setForm({...form, month: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>일</label>
                  <input type="number" placeholder="15" min="1" max="31"
                    value={form.day} onChange={e => setForm({...form, day: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>태어난 시간 (모르면 12시로)</label>
                <select value={form.hour} onChange={e => setForm({...form, hour: e.target.value})}>
                  {Array.from({length: 24}, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2,'0')}시 ({getTimeDesc(i)})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>성별</label>
                <div className="gender-btns">
                  {['남', '여'].map(g => (
                    <button key={g}
                      className={`gender-btn ${form.gender === g ? 'active' : ''}`}
                      onClick={() => setForm({...form, gender: g})}
                    >{g}자</button>
                  ))}
                </div>
              </div>

              {error && <p className="error">{error}</p>}

              <button className="submit-btn" onClick={handleSubmit}>
                사주 분석 시작하기 🔮
              </button>
            </div>
          </main>
        )}

        {step === 'loading' && (
          <main className="main loading-main">
            <div className="loading-card">
              <div className="loading-orb">🔮</div>
              <h2>사주를 분석하고 있어요...</h2>
              <div className="loading-steps">
                <p>✨ 사주팔자 계산 중...</p>
                <p>🪐 일주 분석 중...</p>
                <p>🤖 AI 해석 준비 중...</p>
              </div>
              <div className="loading-bar"><div className="loading-fill" /></div>
            </div>
          </main>
        )}

        <footer className="footer">
          <p>© 2026 사주한잔 · AI 기반 사주 분석 서비스</p>
          <p className="footer-note">본 서비스는 참고용이며 전문 상담을 대체하지 않습니다</p>
        </footer>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #080b14; color: #e8e0d0; font-family: 'Noto Sans KR', sans-serif; min-height: 100vh; }
      `}</style>
      <style jsx>{`
        .wrapper { min-height: 100vh; position: relative; overflow: hidden; }
        .bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .orb1 { width: 400px; height: 400px; background: rgba(120,80,200,0.12); top: -100px; right: -100px; }
        .orb2 { width: 300px; height: 300px; background: rgba(180,130,50,0.08); bottom: 100px; left: -50px; }
        .orb3 { width: 200px; height: 200px; background: rgba(60,120,160,0.1); top: 50%; left: 50%; }

        .header { position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .logo { font-family: 'Noto Serif KR', serif; font-size: 20px; font-weight: 700; color: #d4af60; }
        .nav { display: flex; gap: 28px; }
        .nav a { color: rgba(232,224,208,0.6); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .nav a:hover { color: #d4af60; }

        .main { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 60px 24px; }

        .hero { text-align: center; margin-bottom: 80px; }
        .hero-badge { display: inline-block; background: rgba(212,175,96,0.15); border: 1px solid rgba(212,175,96,0.3); color: #d4af60; padding: 6px 18px; border-radius: 20px; font-size: 13px; margin-bottom: 24px; }
        .hero-title { font-family: 'Noto Serif KR', serif; font-size: clamp(36px, 6vw, 60px); line-height: 1.3; font-weight: 700; margin-bottom: 20px; }
        .accent { color: #d4af60; }
        .hero-sub { font-size: 16px; color: rgba(232,224,208,0.6); line-height: 1.8; margin-bottom: 36px; }
        .cta-btn { background: linear-gradient(135deg, #c8962a, #e8c060); color: #1a1200; padding: 16px 40px; border: none; border-radius: 50px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Noto Sans KR', sans-serif; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(200,150,42,0.35); }
        .cta-note { margin-top: 12px; font-size: 12px; color: rgba(232,224,208,0.4); }

        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 60px; }
        .service-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; position: relative; transition: all 0.2s; }
        .service-card:hover { border-color: rgba(212,175,96,0.3); transform: translateY(-2px); }
        .service-card.featured { border-color: rgba(212,175,96,0.4); background: rgba(212,175,96,0.06); }
        .service-badge { position: absolute; top: -10px; right: 20px; background: #d4af60; color: #1a1200; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 10px; }
        .service-icon { font-size: 32px; margin-bottom: 14px; }
        .service-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .service-card p { font-size: 14px; color: rgba(232,224,208,0.6); line-height: 1.6; margin-bottom: 16px; }
        .price { color: #d4af60; font-size: 20px; font-weight: 700; }

        .reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
        .review { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; }
        .review-stars { color: #d4af60; margin-bottom: 10px; font-size: 14px; }
        .review p { font-size: 14px; color: rgba(232,224,208,0.8); line-height: 1.6; margin-bottom: 10px; }
        .review span { font-size: 12px; color: rgba(232,224,208,0.4); }

        .form-main { display: flex; justify-content: center; align-items: flex-start; padding-top: 40px; }
        .form-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; width: 100%; max-width: 480px; }
        .back-btn { background: none; border: none; color: rgba(232,224,208,0.5); cursor: pointer; font-size: 14px; margin-bottom: 24px; font-family: 'Noto Sans KR', sans-serif; }
        .form-title { font-family: 'Noto Serif KR', serif; font-size: 26px; font-weight: 700; margin-bottom: 8px; }
        .form-sub { font-size: 14px; color: rgba(232,224,208,0.5); margin-bottom: 28px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 13px; color: rgba(232,224,208,0.6); margin-bottom: 8px; }
        .form-group input, .form-group select { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 16px; color: #e8e0d0; font-size: 15px; font-family: 'Noto Sans KR', sans-serif; outline: none; transition: border-color 0.2s; }
        .form-group input:focus, .form-group select:focus { border-color: rgba(212,175,96,0.5); }
        .form-group select option { background: #1a1a2e; }
        .form-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; }
        .gender-btns { display: flex; gap: 10px; }
        .gender-btn { flex: 1; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: rgba(232,224,208,0.7); font-size: 15px; cursor: pointer; transition: all 0.2s; font-family: 'Noto Sans KR', sans-serif; }
        .gender-btn.active { background: rgba(212,175,96,0.15); border-color: rgba(212,175,96,0.5); color: #d4af60; }
        .error { color: #e87070; font-size: 13px; margin-bottom: 16px; }
        .submit-btn { width: 100%; background: linear-gradient(135deg, #c8962a, #e8c060); color: #1a1200; padding: 16px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.2s; }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,150,42,0.3); }

        .loading-main { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
        .loading-card { text-align: center; }
        .loading-orb { font-size: 64px; margin-bottom: 24px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .loading-card h2 { font-family: 'Noto Serif KR', serif; font-size: 24px; margin-bottom: 24px; }
        .loading-steps { margin-bottom: 32px; }
        .loading-steps p { color: rgba(232,224,208,0.6); font-size: 14px; line-height: 2; }
        .loading-bar { width: 200px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin: 0 auto; overflow: hidden; }
        .loading-fill { height: 100%; background: linear-gradient(90deg, #c8962a, #e8c060); border-radius: 2px; animation: fill 2s linear forwards; }
        @keyframes fill { from { width: 0%; } to { width: 100%; } }

        .footer { position: relative; z-index: 1; text-align: center; padding: 40px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer p { font-size: 13px; color: rgba(232,224,208,0.3); line-height: 2; }
      `}</style>
    </>
  );
}

function getTimeDesc(hour) {
  const descs = ['자시', '자시', '축시', '축시', '인시', '인시', '묘시', '묘시', '진시', '진시', '사시', '사시', '오시', '오시', '미시', '미시', '신시', '신시', '유시', '유시', '술시', '술시', '해시', '해시'];
  return descs[hour];
}
