import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PageHero from '../../lib/PageHero';
import CrossSell from '../../lib/CrossSell';
import { PRODUCTS } from '../../lib/products';

// 새 유료 메뉴 6종 공용 화면: 입력 → 무료 미리보기 → 결제 → 전체 보기 → 다른 메뉴 이어 보기
const HOURS = [
  ['자시', '23:30~01:30'], ['축시', '01:30~03:30'], ['인시', '03:30~05:30'], ['묘시', '05:30~07:30'],
  ['진시', '07:30~09:30'], ['사시', '09:30~11:30'], ['오시', '11:30~13:30'], ['미시', '13:30~15:30'],
  ['신시', '15:30~17:30'], ['유시', '17:30~19:30'], ['술시', '19:30~21:30'], ['해시', '21:30~23:30'], ['모름', '시간 불명'],
];
const MBTIS = ['ENFP','ENFJ','ENTP','ENTJ','ESFP','ESFJ','ESTP','ESTJ','INFP','INFJ','INTP','INTJ','ISFP','ISFJ','ISTP','ISTJ'];
const WHEN = ['한 달 이내', '세 달 이내', '1년 이내', '1년 넘었어요'];
const LOADING = ['천기소녀가 사주를 펼치고 있어요...', '여덟 글자의 기운을 읽는 중이에요...', '풀이를 한 장씩 적고 있어요...'];

function makeOrderId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'ord-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

