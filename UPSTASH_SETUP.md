# 🔄 Upstash Redis로 전환 가이드

Vercel KV가 Marketplace를 통해 제공되므로, Upstash Redis를 사용하는 방법입니다.

## 📦 패키지 설치

```bash
npm install @upstash/redis
```

## 🔧 코드 수정

### `/app/api/save/route.ts` 수정

```typescript
import { Redis } from '@upstash/redis';

// Vercel KV 사용 여부 확인
const useUpstashRedis = () => {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
};

// Upstash Redis로 저장
async function saveToUpstashRedis(saveData: SaveData) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  
  // 기존 로그 가져오기
  const existingLogs = await redis.get<SaveData[]>('logs') || [];
  
  // 새 데이터 추가
  const updatedLogs = [...existingLogs, saveData];
  
  // Redis에 저장
  await redis.set('logs', updatedLogs);
  
  return updatedLogs;
}
```

### `/app/api/logs/route.ts` 수정

```typescript
import { Redis } from '@upstash/redis';

// Upstash Redis에서 로그 가져오기
async function getLogsFromUpstashRedis() {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  
  const logs = await redis.get<SaveData[]>('logs') || [];
  return logs;
}
```

## ✅ 장점

- **무료 티어**: Upstash는 관대한 무료 티어 제공
- **빠른 속도**: Redis 기반으로 매우 빠름
- **확장성**: 필요시 쉽게 확장 가능

## 📝 참고

- Upstash 문서: https://docs.upstash.com/redis
- 무료 티어 제한 확인: https://upstash.com/pricing

