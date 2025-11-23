import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

// Vercel KV 사용 여부 확인
const useVercelKV = () => {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
};

// Vercel KV에서 로그 가져오기
async function getLogsFromVercelKV() {
  const { kv } = await import('@vercel/kv');
  const logs = await kv.get<Array<{ name: string; title: string; height: string; timestamp: string; ip?: string }>>('logs') || [];
  return logs;
}

// 파일에서 로그 가져오기
async function getLogsFromFile() {
  const dataFile = join(process.cwd(), 'data', 'logs.json');

  // 파일이 없으면 빈 배열 반환
  if (!existsSync(dataFile)) {
    return [];
  }

  // 파일 읽기
  const fileContent = await readFile(dataFile, 'utf-8');
  const logs = JSON.parse(fileContent);
  
  return logs;
}

export async function GET() {
  try {
    let logs;

    // Vercel KV 사용 여부에 따라 저장 방식 선택
    if (useVercelKV()) {
      // Vercel 배포 환경: Vercel KV에서 가져오기
      logs = await getLogsFromVercelKV();
    } else {
      // 로컬 개발 환경: 파일에서 가져오기
      logs = await getLogsFromFile();
    }

    // 최신순으로 정렬 (가장 최근 것이 마지막)
    const sortedLogs = [...logs].reverse();

    return NextResponse.json({
      logs: sortedLogs,
      count: logs.length,
      storage: useVercelKV() ? 'vercel-kv' : 'file',
    });
  } catch (error) {
    console.error('로그 조회 실패:', error);
    return NextResponse.json(
      { error: '로그를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}

