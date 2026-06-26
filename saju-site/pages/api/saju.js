import { calculateSaju } from '@fullstackfamily/manseryeok';

const CHEONGAN_OHAENG = {
  '갑':'목','을':'목','병':'화','정':'화','무':'토',
  '기':'토','경':'금','신':'금','임':'수','계':'수'
};
const JIJI_OHAENG = {
  '자':'수','축':'토','인':'목','묘':'목','진':'토','사':'화',
  '오':'화','미':'토','신':'금','유':'금','술':'토','해':'수'
};
const JIJI_JIJANGGAN = {
  '자':['임','계'],'축':['기','신','계'],'인':['무','병','갑'],
  '묘':['갑','을'],'진':['을','계','무'],'사':['무','경','병'],
  '오':['병','기'],'미':['기','을','정'],'신':['무','임','경'],
  '유':['경','신'],'술':['신','정','무'],'해':['무','갑','임']
};
const CHEONGAN_UMYANG = {
  '갑':'양','을':'음','병':'양','정':'음','무':'양',
  '기':'음','경':'양','신':'음','임':'양','계':'음'
};

function getSipsin(ilgan, target) {
  const ohaengOrder = ['목','화','토','금','수'];
  const ilOhaeng = CHEONGAN_OHAENG[ilgan];
  const targetOhaeng = CHEONGAN_OHAENG[target] || JIJI_OHAENG[target];
  if (!ilOhaeng || !targetOhaeng) return '';
  const ilIdx = ohaengOrder.indexOf(ilOhaeng);
  const targetIdx = ohaengOrder.indexOf(targetOhaeng);
  const diff = (targetIdx - ilIdx + 5) % 5;
  const sameUmyang = CHEONGAN_UMYANG[ilgan] === CHEONGAN_UMYANG[target];
  if (diff === 0) return sameUmyang ? '비견' : '겁재';
  if (diff === 1) return sameUmyang ? '식신' : '상관';
  if (diff === 2) return sameUmyang ? '편재' : '정재';
  if (diff === 3) return sameUmyang ? '편관' : '정관';
  if (diff === 4) return sameUmyang ? '편인' : '정인';
  return '';
}

function calcOhaengStrength(pillars) {
  const strength = { '목':0, '화':0, '토':0, '금':0, '수':0 };
  pillars.forEach(p => {
    if (!p || p.length < 2) return;
    const gan = p[0];
    const ji = p[1];
    if (CHEONGAN_OHAENG[gan]) strength[CHEONGAN_OHAENG[gan]] += 1.0;
    if (JIJI_OHAENG[ji]) strength[JIJI_OHAENG[ji]] += 0.7;
    const jijanggan = JIJI_JIJANGGAN[ji] || [];
    jijanggan.forEach(jj => {
      if (CHEONGAN_OHAENG[jj]) strength[CHEONGAN_OHAENG[jj]] += 0.3;
    });
  });
  Object.keys(strength).forEach(k => {
    strength[k] = Math.round(strength[k] * 10) / 10;
  });
  return strength;
}

function getIlgan(dayPillar) {
  return dayPillar ? dayPillar[0] : '';
}

