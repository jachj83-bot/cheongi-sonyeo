import { calculateSaju } from '@fullstackfamily/manseryeok';

// 천간 오행 매핑
const CHEONGAN_OHAENG = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수'
};

// 지지 오행 매핑
const JIJI_OHAENG = {
  '자': '수', '축': '토', '인': '목', '묘': '목',
  '진': '토', '사': '화', '오': '화', '미': '토',
  '신': '금', '유': '금', '술': '토', '해': '수'
};

// 천간 음양
const CHEONGAN_UMYANG = {
  '갑': '양', '을': '음', '병': '양', '정': '음',
  '무': '양', '기': '음', '경': '양', '신': '음',
  '임': '양', '계': '음'
};

// 십신 계산 (일간 기준)
function getSipsin(ilgan, target) {
  const ohaengMap = { '목': 0, '화': 1, '토': 2, '금': 3, '수': 4 };
  const ilOhaeng = CHEONGAN_OHAENG[ilgan];
  const targetOhaeng = CHEONGAN_OHAENG[target] || JIJI_OHAENG[target];
  const ilUmyang = CHEONGAN_UMYANG[ilgan];
  const targetUmyang = CHEONGAN_UMYANG[target];

  if (!ilOhaeng || !targetOhaeng) return '미상';

  const ilIdx = ohaengMap[ilOhaeng];
  const targetIdx = ohaengMap[targetOhaeng];
  const diff = (targetIdx - ilIdx + 5) % 5;

  // 상생상극 관계
  if (diff === 0) {
    // 같은 오행
    return ilUmyang === targetUmyang ? '비견' : '겁재';
  } else if (diff === 1) {
    // 일간이 생하는 오행 (식상)
    return ilUmyang === targetUmyang ? '식신' : '상관';
  } else if (diff === 2) {
    // 일간이 극하는 오행 (재성)
    return ilUmyang === targetUmyang ? '편재' : '정재';
  } else if (diff === 3) {
    // 일간을 극하는 오행 (관성)
    return ilUmyang === targetUmyang ? '편관' : '정관';
  } else if (diff === 4) {
    // 일간을 생하는 오행 (인성)
    return ilUmyang === targetUmyang ? '편인' : '정인';
  }
  return '미상';
}

// 오행 강약 계산
function calcOhaengStrength(pillars) {
  const strength = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  pillars.forEach(p => {
    if (p && p.length >= 2) {
      const gan = p[0];
      const ji = p[1];
      const ganOhaeng = CHEONGAN_OHAENG[gan];
      const jiOhaeng = JIJI_OHAENG[ji];
      if (ganOhaeng) strength[ganOhaeng] += 1;
      if (jiOhaeng) strength[jiOhaeng] += 0.5;
    }
  });
  return strength;
}

