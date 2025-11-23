import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name') || '';
    const title = searchParams.get('title') || '';
    const height = parseFloat(searchParams.get('height') || '190');

    // ratio 계산
    const ratio = (height / 190).toFixed(2);

    // Canvas 생성 (400x400)
    const canvas = createCanvas(400, 400);
    const ctx = canvas.getContext('2d');

    // 배경색 설정
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, 400, 400);

    // 광수 이미지 로드
    const baseImagePath = join(process.cwd(), 'public', 'kwangsoo-base.png.png');
    const overlayImagePath = join(process.cwd(), 'public', 'kwangsoo-overlay.png');

    let baseImg: any = null;
    let overlayImg: any = null;

    try {
      const baseImageBuffer = await readFile(baseImagePath);
      baseImg = await loadImage(baseImageBuffer);
    } catch (err) {
      console.warn('kwangsoo-base.png를 찾을 수 없습니다. 기본 이미지 없이 진행합니다.');
    }

    try {
      const overlayImageBuffer = await readFile(overlayImagePath);
      overlayImg = await loadImage(overlayImageBuffer);
    } catch (err) {
      console.warn('kwangsoo-overlay.png를 찾을 수 없습니다. 기본 이미지 없이 진행합니다.');
    }

    // 광수 이미지 렌더링
    // Step 1: 원본 PNG를 150×373으로 먼저 resize
    let scaledBase: any = null;
    let scaledOverlay: any = null;

    if (baseImg) {
      // base 이미지를 150×373으로 resize
      const baseCanvas = createCanvas(150, 373);
      const baseCtx = baseCanvas.getContext('2d');
      baseCtx.drawImage(baseImg, 0, 0, 150, 373);
      scaledBase = baseCanvas;
    }

    if (overlayImg) {
      // overlay 이미지를 150×373으로 resize
      const overlayCanvas = createCanvas(150, 373);
      const overlayCtx = overlayCanvas.getContext('2d');
      overlayCtx.drawImage(overlayImg, 0, 0, 150, 373);
      scaledOverlay = overlayCanvas;
    }

    // Step 2: resize된 버퍼에서 렌더링
    if (scaledBase) {
      // 옅은 이미지 전체 그리기
      ctx.drawImage(scaledBase, 0, 0, 150, 373, 230, 13, 150, 373);
    }

    if (scaledOverlay) {
      // 불투명 이미지 아래쪽만 그리기
      const ratioNum = parseFloat(ratio);
      const visible = 373 * ratioNum;
      const sourceY = 373 - visible;
      const targetY = 13 + (373 - visible);

      ctx.drawImage(
        scaledOverlay,
        0, sourceY,        // source crop start (from bottom, on resized 150×373 canvas)
        150, visible,      // source width, visible height
        230, targetY,      // target position
        150, visible       // target width, visible height
      );
    }

    // 텍스트 렌더링 설정
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 1. 메인 제목 텍스트 (68pt / Pretendard Bold / 검은색)
    // 위치: x = 40, y = 40 (좌측 상단 정렬, 40px 여백)
    // 3줄 구성: ratio, Kwang, -soo
    // 줄 간격: 60px, 자간: -5%
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 68px Pretendard, sans-serif';
    
    const lineHeight = 60; // 줄 간격 60px
    const startX = 40; // 좌측 여백 40px
    let currentY = 40; // 상단 여백 40px
    const letterSpacing = -0.05; // -5% 자간 (폰트 크기의 5%)
    
    // 자간을 적용한 텍스트 렌더링 함수
    const drawTextWithLetterSpacing = (text: string, x: number, y: number) => {
      let currentX = x;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const metrics = ctx.measureText(char);
        ctx.fillText(char, currentX, y);
        // 다음 문자 위치 = 현재 위치 + 문자 너비 + 자간
        currentX += metrics.width + (68 * letterSpacing);
      }
    };
    
    // Line 1: ratio
    drawTextWithLetterSpacing(ratio, startX, currentY);
    currentY += lineHeight;
    
    // Line 2: Kwang
    drawTextWithLetterSpacing('Kwang', startX, currentY);
    currentY += lineHeight;
    
    // Line 3: -soo
    drawTextWithLetterSpacing('-soo', startX, currentY);

    // 2. name 텍스트 (@prefix) (36pt / Pretendard Regular / #A2A2A2)
    // 위치: x = 32, y = 260
    ctx.fillStyle = '#A2A2A2';
    ctx.font = '36px Pretendard, sans-serif';
    ctx.fillText(`@${name}`, 32, 260);

    // 3. title 텍스트 (24pt / Pretendard Regular / #A2A2A2)
    // 위치: x = 32, y = 305
    if (title) {
      ctx.font = '24px Pretendard, sans-serif';
      ctx.fillText(title, 32, 305);
    }

    // 4. 날짜 텍스트 (24pt / Pretendard Regular / #A2A2A2)
    // 위치: x = 32, y = 340
    // 형식: yy.mm.dd
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateString = `${year}.${month}.${day}`;
    
    ctx.font = '24px Pretendard, sans-serif';
    ctx.fillText(dateString, 32, 340);

    // PNG 버퍼 반환
    const buffer = canvas.toBuffer('image/png');
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    return new NextResponse('이미지 생성에 실패했습니다.', { status: 500 });
  }
}

