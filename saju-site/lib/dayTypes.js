// 일간(태어난 날의 천간) 10가지 = 천기소녀 10가지 타입
// 타입마다 궁중 인물의 역할 한자(將·策·王…)를 도장처럼 찍어 아이콘으로 쓴다.

export const ELEMENT_COLOR = {
  '목': '#6fbf73', '화': '#ef7a4a', '토': '#d9a646', '금': '#c9c9e3', '수': '#5aa0e0',
};

// 나를 생(生)해주는 오행 — 상생: 수→목→화→토→금→수
export const GENERATED_BY = { '목': '수', '화': '목', '토': '화', '금': '토', '수': '금' };


export const DAY_TYPES = {
  '갑': { name: '장군형', hanja: '甲', role: '將', title: '선봉에 선 장군', el: '목',
    line: '맨 앞에서 깃발을 들고 길을 여는 리더', tags: ['리더십', '추진력', '책임감'] },
  '을': { name: '책사형', hanja: '乙', role: '策', title: '판을 읽는 책사', el: '목',
    line: '부드럽게 판을 읽고 끝내 원하는 걸 이뤄내는 전략가', tags: ['전략', '유연함', '끈기'] },
  '병': { name: '임금형', hanja: '丙', role: '王', title: '빛나는 임금', el: '화',
    line: '어디에 있든 자연스럽게 중심이 되는 존재감', tags: ['존재감', '열정', '솔직함'] },
  '정': { name: '의원형', hanja: '丁', role: '醫', title: '마음을 살피는 의원', el: '화',
    line: '조용히 사람을 살피고 챙기는 따뜻한 손길', tags: ['섬세함', '다정함', '집중력'] },
  '무': { name: '재상형', hanja: '戊', role: '相', title: '나라를 받치는 재상', el: '토',
    line: '모두가 믿고 기대는 흔들림 없는 버팀목', tags: ['듬직함', '신뢰', '포용'] },
  '기': { name: '상궁형', hanja: '己', role: '宮', title: '궁을 꾸리는 상궁', el: '토',
    line: '살림도 사람도 빈틈없이 챙기는 현실 감각', tags: ['현실감각', '배려', '살림꾼'] },
  '경': { name: '무사형', hanja: '庚', role: '武', title: '칼을 든 무사', el: '금',
    line: '결단은 빠르게, 내 사람에 대한 의리는 끝까지', tags: ['결단력', '의리', '직진'] },
  '신': { name: '화원형', hanja: '辛', role: '畵', title: '궁중 화원', el: '금',
    line: '남다른 감각으로 디테일까지 완성하는 장인', tags: ['세련됨', '감각', '완벽주의'] },
  '임': { name: '상단주형', hanja: '壬', role: '商', title: '바다를 건너는 상단주', el: '수',
    line: '판을 크게 보고 자유롭게 움직이는 승부사', tags: ['스케일', '자유', '포용력'] },
  '계': { name: '도사형', hanja: '癸', role: '道', title: '산속의 도사', el: '수',
    line: '말수는 적어도 핵심을 꿰뚫어 보는 직관', tags: ['직관', '지혜', '감수성'] },
};

export const TYPE_ORDER = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 나를 살려주는 오행에 속한 타입 이름들
export function helperTypes(gan) {
  const t = DAY_TYPES[gan];
  if (!t) return [];
  const el = GENERATED_BY[t.el];
  return TYPE_ORDER.filter(k => DAY_TYPES[k].el === el).map(k => DAY_TYPES[k].name);
}

export function TypeIcon({ gan, size = 48, color, strokeWidth = 2, style }) {
  const t = DAY_TYPES[gan];
  if (!t) return null;
  const c = color || ELEMENT_COLOR[t.el];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style} aria-hidden="true">
      <circle cx="24" cy="24" r="21.5" stroke={c} strokeWidth={strokeWidth} />
      <circle cx="24" cy="24" r="17.5" stroke={c} strokeWidth={strokeWidth * 0.5} strokeDasharray="2 2.5" opacity="0.8" />
      <text x="24" y="31.5" textAnchor="middle" fontSize="21" fontWeight="700" fill={c}
        fontFamily="'Noto Serif KR', 'Nanum Myeongjo', serif">{t.role}</text>
    </svg>
  );
}

