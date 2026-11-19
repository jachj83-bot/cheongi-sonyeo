import { BUSINESS as B } from './business';

// 모든 페이지 맨 아래 공통 하단. 전자상거래법상 표시해야 하는 사업자 정보와 정책 링크.
export default function SiteFooter() {
  const rows = [
    ['상호', B.name],
    ['대표', B.owner],
    ['사업자등록번호', B.bizNo],
    ['통신판매업 신고', B.mailOrderNo],
    ['주소', B.address],
    ['문의', [B.email, B.phone].filter(Boolean).join(' / ')],
  ].filter(([, v]) => v);

  return (
    <footer className="site-footer">
      <style dangerouslySetInnerHTML={{ __html: `
        .site-footer { background:#08071a; border-top:1px solid rgba(232,200,126,0.1); padding:28px 20px 32px; font-family:'Noto Sans KR',sans-serif; color:rgba(237,233,242,0.42); font-size:11.5px; line-height:1.8; word-break:keep-all; }
        .site-footer-in { max-width:1100px; margin:0 auto; }
        .site-footer-links { display:flex; flex-wrap:wrap; gap:6px 16px; margin-bottom:12px; }
        .site-footer-links a { color:rgba(237,233,242,0.7); text-decoration:none; font-size:12px; }
        .site-footer-links a.strong { color:#E8C87E; font-weight:600; }
        .site-footer-biz span { display:inline-block; margin-right:12px; }
        .site-footer-note { margin-top:10px; color:rgba(237,233,242,0.3); }
      ` }} />
      <div className="site-footer-in">
        <div className="site-footer-links">
          <a href="/terms">이용약관</a>
          <a href="/privacy" className="strong">개인정보처리방침</a>
          <a href="/refund">환불 규정</a>
        </div>
        {rows.length > 0 && (
          <div className="site-footer-biz">
            {rows.map(([k, v]) => <span key={k}>{k} {v}</span>)}
          </div>
        )}
        <div className="site-footer-note">
          천기소녀의 풀이는 명리학과 타로를 바탕으로 한 참고용 콘텐츠예요. 건강, 법률, 투자 같은 중요한 결정은 전문가와 상의해 주세요.
        </div>
        <div className="site-footer-note">© 2026 {B.brand} · CHEONGI SONYEO</div>
      </div>
    </footer>
  );
}
