import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

interface SaveData {
  name: string;
  title: string;
  height: string;
  timestamp: string;
  ip?: string;
}

// Vercel KV 사용 여부 확인
const useVercelKV = () => {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
};

// Vercel KV로 저장
async function saveToVercelKV(saveData: SaveData) {
  const { kv } = await import('@vercel/kv');
  
  // 기존 로그 가져오기
  const existingLogs = await kv.get<SaveData[]>('logs') || [];
  
  // 새 데이터 추가
  const updatedLogs = [...existingLogs, saveData];
  
  // KV에 저장
  await kv.set('logs', updatedLogs);
  
  return updatedLogs;
}

// 파일로 저장 (로컬 개발용)
async function saveToFile(saveData: SaveData) {
  const dataDir = join(process.cwd(), 'data');
  const dataFile = join(dataDir, 'logs.json');

  // 디렉토리가 없으면 생성
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  // 기존 데이터 읽기
  let logs: SaveData[] = [];
  if (existsSync(dataFile)) {
    try {
      const existingData = await readFile(dataFile, 'utf-8');
      logs = JSON.parse(existingData);
    } catch (err) {
      console.warn('기존 로그 파일을 읽을 수 없습니다. 새로 시작합니다.');
      logs = [];
    }
  }

  // 새 데이터 추가
  logs.push(saveData);

  // 파일에 저장
  await writeFile(dataFile, JSON.stringify(logs, null, 2), 'utf-8');
  
  return logs;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, height } = body;

    // 입력값 검증
    if (!name || !title || !height) {
      return NextResponse.json(
        { error: 'name, title, height는 필수입니다.' },
        { status: 400 }
      );
    }

    // 타임스탬프 생성 (한국 시간대 KST, UTC+9)
    const now = new Date();
    // 한국 시간대(Asia/Seoul)로 변환
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const second = parts.find(p => p.type === 'second')?.value;
    
    const timestamp = `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
    
    // IP 주소 가져오기 (선택적)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // 저장할 데이터
    const saveData: SaveData = {
      name,
      title,
      height,
      timestamp,
      ip,
    };

    // Vercel KV 사용 여부에 따라 저장 방식 선택
    if (useVercelKV()) {
      // Vercel 배포 환경: Vercel KV 사용
      await saveToVercelKV(saveData);
      console.log('데이터 저장 완료 (Vercel KV):', saveData);
    } else {
      // 로컬 개발 환경: 파일 기반 저장
      await saveToFile(saveData);
      console.log('데이터 저장 완료 (파일):', saveData);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: '데이터가 저장되었습니다.',
        data: saveData,
        storage: useVercelKV() ? 'vercel-kv' : 'file'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('데이터 저장 실패:', error);
    return NextResponse.json(
      { error: '데이터 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

