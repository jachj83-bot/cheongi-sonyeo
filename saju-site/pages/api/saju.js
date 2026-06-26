import { calculateSaju } from '@fullstackfamily/manseryeok';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, year, month, day, hour, gender, type, me, partner } = req.body;

  try {
    let prompt = '';

    if (type === 'gunghap') {
      // 두 사람 사주팔자 계산
      const meSaju = calculateSaju(
        parseInt(me.year), parseInt(me.month), parseInt(me.day), 12
      );
      const partnerSaju = calculateSaju(
        parseInt(partner.year), parseInt(partner.month), parseInt(partner.day), 12
      );

      prompt = `당신은 30년 경력의 명리학 전문가입니다. 아래 두 사람의 정확한 사주팔자를 바탕으로 궁합을 분석해주세요.

[나의 사주팔자]
년주: ${meSaju.yearPillar} / 월주: ${meSaju.monthPillar} / 일주: ${meSaju.dayPillar} / 시주: ${meSaju.hourPillar}

[상대방 사주팔자]
년주: ${partnerSaju.yearPillar} / 월주: ${partnerSaju.monthPillar} / 일주: ${partnerSaju.dayPillar} / 시주: ${partnerSaju.hourPillar}

다음 형식으로 분석해주세요:

⭐ 궁합 총점: /100점

🔥 두 사람의 오행 관계
(상생인지 상극인지, 어떤 에너지 흐름인지)

💛 잘 맞는 부분
(구체적으로 3가지)

⚠️ 주의해야 할 부분
(솔직하게, 나쁜 점도 명확하게)

🌿 2026 병오년 이 두 사람에게
(올해 이 관계에서 특히 조심하거나 활용할 것)

신비롭고 따뜻하되 좋은 말만 하지 말고 나쁜 운도 솔직하게 말해주세요. 한국어로 작성해주세요.`;

    } else {
      // 개인 사주팔자 계산
      const hourNum = hour === '모름' ? 12 : getHourNumber(hour);
      const saju = calculateSaju(
        parseInt(year), parseInt(month), parseInt(day), hourNum
      );

      prompt = `당신은 30년 경력의 명리학 전문가입니다. 아래 사주팔자를 바탕으로 분석해주세요.

[${name}님의 사주팔자]
년주: ${saju.yearPillar} / 월주: ${saju.monthPillar} / 일주: ${saju.dayPillar} / 시주: ${saju.hourPillar}
성별: ${gender}자

첫 문장은 반드시 "하늘의 기운을 읽었습니다."로 시작하고 다음 형식으로 분석해주세요:

🌟 일주 분석 (${saju.dayPillar}일)
(일간의 특성과 타고난 기질)

🔥 오행 에너지
(강한 오행과 약한 오행, 균형 상태)

💫 기본 성격과 재능

💰 재물운
(좋은 점과 나쁜 점 모두 솔직하게)

❤️ 연애운
(좋은 점과 나쁜 점 모두 솔직하게)

⚡ 2026 병오년 운세
(올해 특히 주의할 것, 좋은 시기, 나쁜 시기 구체적으로)

⚠️ 주의사항
(이 사주의 단점과 조심해야 할 것 솔직하게)

좋은 말만 하지 말고 나쁜 운도 솔직하고 구체적으로 말해주세요. 한국어로 작성해주세요.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const result = data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
    res.status(200).json({ result });

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
