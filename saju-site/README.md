# 사주한잔 — AI 사주 분석 사이트

## 🚀 빠른 시작

### 1. 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일 생성:
```
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```
http://localhost:3000 에서 확인

### 4. 배포 (Vercel 추천)
```bash
npm install -g vercel
vercel
```
Vercel 환경변수에 ANTHROPIC_API_KEY 추가

---

## 📁 파일 구조
```
saju-site/
├── pages/
│   ├── index.js          # 메인 랜딩 + 입력 페이지
│   ├── result.js         # 사주 분석 결과 페이지
│   ├── gunghap.js        # 궁합 분석 페이지
│   └── api/
│       └── saju.js       # Claude API 연동 엔드포인트
├── lib/
│   └── saju-calculator.js # 사주팔자 계산 라이브러리
├── package.json
└── README.md
```

---

## 💰 수익화 연동

### 토스페이먼츠 결제 연동
```javascript
// pages/api/payment.js 추가 필요
// https://docs.tosspayments.com/guides/payment-widget/integration
```

### 가격 구조
| 상품 | 가격 |
|------|------|
| 기본 사주 | 무료 |
| 일주별 상세분석 | ₩9,900 |
| 궁합 분석 | ₩14,900 |
| AI 사주 리포트 (PDF) | ₩29,900 |

---

## 🔧 추가 개발 포인트

1. **PDF 생성**: `@react-pdf/renderer` 패키지로 리포트 PDF 자동 생성
2. **결제 연동**: 토스페이먼츠 또는 카카오페이
3. **이메일 발송**: 결제 완료 후 PDF 자동 발송 (nodemailer)
4. **카카오 로그인**: 재방문 시 이전 분석 조회
5. **SEO**: 일주별 정적 페이지 생성 (SSG)

---

## 📊 인스타 → 사이트 퍼널

```
릴스 CTA "무료 사주 보러가기"
  → 링크인바이오
    → saju.kr (메인)
      → 무료 기본 분석
        → 업셀 (유료 상세분석)
          → 결제 완료
            → PDF 이메일 발송
```
