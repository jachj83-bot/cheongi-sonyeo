// 결과 화면 아래 "방금 입력한 사주 그대로 바로 보기" 카드 묶음.
// 생년월일을 주소에 실어 넘기고 auto=1을 붙여서, 다음 메뉴에서 다시 입력하지 않게 한다.
import { PRODUCTS } from './products';

const EXTRA = {
  sinnyeon: { title: '2027 신년운세', sub: '정미년 열두 달 흐름', img: 'y2027', price: 9900, href: '/sinnyeon?year=2027' },
  wolun: { title: '이번 달 나의 운세', sub: '좋은 날·조심할 날까지', img: 'month', price: 1900, href: '/wolun' },
};

export default function CrossSell({ birth = {}, exclude = [], items = ['vessel', 'love', 'sinnyeon', 'reunion'] }) {
  const keep = ['name', 'year', 'month', 'day', 'hour', 'gender', 'calendar', 'mbti'];
  const q = new URLSearchParams(Object.fromEntries(Object.entries(birth).filter(([k, v]) => keep.includes(k) && v)));
  if (!q.get('year')) return null;
  const list = items.filter(k => !exclude.includes(k)).slice(0, 4).map(k => {
    if (EXTRA[k]) {
      const e = EXTRA[k];
      // 신년운세는 주소의 year가 '보는 해'라서 생년월일은 by·bm·bd로 따로 넘긴다
      const qq = new URLSearchParams(q);
      if (k === 'sinnyeon') { qq.set('by', q.get('year')); qq.set('bm', q.get('month') || ''); qq.set('bd', q.get('day') || ''); qq.delete('year'); qq.delete('month'); qq.delete('day'); }
      const sep = e.href.includes('?') ? '&' : '?';
      return { key: k, ...e, href: `${e.href}${sep}${qq.toString()}` };
    }
    const p = PRODUCTS[k];
    return p && { key: k, title: p.title, sub: p.sub, img: p.img, price: p.price, href: `/unse/${k}?${q.toString()}&auto=1` };
  }).filter(Boolean);

  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>방금 본 내 사주, 더 궁금하다면</div>
      <div style={{ fontSize: '12px', color: 'rgba(237,233,242,.55)', marginBottom: '14px' }}>생년월일 다시 입력할 필요 없이 바로 이어서 볼 수 있어요</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
        {list.map(it => (
          <a key={it.key} href={it.href} style={{ display: 'block', textDecoration: 'none', background: '#17171b', border: '1px solid rgba(255,255,255,.08)', borderRadius: '10px', overflow: 'hidden' }}>
            <img src={`/svc3/${it.img}.webp`} alt={it.title} loading="lazy" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', filter: 'saturate(.85) brightness(.92)' }} />
            <div style={{ padding: '10px 10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{it.title}</div>
              <div style={{ fontSize: '11px', color: 'rgba(237,233,242,.5)', margin: '3px 0 6px' }}>{it.sub}</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#E8C87E' }}>₩{it.price.toLocaleString()}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
