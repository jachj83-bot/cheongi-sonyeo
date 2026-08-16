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

// AI 응답을 실시간 스트리밍으로 전송 (체감 속도 개선). extraHeader가 있으면
// 사이드카 데이터(사주원국, 괘 등)를 헤더로 함께 실어 보낸다.
async function streamAnthropic(res, { prompt, maxTokens = 2000, fallback = '분석 결과를 가져올 수 없습니다.', extraHeader }) {
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: maxTokens, stream: true, messages: [{ role: 'user', content: prompt }] })
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    const fallbackBody = { result: fallback };
    if (extraHeader) fallbackBody[extraHeader.jsonKey] = extraHeader.payload;
    res.status(200).json(fallbackBody);
    return;
  }

  const headers = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' };
  if (extraHeader) headers[extraHeader.name] = encodeURIComponent(JSON.stringify(extraHeader.payload));
  res.writeHead(200, headers);

  const reader = anthropicRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const evt = JSON.parse(line.slice(6));
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          res.write(evt.delta.text);
        }
      } catch {}
    }
  }
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, year, month, day, hour, gender, type, me, partner, card, cardEn, reversed, question } = req.body;

  try {

    // 타로 분석
    if (type === 'tarot') {
      const { spread, category, positions, cards: tarotCards, question: tarotQuestion } = req.body;
      const cat = category || spread || 'daily';

      const CATEGORY_THEME = {
        daily: { title: '오늘의 운세', topic: '오늘 하루 전반의 흐름과 마음가짐', tone: '신비롭고 따뜻한' },
        love: { title: '연애 타로', topic: '그 사람의 마음, 나의 마음, 그리고 두 사람의 앞으로의 관계', tone: '섬세하고 다정한' },
        wealth: { title: '재물 타로', topic: '현재 재물 흐름과 다가올 기회, 돈과 관련된 선택', tone: '현실적이면서도 신비로운' },
      };
      const theme = CATEGORY_THEME[cat] || CATEGORY_THEME.daily;

      let prompt = '';

      if (cat === 'daily' || !tarotCards || tarotCards.length === 1) {
        // 1장
        const card = tarotCards[0];
        prompt = `당신은 20년 경력의 타로 마스터입니다.

카테고리: ${theme.title}
오늘 뽑힌 카드: ${card.name} (${card.nameEn}) — ${card.reversed ? '역방향' : '정방향'}
주제: ${theme.topic}${tarotQuestion ? ` / 추가로 궁금한 점: ${tarotQuestion}` : ''}

아래 형식으로 해석해주세요:

🃏 ${card.name}${card.reversed ? ' (역방향)' : ''}

✨ 카드의 의미
💫 지금 당신에게 전하는 메시지
🌟 오늘 하루 조언
🔮 한 줄 핵심

${theme.tone} 톤으로 한국어로 작성해주세요.`;

      } else {
        // 3장 스프레드 (연애 타로 / 재물 타로)
        const cardList = tarotCards.map(c =>
          `${c.position}: ${c.name} (${c.nameEn}) — ${c.reversed ? '역방향' : '정방향'}`
        ).join('\n');

        prompt = `당신은 20년 경력의 타로 마스터입니다.

카테고리: ${theme.title}
주제: ${theme.topic}${tarotQuestion ? ` / 추가로 궁금한 점: ${tarotQuestion}` : ''}

뽑힌 카드:
${cardList}

아래 형식으로 각 카드를 해석하고 전체 흐름을 읽어주세요:

${tarotCards.map(c => `🃏 ${c.position} — ${c.name}${c.reversed ? ' (역방향)' : ''}
(이 카드가 ${c.position} 자리에서 말하는 것, "${theme.title}" 주제에 맞춰서)`).join('\n\n')}

🔮 세 카드가 전하는 전체 메시지
(세 카드의 흐름을 연결해서 "${theme.title}" 관점으로 종합 해석)

💫 지금 당신에게 가장 중요한 조언

${theme.tone} 톤으로 한국어로 작성해주세요.`;
      }

      await streamAnthropic(res, { prompt, maxTokens: 2000, fallback: '카드의 메시지를 읽을 수 없습니다.' });
      return;
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
      const meName = me.name || '나';
      const partnerName = partner.name || '상대방';

      const prompt = `당신은 30년 경력의 명리학 전문가입니다.

[${meName}님의 사주팔자]
년주: ${meSaju.yearPillar} / 월주: ${meSaju.monthPillar} / 일주: ${meSaju.dayPillar} / 시주: ${meSaju.hourPillar}
일간: ${meIlgan}(${CHEONGAN_OHAENG[meIlgan]})
오행: 목${meStrength['목']} 화${meStrength['화']} 토${meStrength['토']} 금${meStrength['금']} 수${meStrength['수']}

[${partnerName}님의 사주팔자]
년주: ${partnerSaju.yearPillar} / 월주: ${partnerSaju.monthPillar} / 일주: ${partnerSaju.dayPillar} / 시주: ${partnerSaju.hourPillar}
일간: ${partnerIlgan}(${CHEONGAN_OHAENG[partnerIlgan]})
오행: 목${partnerStrength['목']} 화${partnerStrength['화']} 토${partnerStrength['토']} 금${partnerStrength['금']} 수${partnerStrength['수']}

${meName}님과 ${partnerName}님, 두 분의 궁합을 봐주세요. 아래 형식으로 분석해주세요:

⭐ 궁합 총점: /100점

🔥 오행 관계 분석

💛 잘 맞는 부분 (3가지)

⚠️ 주의해야 할 부분 (극복 방법 포함)

🌿 2026 병오년 두 사람에게

두 분의 이름을 자연스럽게 불러가며, 장점과 단점을 6:4로 균형있게, 따뜻한 톤으로 한국어로 작성해주세요.`;

      await streamAnthropic(res, { prompt, maxTokens: 2800, fallback: '분석 결과를 가져올 수 없습니다.' });
      return;
    }

    // 신년운세 (2026 병오년)
    if (type === 'sinnyeon') {
      const hourNum = hour === '모름' ? 12 : getHourNumber(hour);
      const saju = calculateSaju(parseInt(year), parseInt(month), parseInt(day), hourNum);
      const ilgan = getIlgan(saju.dayPillar);
      const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];
      const strength = calcOhaengStrength(pillars);
      const ilganOhaeng = CHEONGAN_OHAENG[ilgan];

      const prompt = `당신은 30년 경력의 명리학 전문가입니다. ${name || '의뢰인'}님의 2026년 병오년(丙午年) 신년운세를 상세히 봐주세요.

[${name || '의뢰인'}님 사주팔자]
년주: ${saju.yearPillar} / 월주: ${saju.monthPillar} / 일주: ${saju.dayPillar} / 시주: ${saju.hourPillar}
성별: ${gender}자 / 일간: ${ilgan}(${ilganOhaeng})
오행 강약: 목${strength['목']} 화${strength['화']} 토${strength['토']} 금${strength['금']} 수${strength['수']}

2026년은 병오년(丙午年), 붉은 말의 해로 화(火) 기운이 매우 강합니다. 이 사주의 일간 ${ilgan}(${ilganOhaeng})이 병오년의 강한 화 기운과 어떻게 상호작용하는지(생조/극제 관계) 반드시 반영해서 풀이해주세요.

첫 문장은 반드시 "하늘의 기운을 읽었습니다."로 시작하고 아래 형식으로 분석해주세요:

🐎 2026 병오년 총운
📅 상반기 흐름 (1~6월)
📅 하반기 흐름 (7~12월)
💰 재물운
❤️ 애정 · 인간관계운
🩺 건강운
🍀 올해의 행운 포인트 (색 · 방향 · 아이템)
⚠️ 조심해야 할 시기와 이유

장점과 단점을 6:4로 균형있게, 따뜻하고 신비로운 톤으로 한국어로 작성해주세요.`;

      await streamAnthropic(res, { prompt, maxTokens: 2800, fallback: '분석 결과를 가져올 수 없습니다.' });
      return;
    }

    // 토정비결
    if (type === 'tojeong') {
      const hourNum = hour === '모름' ? 12 : getHourNumber(hour);
      const saju = calculateSaju(parseInt(year), parseInt(month), parseInt(day), hourNum);
      const ilgan = getIlgan(saju.dayPillar);
      const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];
      const strength = calcOhaengStrength(pillars);
      const ilganOhaeng = CHEONGAN_OHAENG[ilgan];

      // 사주 기반으로 결정되는 괘 번호 (상괘·중괘·하괘)
      const seed = (parseInt(year) + parseInt(month) * 3 + parseInt(day) * 7 + hourNum) ;
      const sanggwae = (seed % 8) + 1;
      const junggwae = (Math.floor(seed / 8) % 6) + 1;
      const hagwae = (Math.floor(seed / 48) % 3) + 1;

      const prompt = `당신은 전통 토정비결(土亭秘訣) 풀이에 능한 30년 경력의 명리학 전문가입니다. ${name || '의뢰인'}님의 2026년 신수(身數)를 토정비결 형식을 빌려 풀이해주세요.

[${name || '의뢰인'}님 사주팔자]
년주: ${saju.yearPillar} / 월주: ${saju.monthPillar} / 일주: ${saju.dayPillar} / 시주: ${saju.hourPillar}
일간: ${ilgan}(${ilganOhaeng})
오행 강약: 목${strength['목']} 화${strength['화']} 토${strength['토']} 금${strength['금']} 수${strength['수']}
괘상 번호: ${sanggwae}-${junggwae}-${hagwae}괘

이 사주와 괘상을 바탕으로, 옛 토정비결처럼 짧은 한자성어 느낌의 총평 한 줄로 시작해서 아래 형식으로 풀이해주세요. 첫 문장은 반드시 "하늘의 기운을 읽었습니다."로 시작해주세요.

📜 ${sanggwae}-${junggwae}-${hagwae}괘 총평 (한 줄 한자성어 느낌 문구 포함)
🌱 1~3월 신수
🌿 4~6월 신수
🍂 7~9월 신수
❄️ 10~12월 신수
💰 올해 재물의 흐름
👪 가정 · 인간관계
⚠️ 각별히 조심할 일
🍀 올해를 잘 넘기는 지혜

전통적이고 담백한 옛 어투를 살짝 섞되 이해하기 쉽게, 한국어로 작성해주세요.`;

      await streamAnthropic(res, {
        prompt, maxTokens: 2800, fallback: '분석 결과를 가져올 수 없습니다.',
        extraHeader: { name: 'X-Gwae-Data', jsonKey: 'gwae', payload: { sanggwae, junggwae, hagwae } }
      });
      return;
    }

    // 사주 + 타로 통합 분석
    if (type === 'tonghap_tarot') {
      const hourNum = hour === '모름' ? 12 : getHourNumber(hour);
      const saju = calculateSaju(parseInt(year), parseInt(month), parseInt(day), hourNum);
      const ilgan = getIlgan(saju.dayPillar);
      const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];
      const strength = calcOhaengStrength(pillars);
      const ilganOhaeng = CHEONGAN_OHAENG[ilgan];
      const singangCheck = (() => {
        const inseongOhaeng = { '목':'수', '화':'목', '토':'화', '금':'토', '수':'금' }[ilganOhaeng];
        const bigyeopScore = (strength[ilganOhaeng] || 0) + (strength[inseongOhaeng] || 0);
        return bigyeopScore >= 3.0 ? '신강' : '신약';
      })();

      const prompt = `당신은 사주와 타로를 함께 보는 30년 경력의 명리학 전문가이자 타로 마스터입니다. ${name || '의뢰인'}님을 위해 사주로 큰 흐름을 짚고, 타로로 지금 이 순간의 기운을 겹쳐서 하나의 통합된 리딩을 해주세요.

[사주팔자]
년주: ${saju.yearPillar} / 월주: ${saju.monthPillar} / 일주: ${saju.dayPillar} / 시주: ${saju.hourPillar}
일간: ${ilgan}(${ilganOhaeng}) / ${singangCheck} 사주
오행 강약: 목${strength['목']} 화${strength['화']} 토${strength['토']} 금${strength['금']} 수${strength['수']}

[뽑힌 타로 카드]
${card} (${cardEn || ''}) — ${reversed ? '역방향' : '정방향'}

첫 문장은 반드시 "하늘의 기운을 읽었습니다."로 시작하고 아래 형식으로 사주와 타로를 유기적으로 연결해서 분석해주세요:

🌟 사주로 본 타고난 흐름 (${singangCheck} 사주 특성)
🃏 지금 뽑힌 카드 "${card}"가 말하는 것
🔮 사주와 카드가 겹쳐서 보여주는 지금 이 시기
💰 재물 · 커리어
❤️ 연애 · 관계
⚡ 2026 병오년과 함께 본 앞으로의 흐름
⚠️ 종합 조언

사주(장기 흐름)와 타로(현재 기운)가 서로를 어떻게 뒷받침하거나 다른 신호를 주는지 명확히 짚어주면서, 따뜻하고 신비로운 톤으로 한국어로 작성해주세요.`;

      await streamAnthropic(res, { prompt, maxTokens: 2800, fallback: '분석 결과를 가져올 수 없습니다.' });
      return;
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

