# Supabase + Next.js 인증 시스템

Next.js와 Supabase를 이용한 완전한 인증 시스템입니다. 회원가입, 로그인, 세션 관리, 보호된 페이지 등의 기능을 제공합니다.

## 🚀 기능

- ✅ **회원가입**: 이메일과 비밀번호로 안전한 회원가입
- ✅ **로그인**: Supabase 인증을 이용한 로그인
- ✅ **세션 관리**: 자동 세션 관리 및 로그아웃
- ✅ **보호된 페이지**: 로그인한 사용자만 접근 가능한 대시보드
- ✅ **타입스크립트**: 완전한 타입 안정성
- ✅ **Tailwind CSS**: 현대적이고 반응형 UI

## 📁 프로젝트 구조

```
auth-app/
├── pages/
│   ├── _app.tsx              # Next.js 앱 메인 파일
│   ├── _document.tsx         # HTML 문서 구조
│   ├── index.tsx             # 홈페이지
│   ├── signup.tsx            # 회원가입 페이지
│   ├── login.tsx             # 로그인 페이지
│   └── dashboard.tsx         # 대시보드 (보호된 페이지)
├── lib/
│   └── supabase.ts          # Supabase 클라이언트 설정
├── hooks/
│   ├── useAuth.ts           # 인증 상태 관리 훅
│   └── useProtectedRoute.ts # 보호된 라우트 훅
├── styles/
│   └── globals.css          # 전역 스타일
├── .env.local               # 환경 변수
├── next.config.js           # Next.js 설정
├── tsconfig.json            # TypeScript 설정
├── tailwind.config.js       # Tailwind CSS 설정
└── package.json             # 프로젝트 설정

```

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 14**: React 풀스택 프레임워크
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 기반 CSS

### 백엔드 & 데이터베이스
- **Supabase**: Firebase 오픈소스 대체 서비스
- **PostgreSQL**: 데이터베이스
- **Supabase Auth**: 인증 시스템

## 🚀 설치 및 실행

### 1. 프로젝트 디렉토리로 이동
```bash
cd auth-app
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

그 다음 브라우저에서 `http://localhost:3000` 열기

## 📝 환경 변수

`.env.local` 파일이 이미 설정되어 있습니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://pkorpzicojwkxcaqlpru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**주의**: 이 키들은 공개용입니다. 프로덕션에서는 절대 Git에 커밋하면 안 됩니다!

## 🔐 인증 흐름

### 회원가입 흐름
```
사용자 입력 → Supabase 서버로 전송 → 데이터베이스에 저장 → 성공 응답 → 로그인 페이지로 이동
```

### 로그인 흐름
```
이메일/비밀번호 입력 → Supabase 인증 → 세션 생성 → 대시보드로 리다이렉트
```

### 보호된 페이지 접근
```
대시보드 접근 → useProtectedRoute 훅 확인 → 인증 여부 확인 → 미인증 시 로그인 페이지로 리다이렉트
```

## 📄 주요 파일 설명

### `lib/supabase.ts`
Supabase 클라이언트 초기화. 모든 인증 작업의 기초입니다.

```typescript
export const supabase = createClient(supabaseUrl, supabaseKey)
```

### `hooks/useAuth.ts`
사용자 인증 상태를 관리하는 커스텀 훅. 세션 변화를 감지합니다.

```typescript
const { user, loading, logout } = useAuth()
```

### `hooks/useProtectedRoute.ts`
보호된 페이지에 사용. 미인증 사용자는 자동으로 로그인 페이지로 이동합니다.

```typescript
const { user, loading } = useProtectedRoute()
```

## 🧪 테스트

### 1. 회원가입 테스트
1. 홈페이지에서 "회원가입" 클릭
2. 이메일과 비밀번호 입력
3. "회원가입" 버튼 클릭
4. 성공 메시지 확인 후 로그인 페이지로 이동

### 2. 로그인 테스트
1. 로그인 페이지에서 가입한 이메일과 비밀번호 입력
2. "로그인" 버튼 클릭
3. 대시보드로 자동 이동
4. 사용자 정보 표시 확인

### 3. 보호된 페이지 테스트
1. 로그아웃 상태에서 `/dashboard` URL 직접 접근
2. 자동으로 로그인 페이지로 리다이렉트되는지 확인

## 🔧 커스터마이징

### 회원가입 필드 추가
`pages/signup.tsx`에서 추가 필드를 입력받고, Supabase user metadata에 저장할 수 있습니다.

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: 'John Doe',
      // 추가 정보...
    }
  }
})
```

### 소셜 로그인 추가
Supabase는 Google, GitHub, Discord 등을 지원합니다.

```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
})
```

## 🚀 배포

### Vercel에 배포
```bash
npm run build
# 또는 GitHub에 push하면 자동 배포
```

### 환경 변수 설정
Vercel 프로젝트 설정에서 `.env.local` 변수들을 추가하세요.

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)

## 📝 라이센스

MIT

## 💬 문의

문제가 발생하면 Supabase 문서를 참고하거나, GitHub Issues를 열어주세요.

---

**Happy Coding! 🎉**
