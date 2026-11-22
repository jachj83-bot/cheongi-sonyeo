import { useEffect, useState } from 'react';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DAY_TYPES, TYPE_ORDER, ELEMENT_COLOR, TypeIcon } from '../lib/dayTypes';
import { hasKakao, hasGoogle, authEnabled } from '../lib/auth';

// 사주아이처럼 첫 화면에서 바로 로그인. 카카오는 인스타·카톡 안 브라우저에서도 되고,
// 구글은 인스타·카톡 안 브라우저에서 막히므로 바깥 브라우저로 여는 길을 따로 안내한다.
// 로그인 화면은 미리 만들어 둔 정적 페이지로 내보내서 바로 뜨게 한다 (서버 대기 없음).
// 카카오·구글 키 유무는 배포할 때 정해지고, 키를 바꾸면 다시 배포하면 된다.
export async function getStaticProps() {
  return { props: { enabled: authEnabled(), kakao: hasKakao(), google: hasGoogle() } };
}

function inAppBrowser(ua) {
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/KAKAOTALK/i.test(ua)) return 'kakaotalk';
  if (/FBAN|FBAV|FB_IAB|Line\/|NAVER\(inapp|everytimeApp|DaumApps/i.test(ua)) return 'inapp';
  return '';
}

export default function Login({ enabled, kakao, google }) {
  const router = useRouter();
  const { query } = router;
  // 로그인이 꺼져 있으면 원래 가려던 곳으로 바로 보낸다
  useEffect(() => { if (!enabled && router.isReady) router.replace(callbackUrl); }, [enabled, router.isReady]);
  const callbackUrl = typeof query.callbackUrl === 'string' && query.callbackUrl.startsWith('/') ? query.callbackUrl : '/';
  const error = typeof query.error === 'string' ? query.error : '';
  const [inApp, setInApp] = useState('');
  const [android, setAndroid] = useState(false);
  const [busy, setBusy] = useState('');
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    setInApp(inAppBrowser(ua));
    setAndroid(/Android/i.test(ua));
  }, []);

  // 친구가 공유한 링크로 들어왔으면 그 타입을 보여준다
  const shared = (() => {
    try { const g = new URL('https://x' + callbackUrl).searchParams.get('type'); return g && DAY_TYPES[g] ? DAY_TYPES[g] : null; } catch { return null; }
  })();

  const go = (p) => { setBusy(p); signIn(p, { callbackUrl }); };

  const googleClick = () => {
    if (!inApp) return go('google');
    if (inApp === 'kakaotalk') {
      // 카카오톡 인앱 브라우저는 이 주소로 바깥 브라우저를 열어준다
      window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(window.location.href);
      return;
    }
    if (android) {
      const u = window.location.href.replace(/^https?:\/\//, '');
      window.location.href = `intent://${u}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    setGuide(true);
  };

  return (
    <>
      <Head>
        <title>천기소녀 — 로그인</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing:border-box; margin:0; padding:0; }
          body { background:#0B0A1F; color:#EDE9F2; font-family:'Noto Sans KR',sans-serif; word-break:keep-all; }
          .lg { min-height:100vh; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; padding:20px 20px 32px; }
          .lg-bg { position:absolute; inset:0; background:url(/hero_cosmos.jpg) center/cover; opacity:.35; }
          .lg-in { position:relative; width:100%; max-width:400px; display:flex; flex-direction:column; align-items:center; text-align:center; }
          .lg-logo { display:flex; align-items:center; gap:8px; font-family:'Cormorant Garamond','Noto Serif KR',serif; font-size:20px; color:#E8C87E; letter-spacing:2px; margin-bottom:16px; }
          .lg-girl { width:96px; border-radius:6px; box-shadow:0 0 40px rgba(232,200,126,.25); margin-bottom:16px; }
          .lg h1 { font-family:'Noto Serif KR',serif; font-size:24px; line-height:1.45; margin-bottom:10px; }
          .lg h1 b { color:#E8C87E; }
          .lg-sub { font-size:13px; color:rgba(237,233,242,.55); line-height:1.7; margin-bottom:16px; }
          .lg-shared { width:100%; background:rgba(232,200,126,.08); border:1px solid rgba(232,200,126,.3); border-radius:10px; padding:11px 14px; font-size:14px; margin-bottom:16px; }
          .lg-types { display:flex; gap:4px; justify-content:center; flex-wrap:nowrap; margin-bottom:20px; }
          .lg-types span { display:inline-flex; }
          .lg-btn { width:100%; height:52px; border:none; border-radius:10px; font-size:15px; font-weight:700; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:10px; }
          .lg-kakao { background:#FEE500; color:rgba(0,0,0,.85); }
          .lg-google { background:#fff; color:#1f1f1f; }
          .lg-btn:disabled { opacity:.6; }
          .lg-note { font-size:11.5px; color:rgba(237,233,242,.4); margin-top:6px; line-height:1.7; }
          .lg-note a { color:rgba(237,233,242,.6); }
          .lg-err { width:100%; font-size:13px; color:#ffb4a8; background:rgba(255,107,107,.08); border-radius:8px; padding:10px 12px; margin-bottom:12px; }
          .lg-guide { width:100%; text-align:left; font-size:13px; line-height:1.7; background:rgba(255,255,255,.05); border:1px solid rgba(232,200,126,.2); border-radius:10px; padding:12px 14px; margin-bottom:10px; }
        `}</style>
      </Head>
      <main className="lg">
        <div className="lg-bg" aria-hidden="true" />
        <div className="lg-in">
          <div className="lg-logo"><img src="/logo_symbol.png" alt="" width="26" height="26" />천기소녀</div>
          <img className="lg-girl" src="/oracle_girl.jpg" alt="천기소녀" />
          <h1>궁중에 태어났다면<br />나는 <b>누구</b>였을까</h1>
          <p className="lg-sub">로그인하면 무료로 내 타입과 사주를 보고,<br />결과는 보관함에 계속 남아요.</p>
          {shared && <div className="lg-shared">친구는 <b style={{ color: ELEMENT_COLOR[shared.el] }}>{shared.name}</b>이 나왔어요. 나는?</div>}
          <div className="lg-types" aria-hidden="true">
            {TYPE_ORDER.map(g => <span key={g}><TypeIcon gan={g} size={28} strokeWidth={1.4} /></span>)}
          </div>

          {error && <div className="lg-err">로그인이 끝나지 않았어요. 한 번 더 눌러 주세요.</div>}

          {kakao && (
            <button className="lg-btn lg-kakao" onClick={() => go('kakao')} disabled={!!busy}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#000" d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.86 5.27 4.66 6.7-.2.75-.74 2.7-.85 3.12-.13.52.19.51.4.37.17-.11 2.65-1.8 3.72-2.53.67.1 1.36.15 2.07.15 5.52 0 10-3.58 10-8S17.52 3 12 3z" /></svg>
              {busy === 'kakao' ? '카카오로 이동 중...' : '카카오로 3초 만에 시작하기'}
            </button>
          )}
          {google && (
            <button className="lg-btn lg-google" onClick={googleClick} disabled={!!busy}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>
              {busy === 'google' ? '구글로 이동 중...' : '구글로 시작하기'}
            </button>
          )}
          {guide && (
            <div className="lg-guide">
              인스타 안에서는 구글 로그인이 막혀 있어요.<br />
              오른쪽 위 <b>⋯</b> 버튼을 누르고 <b>외부 브라우저로 열기</b>를 고른 뒤 다시 눌러 주세요. 카카오는 여기서 바로 돼요.
            </div>
          )}
          <p className="lg-note">
            시작하면 <a href="/terms">이용약관</a>과 <a href="/privacy">개인정보처리방침</a>에 동의하는 걸로 봐요.<br />
            카카오는 닉네임, 구글은 이름과 이메일만 받아요.
          </p>
        </div>
      </main>
    </>
  );
}

// 로그인 화면에는 공통 하단 탭을 붙이지 않는다
Login.bare = true;