첫 문장은 반드시 "하늘의 기운을 읽었습니다."로 시작하고 아래 형식으로, 짧고 임팩트 있게 분석해주세요. 이건 무료로 제공되는 맛보기 리포트이니 전체적으로 짧고 간결하게 써주세요:

🌟 일주 분석 (${saju.dayPillar})
🔥 오행 에너지
💫 십신으로 본 성격과 재능

${singang} 사주 특성에 맞게, 장점과 단점을 6:4로 균형있게, 따뜻하고 신비로운 톤으로 한국어로 작성해주세요. 각 항목은 딱 2문장으로만 짧게 써주세요. 마지막에 줄바꿈 후 "✨" 로 시작하는 한 줄로, 재물운·연애운·2026년 병오년 운세는 더 자세한 유료 콘텐츠에서 확인할 수 있다는 걸 자연스럽게 궁금증을 자아내는 문장으로 안내해주세요 (예: "재물운과 연애운, 2026년의 흐름은 신년운세에서 훨씬 자세히 만나볼 수 있어요"). 전체 분량은 절대 넘치지 않게, 딱 필요한 만큼만 써주세요.`;

    // sajuData를 먼저 헤더로 보내고, AI 해석은 실시간 스트리밍으로 전송 (체감 속도 개선)
    const sajuDataPayload = {
      pillars: { year: saju.yearPillar, month: saju.monthPillar, day: saju.dayPillar, hour: saju.hourPillar },
      sipsin: sipsinData,
      strength,
      singang,
      ilgan
    };

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 900, stream: true, messages: [{ role: 'user', content: prompt }] })
    });

    if (!anthropicRes.ok || !anthropicRes.body) {
      return res.status(200).json({ result: '분석 결과를 가져올 수 없습니다.', sajuData: sajuDataPayload });
    }

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Saju-Data': encodeURIComponent(JSON.stringify(sajuDataPayload)),
      'Cache-Control': 'no-cache',
    });

    const reader = anthropicRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const evt = JSON.parse(line.slice(6));
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            res.write(evt.delta.text);
          }
        } catch {}
      }
    }
    return res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
