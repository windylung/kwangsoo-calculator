# 데이터 저장 및 확인 방법

## 📝 데이터 저장

Calculate 버튼을 클릭하면 자동으로 다음 정보가 저장됩니다:
- `name`: 사용자 이름
- `title`: 제목
- `height`: 키 (cm)
- `timestamp`: 저장 시각 (ISO 형식)
- `ip`: 요청 IP 주소 (가능한 경우)

데이터는 `/data/logs.json` 파일에 저장됩니다.

## 🔍 데이터 확인 방법

### 방법 1: 브라우저에서 직접 확인

개발 서버가 실행 중일 때 다음 URL로 접속:

```
http://localhost:3000/api/logs
```

또는 배포된 경우:

```
https://your-domain.com/api/logs
```

### 방법 2: 터미널에서 확인

```bash
# 프로젝트 루트에서
cat data/logs.json
```

또는 JSON을 예쁘게 보려면:

```bash
cat data/logs.json | jq
```

### 방법 3: 코드에서 확인

```typescript
// 예시: API 호출
const response = await fetch('/api/logs');
const data = await response.json();
console.log(data.logs); // 저장된 모든 로그
console.log(data.count); // 총 개수
```

## 📊 저장된 데이터 형식

```json
{
  "logs": [
    {
      "name": "광수",
      "title": "생일맞이목도리",
      "height": "175",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "ip": "127.0.0.1"
    }
  ],
  "count": 1
}
```

## 🚀 프로덕션 환경

프로덕션 환경에서는 다음 중 하나를 사용하는 것을 권장합니다:
- **Vercel KV**: Vercel에서 제공하는 키-값 저장소
- **PostgreSQL**: 관계형 데이터베이스
- **MongoDB**: NoSQL 데이터베이스
- **Supabase**: 오픈소스 Firebase 대안

현재는 개발 단계이므로 파일 기반 저장을 사용하고 있습니다.