export default function Unse() {
  const router = useRouter();
  const kind = router.query.kind;
  const P = PRODUCTS[kind];
  const [step, setStep] = useState('input');
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '', gender: '', calendar: '양력', mbti: '', when: '' });
  const [partner, setPartner] = useState({ name: '', year: '', month: '', day: '', hour: '', gender: '', calendar: '양력' });
  const [result, setResult] = useState('');
  const [preview, setPreview] = useState('');
  const [locked, setLocked] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState(0);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const autoRan = useRef(false);

  useEffect(() => {
    if (!loading) { setMsg(0); return; }
    const t = setInterval(() => setMsg(i => Math.min(i + 1, LOADING.length - 1)), 3000);
    return () => clearInterval(t);
  }, [loading]);

  // 주소에 생년월일이 있으면 채우고, auto=1이면 바로 풀이를 시작한다 (다른 결과 화면에서 넘어온 경우)
  useEffect(() => {
    if (!router.isReady || !P) return;
    const q = router.query;
    if (q.orderId) {
      setOrderId(q.orderId); setStep('result'); setRestoring(true); pollReveal(q.orderId, 0);
      return;
    }
    if (q.year && q.month && q.day) {
      const f = { ...form, name: q.name || '', year: q.year, month: q.month, day: q.day, hour: q.hour || '', gender: q.gender || '', calendar: q.calendar || '양력', mbti: q.mbti || '' };
      setForm(f);
      if (q.auto === '1' && !P.needPartner && !P.askWhen && f.name && f.hour && f.gender && !autoRan.current) {
        autoRan.current = true;
        run(f);
      }
      return;
    }
    fetch('/api/me').then(r => r.json()).then(d => { if (d && d.birth) setForm(f => (f.year ? f : { ...f, ...d.birth })); }).catch(() => {});
  }, [router.isReady, kind]);

  const pollReveal = async (oid, attempt) => {
    try {
      const res = await fetch('/api/payapp/reveal?orderId=' + encodeURIComponent(oid));
      if (res.status === 200) {
        const data = await res.json();
        if (data.paid && data.stash) {
          setResult(data.stash.full || ''); setLocked(false);
          if (data.stash.meta) { const { kind: _k, price: _p, ...rest } = data.stash.meta; setForm(f => ({ ...f, ...rest })); }
          setRestoring(false);
          return;
        }
      }
    } catch {}
    if (attempt < 20) setTimeout(() => pollReveal(oid, attempt + 1), 1500);
    else { setRestoring(false); setPayError('결제 확인이 늦어지고 있어요. 잠시 후 새로고침 해주세요.'); }
  };

  const run = async (f) => {
    setError(''); setLoading(true); setStep('result');
    const oid = makeOrderId(); setOrderId(oid);
    try {
      const res = await fetch('/api/saju', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'product', kind, ...f, partner: P.needPartner ? partner : undefined, orderId: oid }),
      });
      const data = await res.json();
      if (!res.ok) { setStep('input'); setError(data.error || '잠시 후 다시 시도해주세요.'); setLoading(false); return; }
      if (data.locked) { setPreview(data.preview || ''); setLocked(true); }
      else { setResult(data.full || data.preview || '분석 결과를 불러올 수 없습니다.'); setLocked(false); }
    } catch { setResult('잠시 후 다시 시도해주세요.'); }
    setLoading(false);
    window.scrollTo({ top: 0 });
  };

  const handleSubmit = () => {
    if (!form.name || !form.year || !form.month || !form.day || !form.gender || !form.hour) { setError('내 정보를 모두 입력해주세요.'); return; }
    if (P.needPartner && (!partner.year || !partner.month || !partner.day || !partner.gender)) { setError('상대방 생년월일과 성별을 입력해주세요.'); return; }
    run(form);
  };

  const startPayment = async () => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 9) { setPayError('휴대폰번호를 정확히 입력해주세요.'); return; }
    setPaying(true); setPayError('');
    try {
      const res = await fetch('/api/payapp/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, goodname: `${P.title} 전체보기`, price: P.price, recvphone: digits, returnPath: `/unse/${kind}?orderId=${orderId}` }),
      });
      const data = await res.json();
      if (res.status === 401 && data.needLogin) { window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname + window.location.search); return; }
      if (!res.ok || !data.payurl) { setPayError(data.error || '결제 요청에 실패했어요.'); setPaying(false); return; }
      window.location.href = data.payurl;
    } catch { setPayError('결제 요청 중 오류가 발생했어요.'); setPaying(false); }
  };

  if (!P) return <div style={{ minHeight: '100vh', background: '#0c0c0f' }} />;

  const shownCount = (preview.match(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gmu) || []).length;
  const lockedTitles = P.sections.slice(Math.max(P.preview, shownCount));

  const S = {
    input: { width: '100%', background: '#17171b', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '14px 16px', color: '#EDE9F2', fontSize: '15px', outline: 'none', fontFamily: 'inherit' },
    sel: (a) => ({ padding: '12px 6px', background: a ? 'rgba(232,200,126,.14)' : '#17171b', border: `1px solid ${a ? 'rgba(232,200,126,.7)' : 'rgba(255,255,255,.1)'}`, borderRadius: '8px', color: a ? '#E8C87E' : 'rgba(237,233,242,.55)', cursor: 'pointer', fontSize: '14px', fontWeight: a ? 700 : 400, fontFamily: 'inherit' }),
    label: { display: 'block', fontSize: '12px', color: 'rgba(237,233,242,.6)', marginBottom: '8px' },
    select: { width: '100%', background: '#17171b', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '14px 16px', color: '#EDE9F2', fontSize: '14px', outline: 'none', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none' },
    gold: { width: '100%', background: 'linear-gradient(180deg,#e2bd62,#b8902f)', color: '#17120a', padding: '16px', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
    box: { background: '#141418', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '22px', lineHeight: '1.9', fontSize: '15px', whiteSpace: 'pre-wrap', color: '#EDE9F2' },
  };

  const BirthFields = ({ v, set, prefix }) => (
    <>
      <div style={{ marginBottom: '16px' }}>
        <label style={S.label}>{prefix}이름{prefix ? ' (선택)' : ''}</label>
        <input type="text" placeholder={prefix ? '상대방 이름' : '홍길동'} value={v.name} onChange={e => set({ ...v, name: e.target.value })} style={S.input} />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={S.label}>{prefix}생년월일</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {['양력', '음력'].map(c => <button key={c} type="button" onClick={() => set({ ...v, calendar: c })} style={S.sel(v.calendar === c)}>{c}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
          {[['year', '1995'], ['month', '07'], ['day', '21']].map(([k, p]) => (
            <input key={k} type="number" placeholder={p} value={v[k]} onChange={e => set({ ...v, [k]: e.target.value })} style={S.input} />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={S.label}>{prefix}태어난 시간</label>
        <select value={v.hour} onChange={e => set({ ...v, hour: e.target.value })} style={S.select}>
          <option value="">시간을 선택하세요</option>
          {HOURS.map(([l, d]) => <option key={l} value={l}>{l} · {d}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={S.label}>{prefix}성별</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['남', '여'].map(g => <button key={g} type="button" onClick={() => set({ ...v, gender: g })} style={S.sel(v.gender === g)}>{g}자</button>)}
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>{P.title} — 천기소녀</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0c0c0f; color: #EDE9F2; font-family: 'Noto Sans KR', sans-serif; word-break: keep-all; } input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; } select option { background: #0c0c0f; }`}</style>
      </Head>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(12,12,15,.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo_symbol.png" alt="천기소녀" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
          <span style={{ fontSize: '17px', color: '#E8C87E', fontWeight: 700, letterSpacing: '1px' }}>천기소녀</span>
        </a>
        <span style={{ fontSize: '12px', color: 'rgba(237,233,242,.6)' }}>{P.title}</span>
      </div>

      <div style={{ minHeight: '100vh', background: '#0c0c0f' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '22px 18px 90px' }}>
          {step === 'input' && (
            <>
              <PageHero img={P.img} alt={P.title} />
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#e0a05a', marginBottom: '6px' }}>{P.cat}</div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-.8px', marginBottom: '6px' }}>{P.title}</h1>
              <p style={{ fontSize: '14px', color: 'rgba(237,233,242,.6)', marginBottom: '6px' }}>{P.sub}</p>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#E8C87E', marginBottom: '22px' }}>₩{P.price.toLocaleString()}</div>

              <div style={{ background: '#141418', border: '1px solid rgba(232,200,126,.25)', borderRadius: '12px', padding: '18px', marginBottom: '26px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#E8C87E', marginBottom: '4px' }}>풀이 구성 {P.sections.length}장</div>
                <div style={{ fontSize: '12px', color: 'rgba(237,233,242,.5)', marginBottom: '12px' }}>앞의 {P.preview}장은 무료로 먼저 보여드려요</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {P.sections.map(([e, t, d], i) => (
                    <div key={t} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#1b1b20', borderRadius: '8px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: i < P.preview ? '#E8C87E' : 'rgba(237,233,242,.4)', minWidth: '34px' }}>{i + 1}장</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{e} {t}{i < P.preview && <span style={{ fontSize: '11px', color: '#E8C87E', marginLeft: '6px' }}>무료</span>}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(237,233,242,.5)', marginTop: '2px' }}>{d.split('.')[0]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {BirthFields({ v: form, set: setForm, prefix: "" })}
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>MBTI (선택 · 사주와 함께 풀이)</label>
                <select value={form.mbti} onChange={e => setForm({ ...form, mbti: e.target.value })} style={S.select}>
                  <option value="">선택 안 함</option>
                  {MBTIS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {P.askWhen && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={S.label}>헤어진 지 얼마나 됐나요? (선택)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {WHEN.map(w => <button key={w} type="button" onClick={() => setForm({ ...form, when: w })} style={S.sel(form.when === w)}>{w}</button>)}
                  </div>
                </div>
              )}
              {P.needPartner && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', marginTop: '22px', paddingTop: '22px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>상대방 정보</div>
                  {BirthFields({ v: partner, set: setPartner, prefix: "상대방 " })}
                </div>
              )}

              {error && <p style={{ color: '#ff8a7a', fontSize: '13px', margin: '6px 0 14px' }}>{error}</p>}
              <button onClick={handleSubmit} style={{ ...S.gold, marginTop: '10px' }}>무료로 {P.preview}장 먼저 보기 →</button>
            </>
          )}

          {step === 'result' && (
            <>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#e0a05a' }}>{P.title}</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{form.name || '의뢰인'}님의 풀이</h2>
                <p style={{ fontSize: '13px', color: 'rgba(237,233,242,.45)' }}>{form.year}년 {form.month}월 {form.day}일생</p>
              </div>

              {(loading || restoring) ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <img src="/hero_girl2.webp" alt="" style={{ width: '160px', borderRadius: '12px', marginBottom: '18px', opacity: .9 }} />
                  <p style={{ fontSize: '15px', color: 'rgba(232,200,126,.8)' }}>{restoring ? '결제를 확인하고 있어요...' : LOADING[msg]}</p>
                </div>
              ) : locked ? (
                <>
                  <div style={S.box}>{preview}</div>
                  <div style={{ display: 'grid', gap: '8px', margin: '14px 0 18px' }}>
                    {lockedTitles.map(([e, t]) => (
                      <div key={t} style={{ position: 'relative', background: '#141418', border: '1px solid rgba(255,255,255,.06)', borderRadius: '10px', padding: '14px 16px', overflow: 'hidden' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{e} {t}</div>
                        <div style={{ filter: 'blur(5px)', fontSize: '13px', color: 'rgba(237,233,242,.6)', marginTop: '6px', userSelect: 'none' }}>하늘의 기운을 읽어보면 이 시기에는 마음이 먼저 움직이고, 작은 계기로 흐름이 바뀌기 쉬워요.</div>
                        <span style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '12px' }}>🔒</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(232,200,126,.06)', border: '1px solid rgba(232,200,126,.35)', borderRadius: '12px', padding: '22px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>나머지 {lockedTitles.length}장 이어서 보기</div>
                    <div style={{ fontSize: '12px', color: 'rgba(237,233,242,.5)', marginBottom: '16px' }}>결제하면 바로 열리고, 보관함에 저장돼요</div>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="결제 알림 받을 휴대폰번호 (숫자만)" style={{ ...S.input, marginBottom: '10px', textAlign: 'center' }} />
                    {payError && <p style={{ color: '#ff8a7a', fontSize: '12px', marginBottom: '10px' }}>{payError}</p>}
                    <button onClick={startPayment} disabled={paying} style={{ ...S.gold, opacity: paying ? .6 : 1 }}>{paying ? '결제창 여는 중...' : `₩${P.price.toLocaleString()} 결제하고 전체 보기`}</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={S.box}>{result}</div>
                  <CrossSell birth={form} exclude={[kind]} items={['vessel', 'love', 'sinnyeon', 'reunion', 'today', 'lucky']} />
                  <a href="/" style={{ display: 'block', textAlign: 'center', color: 'rgba(237,233,242,.45)', padding: '14px', marginTop: '18px', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px', fontSize: '14px', textDecoration: 'none' }}>처음으로</a>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
