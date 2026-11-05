// 일간(태어난 날의 천간) 10가지 = 천기소녀 10가지 타입
// 아이콘은 48x48 기준 선(stroke) 경로라서 SVG와 캔버스(스토리 카드)에서 똑같이 쓸 수 있다.

export const ELEMENT_COLOR = {
  '목': '#6fbf73', '화': '#ef7a4a', '토': '#d9a646', '금': '#c9c9e3', '수': '#5aa0e0',
};

// 나를 생(生)해주는 오행 — 상생: 수→목→화→토→금→수
export const GENERATED_BY = { '목': '수', '화': '목', '토': '화', '금': '토', '수': '금' };

const ICON = {
  tree: 'M24 5 L12 21 H18 L9 32 H21 V43 H27 V32 H39 L30 21 H36 Z',
  flower: 'M24 19a5 5 0 1 0 0.01 0 M24 19 C19 10 29 10 24 19 M29 24 C38 19 38 29 29 24 M19 24 C10 29 10 19 19 24 M24 29 V43 M24 37 C28 33 33 34 33 34',
  sun: 'M24 15a9 9 0 1 0 0.01 0 M24 3 V9 M24 39 V45 M3 24 H9 M39 24 H45 M9 9 L13 13 M35 35 L39 39 M39 9 L35 13 M13 35 L9 39',
  candle: 'M17 24 H31 V43 H17 Z M24 24 V19 M24 19 C19 15 21 8 24 5 C27 8 29 15 24 19 Z',
  mountain: 'M3 41 L18 13 L26 27 L32 19 L45 41 Z M13 22 L18 26 L23 21',
  sprout: 'M6 39 H42 M11 44 H37 M24 39 V22 M24 29 C17 29 13 25 13 18 C20 18 24 22 24 29 M24 24 C31 24 35 20 35 13 C28 13 24 17 24 24',
  sword: 'M24 3 L28 9 V31 H20 V9 Z M13 31 H35 M24 31 V40 M19 44 H29 M24 40 V44',
  gem: 'M14 8 H34 L43 18 L24 42 L5 18 Z M5 18 H43 M19 8 L15 18 L24 42 M29 8 L33 18 L24 42',
  wave: 'M3 19 C9 13 14 13 19 19 S29 25 35 19 S42 13 45 15 M3 29 C9 23 14 23 19 29 S29 35 35 29 S42 23 45 25 M3 39 C9 33 14 33 19 39 S29 45 35 39',
  drop: 'M24 5 C24 5 11 21 11 30 a13 13 0 0 0 26 0 C37 21 24 5 24 5 Z M17 30 a7 7 0 0 0 7 7',
};

export const DAY_TYPES = {
  '갑': { name: '청송형', hanja: '甲', title: '푸른 소나무', el: '목', icon: ICON.tree,
    line: '곧게 자라서 사람들이 자연스럽게 기대는 리더', tags: ['리더십', '우직함', '성장'] },
  '을': { name: '들꽃형', hanja: '乙', title: '바위틈 들꽃', el: '목', icon: ICON.flower,
    line: '여려 보여도 어디서든 꽃을 피우는 생존력', tags: ['유연함', '센스', '끈기'] },
  '병': { name: '태양형', hanja: '丙', title: '한낮의 태양', el: '화', icon: ICON.sun,
    line: '들어서는 순간 분위기를 환하게 바꾸는 사람', tags: ['열정', '솔직함', '존재감'] },
  '정': { name: '등불형', hanja: '丁', title: '밤의 등불', el: '화', icon: ICON.candle,
    line: '조용하지만 모두가 곁으로 모여드는 따뜻함', tags: ['섬세함', '다정함', '집중력'] },
  '무': { name: '태산형', hanja: '戊', title: '큰 산', el: '토', icon: ICON.mountain,
    line: '흔들리지 않아서 모두의 안식처가 되는 사람', tags: ['듬직함', '신뢰', '포용'] },
  '기': { name: '텃밭형', hanja: '己', title: '기름진 텃밭', el: '토', icon: ICON.sprout,
    line: '무엇을 심어도 키워내는 현실 감각과 다정함', tags: ['현실감각', '배려', '살림꾼'] },
  '경': { name: '명검형', hanja: '庚', title: '잘 벼린 칼', el: '금', icon: ICON.sword,
    line: '겉은 날카롭고 내 사람에겐 끝까지 의리 있는', tags: ['결단력', '의리', '직진'] },
  '신': { name: '보석형', hanja: '辛', title: '빛나는 보석', el: '금', icon: ICON.gem,
    line: '다듬을수록 빛나는 세련됨과 완벽주의', tags: ['세련됨', '예리함', '완벽주의'] },
  '임': { name: '바다형', hanja: '壬', title: '넓은 바다', el: '수', icon: ICON.wave,
    line: '생각도 마음도 넓어서 자유를 사랑하는 사람', tags: ['포용력', '자유', '스케일'] },
  '계': { name: '이슬형', hanja: '癸', title: '새벽 이슬', el: '수', icon: ICON.drop,
    line: '조용히 스며들어 결국 모든 걸 바꾸는 지혜', tags: ['직관', '지혜', '감수성'] },
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
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={c} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={t.icon} />
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
  ctx.fillText('천기소녀 · 나의 일간 타입', W / 2, 190);

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
  ctx.translate(W / 2 - 180, 700 - 180);
  ctx.scale(360 / 48, 360 / 48);
  ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = col; ctx.shadowBlur = 6;
  ctx.stroke(new Path2D(t.icon));
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
  ctx.fillText('cheongi-sonyeo.vercel.app 에서 내 타입 보기', W / 2, 1840);

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
