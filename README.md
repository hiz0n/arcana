# Arcana Tarot Web

React와 Framer Motion으로 구현한 간단한 아르카나 타로 웹 앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 에 접속하면 메인 화면이 나타납니다.

## 주요 기술

- React 18 (함수형 컴포넌트)
- React Router를 사용한 라우팅 (`/`, `/fortune/:type`)
- Framer Motion으로 카드 펼침/뒤집기/버튼/손 애니메이션
- 재사용 가능한 `TarotCard`, `Hand`, `ArcanaButton` 컴포넌트
- `src/data`에 메이저 아르카나 22장 데이터 및 AI 스타일 운세 JSON 생성 유틸


