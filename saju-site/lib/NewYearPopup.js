import { useEffect, useState } from 'react';

// 2027 정미년 신년운세 유도 팝업 + 닫은 뒤 떠 있는 작은 배지
// - 첫 방문 몇 초 뒤 팝업, "오늘 하루 보지 않기"를 누르면 그날은 배지만 보여줌
// - 새해(1/1)까지는 새해 D-day, 그 뒤 입춘(2/4)까지는 입춘 D-day, 3월부터는 꺼짐

const NEW_YEAR = new Date('2027-01-01T00:00:00+09:00').getTime();
const IPCHUN = new Date('2027-02-04T00:00:00+09:00').getTime();
const END = new Date('2027-03-01T00:00:00+09:00').getTime();
const HIDE_KEY = 'cheongi_ny2027_hide';
const LINK = '/sinnyeon?year=2027';

const ZODIAC = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZODIAC_KO = ['쥐','소','범','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];

const ITEMS = [
  { k: '총운', d: 'M24 4 L28 20 L44 24 L28 28 L24 44 L20 28 L4 24 L20 20 Z' },
  { k: '상반기', d: 'M6 34 H42 M12 34 a12 12 0 0 1 24 0 M24 8 V15 M9 17 L14 21 M39 17 L34 21' },
  { k: '하반기', d: 'M30 7 a17 17 0 1 0 11 27 a13 13 0 0 1 -11 -27 Z' },
  { k: '재물운', d: 'M24 8a16 16 0 1 0 0.01 0 M24 14 V34 M30 18 C30 15 18 15 18 20 C18 25 30 23 30 28 C30 33 18 33 18 30' },
  { k: '애정운', d: 'M24 40 C10 30 6 22 10 15 C14 9 21 10 24 16 C27 10 34 9 38 15 C42 22 38 30 24 40 Z' },
  { k: '건강운', d: 'M4 26 H14 L18 16 L24 36 L30 20 L34 26 H44' },
  { k: '행운 포인트', d: 'M24 11a6 6 0 1 0 0.01 0 M31 18a6 6 0 1 0 0.01 0 M24 25a6 6 0 1 0 0.01 0 M17 18a6 6 0 1 0 0.01 0 M25 30 C27 37 30 41 34 44' },
  { k: '조심할 때', d: 'M24 6 L44 40 H4 Z M24 18 V28 M24 33 V34' },
];

const BURSTS = [
  { x: 18, y: 28, c: '#ffcf6b', d: 0 }, { x: 80, y: 20, c: '#ff7a59', d: 0.9 },
  { x: 62, y: 46, c: '#f6a6ff', d: 1.7 }, { x: 30, y: 52, c: '#8fd3ff', d: 2.4 },
];

function today() {
  try { return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); } catch { return ''; }
}

function useNow(active) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

function target(now) {
  if (now < NEW_YEAR) return { at: NEW_YEAR, label: '2027년 새해까지' };
  if (now < IPCHUN) return { at: IPCHUN, label: '사주 속 새해, 입춘까지' };
  return { at: null, label: '정미년이 시작됐어요' };
}

function split(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
}

