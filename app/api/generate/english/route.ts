import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name') || 'Kwang-soo';
    const title = searchParams.get('title') || '';
    const ratio = parseFloat(searchParams.get('ratio') || '1.0');

    // Canvas 생성 (400x400)
    const canvas = createCanvas(400, 400);
    const ctx = canvas.getContext('2d');

    // 배경색 설정
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, 400, 400);

    // 광수 이미지 로드
    const baseImagePath = join(process.cwd(), 'public', 'images', 'base.png');
    const overlayImagePath = join(process.cwd(), 'public', 'images', 'overlay.png');

    let baseImg: any = null;
    let overlayImg: any = null;

    try {
      const baseImageBuffer = await readFile(baseImagePath);
      baseImg = await loadImage(baseImageBuffer);
    } catch (err) {
      console.warn('base.png를 찾을 수 없습니다. 기본 이미지 없이 진행합니다.');
    }

    try {
      const overlayImageBuffer = await readFile(overlayImagePath);
      overlayImg = await loadImage(overlayImageBuffer);
    } catch (err) {
      console.warn('overlay.png를 찾을 수 없습니다. 기본 이미지 없이 진행합니다.');
    }

    // 광수 이미지 렌더링
    if (baseImg) {
      // 옅은 이미지 전체 그리기
      ctx.drawImage(baseImg, 230, 13, 150, 373);
    }

    if (overlayImg) {
      // 불투명 이미지 아래쪽만 그리기
      const visible = 373 * ratio;
      const sourceY = 373 - visible;
      const targetY = 13 + (373 - visible);

      ctx.drawImage(
        overlayImg,
        0, sourceY,        // source crop start (from bottom)
        150, visible,      // source width, visible height
        230, targetY,      // target position
        150, visible       // target width, visible height
      );
    }

    // 텍스트 렌더링
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 비율 표시 (0.28 형식)
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(ratio.toFixed(2), 20, 20);

    // 이름 (Kwang-soo)
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(name, 20, 80);

    // @tteu.tto
    ctx.font = '24px sans-serif';
    ctx.fillText('@tteu.tto', 20, 130);

    // 제목 (생일맞이목도리)
    if (title) {
      ctx.font = '24px sans-serif';
      ctx.fillText(title, 20, 180);
    }

    // 날짜 (25.11.23)
    ctx.font = '20px sans-serif';
    ctx.fillText('25.11.23', 20, 230);

    // PNG 버퍼 반환
    const buffer = canvas.toBuffer('image/png');
    return new NextResponse(buffer, {
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

