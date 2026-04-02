// 사주팔자 계산 라이브러리

const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const CHEONGAN_EN = ['갑(甲)', '을(乙)', '병(丙)', '정(丁)', '무(戊)', '기(己)', '경(庚)', '신(辛)', '임(壬)', '계(癸)'];
const JIJI_EN = ['자(子)', '축(丑)', '인(寅)', '묘(卯)', '진(辰)', '사(巳)', '오(午)', '미(未)', '신(申)', '유(酉)', '술(戌)', '해(亥)'];

const ILJUS = CHEONGAN.flatMap((c, ci) =>
  JIJI.map((j, ji) => {
    const idx = (ci * 12 + ji) % 60;
    if ((ci % 2) !== (ji % 2)) return null;
    return { name: c + j, cheongan: c, jiji: j, idx };
  }).filter(Boolean)
);

// 60갑자 목록 (순서대로)
const GAPJA_60 = [];
for (let i = 0; i < 60; i++) {
  GAPJA_60.push(CHEONGAN[i % 10] + JIJI[i % 12]);
}

// 오행
const OHAENG = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
  자: '수', 축: '토', 인: '목', 묘: '목', 진: '토',
  사: '화', 오: '화', 미: '토', 신: '금', 유: '금',
  술: '토', 해: '수'
};

// 음양
const EUMYANG = {
  갑: '양', 병: '양', 무: '양', 경: '양', 임: '양',
  을: '음', 정: '음', 기: '음', 신: '음', 계: '음',
  자: '양', 인: '양', 진: '양', 오: '양', 신: '양', 술: '양',
  축: '음', 묘: '음', 사: '음', 미: '음', 유: '음', 해: '음'
};

// 연주 계산
function getYeonju(year) {
  const idx = (year - 4) % 60;
  return GAPJA_60[(idx + 60) % 60];
}

// 월주 계산 (절기 기준 간소화 버전)
const WOLJU_JIJI = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
function getWolju(year, month) {
  const yeonCheonganIdx = (year - 4) % 10;
  // 월간 시작 인덱스: 갑기년=병인, 을경년=무인, 병신년=경인, 정임년=임인, 무계년=갑인
  const wolCheonganStarts = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 병, 무, 경, 임, 갑 반복
  const startIdx = wolCheonganStarts[yeonCheonganIdx];
  const monthIdx = month - 1; // 1월=인월(0)
  const cheonganIdx = (startIdx + monthIdx) % 10;
  const jijiIdx = monthIdx % 12;
  return CHEONGAN[cheonganIdx] + WOLJU_JIJI[jijiIdx];
}

// 일주 계산 (율리우스 적일 기반)
function getIlju(year, month, day) {
  // 율리우스 적일 계산
  let y = year, m = month, d = day;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524;
  // 갑자일 기준: JD 2405750 = 갑자(0)
  const idx = ((jd - 2405750) % 60 + 60) % 60;
  return GAPJA_60[idx];
}

// 시주 계산
function getSiju(ilCheongan, hour) {
  // 시지 (자시=0, 축시=1, ...)
  // 23-1: 자시, 1-3: 축시, 3-5: 인시, ...
  const sijiIdx = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  // 일간에 따른 시간 시작
  const siCheonganStarts = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const ilCheonganIdx = CHEONGAN.indexOf(ilCheongan);
  const startIdx = siCheonganStarts[ilCheonganIdx];
  const cheonganIdx = (startIdx + sijiIdx) % 10;
  return CHEONGAN[cheonganIdx] + JIJI[sijiIdx];
}

// 오행 분석
function analyzeOhaeng(pillars) {
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  pillars.forEach(p => {
    if (p && p.length >= 2) {
      const cg = OHAENG[p[0]];
      const jj = OHAENG[p[1]];
      if (cg) counts[cg]++;
      if (jj) counts[jj]++;
    }
  });
  return counts;
}

