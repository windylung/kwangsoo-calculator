'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const name = searchParams.get('name') || '';
  const title = searchParams.get('title') || '';
  const height = searchParams.get('height') || '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 이미지 생성
  useEffect(() => {
    const generateImages = async () => {
      if (!name || !title || !height) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 영어 버전과 한국어 버전 각각 생성
        const englishUrl = `/api/generate?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&height=${encodeURIComponent(height)}`;
        const koreanUrl = `/api/generate/korean?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&height=${encodeURIComponent(height)}`;
        
        setImageUrls([englishUrl, koreanUrl]);
        setLoading(false);
      } catch (error) {
        console.error('이미지 생성 실패:', error);
        setLoading(false);
      }
    };

    generateImages();
  }, [name, title, height]);

  // 최소 스와이프 거리 (픽셀)
  const minSwipeDistance = 50;

  useEffect(() => {
    // 콘솔 로그로 파라미터 출력
    console.log('Result params:', { name, title, height });

    // DB 저장용 fetch
    const saveToDatabase = async () => {
      try {
        const response = await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, title, height }),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('데이터 저장 성공:', result);
        } else {
          console.error('데이터 저장 실패:', await response.json());
        }
      } catch (error) {
        console.error('DB 저장 실패:', error);
      }
    };

    // 입력값이 모두 있을 때만 저장 시도
    if (name && title && height) {
      saveToDatabase();
    }
  }, [name, title, height]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd(0);
    setTouchStart(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd(touch.clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTouchStart(0);
      setTouchEnd(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < imageUrls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setTouchStart(e.clientX);
    setTouchEnd(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    if (touchStart && touchEnd) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe && currentIndex < imageUrls.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      if (isRightSwipe && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    
    setIsDragging(false);
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (loading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={200}
        height={200}
        className={styles.logo}
        style={{ width: '200px', height: 'auto', cursor: 'pointer' }}
        onClick={() => router.push('/')}
        priority
      />

      <div
        ref={containerRef}
        className={styles.imageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={styles.imageWrapper}>
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className={styles.imageSlide}
              style={{
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 2 : 1,
              }}
            >
              <img
                src={url}
                alt={index === 0 ? 'English version' : 'Korean version'}
                className={styles.generatedImage}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      {imageUrls.length > 0 && (
        <div className={styles.indicators}>
          {imageUrls.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`이미지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}