export default function NewYearPopup({ delay = 3500, enabled = true, popup = true }) {
  const [open, setOpen] = useState(false);
  const [chip, setChip] = useState(false);
  const now = useNow(open || chip);

  useEffect(() => {
    if (!enabled || Date.now() >= END) return;
    let hidden = false;
    try { hidden = localStorage.getItem(HIDE_KEY) === today(); } catch {}
    if (hidden || !popup) { setChip(true); return; }
    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [enabled, delay, popup]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => { setOpen(false); setChip(true); };
  const hideToday = () => { try { localStorage.setItem(HIDE_KEY, today()); } catch {} close(); };

  if (!enabled || now === null || now >= END) return null;
  const tg = target(now);
  const left = tg.at ? split(tg.at - now) : null;

  return (
    <>
      <style>{CSS}</style>

      {open && (
        <div className="ny-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="2027 신년운세 안내">
          <div className="ny-card" onClick={e => e.stopPropagation()}>
            <button className="ny-x" onClick={close} aria-label="닫기">×</button>

            <div className="ny-sky">
              {BURSTS.map((b, i) => (
                <span key={i} className="ny-burst" style={{ left: `${b.x}%`, top: `${b.y}%`, '--c': b.c, animationDelay: `${b.d}s` }}>
                  {Array.from({ length: 12 }).map((_, j) => <i key={j} style={{ '--r': `${j * 30}deg` }} />)}
                </span>
              ))}
              {[12, 34, 70, 88].map((x, i) => (
                <span key={i} className="ny-lantern" style={{ left: `${x}%`, animationDelay: `${i * 1.3}s`, animationDuration: `${7 + i}s` }} />
              ))}
              <div className="ny-wheel" aria-hidden="true">
                {ZODIAC.map((z, i) => {
                  const a = i * 2 * Math.PI / 12;
                  return (
                    <span key={z} className={z === '未' ? 'on' : ''} style={{ left: `${50 + 46 * Math.sin(a)}%`, top: `${50 - 46 * Math.cos(a)}%` }}>{z}</span>
                  );
                })}
              </div>
              <div className="ny-seal">
                <div className="ny-seal-inner">
                  <b>丁未</b>
                  <small>붉은 양의 해</small>
                </div>
              </div>
            </div>

            <div className="ny-body">
              <div className="ny-eyebrow">2027 정미년 신년운세</div>
              <h3 className="ny-title">내년 내 운,<br /><span>미리 궁금하지 않아요?</span></h3>
              <p className="ny-desc">불의 기운(丁)과 흙의 기운(未)이 만나는 해예요.<br />내 사주와 어떻게 부딪히고 어울리는지 짚어드려요.</p>

              {left ? (
                <div className="ny-count">
                  <div className="ny-count-label">{tg.label}</div>
                  <div className="ny-count-row">
                    {[['일', left.d], ['시간', left.h], ['분', left.m], ['초', left.s]].map(([u, v]) => (
                      <div key={u} className="ny-cell"><b key={v}>{String(v).padStart(2, '0')}</b><span>{u}</span></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ny-count"><div className="ny-count-label">{tg.label}</div></div>
              )}

              <div className="ny-grid">
                {ITEMS.map((it, i) => (
                  <div key={it.k} className="ny-item" style={{ animationDelay: `${0.25 + i * 0.07}s` }}>
                    <svg width="22" height="22" viewBox="0 0 48 48" fill="none" stroke="#E8C87E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={it.d} /></svg>
                    <span>{it.k}</span>
                  </div>
                ))}
              </div>

              <div className="ny-actions">
                <a href={LINK} className="ny-cta">2027 신년운세 미리 보기 · ₩9,900</a>
                <div className="ny-foot">
                  <button onClick={hideToday}>오늘 하루 보지 않기</button>
                  <button onClick={close}>닫기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!open && chip && (
        <a href={LINK} className="ny-chip" aria-label="2027 신년운세 보러 가기">
          <span className="ny-chip-seal">未</span>
          <span className="ny-chip-text">
            <b>2027 신년운세</b>
            <small>{left ? `${tg.label.includes('입춘') ? '입춘' : '새해'}까지 D-${left.d}` : '지금 보기'}</small>
          </span>
        </a>
      )}
    </>
  );
}

const CSS = `
.ny-overlay { position:fixed; inset:0; z-index:1000; background:rgba(5,4,16,.72); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:16px; animation: nyFade .35s ease; }
.ny-card { position:relative; width:100%; max-width:380px; max-height:calc(100vh - 32px); overflow:auto; background:linear-gradient(180deg,#1b1238 0%,#120c26 55%,#0d0a1f 100%); border:1px solid rgba(232,200,126,.35); border-radius:20px; box-shadow:0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(239,90,60,.18); animation: nyPop .55s cubic-bezier(.2,1.3,.4,1); font-family:'Noto Sans KR',sans-serif; color:#EDE9F2; word-break:keep-all; }
.ny-x { position:absolute; top:10px; right:12px; z-index:5; width:32px; height:32px; border-radius:50%; border:1px solid rgba(255,255,255,.15); background:rgba(0,0,0,.35); color:#EDE9F2; font-size:20px; line-height:1; cursor:pointer; }
.ny-sky { position:relative; height:210px; overflow:hidden; border-radius:20px 20px 0 0; background:radial-gradient(circle at 50% 70%, rgba(239,90,60,.35), transparent 60%), radial-gradient(circle at 20% 20%, rgba(155,109,214,.25), transparent 50%), #140d2c; }
.ny-burst { position:absolute; width:0; height:0; }
.ny-burst i { position:absolute; left:0; top:0; width:3px; height:3px; border-radius:50%; background:var(--c); box-shadow:0 0 6px var(--c); opacity:0; transform:rotate(var(--r)) translateY(0); animation: nyBurst 3.2s ease-out infinite; animation-delay: inherit; }
.ny-lantern { position:absolute; bottom:-30px; width:12px; height:16px; border-radius:5px 5px 7px 7px; background:linear-gradient(180deg,#ffd27a,#ff7a3d); box-shadow:0 0 14px rgba(255,160,70,.8); animation: nyRise linear infinite; opacity:.85; }
.ny-wheel { position:absolute; left:50%; top:55%; width:190px; height:190px; margin:-95px 0 0 -95px; border-radius:50%; border:1px dashed rgba(232,200,126,.25); animation: nySpin 40s linear infinite; }
.ny-wheel span { position:absolute; transform:translate(-50%,-50%); font-family:'Noto Serif KR',serif; font-size:13px; color:rgba(232,200,126,.45); }
.ny-wheel span.on { color:#ff8a5c; font-size:17px; font-weight:700; text-shadow:0 0 10px #ff6a3d; }
.ny-seal { position:absolute; left:50%; top:55%; width:112px; height:112px; margin:-56px 0 0 -56px; border-radius:50%; background:conic-gradient(from 0deg,#ff6a3d,#ffcf6b,#ff6a3d,#c2392b,#ff6a3d); padding:3px; animation: nyGlow 2.6s ease-in-out infinite; }
.ny-seal-inner { width:100%; height:100%; border-radius:50%; background:radial-gradient(circle,#3a1410,#1a0a12); display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ny-seal-inner b { font-family:'Noto Serif KR',serif; font-size:34px; color:#ffd9a0; letter-spacing:2px; text-shadow:0 0 12px rgba(255,140,80,.7); line-height:1.1; }
.ny-seal-inner small { font-size:10px; color:#ffb48a; letter-spacing:1px; margin-top:2px; }
.ny-body { padding:18px 20px 16px; text-align:center; }
.ny-eyebrow { display:inline-block; font-size:11px; letter-spacing:2px; color:#1a0a12; background:linear-gradient(90deg,#ffcf6b,#ff8a5c); border-radius:10px; padding:3px 10px; font-weight:700; margin-bottom:10px; }
.ny-title { font-family:'Noto Serif KR',serif; font-size:24px; line-height:1.35; font-weight:700; margin-bottom:8px; }
.ny-title span { background:linear-gradient(90deg,#ffcf6b,#ff8a5c,#ffcf6b); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation: nyShine 3s linear infinite; }
.ny-desc { font-size:12.5px; color:rgba(237,233,242,.6); line-height:1.7; margin-bottom:14px; }
.ny-count { background:rgba(255,255,255,.04); border:1px solid rgba(232,200,126,.15); border-radius:12px; padding:10px; margin-bottom:14px; }
.ny-count-label { font-size:11px; color:#c4956a; margin-bottom:6px; }
.ny-count-row { display:flex; gap:6px; justify-content:center; }
.ny-cell { min-width:54px; background:#0b0820; border:1px solid rgba(232,200,126,.2); border-radius:8px; padding:6px 0 4px; }
.ny-cell b { display:block; font-family:'Cormorant Garamond',serif; font-size:22px; color:#ffd9a0; animation: nyTick .4s ease; }
.ny-cell span { font-size:10px; color:rgba(237,233,242,.45); }
.ny-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:16px; }
.ny-item { display:flex; flex-direction:column; align-items:center; gap:4px; padding:9px 2px; border-radius:10px; background:rgba(232,200,126,.05); border:1px solid rgba(232,200,126,.12); font-size:11px; color:rgba(237,233,242,.8); opacity:0; animation: nyUp .5s ease forwards; }
.ny-cta { position:relative; overflow:hidden; display:block; text-decoration:none; background:linear-gradient(90deg,#ff6a3d,#ff9a5c); color:#1a0a12; font-weight:800; font-size:15px; padding:14px; border-radius:12px; box-shadow:0 8px 24px rgba(255,106,61,.35); animation: nyPulse 2.2s ease-in-out infinite; }
.ny-cta::after { content:''; position:absolute; top:0; left:-40%; width:40%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent); transform:skewX(-20deg); animation: nySweep 2.8s ease-in-out infinite; }
.ny-actions { position:sticky; bottom:0; margin:0 -20px -16px; padding:12px 20px 14px; background:linear-gradient(180deg,rgba(13,10,31,0),#0d0a1f 28%); }
.ny-foot { display:flex; justify-content:space-between; margin-top:10px; }
.ny-foot button { background:none; border:none; color:rgba(237,233,242,.45); font-size:12px; cursor:pointer; font-family:inherit; padding:6px 2px; }
.ny-chip { position:fixed; right:14px; bottom:16px; z-index:900; display:flex; align-items:center; gap:8px; padding:8px 14px 8px 8px; border-radius:30px; text-decoration:none; background:linear-gradient(90deg,#2a1230,#1b1238); border:1px solid rgba(255,138,92,.6); box-shadow:0 8px 24px rgba(0,0,0,.45), 0 0 18px rgba(255,106,61,.25); animation: nyBob 3s ease-in-out infinite, nyFade .4s ease; font-family:'Noto Sans KR',sans-serif; }
.ny-chip-seal { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:conic-gradient(#ff6a3d,#ffcf6b,#ff6a3d); color:#2a0e0e; font-family:'Noto Serif KR',serif; font-weight:700; font-size:15px; }
.ny-chip-text { display:flex; flex-direction:column; line-height:1.2; }
.ny-chip-text b { font-size:12px; color:#ffd9a0; }
.ny-chip-text small { font-size:10px; color:#ffb48a; }
@keyframes nyFade { from{opacity:0} to{opacity:1} }
@keyframes nyPop { from{opacity:0; transform:translateY(40px) scale(.92)} to{opacity:1; transform:none} }
@keyframes nyBurst { 0%{opacity:0; transform:rotate(var(--r)) translateY(0)} 8%{opacity:1} 45%{opacity:1} 70%,100%{opacity:0; transform:rotate(var(--r)) translateY(-34px)} }
@keyframes nyRise { from{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-130px) rotate(4deg)} to{transform:translateY(-260px) rotate(-4deg); opacity:0} }
@keyframes nySpin { to{transform:rotate(360deg)} }
@keyframes nyGlow { 0%,100%{box-shadow:0 0 22px rgba(255,106,61,.45)} 50%{box-shadow:0 0 44px rgba(255,170,90,.8)} }
@keyframes nyShine { to{background-position:-200% 0} }
@keyframes nyTick { from{transform:translateY(-4px); opacity:.4} to{transform:none; opacity:1} }
@keyframes nyUp { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none} }
@keyframes nyPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.025)} }
@keyframes nySweep { 0%{left:-40%} 60%,100%{left:130%} }
@keyframes nyBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
@media (max-width: 480px) {
  .ny-overlay { align-items:flex-end; padding:0; }
  .ny-card { max-width:none; border-radius:20px 20px 0 0; max-height:92vh; animation: nySheet .5s cubic-bezier(.2,1,.3,1); }
  .ny-sky { height:150px; }
  .ny-wheel { width:150px; height:150px; margin:-75px 0 0 -75px; }
  .ny-seal { width:92px; height:92px; margin:-46px 0 0 -46px; }
  .ny-seal-inner b { font-size:28px; }
  .ny-body { padding:14px 16px 12px; }
  .ny-actions { margin:0 -16px -12px; padding:10px 16px 14px; }
  .ny-title { font-size:21px; }
  .ny-desc { font-size:12px; margin-bottom:10px; }
  .ny-count { padding:8px; margin-bottom:10px; }
  .ny-cell { min-width:48px; padding:4px 0 2px; }
  .ny-cell b { font-size:19px; }
  .ny-grid { margin-bottom:4px; }
  .ny-item { padding:7px 2px; font-size:10.5px; }
}
@keyframes nySheet { from{transform:translateY(100%)} to{transform:none} }
@media (prefers-reduced-motion: reduce) {
  .ny-overlay *, .ny-chip { animation:none !important; }
  .ny-item { opacity:1 !important; }
}
`;
