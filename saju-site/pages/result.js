import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const OHAENG_COLOR = {
  '목': '#4a9e4a', '화': '#e05a2b', '토': '#c4962a',
  '금': '#a0a0c0', '수': '#3a7ab8'
};

const CHEONGAN_OHAENG = {
  '갑':'목','을':'목','병':'화','정':'화','무':'토',
  '기':'토','경':'금','신':'금','임':'수','계':'수'
};
const JIJI_OHAENG = {
  '자':'수','축':'토','인':'목','묘':'목','진':'토','사':'화',
  '오':'화','미':'토','신':'금','유':'금','술':'토','해':'수'
};

export default function Result() {
  const router = useRouter();
  const [result, setResult] = useState('');
  const [sajuData, setSajuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const { name, year, month, day, hour, gender, calendar } = router.query;
    if (!name) return;
    fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, year, month, day, hour, gender, calendar })
    })
      .then(r => r.json())
      .then(data => {
        setResult(data.result || '분석 결과를 불러올 수 없습니다.');
        setSajuData(data.sajuData || null);
        setLoading(false);
      })
      .catch(() => {
        setResult('잠시 후 다시 시도해주세요.');
        setLoading(false);
      });
  }, [router.isReady]);

  const { name, year, month, day } = router.query;

  const PillarCard = ({ label, pillar, sipsin }) => {
    if (!pillar) return null;
    const gan = pillar[0];
    const ji = pillar[1];
    const ganOhaeng = CHEONGAN_OHAENG[gan];
    const jiOhaeng = JIJI_OHAENG[ji];
    return (
      <div style={{flex:1,textAlign:'center',minWidth:0}}>
        <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'6px',letterSpacing:'1px'}}>{label}</div>
        {sipsin && <div style={{fontSize:'11px',color:'#c4956a',marginBottom:'4px'}}>{sipsin.ganSipsin}</div>}
        <div style={{background:`${OHAENG_COLOR[ganOhaeng]}22`,border:`1.5px solid ${OHAENG_COLOR[ganOhaeng]}`,borderRadius:'6px',padding:'10px 4px',marginBottom:'4px'}}>
          <div style={{fontSize:'22px',fontWeight:'900',color:OHAENG_COLOR[ganOhaeng],fontFamily:'serif'}}>{gan}</div>
          <div style={{fontSize:'10px',color:OHAENG_COLOR[ganOhaeng],opacity:0.8}}>+{ganOhaeng}</div>
        </div>
        <div style={{background:`${OHAENG_COLOR[jiOhaeng]}22`,border:`1.5px solid ${OHAENG_COLOR[jiOhaeng]}`,borderRadius:'6px',padding:'10px 4px',marginBottom:'4px'}}>
          <div style={{fontSize:'22px',fontWeight:'900',color:OHAENG_COLOR[jiOhaeng],fontFamily:'serif'}}>{ji}</div>
          <div style={{fontSize:'10px',color:OHAENG_COLOR[jiOhaeng],opacity:0.8}}>+{jiOhaeng}</div>
        </div>
        {sipsin && <div style={{fontSize:'11px',color:'#9070a0',marginTop:'4px'}}>{sipsin.jiSipsin}</div>}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>사주 결과 — 천기소녀</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`* {box-sizing:border-box;margin:0;padding:0;} body {background:#1a0a00;color:#f0e6d3;font-family:'Noto Sans KR',sans-serif;}`}</style>
      </Head>

      <div style={{minHeight:'100vh',background:'#1a0a00'}}>
        {/* 헤더 */}
        <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(26,10,0,0.97)',backdropFilter:'blur(10px)',borderBottom:'1px solid #3d1500',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a href="/" style={{color:'#e8c97a',fontSize:'18px',fontWeight:'900',textDecoration:'none',fontFamily:'serif',letterSpacing:'2px'}}>🔮 천기소녀</a>
        </div>

        <div style={{maxWidth:'600px',margin:'0 auto',padding:'28px 20px 80px'}}>

          {/* 이름/날짜 */}
          <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
            <h2 style={{fontFamily:'serif',fontSize:'20px',color:'#e8c97a',marginBottom:'4px'}}>{name}님의 사주</h2>
            <p style={{color:'#7a5030',fontSize:'14px'}}>{year}년 {month}월 {day}일생</p>
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:'48px',marginBottom:'20px'}}>🔮</div>
              <p style={{fontSize:'16px',color:'#c4956a'}}>천기소녀가 하늘의 기운을 읽고 있어요...</p>
              <p style={{fontSize:'13px',color:'#7a5030',marginTop:'8px'}}>잠시만 기다려주세요</p>
            </div>
          ) : (
            <>
              {/* 사주원국 표 */}
              {sajuData && (
                <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'6px',padding:'20px',marginBottom:'20px'}}>
                  <div style={{textAlign:'center',fontFamily:'serif',fontSize:'14px',color:'#e8c97a',marginBottom:'16px',letterSpacing:'2px'}}>✦ 사주원국 ✦</div>

                  {/* 주 레이블 */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                    {['시주','일주','월주','년주'].map(l=>(
                      <div key={l} style={{flex:1,textAlign:'center',fontSize:'11px',color:'#7a5030',letterSpacing:'1px'}}>{l}</div>
                    ))}
                  </div>

                  {/* 천간/지지 카드 */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
                    {[
                      {label:'시주', pillar:sajuData.pillars.hour, sipsin:sajuData.sipsin?.[3]},
                      {label:'일주', pillar:sajuData.pillars.day, sipsin:sajuData.sipsin?.[2]},
                      {label:'월주', pillar:sajuData.pillars.month, sipsin:sajuData.sipsin?.[1]},
                      {label:'년주', pillar:sajuData.pillars.year, sipsin:sajuData.sipsin?.[0]},
                    ].map((p,i)=>(
                      <PillarCard key={i} {...p} />
                    ))}
                  </div>

                  {/* 오행 강약 바 */}
                  <div style={{borderTop:'1px solid #3d1500',paddingTop:'14px'}}>
                    <div style={{fontSize:'11px',color:'#7a5030',marginBottom:'10px',letterSpacing:'1px',textAlign:'center'}}>오행 강약</div>
                    {Object.entries(sajuData.strength).map(([k,v])=>(
                      <div key={k} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                        <div style={{width:'20px',fontSize:'12px',color:OHAENG_COLOR[k],fontWeight:'700'}}>{k}</div>
                        <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'4px',height:'8px',overflow:'hidden'}}>
                          <div style={{width:`${Math.min(v/6*100,100)}%`,height:'100%',background:OHAENG_COLOR[k],borderRadius:'4px',transition:'width 0.5s'}} />
                        </div>
                        <div style={{width:'24px',fontSize:'11px',color:'#c4956a',textAlign:'right'}}>{v}</div>
                      </div>
                    ))}
                    <div style={{textAlign:'center',marginTop:'10px'}}>
                      <span style={{fontSize:'12px',color:'#e8c97a',background:'rgba(139,46,0,0.3)',padding:'3px 12px',borderRadius:'10px',border:'1px solid #3d1500'}}>{sajuData.singang} 사주</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 분석 결과 */}
              <div style={{background:'#1f0a00',border:'1px solid #3d1500',borderRadius:'6px',padding:'24px',marginBottom:'20px',lineHeight:'1.9',fontSize:'15px',whiteSpace:'pre-wrap',color:'#f0e6d3'}}>
                {result}
              </div>

              {/* 유료 CTA */}
              <div style={{background:'#2d0f00',border:'1px solid #8b2e00',borderRadius:'6px',padding:'24px',textAlign:'center',marginBottom:'16px'}}>
                <div style={{fontFamily:'serif',fontSize:'18px',color:'#e8c97a',marginBottom:'8px'}}>✦ 더 깊은 분석이 궁금하신가요? ✦</div>
                <p style={{color:'#7a5030',fontSize:'13px',marginBottom:'20px'}}>일주 상세분석 · 궁합 분석 · AI 리포트 PDF</p>
                <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
                  <button style={{background:'#8b2e00',color:'#e8c97a',padding:'12px 24px',border:'1.5px solid #c4712a',borderRadius:'4px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'serif'}}>
                    일주 상세분석 ₩9,900
                  </button>
                  <button style={{background:'transparent',color:'#c49ae8',padding:'12px 24px',border:'1px solid #3d1560',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
                    궁합 분석 ₩14,900
                  </button>
                </div>
              </div>

              <button onClick={()=>router.push('/')} style={{width:'100%',background:'none',border:'1px solid #3d1500',color:'#7a5030',padding:'14px',borderRadius:'4px',fontSize:'14px',cursor:'pointer'}}>
                처음으로 돌아가기
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