// 일간 추출 (일주 첫 글자)
function getIlgan(dayPillar) {
  return dayPillar ? dayPillar[0] : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, year, month, day, hour, gender, type, me, partner } = req.body;

  try {
    if (type === 'gunghap') {
      const meSaju = calculateSaju(parseInt(me.year), parseInt(me.month), parseInt(me.day), 12);
      const partnerSaju = calculateSaju(parseInt(partner.year), parseInt(partner.month), parseInt(partner.day), 12);

      const meIlgan = getIlgan(meSaju.dayPillar);
      const partnerIlgan = getIlgan(partnerSaju.dayPillar);

      const mePillars = [meSaju.yearPillar, meSaju.monthPillar, meSaju.dayPillar, meSaju.hourPillar];
      const partnerPillars = [partnerSaju.yearPillar, partnerSaju.monthPillar, partnerSaju.dayPillar, partnerSaju.hourPillar];

      const meStrength = calcOhaengStrength(mePillars);
      const partnerStrength = calcOhaengStrength(partnerPillars);

      const prompt = `당신은 30년 경력의 명리학 전문가입니다. 아래 정확한 사주 데이터를 바탕으로 궁합을 분석해주세요.

[나의 사주팔자]
년주: ${meSaju.yearPillar} / 월주: ${meSaju.monthPillar} / 일주: ${meSaju.dayPillar} / 시주: ${meSaju.hourPillar}
일간: ${meIlgan}(${CHEONGAN_OHAENG[meIlgan]}/${CHEONGAN_UMYANG[meIlgan]})
오행 강약: 목${meStrength['목']} 화${meStrength['화']} 토${meStrength['토']} 금${meStrength['금']} 수${meStrength['수']}

[상대방 사주팔자]
년주: ${partnerSaju.yearPillar} / 월주: ${partnerSaju.monthPillar} / 일주: ${partnerSaju.dayPillar} / 시주: ${partnerSaju.hourPillar}
일간: ${partnerIlgan}(${CHEONGAN_OHAENG[partnerIlgan]}/${CHEONGAN_UMYANG[partnerIlgan]})
오행 강약: 목${partnerStrength['목']} 화${partnerStrength['화']} 토${partnerStrength['토']} 금${partnerStrength['금']} 수${partnerStrength['수']}

아래 형식으로 분석해주세요:

⭐ 궁합 총점: /100점
(점수 근거 한 줄 설명)

🔥 오행 관계 분석
(두 사람의 오행이 상생인지 상극인지, 일간 관계)

💛 잘 맞는 부분 (3가지)

⚠️ 주의해야 할 부분
(나쁜 점도 솔직하고 구체적으로)

🌿 2026 병오년 두 사람에게
(올해 이 관계에서 특히 조심하거나 좋은 시기)

좋은 말만 하지 말고 충극 관계나 갈등 요소도 명확히 짚어주세요. 한국어로 작성해주세요.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const result = data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
      res.status(200).json({ result });

    } else {
      const hourNum = hour === '모름' ? 12 : getHourNumber(hour);
      const saju = calculateSaju(parseInt(year), parseInt(month), parseInt(day), hourNum);

      const ilgan = getIlgan(saju.dayPillar);
      const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];
      const strength = calcOhaengStrength(pillars);

      // 십신 계산
      const sipsinList = pillars.map(p => {
        if (!p || p.length < 2) return '';
        const gan = p[0];
        const ji = p[1];
        return `${p}: 천간(${getSipsin(ilgan, gan)}) 지지(${getSipsin(ilgan, ji)})`;
      });

      // 가장 강한/약한 오행
      const sorted = Object.entries(strength).sort((a, b) => b[1] - a[1]);
      const strongest = sorted[0][0];
      const weakest = sorted[sorted.length - 1][0];

      const prompt = `당신은 30년 경력의 명리학 전문가입니다. 아래 정확한 사주 데이터를 바탕으로 분석해주세요.

[${name || '의뢰인'}님의 사주팔자]
년주: ${saju.yearPillar} / 월주: ${saju.monthPillar} / 일주: ${saju.dayPillar} / 시주: ${saju.hourPillar}
성별: ${gender}자
일간: ${ilgan}(${CHEONGAN_OHAENG[ilgan]}/${CHEONGAN_UMYANG[ilgan]})

오행 강약:
목 ${strength['목']} / 화 ${strength['화']} / 토 ${strength['토']} / 금 ${strength['금']} / 수 ${strength['수']}
→ 가장 강한 오행: ${strongest} / 가장 약한 오행: ${weakest}

십신 구성:
${sipsinList.join('\n')}

첫 문장은 반드시 "하늘의 기운을 읽었습니다."로 시작하고 아래 형식으로 분석해주세요:

🌟 일주 분석 (${saju.dayPillar})
(${ilgan}일간의 특성, 타고난 기질)

🔥 오행 에너지
(${strongest}이 강하고 ${weakest}이 약한 사주의 특징과 영향)

💫 십신으로 본 성격과 재능
(위 십신 구성을 바탕으로 구체적으로)

💰 재물운
(좋은 점과 취약점 모두 솔직하게)

❤️ 연애운
(좋은 점과 취약점 모두 솔직하게)

⚡ 2026 병오년 운세
(올해 좋은 시기, 나쁜 시기, 특히 주의할 것 구체적으로)

⚠️ 이 사주의 주의사항
(단점과 조심해야 할 것 솔직하게)

좋은 말만 하지 말고 나쁜 운도 솔직하고 구체적으로 말해주세요. 한국어로 작성해주세요.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const result = data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
      res.status(200).json({ result });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}

function getHourNumber(hourLabel) {
  const map = {
    '자시': 0, '축시': 2, '인시': 4, '묘시': 6,
    '진시': 8, '사시': 10, '오시': 12, '미시': 14,
    '신시': 16, '유시': 18, '술시': 20, '해시': 22
  };
  return map[hourLabel] ?? 12;
}
