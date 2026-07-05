# Stockfolio — 주식 포트폴리오 관리 웹

주식 포트폴리오를 관리하고 실시간 시세 정보를 확인할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- **대시보드** — 총 평가액, 손익, 수익률을 한눈에 확인
- **포트폴리오 관리** — 종목 추가/삭제, 보유 수량 및 평균 매입가 추적
- **종목 검색** — 티커 또는 회사명으로 주식 검색
- **종목 상세** — 현재가, 시가총액, 52주 고저가, 가격 차트
- **자산 배분** — 포트폴리오 구성 비율 시각화

## 기술 스택

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2) — 주식 시세 API
- [Recharts](https://recharts.org/) — 차트
- 브라우저 LocalStorage — 포트폴리오 데이터 저장

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

## 사용 방법

1. **종목 검색** 페이지에서 주식을 검색합니다 (예: `AAPL`, `TSLA`, `005930.KS`)
2. 보유 수량과 평균 매입가를 입력하고 포트폴리오에 추가합니다
3. **대시보드**에서 전체 포트폴리오 현황을 확인합니다
4. 종목명을 클릭하면 **상세 페이지**에서 차트와 추가 정보를 볼 수 있습니다

## 지원 종목

Yahoo Finance API를 통해 전 세계 주식을 지원합니다.

- 미국: `AAPL`, `MSFT`, `GOOGL` 등
- 한국: `005930.KS` (삼성전자), `000660.KS` (SK하이닉스) 등

## 데이터 저장

포트폴리오 데이터는 브라우저 LocalStorage에 저장됩니다. 별도의 서버나 계정이 필요하지 않습니다.

## 프로덕션 빌드

```bash
npm run build
npm start
```
