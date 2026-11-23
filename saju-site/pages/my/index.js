import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';
import { DAY_TYPES, ELEMENT_COLOR, TypeIcon } from '../../lib/dayTypes';

// 보관함 + 내 정보. 사주아이의 "보관함"처럼 내가 본 풀이가 계속 남는다.
export default function My() {
  const { data: session, status } = useSession();
  const [me, setMe] = useState(null);
  const [items, setItems] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/me').then(r => r.json()).then(setMe).catch(() => setMe({}));
    fetch('/api/vault').then(r => r.json()).then(d => setItems(d.items || [])).catch(() => setItems([]));
  }, [status]);

  const leave = async () => {
    setLeaving(true);
    try { await fetch('/api/me', { method: 'DELETE' }); } catch {}
    signOut({ callbackUrl: '/login' });
  };

  const b = me?.birth;
  const birthQuery = b ? '/result?' + new URLSearchParams({ name: b.name || session?.user?.name || '나', year: b.year, month: b.month, day: b.day, hour: b.hour || '모름', gender: b.gender || '여', calendar: b.calendar || '양력' }).toString() : null;
  const fmt = iso => { try { const d = new Date(iso); return `${d.getMonth() + 1}월 ${d.getDate()}일`; } catch { return ''; } };

  return (
    <>
      <Head>
        <title>보관함 | 천기소녀</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing:border-box; margin:0; padding:0; }
          body { background:#0B0A1F; color:#EDE9F2; font-family:'Noto Sans KR',sans-serif; word-break:keep-all; }
          .my { max-width:560px; margin:0 auto; padding:20px 16px 40px; }
          .my-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
          .my-top a { display:flex; align-items:center; gap:8px; color:#E8C87E; text-decoration:none; font-family:'Noto Serif KR',serif; font-weight:700; letter-spacing:2px; }
          .my-card { background:linear-gradient(180deg,rgba(40,34,72,.45),rgba(24,20,46,.55)); border:1px solid rgba(232,200,126,.15); border-radius:12px; padding:18px; margin-bottom:16px; }
          .my-hello { font-family:'Noto Serif KR',serif; font-size:20px; margin-bottom:4px; }
          .my-badge { display:inline-block; font-size:11px; border-radius:9px; padding:2px 8px; margin-left:6px; vertical-align:middle; }
          .my-dim { font-size:13px; color:rgba(237,233,242,.55); line-height:1.7; }
          .my-btn { display:inline-flex; align-items:center; justify-content:center; height:42px; padding:0 16px; border-radius:8px; font-size:14px; font-weight:700; text-decoration:none; font-family:inherit; cursor:pointer; border:1px solid rgba(232,200,126,.5); background:rgba(232,200,126,.12); color:#E8C87E; }
          .my-h { font-size:13px; letter-spacing:2px; color:rgba(232,200,126,.6); margin:22px 0 10px; }
          .my-item { display:flex; gap:12px; align-items:center; padding:14px; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(232,200,126,.1); margin-bottom:8px; text-decoration:none; color:inherit; }
          .my-item:active { background:rgba(232,200,126,.08); }
          .my-ico { width:42px; height:42px; flex:0 0 42px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:rgba(11,10,31,.6); border:1px solid rgba(232,200,126,.2); }
          .my-t { font-size:15px; font-weight:500; margin-bottom:2px; }
          .my-s { font-size:12px; color:rgba(237,233,242,.45); }
          .my-paid { font-size:10.5px; color:#0B0A1F; background:#E8C87E; border-radius:8px; padding:1px 6px; margin-left:6px; font-weight:700; }
          .my-foot { display:flex; gap:16px; justify-content:center; margin-top:28px; }
          .my-foot button { background:none; border:none; color:rgba(237,233,242,.45); font-size:13px; font-family:inherit; cursor:pointer; text-decoration:underline; }
          .my-warn { margin-top:12px; padding:14px; border-radius:10px; background:rgba(255,107,107,.08); border:1px solid rgba(255,107,107,.3); font-size:13px; line-height:1.7; }
          .my-warn button { margin-top:10px; margin-right:8px; height:38px; padding:0 14px; border-radius:8px; font-family:inherit; font-size:13px; cursor:pointer; }
        `}</style>
      </Head>
      <main className="my">
        <div className="my-top">
          <a href="/"><img src="/logo_symbol.png" alt="" width="24" height="24" />천기소녀</a>
        </div>

        {status === 'loading' && <p className="my-dim">불러오는 중...</p>}
        {status === 'unauthenticated' && (
          <div className="my-card">
            <img src="/svc/me.webp" alt="" width="640" height="482" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 10, marginBottom: 14, display: 'block' }} />
            <p className="my-dim" style={{ marginBottom: 12 }}>로그인하면 내가 본 풀이가 여기에 계속 남아요.</p>
            <a className="my-btn" href="/login?callbackUrl=%2Fmy">로그인하기</a>
          </div>
        )}

        {status === 'authenticated' && (
          <>
            <div className="my-card">
              <div className="my-hello">
                {session.user?.name || '천기소녀 회원'}님
                <span className="my-badge" style={session.user?.provider === 'kakao' ? { background: '#FEE500', color: '#191919' } : { background: '#fff', color: '#1f1f1f' }}>
                  {session.user?.provider === 'kakao' ? '카카오' : '구글'}
                </span>
              </div>
              {b ? (
                <>
                  <p className="my-dim" style={{ marginBottom: 12 }}>내 생년월일 · {b.calendar} {b.year}.{b.month}.{b.day} · {b.hour} · {b.gender ? b.gender + '자' : ''}</p>
                  <a className="my-btn" href={birthQuery}>내 사주 다시 보기</a>
                </>
              ) : (
                <>
                  <p className="my-dim" style={{ marginBottom: 12 }}>처음 사주를 보면 생년월일이 저장돼서 다음부터는 입력 없이 바로 볼 수 있어요.</p>
                  <a className="my-btn" href="/#start">무료로 내 사주 보기</a>
                </>
              )}
            </div>

            <div className="my-h">보관함</div>
            {items === null && <p className="my-dim">불러오는 중...</p>}
            {items && items.length === 0 && <p className="my-dim">아직 저장된 풀이가 없어요. 사주나 운세를 보면 여기에 자동으로 남아요.</p>}
            {items && items.map(it => {
              const t = it.gan && DAY_TYPES[it.gan];
              return (
                <a key={it.id} href={`/my/${it.id}`} className="my-item">
                  <span className="my-ico">{t ? <TypeIcon gan={it.gan} size={26} /> : <img src="/logo_symbol.png" alt="" width="22" height="22" />}</span>
                  <span style={{ minWidth: 0 }}>
                    <div className="my-t">{it.title}{it.paid && <span className="my-paid">유료</span>}</div>
                    <div className="my-s">{[t ? <span key="t" style={{ color: ELEMENT_COLOR[t.el] }}>{t.name}</span> : null, it.subtitle, fmt(it.savedAt)].filter(Boolean).reduce((a, x, i) => i ? [...a, ' · ', x] : [x], [])}</div>
                  </span>
                </a>
              );
            })}

            <div className="my-foot">
              <button onClick={() => signOut({ callbackUrl: '/login' })}>로그아웃</button>
              <button onClick={() => setConfirmLeave(true)}>회원 탈퇴</button>
            </div>
            {confirmLeave && (
              <div className="my-warn">
                탈퇴하면 저장된 생년월일과 보관함이 바로 지워지고 되돌릴 수 없어요. 결제 기록은 법에 따라 결제대행사에 따로 보관돼요.
                <div>
                  <button onClick={leave} disabled={leaving} style={{ background: '#ff6b6b', color: '#fff', border: 'none' }}>{leaving ? '지우는 중...' : '탈퇴하기'}</button>
                  <button onClick={() => setConfirmLeave(false)} style={{ background: 'transparent', color: '#EDE9F2', border: '1px solid rgba(237,233,242,.3)' }}>취소</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
