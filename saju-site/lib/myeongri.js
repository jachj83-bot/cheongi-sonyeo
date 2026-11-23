// 결과 화면에 보여주는 명리 계산 (AI 없이 계산만으로 나오는 표)
// 지장간, 12운성, 신살, 합충, 10년 대운, 연도별 월운을 만든다.

export const GAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const JI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const GAN_HANJA = { 갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊', 기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸' };
export const JI_HANJA = { 자: '子', 축: '丑', 인: '寅', 묘: '卯', 진: '辰', 사: '巳', 오: '午', 미: '未', 신: '申', 유: '酉', 술: '戌', 해: '亥' };

const GAN_OH = { 갑: '목', 을: '목', 병: '화', 정: '화', 무: '토', 기: '토', 경: '금', 신: '금', 임: '수', 계: '수' };
const JI_OH = { 자: '수', 축: '토', 인: '목', 묘: '목', 진: '토', 사: '화', 오: '화', 미: '토', 신: '금', 유: '금', 술: '토', 해: '수' };
const GAN_YANG = { 갑: 1, 을: 0, 병: 1, 정: 0, 무: 1, 기: 0, 경: 1, 신: 0, 임: 1, 계: 0 };
// 십성을 볼 때 지지의 음양은 본기(정기) 기준: 사·해는 양, 자·오는 음
const JI_YANG = { 자: 0, 축: 0, 인: 1, 묘: 0, 진: 1, 사: 1, 오: 0, 미: 0, 신: 1, 유: 0, 술: 1, 해: 1 };

export const ganOhaeng = (g) => GAN_OH[g];
export const jiOhaeng = (j) => JI_OH[j];

export const JIJANGGAN = {
  자: ['임', '계'], 축: ['계', '신', '기'], 인: ['무', '병', '갑'], 묘: ['갑', '을'],
  진: ['을', '계', '무'], 사: ['무', '경', '병'], 오: ['병', '기', '정'], 미: ['정', '을', '기'],
  신: ['무', '임', '경'], 유: ['경', '신'], 술: ['신', '정', '무'], 해: ['무', '갑', '임'],
};

const OH_ORDER = ['목', '화', '토', '금', '수'];
// 일간 기준 십성. 대상이 천간이면 천간 음양, 지지면 본기 음양으로 본다.
export function sipsin(ilgan, target, isJi) {
  const a = GAN_OH[ilgan];
  const b = isJi ? JI_OH[target] : GAN_OH[target];
  if (!a || !b) return '';
  const diff = (OH_ORDER.indexOf(b) - OH_ORDER.indexOf(a) + 5) % 5;
  const same = GAN_YANG[ilgan] === (isJi ? JI_YANG[target] : GAN_YANG[target]);
  return [['비견', '겁재'], ['식신', '상관'], ['편재', '정재'], ['편관', '정관'], ['편인', '정인']][diff][same ? 0 : 1];
}

const UNSEONG = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const UNSEONG_START = { 갑: '해', 병: '인', 무: '인', 경: '사', 임: '신', 을: '오', 정: '유', 기: '유', 신: '자', 계: '묘' };
export function unseong(ilgan, ji) {
  const s = JI.indexOf(UNSEONG_START[ilgan]);
  const j = JI.indexOf(ji);
  if (s < 0 || j < 0) return '';
  const k = GAN_YANG[ilgan] ? (j - s + 12) % 12 : (s - j + 12) % 12;
  return UNSEONG[k];
}

// 삼합 그룹 기준 역마·도화·화개
const SAMHAP = { 신: 0, 자: 0, 진: 0, 인: 1, 오: 1, 술: 1, 사: 2, 유: 2, 축: 2, 해: 3, 묘: 3, 미: 3 };
const YEOKMA = ['인', '신', '해', '사'];
const DOHWA = ['유', '묘', '오', '자'];
const HWAGAE = ['진', '술', '축', '미'];
const CHEONEUL = { 갑: ['축', '미'], 무: ['축', '미'], 경: ['축', '미'], 을: ['자', '신'], 기: ['자', '신'], 병: ['해', '유'], 정: ['해', '유'], 임: ['사', '묘'], 계: ['사', '묘'], 신: ['인', '오'] };
const MUNCHANG = { 갑: '사', 을: '오', 병: '신', 정: '유', 무: '신', 기: '유', 경: '해', 신: '자', 임: '인', 계: '묘' };

