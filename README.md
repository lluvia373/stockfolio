# Stockfolio

개인 투자자용 포트폴리오 앱. 웹 완성 → 모바일 앱 → iOS/Android 상용 출시가 목표.

## 바로가기

- 웹: https://stockfolio-ashen.vercel.app/
- GitHub: https://github.com/lluvia373/stockfolio

## 지금 할 일

- [x] 미국/한국 주식 기록
- [x] 과거 거래일 기준 매수·매도 기록
- [x] KRW / USD 표시 전환
- [x] 매수 당시 환율 + 현재 환율로 환차손익 계산
- [x] Vercel 자동 배포
- [ ] **2. Google 로그인 ← 현재 작업**
  - [x] Google 로그인 UI / 로그아웃 코드
  - [x] Google 사용자별 LocalStorage 분리
  - [x] 기존 브라우저 데이터는 첫 로그인 계정으로 1회 이전
  - [ ] Supabase 프로젝트 생성
  - [ ] Google OAuth Client ID/Secret 생성 후 Supabase Google Provider 연결
  - [ ] Vercel에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 등록
  - [ ] 실제 Google 로그인 Production 확인
- [ ] 3. 데이터 백업·복구
- [ ] 4. 거래 수정 / 삭제 확인 / 되돌리기
- [ ] 5. 로그인 사용자 데이터를 서버 DB로 이전 + 기기간 동기화
- [ ] 6. 대시보드 / 포트폴리오 화면 역할 정리
- [ ] 7. 시세 조회 실패 / 마지막 갱신 시각 표시
- [ ] 8. 거래 페이지 이름·경로 정리
- [ ] 9. 모바일 UI 최적화
- [ ] 10. iOS / Android 앱 제작 및 스토어 출시

## 로그인 방향

- 웹은 **Google 로그인 하나로 시작**한다.
- 별도 Stockfolio 아이디/비밀번호는 만들지 않는다.
- 현재는 로그인한 Google 사용자마다 브라우저 저장공간을 분리한다.
- 이후 서버 DB를 붙이면 같은 Google 계정으로 PC/아이폰/안드로이드에서 같은 포트폴리오를 보게 한다.
- iOS App Store 출시 시 Google 같은 소셜 로그인을 주 계정 로그인으로 쓰면 Apple 심사 규칙상 동등한 개인정보 보호형 로그인 옵션도 필요할 수 있으므로 **출시 단계에서 Sign in with Apple을 추가**한다.

## 통화 계산 원칙

- 종목 가격은 실제 시장 통화로 저장.
- 포트폴리오는 `₩ KRW` / `$ USD` 중 선택.
- **매입원가 = 거래 당시 환율**
- **현재 평가액 = 현재 환율**
- 환차익·환차손까지 선택 통화 기준 손익에 포함.

## 출시 전 반드시 해결

### 주가·환율 데이터 라이선스

현재 `yahoo-finance2`는 개발용. 유료 출시 전 상업적 외부 표시 권한을 계약/서면으로 확인한 공급자로 교체한다.

후보:
- Twelve Data Business
- EODHD
- 한국 실시간 시세가 필요하면 KRX / Koscom 정식 계약

**유료 앱 사용자에게 주가/환율을 표시할 수 있다는 권한이 확인되기 전에는 유료 출시하지 않는다.**

## 수익모델

기본은 **무료 + 광고 / 유료 = 광고 제거**.

- 무료: 광고 표시
- 유료: 광고 제거
- 추후 유료 기능에 기기간 동기화 / 고급 분석 등을 추가 가능
- 유료결제 계산은 일단 결제액의 약 15%를 스토어 몫으로 잡고 계획
- 광고는 사용자 수보다 `광고 노출수 × eCPM`이 핵심

## 개발 방식

큰 수정은 `별도 브랜치 → Vercel Preview 성공 → main 병합 → Production 확인` 순서.
