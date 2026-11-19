import { pushJSON } from './redis';

// 보관함에 풀이 하나를 저장 (최대 50개 유지)
export async function saveToVault(uid, { kind, title, subtitle, input, gan, text, paid }) {
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    kind: String(kind).slice(0, 20),
    title: String(title || '').slice(0, 60),
    subtitle: String(subtitle || '').slice(0, 80),
    input: input || null,
    gan: gan || null,
    paid: !!paid,
    text: String(text).slice(0, 20000),
    savedAt: new Date().toISOString(),
  };
  await pushJSON(`vault:${uid}`, item, 50);
  return item;
}
