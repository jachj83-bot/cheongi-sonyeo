export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, year, month, day, gender, type, me, partner } = req.body;

  let prompt = '';

  if (type === 'gunghap') {
    prompt = `사주 궁합 분석을 해주세요.

나: ${me.year}년 ${me.month}월 ${me.day}일생
상대방: ${partner.year}년 ${partner.month}월 ${partner.day}일생

다음 형식으로 분석해주세요:
1. 궁합 총점 (100점 만점)
2. 두 사람의 에너지 관계
3. 잘 맞는 부분
4. 주의해야 할 부분
5. 2026년 병오년 이 두 사람에게 조언

신비롭고 따뜻한 톤으로, 한국어로 작성해주세요.`;
  } else {
    prompt = `${name}님의 사주를 분석해주세요.

생년월일: ${year}년 ${month}월 ${day}일
성별: ${gender}자

다음 형식으로 분석해주세요:
1. 일주 분석 (태어난 날의 천간지지)
2. 기본 성격과 에너지
3. 2026년 병오년 운세
4. 재물운
5. 연애운
6. 올해 주의사항과 조언

신비롭고 따뜻한 톤으로, 천기소녀 캐릭터처럼 한국어로 작성해주세요. 첫 문장은 "하늘의 기운을 읽었습니다."로 시작해주세요.`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const result = data.content?.[0]?.text || '분석 결과를 가져올 수 없습니다.';
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
