'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [height, setHeight] = useState('');

  const handleCalculate = () => {
    if (!name || !title || !height) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 0) {
      alert('올바른 키를 입력해주세요.');
      return;
    }
    router.push(`/result?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&height=${heightNum}`);
  };

  return (
    <div className={styles.container}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={200}
        height={200}
        className={styles.logo}
        style={{ width: '200px', height: 'auto' }}
        priority
      />

      <div className={styles.inputRow}>
        <label htmlFor="name" className={styles.label}>
          name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          placeholder=""
        />
      </div>

      <div className={styles.inputRow}>
        <label htmlFor="title" className={styles.label}>
          title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          placeholder=""
        />
      </div>

      <div className={styles.inputRow}>
        <label htmlFor="height" className={styles.label}>
          height
        </label>
        <input
          id="height"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className={styles.input}
          placeholder=""
        />
        <span className={styles.cm}>cm</span>
      </div>

      <button onClick={handleCalculate} className={styles.calcButton}>
        <Image
          src="/calculate-button.png"
          alt="Calculate"
          width={200}
          height={200}
          className={styles.calcButtonImage}
          style={{ width: '200px', height: 'auto' }}
          priority
        />
      </button>

      <div className={styles.divider}></div>

      <div className={styles.footerSection}>
        <button 
          className={styles.serviceInfo}
          onClick={() => window.open('https://humanbook.notion.site/kwangsoo-calculator?source=copy_link', '_blank')}
        >
          Service Info
        </button>

        <button
          className={styles.from}
          onClick={() => window.open('https://www.instagram.com/tteu.tto/', '_blank')}
        >
          From @tteu.tto
        </button>
      </div>
    </div>
  );
}
