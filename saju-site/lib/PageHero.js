// 상품 페이지 맨 위 대표 그림 (메뉴 카드와 같은 그림)
export default function PageHero({ img, alt = '', accent = '#E8C87E' }) {
  return (
    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', aspectRatio: '16 / 9', marginBottom: '24px', border: `1px solid ${accent}66`, boxShadow: '0 10px 28px rgba(0,0,0,.5)', background: '#120f2a' }}>
      <img src={`/svc3/${img}.webp`} alt={alt} width="640" height="360" decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(11,10,31,.55))' }} />
    </div>
  );
}
