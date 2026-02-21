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
  'Belo', 'is', 'a', 'messaging', 'platform', 'designed', 'to', 'bridge',
  'the', 'gap', 'between', 'digital', 'communication', 'and', 'human',
  'presence.', 'Traditional', 'messaging', 'reduces', 'conversation', 'to',
  'basic', 'bubbles', 'on', 'a', 'screen.', 'Belo', 'integrates', 'ambient',
  'AI', 'to', 'understand', 'tone,', 'context,', 'and', 'relational',
  'signals,', 'allowing', 'the', 'interface', 'itself', 'to', 'respond',
  'dynamically.', 'The', 'result', 'is', 'communication', 'that', 'feels',
  'closer', 'to', 'real', 'presence.', 'It', 'is', 'structured,',
  'adaptive,', 'and', 'aware', 'of', 'the', 'emotion', 'behind', 'the', 'words.',
];

const SUBTITLE_RU = [
  'Belo', '—', 'это', 'мессенджер,', 'созданный', 'для', 'того,', 'чтобы',
  'преодолеть', 'разрыв', 'между', 'цифровым', 'общением', 'и', 'человеческим',
  'присутствием.', 'Традиционные', 'мессенджеры', 'сводят', 'разговор', 'к',
  'обычным', 'пузырькам', 'на', 'экране.', 'Belo', 'использует', 'фоновый',
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

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in ${visible ? 'visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

function ImageBreak({ src, alt = '' }: { src: string; alt?: string }) {
  return (
    <section className="image-break">
      <img src={src} alt={alt} className="break-image" />
      <div className="break-fade-top" />
      <div className="break-fade-bottom" />
    </section>
  );
}

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [grainOn, setGrainOn] = useState(false);
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const touchStartX = useRef(0);
  const heroContentRef = useRef<HTMLDivElement>(null);

  const cycleHero = useCallback((direction: 1 | -1) => {
    setHeroIndex((prev) => (prev + direction + HERO_IMAGES.length) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = heroContentRef.current;
    if (!el) return;

    const onScroll = () => {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * -0.35}px)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
              alt="belo hero"
              className={`hero-image ${i === heroIndex ? 'active' : ''}`}
            />
          ))}
          <img
            src="/images/hero-mobile.png"
            alt="belo hero"
            className={`hero-image hero-mobile-only ${heroIndex === 0 ? 'active' : ''}`}
          />
        </div>

        {grainOn && <FilmGrain />}

        <div className="hero-fade" />

        <div ref={heroContentRef} className={`hero-content ${loaded ? 'visible' : ''}`}>
          <h1 className="hero-title">belo</h1>
          <p className="hero-byline">by GIOIA</p>
        </div>

        <div className="scroll-hint">
          <div className="scroll-chevron" />
        </div>
      </section>

      {/* ===== SUBTITLE / INTRO ===== */}
      <section className="intro-section">
        <WordReveal key={lang} words={lang === 'en' ? SUBTITLE_EN : SUBTITLE_RU} />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="features-section">
        <FadeIn>
          <p className="section-label">How it works</p>
          <h2 className="section-heading">Three ambient features, all on-device</h2>
        </FadeIn>

        <div className="feature-row">
          <FadeIn className="feature-visual">
            <img src="/images/feature-mood.png" alt="" className="feature-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>Semantic Mood Detection</h3>
            <p>Real-time sentiment analysis changes the visual atmosphere of a chat — colors, effects, background — based on the averaged emotional state of both people in the conversation.</p>
          </FadeIn>
        </div>

        <div className="feature-row reverse">
          <FadeIn className="feature-visual">
            <img src="/images/feature-nudge.png" alt="" className="feature-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>Emotional Nudges</h3>
            <p>Gentle, dismissable suggestions when the model detects the conversation shifting. Designed to help without being intrusive — easy to turn off entirely.</p>
          </FadeIn>
        </div>

        <div className="feature-row">
          <FadeIn className="feature-visual">
            <img src="/images/feature-glance.png" alt="" className="feature-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>Mood Glance</h3>
            <p>A visual summary on the home screen showing the emotional tone of each conversation. Mood-colored auras around each contact, visible before you open the chat.</p>
          </FadeIn>
        </div>
      </section>

      {/* ===== MARKET ===== */}
      <section className="market-section">
        <img src="/images/market-bg.png" alt="" className="section-bg" />
        <div className="section-bg-fade" />

        <div className="market-content">
          <FadeIn>
            <p className="section-label">The market</p>
            <p className="big-number">80M+</p>
            <p className="big-number-sub">
              people across Central Asia. The youngest population in the post-Soviet world.
              No messaging platform built for how they actually communicate.
            </p>
          </FadeIn>

          <div className="market-stats">
            <FadeIn>
              <p className="market-stat-line"><span className="stat-highlight">50%+</span> of the population is under 30.</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="market-stat-line"><span className="stat-highlight">~27</span> median age — compared to 44 across Europe.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="market-stat-line"><span className="stat-highlight">96%</span> internet penetration in Kazakhstan alone.</p>
            </FadeIn>
          </div>

          <FadeIn>
            <p className="market-context">
              The infrastructure exists. The audience is online. What&apos;s missing is a product designed for them — one that understands regional communication patterns, social hierarchies, and multilingual nuance that global platforms will never optimize for.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== TECHNOLOGY ===== */}
      <section className="tech-section">
        <img src="/images/tech-bg.png" alt="" className="section-bg" />
        <div className="section-bg-fade" />

        <div className="tech-content">
          <FadeIn>
            <p className="section-label">Technology</p>
            <h2 className="section-heading">Built on-device, designed to scale</h2>
          </FadeIn>

          <FadeIn>
            <p className="section-text tech-body">
              Sentiment analysis runs locally using micro transformer models. Mood scores — not messages — are exchanged between users via WebSocket. AI inference costs stay near zero. Message content never touches a server.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="tech-point">
              <h3>On-Device AI</h3>
              <p>Lightweight models process tone and context directly on the phone. Privacy is structural, not a policy.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="tech-point">
              <h3>Digital Twins</h3>
              <p>Over time, each user builds a vector-based profile of their communication style — continuously updated embeddings, not fine-tuned models.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="tech-point">
              <h3>Data as Embeddings</h3>
              <p>User data stored as vector embeddings, not baked into models. Flexible, portable, and licensable with proper anonymization.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== DATA SOVEREIGNTY ===== */}
      <section className="sovereignty-section">
        <img src="/images/sovereignty-bg.png" alt="" className="section-bg" />
        <div className="section-bg-fade" />

        <div className="sovereignty-content">
          <FadeIn>
            <p className="section-label">Data sovereignty</p>
            <h2 className="section-heading">What&apos;s generated here stays here</h2>
            <p className="section-text">
              Most global platforms extract user data from emerging markets and process it in foreign jurisdictions. Belo is built differently — data sovereignty is a core architectural decision. Local infrastructure, privacy by default, regulatory alignment, and value that stays in the region.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== CLOSE — overlaid on landscape ===== */}
      <section className="close-section">
        <img src="/images/landscape.png" alt="" className="close-bg" />
        <div className="close-fade-top" />
        <div className="close-fade-bottom" />
        <FadeIn className="close-content">
          <h2 className="close-title">belo</h2>
          <p className="close-byline">by GIOIA</p>
          <p className="close-text">Built for how they actually communicate.</p>
          <a href="mailto:saeed@gioia.co" className="close-cta">Get in Touch</a>
        </FadeIn>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <p>&copy; 2026 GIOIA. All rights reserved.</p>
      </footer>
    </main>
  );
}
