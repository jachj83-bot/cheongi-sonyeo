import { useRouter } from 'next/router';

// 휴대폰에서만 보이는 하단 고정 탭. 사주아이처럼 어느 화면에서든 메뉴로 바로 이동.
const TABS = [
  { href: '/', label: '홈', match: p => p === '/' || p === '/result', d: 'M8 22 L24 9 L40 22 V40 H29 V29 H19 V40 H8 Z' },
  { href: '/gunghap', label: '궁합', match: p => p === '/gunghap', d: 'M24 40 C10 30 6 22 10 15 C14 9 21 10 24 16 C27 10 34 9 38 15 C42 22 38 30 24 40 Z' },
  { href: '/tarot', label: '타로', match: p => p === '/tarot', d: 'M12 8 H30 V40 H12 Z M22 6 L38 10 L32 42' },
  { href: '/sinnyeon?year=2027', label: '신년운세', match: p => p === '/sinnyeon' || p === '/tojeong' || p === '/tonghap', d: 'M24 4 L28 18 L42 20 L30 28 L34 42 L24 34 L14 42 L18 28 L6 20 L20 18 Z' },
  { href: '/my', label: '보관함', match: p => p.startsWith('/my'), d: 'M8 14 H40 V40 H8 Z M8 14 L13 7 H35 L40 14 M19 22 H29' },
];

export default function BottomTabs() {
  const { pathname } = useRouter();
  return (
    <nav className="btabs" aria-label="주요 메뉴">
      <style dangerouslySetInnerHTML={{ __html: `
        .btabs { display:none; }
        @media (max-width:760px) {
          .btabs { display:flex; position:fixed; left:0; right:0; bottom:0; z-index:950; background:rgba(11,10,31,0.96); backdrop-filter:blur(12px); border-top:1px solid rgba(232,200,126,0.14); padding:6px 4px calc(6px + env(safe-area-inset-bottom)); font-family:'Noto Sans KR',sans-serif; }
          .btabs a { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 0; text-decoration:none; color:rgba(237,233,242,0.45); font-size:10.5px; }
          .btabs a.on { color:#E8C87E; }
          body { padding-bottom:64px; }
          .ny-chip { bottom:80px !important; }
        }
      ` }} />
      {TABS.map(t => {
        const on = t.match(pathname);
        return (
          <a key={t.label} href={t.href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={t.d} /></svg>
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}
