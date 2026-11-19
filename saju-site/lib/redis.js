// Upstash Redis REST API 헬퍼
// 결제 완료 여부, 결제 전 임시 저장한 콘텐츠(stash), 회원 정보와 보관함을 저장하는 용도로 사용.
// 환경변수 KV_REST_API_URL, KV_REST_API_TOKEN (또는 UPSTASH_REDIS_REST_URL/TOKEN)이 Vercel에 설정되어 있어야 동작한다.

async function redisCommand(cmd) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('KV_REST_API_URL / KV_REST_API_TOKEN 환경변수가 설정되어 있지 않습니다.');
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

// 리스트 맨 앞에 JSON 하나를 넣고, 최대 max개만 남긴다 (보관함용)
async function pushJSON(key, value, max = 50) {
  await redisCommand(['LPUSH', key, JSON.stringify(value)]);
  await redisCommand(['LTRIM', key, '0', String(max - 1)]);
}

async function listJSON(key, start = 0, stop = 49) {
  const rows = (await redisCommand(['LRANGE', key, String(start), String(stop)])) || [];
  return rows.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

async function delKeys(...keys) {
  if (!keys.length) return 0;
  return redisCommand(['DEL', ...keys]);
}

module.exports = { redisCommand, setJSON, getJSON, pushJSON, listJSON, delKeys };
