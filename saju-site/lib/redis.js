// Upstash Redis REST API 헬퍼
// 결제 완료 여부, 결제 전 임시 저장한 콘텐츠(stash) 등을 저장하는 용도로 사용.
// 환경변수 UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN이 Vercel에 설정되어 있어야 동작한다.

async function redisCommand(cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN 환경변수가 설정되어 있지 않습니다.');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// value를 JSON 문자열로 직렬화해서 저장. exSeconds가 있으면 그 초만큼 지나면 자동 만료.
async function setJSON(key, value, exSeconds) {
  const str = JSON.stringify(value);
  const cmd = exSeconds ? ['SET', key, str, 'EX', String(exSeconds)] : ['SET', key, str];
  return redisCommand(cmd);
}

async function getJSON(key) {
  const result = await redisCommand(['GET', key]);
  if (result === null || result === undefined) return null;
  try {
    return JSON.parse(result);
  } catch {
    return null;
  }
}

module.exports = { setJSON, getJSON };