// pillars: [년, 월, 일, 시] 한글 두 글자
export function sinsal(pillars) {
  const ilgan = pillars[2]?.[0];
  const yearJi = pillars[0]?.[1];
  const dayJi = pillars[2]?.[1];
  return pillars.map((p, idx) => {
    if (!p || p.length < 2) return [];
    const ji = p[1];
    const out = [];
    if (CHEONEUL[ilgan]?.includes(ji)) out.push('천을귀인');
    if (MUNCHANG[ilgan] === ji) out.push('문창귀인');
    const bases = [];
    if (idx !== 0 && yearJi) bases.push(yearJi);
    if (idx !== 2 && dayJi) bases.push(dayJi);
    const has = (tbl) => bases.some((b) => SAMHAP[b] !== undefined && tbl[SAMHAP[b]] === ji);
    if (has(YEOKMA)) out.push('역마살');
    if (has(DOHWA)) out.push('도화살');
    if (has(HWAGAE)) out.push('화개살');
    return out;
  });
}

const CHUNG = [['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해']];
const YUKHAP = [['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미']];
const LABEL = ['년지', '월지', '일지', '시지'];
export function relations(pillars) {
  const out = [];
  for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
    const x = pillars[a]?.[1], y = pillars[b]?.[1];
    if (!x || !y) continue;
    const m = (pairs) => pairs.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
    if (m(CHUNG)) out.push(`${LABEL[a]}(${JI_HANJA[x]})-${LABEL[b]}(${JI_HANJA[y]}) 충`);
    if (m(YUKHAP)) out.push(`${LABEL[a]}(${JI_HANJA[x]})-${LABEL[b]}(${JI_HANJA[y]}) 합`);
  }
  return out;
}

// 60갑자
const idx60 = (p) => {
  const g = GAN.indexOf(p[0]), j = JI.indexOf(p[1]);
  for (let k = 0; k < 60; k++) if (k % 10 === g && k % 12 === j) return k;
  return -1;
};
const pillarAt = (k) => GAN[((k % 60) + 60) % 10] + JI[((k % 60) + 60) % 12];

// 태양 황경(도) — Meeus 근사식. 절기 시각을 몇 분 오차로 구한다.
function sunLon(jd) {
  const T = (jd - 2451545.0) / 36525;
  const r = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * r)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * r) + 0.000289 * Math.sin(3 * M * r);
  const om = 125.04 - 1934.136 * T;
  const lon = L0 + C - 0.00569 - 0.00478 * Math.sin(om * r);
  return ((lon % 360) + 360) % 360;
}
const toJD = (ms) => ms / 86400000 + 2440587.5;
const fromJD = (jd) => (jd - 2440587.5) * 86400000;

// target 황경에 도달하는 시각(ms). guess 근처에서 찾는다.
function timeOfLon(target, guessMs) {
  let jd = toJD(guessMs);
  for (let i = 0; i < 50; i++) {
    let d = target - sunLon(jd);
    d = ((d + 540) % 360) - 180;
    if (Math.abs(d) < 1e-6) break;
    jd += d / 0.9856;
  }
  return fromJD(jd);
}

// 출생 시각 앞뒤의 절(節: 입춘·경칩·청명 … 황경 315+30k) 시각
function nearestJie(birthMs) {
  const lon = sunLon(toJD(birthMs));
  const k = Math.floor(((lon - 315 + 360) % 360) / 30);
  const prevLon = (315 + 30 * k) % 360;
  const nextLon = (prevLon + 30) % 360;
  const back = ((lon - prevLon + 360) % 360) / 0.9856;
  const fwd = ((nextLon - lon + 360) % 360) / 0.9856;
  const prev = timeOfLon(prevLon, birthMs - back * 86400000);
  const next = timeOfLon(nextLon, birthMs + fwd * 86400000);
  return { prev, next };
}