// ─── 인스타 스토리 카드 (1080x1920) ───
export async function drawStoryCard({ gan, name, pillars, strength }) {
  const t = DAY_TYPES[gan];
  const W = 1080, H = 1920;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const col = ELEMENT_COLOR[t.el];
  try { await document.fonts.ready; } catch {}
  const serif = "'Noto Serif KR', serif";
  const sans = "'Noto Sans KR', sans-serif";

  // 배경
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0B0A1F'); bg.addColorStop(0.55, '#1a1238'); bg.addColorStop(1, '#0B0A1F');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 700, 40, W / 2, 700, 620);
  glow.addColorStop(0, col + '55'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // 별
  let s = gan.charCodeAt(0);
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 140; i++) {
    ctx.globalAlpha = 0.25 + rnd() * 0.75;
    ctx.fillStyle = '#fff6dc';
    ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, 0.8 + rnd() * 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(232,200,126,0.75)';
  ctx.font = `500 34px ${sans}`;
  ctx.fillText('천기소녀 · 궁중에 태어났다면 나는', W / 2, 190);

  // 원형 링 + 아이콘
  ctx.strokeStyle = 'rgba(232,200,126,0.35)'; ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath(); ctx.arc(W / 2, 700, 330, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = col + '88';
  ctx.beginPath(); ctx.arc(W / 2, 700, 250, 0, Math.PI * 2); ctx.stroke();
  const ring = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  ctx.font = `400 38px ${serif}`;
  ring.forEach((ch, i) => {
    const a = i * Math.PI * 2 / ring.length - Math.PI / 2;
    ctx.fillStyle = ch === t.hanja ? col : 'rgba(232,200,126,0.4)';
    ctx.fillText(ch, W / 2 + Math.cos(a) * 330, 700 + Math.sin(a) * 330 + 13);
  });
  ctx.save();
  ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.strokeStyle = col; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(W / 2, 700, 170, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.setLineDash([10, 12]);
  ctx.beginPath(); ctx.arc(W / 2, 700, 140, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = col;
  ctx.font = `700 170px ${serif}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(t.role, W / 2, 712);
  ctx.textBaseline = 'alphabetic';
  ctx.restore();

  // 이름
  ctx.fillStyle = '#EDE9F2';
  ctx.font = `700 54px ${serif}`;
  ctx.fillText(`${name || '나'}님은`, W / 2, 1150);
  ctx.fillStyle = col;
  ctx.font = `900 132px ${serif}`;
  ctx.fillText(t.name, W / 2, 1300);
  ctx.fillStyle = 'rgba(237,233,242,0.75)';
  ctx.font = `400 40px ${serif}`;
  ctx.fillText(`${t.hanja} · ${t.title}`, W / 2, 1370);

  // 한 줄 설명 (두 줄로 나눔)
  ctx.fillStyle = '#EDE9F2';
  ctx.font = `400 44px ${sans}`;
  const words = t.line.split(' ');
  let l1 = '', l2 = '';
  words.forEach(w => { if ((l1 + ' ' + w).trim().length <= 14 && !l2) l1 = (l1 + ' ' + w).trim(); else l2 = (l2 + ' ' + w).trim(); });
  ctx.fillText(l1, W / 2, 1480);
  if (l2) ctx.fillText(l2, W / 2, 1545);

  // 태그
  ctx.font = `500 38px ${sans}`;
  const tags = t.tags.map(x => '#' + x);
  const tw = tags.map(x => ctx.measureText(x).width + 56);
  let x = W / 2 - (tw.reduce((a, b) => a + b, 0) + 20 * (tags.length - 1)) / 2;
  tags.forEach((tg, i) => {
    ctx.strokeStyle = col + 'aa'; ctx.lineWidth = 2;
    roundRect(ctx, x, 1610, tw[i], 70, 35); ctx.stroke();
    ctx.fillStyle = col; ctx.fillText(tg, x + tw[i] / 2, 1658);
    x += tw[i] + 20;
  });

  // 일주 + 사이트
  if (pillars && pillars.day) {
    ctx.fillStyle = 'rgba(232,200,126,0.6)';
    ctx.font = `400 32px ${sans}`;
    ctx.fillText(`일주 ${pillars.day} · 년 ${pillars.year || ''} · 월 ${pillars.month || ''}`, W / 2, 1760);
  }
  ctx.fillStyle = 'rgba(237,233,242,0.55)';
  ctx.font = `500 34px ${sans}`;
  ctx.fillText('cheongisonyeo.com 에서 내 타입 보기', W / 2, 1840);

  return new Promise(resolve => cv.toBlob(b => resolve(b), 'image/png'));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
