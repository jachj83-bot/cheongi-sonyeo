// 타로 카드 뒷면 — 화투처럼 보이던 🎴 이모지 대신 쓰는 천기소녀 전용 카드 디자인
// 남색 바탕 + 금색 이중 테두리 + 가운데 달·해·별 문양, 위아래에 天機

const STARS = [[18, 30], [102, 34], [24, 150], [96, 146], [14, 92], [106, 88]];

export function CardBack({ picked = false, idx = 0 }) {
  const gid = `cbg${idx}`;
  return (
    <div className={`cb-wrap${picked ? ' cb-picked' : ''}`} style={{ animationDelay: `${idx * 45}ms` }}>
      <svg viewBox="0 0 120 180" width="100%" style={{ display: 'block' }} aria-hidden="true">
        <defs>
          <linearGradient id={`${gid}a`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2b1652" />
            <stop offset="0.5" stopColor="#1a0d38" />
            <stop offset="1" stopColor="#2e1240" />
          </linearGradient>
          <radialGradient id={`${gid}b`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#e8c87e" stopOpacity="0.35" />
            <stop offset="1" stopColor="#e8c87e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="1" y="1" width="118" height="178" rx="10" fill={`url(#${gid}a)`} stroke="#e8c87e" strokeOpacity="0.9" strokeWidth="1.5" />
        <rect x="7" y="7" width="106" height="166" rx="7" fill="none" stroke="#e8c87e" strokeOpacity="0.45" strokeWidth="0.8" />
        <rect x="10" y="10" width="100" height="160" rx="5" fill="none" stroke="#e8c87e" strokeOpacity="0.2" strokeWidth="0.6" strokeDasharray="2 3" />
        {/* 모서리 장식 */}
        {[[10, 10, 1, 1], [110, 10, -1, 1], [10, 170, 1, -1], [110, 170, -1, -1]].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x} ${y + 12 * sy} Q${x} ${y} ${x + 12 * sx} ${y}`} fill="none" stroke="#e8c87e" strokeOpacity="0.7" strokeWidth="1" />
        ))}
        {STARS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 0.9 : 1.3} fill="#fff3d0" opacity={0.5 + (i % 3) * 0.2} />
        ))}
        <text x="60" y="28" textAnchor="middle" fontSize="9" fill="#e8c87e" fillOpacity="0.75" fontFamily="'Noto Serif KR', serif" letterSpacing="3">天 機</text>
        <text x="60" y="160" textAnchor="middle" fontSize="9" fill="#e8c87e" fillOpacity="0.75" fontFamily="'Noto Serif KR', serif" letterSpacing="3" transform="rotate(180 60 157)">天 機</text>
        {/* 가운데 문양 */}
        <circle cx="60" cy="90" r="34" fill={`url(#${gid}b)`} />
        <g className="cb-ring" style={{ transformOrigin: '60px 90px' }}>
          <circle cx="60" cy="90" r="30" fill="none" stroke="#e8c87e" strokeOpacity="0.55" strokeWidth="0.8" strokeDasharray="1.5 3" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return <line key={i} x1={60 + 26 * Math.sin(a)} y1={90 - 26 * Math.cos(a)} x2={60 + 30 * Math.sin(a)} y2={90 - 30 * Math.cos(a)} stroke="#e8c87e" strokeOpacity="0.6" strokeWidth="0.8" />;
          })}
        </g>
        <circle cx="60" cy="90" r="21" fill="none" stroke="#e8c87e" strokeWidth="1" />
        <path d="M60 72 L63.2 86.8 L78 90 L63.2 93.2 L60 108 L56.8 93.2 L42 90 L56.8 86.8 Z" fill="#e8c87e" fillOpacity="0.9" />
        <path d="M67 80 a11 11 0 1 0 0 20 a8.5 8.5 0 1 1 0 -20 Z" fill="#1a0d38" stroke="#e8c87e" strokeWidth="0.8" />
        <circle cx="60" cy="90" r="2.2" fill="#fff3d0" />
      </svg>
      {picked && <span className="cb-check">✓</span>}
    </div>
  );
}

export const CARD_BACK_CSS = `
.cb-wrap { position:relative; border-radius:9px; opacity:0; animation: cbDeal .5s cubic-bezier(.2,.9,.3,1.2) forwards; box-shadow: 0 6px 16px rgba(0,0,0,.45); }
.cb-wrap::after { content:''; position:absolute; inset:0; border-radius:9px; background:linear-gradient(115deg, transparent 35%, rgba(255,240,200,.28) 50%, transparent 65%); background-size:250% 100%; background-position:120% 0; transition: background-position .6s ease; pointer-events:none; }
.cb-pick:hover .cb-wrap::after, .cb-pick:active .cb-wrap::after { background-position:-20% 0; }
.cb-pick { cursor:pointer; transition: transform .25s ease; }
.cb-pick:hover { transform: translateY(-8px) rotate(-1.5deg); }
.cb-pick:hover .cb-wrap { box-shadow: 0 12px 26px rgba(0,0,0,.5), 0 0 18px rgba(232,200,126,.35); }
.cb-ring { animation: cbSpin 24s linear infinite; }
.cb-picked svg { filter: grayscale(.6) brightness(.5); }
.cb-check { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:30px; height:30px; border-radius:50%; background:#e8c87e; color:#1a0d38; font-weight:900; font-size:16px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(232,200,126,.7); }
@keyframes cbDeal { from{opacity:0; transform:translateY(24px) rotate(-6deg) scale(.9)} to{opacity:1; transform:none} }
@keyframes cbSpin { to{transform:rotate(360deg)} }
@media (prefers-reduced-motion: reduce) { .cb-wrap, .cb-ring { animation:none !important; opacity:1 !important; } }
`;
