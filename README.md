# Stockfolio

주식 포트폴리오를 관리하고 시세와 주요 정보를 확인하기 위한 개인용 웹 애플리케이션입니다.

## 바로가기

- **GitHub 저장소**: https://github.com/lluvia373/stockfolio
- **공개 웹 페이지**: Vercel에 배포되어 운영 중입니다. 정확한 Production URL은 아래 배포 정보에 기록합니다.
- **Vercel 배포 페이지**: https://vercel.com/lluvia7531-9475s-projects/stockfolio/8UaWVsUTvNev1uirJDZ6xp8DxqGX
- **로컬 확인 주소**: http://localhost:3000
- **기본 브랜치**: `main`

## 현재 개발 방식

이 프로젝트는 초기에는 Cursor를 이용해 개발했으며, 현재부터는 ChatGPT 대화에서 요구사항을 정하고 연결된 GitHub 저장소를 직접 확인·수정하는 흐름을 기본으로 사용합니다.

기본 작업 흐름은 다음과 같습니다.

1. ChatGPT에서 원하는 기능이나 수정 사항을 자연어로 요청합니다.
2. 필요한 기존 코드를 확인하고 수정합니다.
3. 변경 내용을 GitHub `main` 브랜치에 반영합니다.
4. GitHub에 반영된 변경 사항은 연결된 Vercel 배포를 통해 웹에 반영됩니다.
5. 공개 웹 주소에서 직접 화면을 확인한 뒤 다음 수정 사항을 이어갑니다.

즉, 앞으로는 **요청 → GitHub 수정 → Vercel 배포 → 브라우저 확인 → 추가 수정**의 반복을 기본 개발 방식으로 사용합니다.

## 배포

배포 플랫폼은 **Vercel**입니다.

현재 상태:

- GitHub 저장소 연결: 완료
- Vercel 배포: 완료
- GitHub 최신 커밋의 Vercel 배포 상태: 성공
- Production URL: Vercel에서 실제 접속 중인 주소를 확인해 이 항목에 고정 기록 예정

```text
ChatGPT에서 수정 요청
        ↓
GitHub main 반영
        ↓
Vercel 배포
        ↓
공개 웹 페이지에서 확인
```

## 주요 기능

- **대시보드** — 총 평가액, 손익, 수익률 확인
- **포트폴리오 관리** — 종목 추가/삭제, 보유 수량 및 평균 매입가 추적
- **종목 검색** — 티커 또는 회사명으로 주식 검색
- **종목 상세** — 현재가, 시가총액, 52주 고저가, 가격 차트
- **자산 배분** — 포트폴리오 구성 비율 시각화

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- yahoo-finance2 — 주식 시세 데이터
- Recharts — 차트
- 브라우저 LocalStorage — 포트폴리오 데이터 저장

## 로컬 실행

```bash
npm install
npm run dev
```

실행 후 브라우저에서 http://localhost:3000 을 열어 확인합니다.

## 사용 방법

1. **종목 검색** 페이지에서 주식을 검색합니다. 예: `AAPL`, `TSLA`, `005930.KS`
2. 보유 수량과 평균 매입가를 입력하고 포트폴리오에 추가합니다.
3. **대시보드**에서 전체 포트폴리오 현황을 확인합니다.
4. 종목명을 클릭하면 **상세 페이지**에서 차트와 추가 정보를 확인합니다.

## 지원 종목

Yahoo Finance 데이터를 통해 여러 시장의 종목을 조회합니다.

- 미국: `AAPL`, `MSFT`, `GOOGL` 등
- 한국: `005930.KS`, `000660.KS` 등

## 데이터 저장

현재 포트폴리오 데이터는 브라우저 LocalStorage에 저장됩니다. 따라서 사용하는 브라우저와 기기에 따라 저장 내용이 달라질 수 있습니다.

## 프로덕션 빌드

```bash
npm run build
npm start
```