// 일주 성격 특성
const ILJU_TRAITS = {
  갑자: { title: '갑자일주', keyword: '선구자형 리더', traits: ['독립적', '창의적', '강한 의지'], strength: '새로운 것을 시작하는 추진력', weakness: '고집이 세고 타협이 어려움' },
  을축: { title: '을축일주', keyword: '성실한 현실주의자', traits: ['꼼꼼함', '인내심', '현실적'], strength: '끈기 있게 목표를 달성', weakness: '변화에 적응이 느림' },
  병인: { title: '병인일주', keyword: '열정적 행동가', traits: ['열정적', '사교적', '행동력'], strength: '사람을 끌어모으는 카리스마', weakness: '충동적이고 일관성 부족' },
  정묘: { title: '정묘일주', keyword: '감성적 예술가', traits: ['섬세함', '직관력', '예술성'], strength: '뛰어난 감수성과 창의력', weakness: '예민하고 감정 기복이 큼' },
  무진: { title: '무진일주', keyword: '든든한 버팀목', traits: ['안정적', '책임감', '현실감'], strength: '주변을 안정시키는 중심역할', weakness: '변화를 두려워하고 보수적' },
  기사: { title: '기사일주', keyword: '섬세한 전략가', traits: ['분석적', '완벽주의', '신중함'], strength: '세밀한 계획과 실행력', weakness: '과도한 완벽주의로 스트레스' },
  경오: { title: '경오일주', keyword: '자유로운 행동가', traits: ['활동적', '자유분방', '직설적'], strength: '어떤 상황에서도 적응하는 유연성', weakness: '규칙과 제약을 싫어함' },
  신미: { title: '신미일주', keyword: '우아한 완성자', traits: ['미적 감각', '세련됨', '부드러움'], strength: '아름다움을 추구하는 심미안', weakness: '결단력이 부족하고 우유부단' },
  임신: { title: '임신일주', keyword: '지식탐구자', traits: ['지적 호기심', '분석력', '독창성'], strength: '깊은 사고력과 문제해결 능력', weakness: '현실감각이 부족하고 이상주의적' },
  계유: { title: '계유일주', keyword: '예리한 판단자', traits: ['직관력', '예리함', '실용성'], strength: '본질을 꿰뚫는 판단력', weakness: '차갑게 보이고 감정 표현이 적음' },
};

function getIljuInfo(ilju) {
  return ILJU_TRAITS[ilju] || {
    title: `${ilju}일주`,
    keyword: '독특한 개성의 소유자',
    traits: ['다면적', '복합적', '특별함'],
    strength: '독자적인 방식으로 세상을 바라보는 능력',
    weakness: '때로 주변과의 소통에 어려움'
  };
}

// 궁합 점수 계산
function calcGunghap(saju1, saju2) {
  const il1 = saju1.ilju[0]; // 일간
  const il2 = saju2.ilju[0];

  // 오행 상생·상극
  const ohaeng1 = OHAENG[il1];
  const ohaeng2 = OHAENG[il2];

  const sangsaeng = {
    목: '화', 화: '토', 토: '금', 금: '수', 수: '목'
  };
  const sanggeuk = {
    목: '토', 화: '금', 토: '수', 금: '목', 수: '화'
  };

  let score = 60;
  if (sangsaeng[ohaeng1] === ohaeng2 || sangsaeng[ohaeng2] === ohaeng1) score += 20;
  if (sanggeuk[ohaeng1] === ohaeng2) score -= 15;
  if (sanggeuk[ohaeng2] === ohaeng1) score -= 10;
  if (ohaeng1 === ohaeng2) score += 5;

  // 지지 합
  const jihaFunc = (j1, j2) => {
    const jiha = [['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미']];
    return jiha.some(pair => (pair[0] === j1 && pair[1] === j2) || (pair[0] === j2 && pair[1] === j1));
  };
  if (jihaFunc(saju1.ilju[1], saju2.ilju[1])) score += 15;

  return Math.min(99, Math.max(40, score));
}

export function calculateSaju(year, month, day, hour) {
  const yeonju = getYeonju(year);
  const wolju = getWolju(year, month);
  const ilju = getIlju(year, month, day);
  const siju = getSiju(ilju[0], hour);

  const pillars = [yeonju, wolju, ilju, siju];
  const ohaeng = analyzeOhaeng(pillars);
  const iljuInfo = getIljuInfo(ilju);

  return {
    yeonju, wolju, ilju, siju,
    ohaeng,
    iljuInfo,
    birthInfo: { year, month, day, hour }
  };
}

export function calculateGunghap(saju1, saju2) {
  const score = calcGunghap(saju1, saju2);
  let grade, comment;

  if (score >= 85) { grade = '천생연분'; comment = '운명적인 만남. 서로의 부족함을 채워주는 최상의 궁합입니다.'; }
  else if (score >= 75) { grade = '좋은 궁합'; comment = '서로 이해하고 발전할 수 있는 좋은 관계입니다.'; }
  else if (score >= 65) { grade = '보통 궁합'; comment = '노력하면 좋은 관계를 만들 수 있습니다.'; }
  else if (score >= 55) { grade = '주의 필요'; comment = '서로의 차이를 이해하고 배려하는 노력이 필요합니다.'; }
  else { grade = '어려운 궁합'; comment = '서로 다른 에너지를 가졌지만, 이해와 포용으로 극복 가능합니다.'; }

  return { score, grade, comment };
}

export { OHAENG, CHEONGAN, JIJI, GAPJA_60 };
