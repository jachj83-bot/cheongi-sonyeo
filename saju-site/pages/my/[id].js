import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { DAY_TYPES, ELEMENT_COLOR, TypeIcon } from '../../lib/dayTypes';

const SECTION_EMOJI = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
function sections(text) {
  const out = []; let cur = '';
  (text || '').replace(/\*\*/g, '').replace(/^#{1,3}\s*/gm, '').split('\n').forEach(line => {
    if (SECTION_EMOJI.test(line.trim()) && cur.trim()) { out.push(cur.trim()); cur = line + '\n'; } else cur += line + '\n';
  });
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// 보관함에 저장된 풀이 하나 다시 보기 (AI를 다시 부르지 않고 저장된 글 그대로)
export default function VaultItem() {
  const { query, isReady } = useRouter();
  const [it, setIt] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!isReady) return;
    fetch('/api/vault?id=' + encodeURIComponent(query.id))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setIt)
      .catch(() => setErr('풀이를 찾을 수 없어요. 보관함에서 다시 골라 주세요.'));
  }, [isReady, query.id]);

  const t = it?.gan && DAY_TYPES[it.gan];
  const col = t ? ELEMENT_COLOR[t.el] : '#E8C87E';

  return (
    <>
      <Head>
        <title>{it ? `${it.title} | 천기소녀` : '보관함 | 천기소녀'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing:border-box; margin:0; padding:0; }
          body { background:#1a0a00; color:#f0e6d3; font-family:'Noto Sans KR',sans-serif; word-break:keep-all; }
          .vi { max-width:600px; margin:0 auto; padding:18px 16px 40px; }
          .vi-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
          .vi-top a { color:#e8c97a; text-decoration:none; font-size:14px; }
          .vi-head { background:#1f0a00; border:1px solid #3d1500; border-radius:10px; padding:18px; margin-bottom:16px; text-align:center; }
          .vi-b { display:flex; gap:10px; align-items:flex-start; margin-bottom:14px; }
          .vi-b > div { background:#2d1500; border:1px solid #3d1500; border-radius:4px 14px 14px 14px; padding:14px 16px; font-size:15px; line-height:1.8; white-space:pre-wrap; }
        `}</style>
      </Head>
      <main className="vi">
        <div className="vi-top">
          <a href="/my">← 보관함</a>
          <a href="/">천기소녀</a>
        </div>
        {err && <p style={{ color: '#c4956a' }}>{err}</p>}
        {!it && !err && <p style={{ color: '#c4956a' }}>불러오는 중...</p>}
        {it && (
          <>
            <div className="vi-head">
              {t && <div style={{ marginBottom: 8 }}><TypeIcon gan={it.gan} size={54} style={{ filter: `drop-shadow(0 0 6px ${col})` }} /></div>}
              {t && <div style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 900, color: col }}>{t.name}</div>}
              <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, color: '#e8c97a', marginTop: 4 }}>{it.title}</div>
              {it.subtitle && <div style={{ fontSize: 13, color: '#a08060', marginTop: 4 }}>{it.subtitle}</div>}
            </div>
            {sections(it.text).map((s, i) => (
              <div key={i} className="vi-b">
                <img src="/logo_symbol.png" alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #3d1500', background: '#2d1500', padding: 4, flexShrink: 0 }} />
                <div>{s}</div>
              </div>
            ))}
          </>
        )}
      </main>
    </>
  );
}
