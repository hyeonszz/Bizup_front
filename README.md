# BIZUP 프론트엔드

## 프로젝트 구조

```
front/
├── src/
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 진입점, React DOM 바인딩
│   ├── index.css           # 전역 스타일
│   ├── lib/
│   │   └── api.ts          # API 요청 유틸리티
│   └── components/         # (필요 시) UI 컴포넌트 모음
├── package.json
├── tsconfig.json
└── README.md               # 프로젝트 문서 (현재 파일)
```

## 개발 환경 준비

1. 의존성 설치
   ```
   npm install
   ```

2. 환경 변수 설정
- 루트에 `.env` 파일을 생성하고 API 서버 주소 등 필요한 값을 설정합니다.

## 개발 서버 실행

```
npm run dev
```

- 기본적으로 `http://localhost:5173`에서 애플리케이션을 확인할 수 있습니다.
- FastAPI 백엔드가 별도로 실행 중이어야 API 호출이 정상 동작합니다.

## 빌드

```
npm run build
```

## 추가 커맨드

- `npm run preview`: 빌드 결과물을 로컬에서 확인하는 프리뷰 서버 실행
- `npm run lint`: ESLint를 실행해 코드 스타일과 오류를 점검

## 폴더/파일 관리 팁

- 새 컴포넌트는 `src/components/`에 추가하고 필요한 경우 스타일 파일을 함께 관리합니다.
- API 호출 로직은 `src/lib/api.ts`에 일관되게 정리합니다.
- 환경 변수는 `.env`로 관리하며 `.gitignore`에 등록되어 있어 GitHub에 업로드되지 않습니다.

