// pages/api/saju.js
// Claude API를 사용한 사주 분석 엔드포인트

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { saju, name, gender, type } = req.body;
  if (!saju) return res.status(400).json({ error: 'Missing saju data' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const prompts = {
    basic: buildBasicPrompt(saju, name, gender),
    ilju: buildIljuPrompt(saju, name, gender),
    report: buildReportPrompt(saju, name, gender),
    gunghap: buildGunghapPrompt(saju, req.body.saju2, name, req.body.name2)
  };

  const prompt = prompts[type] || prompts.basic;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: type === 'report' ? 4000 : 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const analysis = data.content?.[0]?.text || '';
    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'AI 분석 중 오류가 발생했습니다.' });
  }
}

function buildBasicPrompt(saju, name, gender) {
  const { yeonju, wolju, ilju, siju, iljuInfo, ohaeng } = saju;
  const ohaengStr = Object.entries(ohaeng).map(([k,v]) => `${k}(${v})`).join(', ');

  return `당신은 한국 전통 사주명리학 전문가입니다. 아래 사주를 분석해주세요.

이름: ${name} (${gender}자)
사주팔자: 연주 ${yeonju} / 월주 ${wolju} / 일주 ${ilju} / 시주 ${siju}
일주 특성: ${iljuInfo.title} - ${iljuInfo.keyword}
오행 분포: ${ohaengStr}

다음 내용을 친근하고 공감가는 문체로 3~4단락으로 분석해주세요:
1. 이 사람의 핵심 성격과 타고난 에너지
2. 대인관계에서 보이는 특징
3. 2026년 현재 전반적인 운의 흐름

마크다운 없이 자연스러운 한국어 문장으로만 작성하세요. 각 단락은 줄바꿈으로 구분하세요.`;
}

function buildIljuPrompt(saju, name, gender) {
  const { yeonju, wolju, ilju, siju, iljuInfo, ohaeng } = saju;

  return `당신은 한국 전통 사주명리학 최고 전문가입니다. 아래 ${ilju}일주에 대해 깊이 있는 분석을 제공해주세요.

이름: ${name} (${gender}자)
사주팔자: 연주 ${yeonju} / 월주 ${wolju} / 일주 ${ilju} / 시주 ${siju}

다음 항목별로 상세하게 분석해주세요:

[성격과 기질]
타고난 성격, 내면의 욕구, 행동 패턴

[연애와 결혼]
이상형, 연애 스타일, 결혼운, 배우자 유형

[직업과 재물]
적성에 맞는 직업 분야, 재물운, 사업 가능성

[2026년 운세]
올해 전체 흐름, 상반기/하반기, 주의할 시기

[월별 운세 하이라이트]
3월~12월 중 특히 중요한 달 3개 선택하여 설명

마크다운 없이 자연스러운 한국어로 작성하되, 각 섹션 제목은 대괄호로 표시해주세요.`;
}

function buildReportPrompt(saju, name, gender) {
  const { yeonju, wolju, ilju, siju, iljuInfo, ohaeng, birthInfo } = saju;

  return `당신은 한국 최고의 사주명리학 전문가입니다. ${name}님의 사주를 바탕으로 종합 리포트를 작성해주세요.

사주: 연주 ${yeonju} / 월주 ${wolju} / 일주 ${ilju} / 시주 ${siju}
생년: ${birthInfo.year}년 (${gender}자)

아래 구조로 상세한 리포트를 작성해주세요:

[종합 사주 개요]
이 사람의 사주 전체를 관통하는 핵심 테마

[성격과 적성]
내면의 본질, 강점, 약점, 타인이 보는 모습

[대운 흐름 (5년)]
현재부터 5년간의 대운 흐름과 변화 시기

[2026년 세운 분석]
올해 전체 흐름, 기회의 시기, 주의 시기

[연애/결혼운]
현재 연애운, 인연이 오는 시기, 이상적 파트너

[재물/직업운]
올해 재물 흐름, 사업/투자 적기, 이직 타이밍

[건강운]
주의해야 할 신체 부위, 관리 포인트

[2026년 월별 운세]
1월부터 12월까지 간략한 월별 운세

[종합 조언]
이 사람에게 드리는 인생 조언

자연스러운 한국어로 작성하되 전문적이고 깊이 있게 써주세요. 마크다운 없이 섹션 제목은 대괄호로 표시해주세요.`;
}

function buildGunghapPrompt(saju1, saju2, name1, name2) {
  return `당신은 한국 전통 사주명리학 전문가입니다. 두 사람의 궁합을 분석해주세요.

${name1}: 일주 ${saju1.ilju} (${saju1.yeonju}년생)
${name2}: 일주 ${saju2.ilju} (${saju2.yeonju}년생)

아래 항목으로 궁합을 분석해주세요:

[오행 상성]
두 사람의 오행이 어떻게 작용하는지

[연애 궁합]
연애할 때 두 사람의 조화, 서로에게 끌리는 이유

[결혼 궁합]
결혼 후 가정 생활, 역할 분담, 장기적 관계

[갈등 포인트와 해결책]
어떤 부분에서 충돌할 수 있고 어떻게 극복할 수 있는지

[최적의 만남 시기]
2026년 이 두 사람에게 특별한 시기

자연스러운 한국어로 친근하게 작성해주세요.`;
}