function getHourNumber(hourLabel) {
  const map = {
    '자시':0,'축시':2,'인시':4,'묘시':6,'진시':8,'사시':10,
    '오시':12,'미시':14,'신시':16,'유시':18,'술시':20,'해시':22
  };
  return map[hourLabel] ?? 12;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, year, month, day, hour, gender, type, me, partner, card, cardEn, reversed, question } = req.body;

  try {

    // 타로 분석
    if (type === 'tarot') {
      const prompt = `당신은 20년 경력의 타로 마스터이자 신비로운 점술가입니다.

오늘 뽑힌 카드: ${card} (${cardEn})${reversed ? ' — 역방향' : ' — 정방향'}
질문/주제: ${question || '오늘 하루의 흐름'}

아래 형식으로 해석해주세요:

🃏 ${card}${reversed ? ' (역방향)' : ''}

✨ 카드의 의미
(이 카드가 상징하는 것, ${reversed ? '역방향일 때의 의미' : '정방향일 때의 의미'})

💫 지금 당신에게 전하는 메시지
(질문/주제와 연결해서 구체적으로, 2-3문단)

🌟 오늘 하루 조언
(이 카드를 받은 사람이 오늘 어떻게 행동하면 좋을지)

🔮 한 줄 핵심
(카드의 핵심 메시지를 한 문장으로)

신비롭고 따뜻한 톤으로, 마치 오랜 지혜를 가진 점술가가 직접 말해주듯이 한국어로 작성해주세요.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await response.json();
      return res.status(200).json({ result: data.content?.[0]?.text || '카드의 메시지를 읽을 수 없습니다.' });
    }

    // 궁합 분석
    if (type === 'gunghap') {
      const meSaju = calculateSaju(parseInt(me.year), parseInt(me.month), parseInt(me.day), 12);
      const partnerSaju = calculateSaju(parseInt(partner.year), parseInt(partner.month), parseInt(partner.day), 12);
      const mePillars = [meSaju.yearPillar, meSaju.monthPillar, meSaju.dayPillar, meSaju.hourPillar];
      const partnerPillars = [partnerSaju.yearPillar, partnerSaju.monthPillar, partnerSaju.dayPillar, partnerSaju.hourPillar];
      const meStrength = calcOhaengStrength(mePillars);
      const partnerStrength = calcOhaengStrength(partnerPillars);
      const meIlgan = getIlgan(meSaju.dayPillar);
      const partnerIlgan = getIlgan(partnerSaju.dayPillar);

      const prompt = `당신은 30년 경력의 명리학 전문가입니다.

[나의 사주팔자]
년주: ${meSaju.yearPillar} / 월주: ${meSaju.monthPillar} / 일주: ${meSaju.dayPillar} / 시주: ${meSaju.hourPillar}
일간: ${meIlgan}(${CHEONGAN_OHAENG[meIlgan]})
오행: 목${meStrength['목']} 화${meStrength['화']} 토${meStrength['토']} 금${meStrength['금']} 수${meStrength['수']}

[상대방 사주팔자]
년주: ${partnerSaju.yearPillar} / 월주: ${partnerSaju.monthPillar} / 일주: ${partnerSaju.dayPillar} / 시주: ${partnerSaju.hourPillar}
일간: ${partnerIlgan}(${CHEONGAN_OHAENG[partnerIlgan]})
오행: 목${partnerStrength['목']} 화${partnerStrength['화']} 토${partnerStrength['토']} 금${partnerStrength['금']} 수${partnerStrength['수']}

아래 형식으로 분석해주세요:

⭐ 궁합 총점: /100점

🔥 오행 관계 분석

💛 잘 맞는 부분 (3가지)

⚠️ 주의해야 할 부분 (극복 방법 포함)

🌿 2026 병오년 두 사람에게

장점과 단점을 6:4로 균형있게, 따뜻한 톤으로 한국어로 작성해주세요.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await response.json();
      return res.status(200).json({ result: data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.' });
    }

    // 사주 분석
    const hourNum = hour === '모름' ? 12 : getHourNumber(hour);
    const saju = calculateSaju(parseInt(year), parseInt(month), parseInt(day), hourNum);
    const ilgan = getIlgan(saju.dayPillar);
    const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];
    const strength = calcOhaengStrength(pillars);

    const sipsinData = pillars.map(p => {
      if (!p || p.length < 2) return null;
      return { pillar: p, ganSipsin: getSipsin(ilgan, p[0]), jiSipsin: getSipsin(ilgan, p[1]) };
    });

    const ilganOhaeng = CHEONGAN_OHAENG[ilgan];
    const inseongOhaeng = { '목':'수', '화':'목', '토':'화', '금':'토', '수':'금' }[ilganOhaeng];
    const bigyeopScore = (strength[ilganOhaeng] || 0) + (strength[inseongOhaeng] || 0);
    const singang = bigyeopScore >= 3.0 ? '신강' : '신약';
    const sorted = Object.entries(strength).sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0][0];
    const weakest = sorted[sorted.length - 1][0];

    const prompt = `당신은 30년 경력의 명리학 전문가입니다.

[${name || '의뢰인'}님 사주팔자]
년주: ${saju.yearPillar} / 월주: ${saju.monthPillar} / 일주: ${saju.dayPillar} / 시주: ${saju.hourPillar}
성별: ${gender}자 / 일간: ${ilgan}(${ilganOhaeng}) / ${singang} 사주

오행 강약:
목 ${strength['목']} / 화 ${strength['화']} / 토 ${strength['토']} / 금 ${strength['금']} / 수 ${strength['수']}
→ 가장 강한 오행: ${strongest} / 가장 약한 오행: ${weakest}

십신:
${sipsinData.map(s => s ? `${s.pillar}: 천간(${s.ganSipsin}) 지지(${s.jiSipsin})` : '').join('\n')}

첫 문장은 반드시 "하늘의 기운을 읽었습니다."로 시작하고 아래 형식으로 분석해주세요:

🌟 일주 분석 (${saju.dayPillar})
🔥 오행 에너지
💫 십신으로 본 성격과 재능
💰 재물운
❤️ 연애·결혼운
⚡ 2026 병오년 운세
⚠️ 조언

${singang} 사주 특성에 맞게, 장점과 단점을 6:4로 균형있게, 따뜻하고 신비로운 톤으로 한국어로 작성해주세요.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();

    return res.status(200).json({
      result: data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.',
      sajuData: {
        pillars: { year: saju.yearPillar, month: saju.monthPillar, day: saju.dayPillar, hour: saju.hourPillar },
        sipsin: sipsinData,
        strength,
        singang,
        ilgan
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