// 10년 대운. 양남음녀는 순행, 음남양녀는 역행.
export function daeun({ year, month, day, hour = 12, minute = 0, gender, pillars, ilgan, nowYear }) {
  const yearGan = pillars[0]?.[0];
  const male = String(gender || '').startsWith('남');
  const forward = (GAN_YANG[yearGan] === 1) === male;
  const birthMs = Date.UTC(year, month - 1, day, hour - 9, minute); // 한국 시간 → UTC
  const { prev, next } = nearestJie(birthMs);
  const days = forward ? (next - birthMs) / 86400000 : (birthMs - prev) / 86400000;
  const su = Math.min(10, Math.max(1, Math.round(days / 3)));
  const base = idx60(pillars[1]);
  const list = [];
  for (let n = 1; n <= 9; n++) {
    const p = pillarAt(base + (forward ? n : -n));
    list.push({
      age: su + (n - 1) * 10,
      pillar: p,
      ganSipsin: sipsin(ilgan, p[0]),
      unseong: unseong(ilgan, p[1]),
    });
  }
  const age = (nowYear || new Date().getFullYear()) - year + 1; // 세는 나이
  let current = -1;
  list.forEach((d, i) => { if (age >= d.age && age < d.age + 10) current = i; });
  return { forward, su, list, current, age };
}

// 연도의 세운과 월운 (절기 기준, 1월은 전해 축월)
export function yearFlow(targetYear, ilgan) {
  const yearPillar = pillarAt(((targetYear - 4) % 60 + 60) % 60);
  const inStem = { 갑: 2, 기: 2, 을: 4, 경: 4, 병: 6, 신: 6, 정: 8, 임: 8, 무: 0, 계: 0 }; // 인월 천간 index
  const monthOf = (y, m) => { // m: 1~12 양력 달, 그 달 5일 무렵부터의 월주
    const yp = pillarAt(((y - 4) % 60 + 60) % 60);
    const sajuIdx = (m + 10) % 12; // 2월=0(인월) … 1월=11(축월)
    const stemYear = m === 1 ? pillarAt(((y - 5) % 60 + 60) % 60) : yp;
    const g = (inStem[stemYear[0]] + sajuIdx) % 10;
    const j = (2 + sajuIdx) % 12;
    return GAN[g] + JI[j];
  };
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const p = monthOf(targetYear, m);
    months.push({ month: m, pillar: p, ganSipsin: sipsin(ilgan, p[0]), unseong: unseong(ilgan, p[1]) });
  }
  return { year: targetYear, pillar: yearPillar, ganSipsin: sipsin(ilgan, yearPillar[0]), months };
}

const HOUR_NUM = { 자시: 0, 축시: 2, 인시: 4, 묘시: 6, 진시: 8, 사시: 10, 오시: 12, 미시: 14, 신시: 16, 유시: 18, 술시: 20, 해시: 22 };
export const hourNumber = (label) => (HOUR_NUM[label] ?? 12);

// 결과 화면용 묶음
export function buildChart({ pillarsObj, birth, nowYear }) {
  const pillars = [pillarsObj.year, pillarsObj.month, pillarsObj.day, pillarsObj.hour];
  const ilgan = pillars[2]?.[0];
  const ss = sinsal(pillars);
  const cols = pillars.map((p, i) => p && p.length >= 2 ? ({
    pillar: p,
    gan: p[0], ji: p[1],
    ganSipsin: i === 2 ? '일간(나)' : sipsin(ilgan, p[0]),
    jiSipsin: sipsin(ilgan, p[1], true),
    jijanggan: JIJANGGAN[p[1]] || [],
    unseong: unseong(ilgan, p[1]),
    sinsal: ss[i],
  }) : null);
  let du = null;
  if (birth && birth.year && birth.month && birth.day) {
    try { du = daeun({ ...birth, pillars, ilgan, nowYear }); } catch { du = null; }
  }
  const kst = new Date(Date.now() + 9 * 3600000);
  const ny = nowYear || kst.getUTCFullYear();
  const target = kst.getUTCMonth() + 1 >= 11 ? ny + 1 : ny; // 11월부터는 내년 흐름을 보여준다
  return { cols, relations: relations(pillars), daeun: du, flow: yearFlow(target, ilgan) };
}
