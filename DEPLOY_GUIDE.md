# 🚀 Vercel 배포 가이드 (Vercel KV 포함)

## 📋 사전 준비

1. **GitHub 저장소 준비**
   - 프로젝트를 GitHub에 푸시해야 합니다
   - Vercel은 GitHub 저장소와 연동됩니다

2. **Vercel 계정 생성**
   - [https://vercel.com](https://vercel.com)에서 계정 생성
   - GitHub 계정으로 로그인 권장

---

## 🔧 Step 1: Vercel KV 스토어 생성 (Marketplace를 통해)

### ⚠️ 중요: Vercel KV는 이제 Marketplace를 통해 제공됩니다

Vercel KV는 더 이상 직접 Storage에서 생성할 수 없고, **Marketplace**를 통해 생성해야 합니다.

### 1-1. Marketplace에서 KV 선택

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 왼쪽 사이드바에서 **Storage** 클릭
3. **Browse Storage** 모달이 열림
4. **Marketplace Database Providers** 섹션에서 **Upstash** 선택
   - Upstash는 "Serverless DB (Redis, Vector, Queue, Search)" 제공
   - Vercel KV는 Upstash의 Redis 기반 서비스입니다

### 1-2. Upstash Redis 생성

1. **Upstash** 선택 후 **Continue** 클릭
2. Upstash 계정 생성 또는 로그인
3. Redis 데이터베이스 생성:
   - 이름: `kwangsoo-logs` (또는 원하는 이름)
   - Region 선택 (가장 가까운 지역 권장)
   - **Create** 클릭

### 1-3. 프로젝트에 연결

1. 생성한 Redis 데이터베이스 선택
2. **Connect to Vercel Project** 클릭
3. 프로젝트 선택
4. 환경 변수 자동 설정 확인

### 1-4. 환경 변수 확인

Upstash Redis를 연결하면 다음 환경 변수가 자동으로 추가됩니다:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

**참고**: Upstash는 `@upstash/redis` 패키지를 사용하지만, 현재 코드는 `@vercel/kv`를 사용합니다. 
Upstash를 사용하려면 코드를 약간 수정해야 할 수 있습니다.

---

## 📦 Step 2: 프로젝트 배포

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. **프로젝트 가져오기**
   - Vercel Dashboard → **Add New...** → **Project**
   - GitHub 저장소 선택
   - 프로젝트 선택 후 **Import**

2. **프로젝트 설정**
   - Framework Preset: **Next.js** (자동 감지됨)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

3. **환경 변수 확인**
   - Settings → Environment Variables
   - KV 관련 환경 변수가 자동으로 추가되어 있는지 확인

4. **배포**
   - **Deploy** 버튼 클릭
   - 배포 완료까지 대기 (약 2-3분)

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 실행
vercel

# 배포 과정:
# 1. 로그인 (브라우저에서 인증)
# 2. 프로젝트 설정 확인
# 3. 배포 완료
```

---

## 🔗 Step 3: Upstash Redis와 프로젝트 연결

### 3-1. 프로젝트에 Redis 연결

1. Vercel Dashboard → 프로젝트 선택
2. **Storage** 탭 클릭
3. **Browse Storage** → **Upstash** 선택
4. 생성한 Redis 데이터베이스 선택
5. **Connect** 클릭

### 3-2. 환경 변수 확인

1. 프로젝트 → **Settings** → **Environment Variables**
2. 다음 변수들이 자동으로 추가되었는지 확인:
   ```
   KV_REST_API_URL
   KV_REST_API_TOKEN
   KV_REST_API_READ_ONLY_TOKEN
   ```

### 3-3. 코드 호환성 확인

현재 코드는 `@vercel/kv`를 사용하지만, Upstash Redis는 `@upstash/redis`를 사용합니다.

**옵션 1**: 코드를 `@upstash/redis`로 변경 (권장)
**옵션 2**: Vercel KV를 계속 사용하려면 Vercel 팀에 문의

Upstash를 사용하는 경우 코드 수정이 필요할 수 있습니다.

---

## ✅ Step 4: 배포 확인

### 4-1. 배포 상태 확인

1. Vercel Dashboard → 프로젝트
2. **Deployments** 탭에서 최신 배포 상태 확인
3. 초록색 체크 표시 = 배포 성공

### 4-2. 사이트 접속

- 배포된 URL: `https://your-project-name.vercel.app`
- 또는 커스텀 도메인 설정 가능

### 4-3. 기능 테스트

1. 메인 페이지에서 입력값 입력
2. Calculate 버튼 클릭
3. 결과 페이지 확인
4. 데이터 저장 확인:
   - Vercel Dashboard → Storage → KV 스토어
   - 또는 `/api/logs` 엔드포인트로 확인

---

## 🔍 Step 5: KV 데이터 확인 방법

### 방법 1: Vercel 대시보드

1. Vercel Dashboard → 프로젝트
2. **Storage** → KV 스토어 선택
3. 데이터 확인

### 방법 2: API 엔드포인트

```
https://your-project.vercel.app/api/logs
```

브라우저에서 접속하면 JSON 형식으로 저장된 데이터 확인 가능

### 방법 3: Vercel CLI

```bash
# KV 데이터 조회
vercel kv:get logs --store=kwangsoo-logs

# 모든 키 조회
vercel kv:keys --store=kwangsoo-logs
```

---

## 🐛 문제 해결

### 문제 1: KV 환경 변수가 없음

**해결 방법:**
1. 프로젝트 → Settings → Environment Variables
2. KV 스토어가 연결되어 있는지 확인
3. 연결되어 있으면 환경 변수 자동 생성됨

### 문제 2: 배포 후 데이터가 저장되지 않음

**확인 사항:**
1. KV 스토어가 프로젝트에 연결되어 있는지
2. 환경 변수가 제대로 설정되어 있는지
3. 배포 로그에서 에러 확인

### 문제 3: 빌드 에러

**확인 사항:**
1. `package.json`에 `@vercel/kv` 패키지가 있는지
2. Node.js 버전 호환성
3. 빌드 로그 확인

---

## 💰 Vercel KV 비용

- **Hobby 플랜**: 무료 (제한적)
  - 읽기: 30,000/일
  - 쓰기: 1,000/일
- **Pro 플랜**: 사용량 기반 과금
  - 자세한 내용: [Vercel KV Pricing](https://vercel.com/docs/storage/vercel-kv)

---

## 📝 체크리스트

배포 전 확인:

- [ ] GitHub에 코드 푸시 완료
- [ ] Vercel KV 스토어 생성 완료
- [ ] 프로젝트에 KV 스토어 연결 완료
- [ ] 환경 변수 자동 설정 확인
- [ ] `@vercel/kv` 패키지 설치 확인
- [ ] 로컬에서 빌드 테스트 완료 (`npm run build`)

배포 후 확인:

- [ ] 배포 성공 확인
- [ ] 사이트 접속 확인
- [ ] 이미지 생성 기능 테스트
- [ ] 데이터 저장 기능 테스트
- [ ] KV 스토어에서 데이터 확인

---

## 🎉 완료!

이제 프로젝트가 Vercel에 배포되었고, Vercel KV를 사용하여 데이터를 저장합니다!

