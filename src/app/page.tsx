'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const HERO_IMAGES = [
  '/images/hero-1.png',
  '/images/hero-2.png',
  '/images/hero-3.png',
  '/images/hero-4.png',
  '/images/hero-5.png',
  '/images/hero-6.png',
];

const SUBTITLE_EN = [
  'Balo', 'is', 'a', 'messaging', 'platform', 'designed', 'to', 'bridge',
  'the', 'gap', 'between', 'digital', 'communication', 'and', 'human',
  'presence.', 'Traditional', 'messaging', 'reduces', 'conversation', 'to',
  'basic', 'bubbles', 'on', 'a', 'screen.', 'Balo', 'integrates', 'ambient',
  'AI', 'to', 'understand', 'tone,', 'context,', 'and', 'relational',
  'signals,', 'allowing', 'the', 'interface', 'itself', 'to', 'respond',
  'dynamically.', 'The', 'result', 'is', 'communication', 'that', 'feels',
  'closer', 'to', 'real', 'presence.', 'It', 'is', 'structured,',
  'adaptive,', 'and', 'aware', 'of', 'the', 'emotion', 'behind', 'the', 'words.',
];

const SUBTITLE_RU = [
  'Balo', '—', 'это', 'мессенджер,', 'созданный', 'для', 'того,', 'чтобы',
  'преодолеть', 'разрыв', 'между', 'цифровым', 'общением', 'и', 'человеческим',
  'присутствием.', 'Традиционные', 'мессенджеры', 'сводят', 'разговор', 'к',
  'обычным', 'пузырькам', 'на', 'экране.', 'Balo', 'использует', 'фоновый',
  'ИИ', 'для', 'понимания', 'тона,', 'контекста', 'и', 'межличностных',
  'сигналов,', 'позволяя', 'интерфейсу', 'динамически', 'реагировать.',
  'Результат', '—', 'общение,', 'которое', 'ощущается', 'ближе', 'к',
  'реальному', 'присутствию.', 'Оно', 'структурировано,', 'адаптивно',
  'и', 'осознаёт', 'эмоции', 'за', 'словами.',
];

function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;

      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 20;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="grain"
    />
  );
}

function WordReveal({ words }: { words: string[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start revealing words
          let count = 0;
          const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= words.length) clearInterval(interval);
          }, 70);
          observer.disconnect();
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [words.length]);

  return (
    <div ref={sectionRef} className="word-reveal-section">
      <p className="word-reveal-text">
        {words.map((word, i) => (
          <span
            key={i}
            className={`word ${i < visibleCount ? 'visible' : ''}`}
          >
            {word}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [grainOn, setGrainOn] = useState(true);
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const touchStartX = useRef(0);

  const cycleHero = useCallback((direction: 1 | -1) => {
    setHeroIndex((prev) => (prev + direction + HERO_IMAGES.length) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') cycleHero(1);
      if (e.key === 'ArrowLeft') cycleHero(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cycleHero]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      cycleHero(diff > 0 ? 1 : -1);
    }
  };

  return (
    <main>
      {/* ===== HERO ===== */}
      <section
        className="hero"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hero-image-wrap">
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="balo hero"
              className={`hero-image ${i === heroIndex ? 'active' : ''}`}
            />
          ))}
        </div>

        {grainOn && <FilmGrain />}

        <div className="hero-fade" />

        <div className={`hero-content ${loaded ? 'visible' : ''}`}>
          <h1 className="hero-title">balo</h1>
          <p className="hero-byline">by GIOIA</p>
        </div>

        <div className="scroll-hint">
          <div className="scroll-icon" />
          <span>Scroll to explore</span>
        </div>

        {/* Toggles */}
        <div className="hero-toggles">
          <button
            className="hero-toggle-btn"
            onClick={() => setGrainOn(!grainOn)}
          >
            grain {grainOn ? 'on' : 'off'}
          </button>
          <button
            className="hero-toggle-btn"
            onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
          >
            {lang === 'en' ? 'RU' : 'EN'}
          </button>
        </div>
      </section>

      {/* ===== SUBTITLE / INTRO ===== */}
      <section className="intro-section">
        <WordReveal key={lang} words={lang === 'en' ? SUBTITLE_EN : SUBTITLE_RU} />
      </section>
    </main>
  );
}
