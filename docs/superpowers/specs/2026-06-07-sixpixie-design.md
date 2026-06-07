# sixpixie Design Spec

**Date:** 2026-06-07

## Overview

sixpixie는 퇴근 시간 직전에 지하철 실시간 도착 정보를 Discord DM으로 알려주는 봇이다. 한국 평일(공휴일 제외)에만 동작하며, 역까지 빨리 걸어갈지 말지를 판단할 수 있도록 다음 열차 2개의 도착 예정 시간을 보여준다.

## Architecture

두 개의 독립된 컴포넌트로 구성된다.

```
[Discord]
    │
    ├─ 슬래시 커맨드 ──→ [Cloudflare Worker]
    │                         │ 설정 읽기/쓰기
    │                         ↓
    │                   [Cloudflare KV]
    │                         ↑ 설정 읽기
    └─ DM 수신 ────────── [GitHub Actions]
                           cron: 평일 08:55 UTC (= 17:55 KST)
                           ① 공휴일 체크
                           ② 지하철 API 조회
                           ③ Discord DM 전송
```

**알림 시간 변경:** GitHub Actions YAML의 cron 표현식을 직접 수정한다. 슬래시 커맨드로 시간을 동적으로 바꾸는 것은 구현 복잡도에 비해 실용적이지 않아 제외한다.

## Config Schema

Cloudflare KV에 Discord 유저 ID를 키로 저장한다.

```json
{
  "departure_station": "성균관대",
  "line": "1",
  "direction": "하행",
  "destination_station": "수원"
}
```

`destination_station`은 API 필터링에 사용되지 않고 알림 메시지의 컨텍스트 표시용이다.

## Components

### 1. GitHub Actions (Scheduled Notification)

- **Cron:** `55 8 * * 1-5` (UTC 기준 평일 08:55 = KST 17:55, YAML에서 변경 가능)
- **실행 순서:**
  1. Python `holidays` 라이브러리로 오늘이 한국 공휴일인지 확인 → 공휴일이면 종료
  2. Cloudflare KV REST API로 전체 유저 설정 조회
  3. 각 유저의 출발역으로 서울 지하철 실시간 도착정보 API 호출
  4. 호선 + 방향으로 필터링, 다음 열차 최대 4개 추출
  5. Discord Bot API로 각 유저에게 DM 전송

### 2. Cloudflare Worker (Slash Commands)

Discord HTTP Interactions 처리. 슬래시 커맨드 요청을 받아 Cloudflare KV 읽기/쓰기 후 응답한다.

**커맨드:**

| 커맨드 | 동작 |
|--------|------|
| `/sixpixie setup` | 4단계 순차 설정 (출발역 → 호선 → 방향 → 도착역) |
| `/sixpixie status` | 현재 설정 + 다음 알림 시간 표시 |
| `/sixpixie test` | 즉시 알림 전송 (설정 확인용) |

> **구현 참고:** `/sixpixie test`는 Worker 내에서 직접 지하철 API를 호출하고 DM을 전송한다. GitHub Actions의 Python 로직과 별도로 TypeScript로 동일한 알림 로직을 구현해야 한다 (중복 허용, 소규모 개인 도구 기준).

**setup 플로우:**
```
봇: 출발역을 입력해주세요 (예: 성균관대)
유저: 성균관대
봇: 호선을 입력해주세요 (예: 1)
유저: 1
봇: 방향을 선택해주세요
     [상행] [하행] [내선] [외선]
유저: 하행 클릭
봇: 도착역을 입력해주세요 (예: 수원)
유저: 수원
봇: ✅ 설정 완료! 매일 17:55에 DM으로 알림이 와요.
```

방향은 버튼으로 선택해 오타를 방지한다.

### 3. Subway API

**서울 열린데이터광장 지하철 실시간 도착정보 API**

```
GET http://swopenAPI.seoul.go.kr/api/subway/{key}/json/realtimeStationArrival/0/5/{station}
```

응답에서 호선(`subwayId`)과 방향(`updnLine`)으로 필터링 후 앞에서 2개 추출. 완행/급행 구분은 `trainLineNm` 필드에서 가져온다.

> **구현 시 확인 필요:** 성균관대역은 Korail 운영 구간이라 이 API의 커버리지에 포함되는지 실제 호출로 검증해야 한다. 미포함 시 공공데이터포털(data.go.kr) Korail 실시간 API로 대체한다.

### 4. Notification Message Format

```
🧚 sixpixie · 퇴근 알림

성균관대 하행
• 18:15 도착 (2분 후) — 수원행 완행
• 18:20 도착 (7분 후) — 천안행 급행
• 18:28 도착 (15분 후) — 병점행 완행
• 18:35 도착 (22분 후) — 신창행 급행
```

열차 정보를 가져올 수 없는 경우 (API 장애, 열차 없음 등): `⚠️ 열차 정보를 가져올 수 없어요.` 메시지를 DM으로 전송한다.

### 5. Holiday Detection

```python
import holidays
kr_holidays = holidays.KR(years=date.today().year)
if date.today() in kr_holidays:
    exit()
```

외부 API 의존 없이 대체공휴일·설날·추석 등 자동 반영. 라이브러리가 매년 업데이트된다.

## Tech Stack

| 역할 | 기술 |
|------|------|
| 알림 스케줄러 | GitHub Actions (cron) |
| 슬래시 커맨드 | Cloudflare Workers (TypeScript) |
| 설정 저장 | Cloudflare KV |
| 알림 스크립트 | Python 3.x |
| 지하철 API | 서울 열린데이터광장 (또는 Korail data.go.kr) |
| 공휴일 처리 | Python `holidays` 라이브러리 |
| Discord | Discord Bot API (DM 전송, Interactions) |
