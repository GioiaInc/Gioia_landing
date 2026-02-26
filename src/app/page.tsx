'use client';

import { useEffect, useState, useRef } from 'react';


const SUBTITLE_EN = [
  '93%', 'of', 'communication', 'is', 'paralinguistic.', 'Tone,', 'timing,',
  'pace,', 'emotion.', 'Current', 'messaging', 'captures', 'none', 'of', 'it.',
  'belo', 'is', 'a', 'messaging', 'app', 'built', 'around', 'ambient', 'AI.',
  'Lightweight', 'sentiment', 'models', 'process', 'everything', 'on-device,',
  'in', 'real', 'time.', 'The', 'interface', 'reflects', 'the', 'emotional',
  'state', 'of', 'the', 'conversation.', 'Colors', 'shift,', 'atmosphere',
  'adapts,', 'nudges', 'appear', 'when', 'tone', 'gets', 'heated.',
  'Nothing', 'leaves', 'the', 'phone.',
];

const SUBTITLE_RU = [
  '93%', 'коммуникации', 'паралингвистика.', 'Тон,', 'ритм,', 'темп,',
  'эмоция.', 'Современные', 'мессенджеры', 'не', 'передают', 'ничего',
  'из', 'этого.', 'belo', 'это', 'мессенджер,', 'построенный', 'на',
  'фоновом', 'ИИ.', 'Лёгкие', 'модели', 'анализа', 'тональности',
  'работают', 'на', 'устройстве,', 'в', 'реальном', 'времени.',
  'Интерфейс', 'отражает', 'эмоциональное', 'состояние', 'разговора.',
  'Цвета', 'меняются,', 'атмосфера', 'адаптируется,', 'подсказки',
  'появляются,', 'когда', 'тон', 'обостряется.',
  'Ничего', 'не', 'покидает', 'телефон.',
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
  const [loaded, setLoaded] = useState(false);
  const [grainOn, setGrainOn] = useState(false);
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const heroContentRef = useRef<HTMLDivElement>(null);

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

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-image-wrap">
          <img src="/images/hero-1.webp" alt="belo hero" className="hero-image active" />
          <img src="/images/hero-mobile.webp" alt="belo hero" className="hero-image hero-mobile-only active" />
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
          <h2 className="section-heading">Three ambient AI features, all on-device</h2>
        </FadeIn>

        <div className="feature-row">
          <FadeIn className="feature-visual">
            <img src="/images/belo_semantic_phone.webp" alt="" className="feature-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>Semantic Mood Detection</h3>
            <p>Real-time sentiment analysis changes the visual atmosphere of a chat. Colors, effects, and background shift based on the emotional state of both people in the conversation.</p>
          </FadeIn>
        </div>

        <div className="feature-row reverse">
          <FadeIn className="feature-visual">
            <img src="/images/belo_nudge_phone.webp" alt="" className="feature-image nudge-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>Emotional Nudges</h3>
            <p>Gentle, dismissable suggestions when the model detects the conversation shifting. Designed to help without being intrusive.</p>
          </FadeIn>
        </div>

        <div className="feature-row">
          <FadeIn className="feature-visual">
            <img src="/images/belo_glance_phone.webp" alt="" className="feature-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>Mood at a Glance</h3>
            <p>A visual summary on the home screen showing the emotional tone of each conversation. Mood-colored auras around each contact, visible before you open the chat.</p>
          </FadeIn>
        </div>
      </section>

      {/* ===== MARKET ===== */}
      <section className="market-section">
        <img src="/images/map_glow_outline.webp" alt="" className="section-bg market-bg-desktop" />
        <img src="/images/vertical_map_belo_market.webp" alt="" className="section-bg market-bg-mobile" />
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
              The infrastructure exists. The audience is online. What&apos;s missing is a product designed for them. One that understands regional communication patterns, social hierarchies, and multilingual nuance that global platforms will never optimize for.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== REVENUE / BUSINESS MODEL ===== */}
      <section className="revenue-section">

        <div className="revenue-content">
          <FadeIn>
            <p className="section-label">Business model</p>
            <h2 className="section-heading">The product is free. The business is in what it enables.</h2>
          </FadeIn>

          <div className="revenue-grid">
            <FadeIn className="revenue-item">
              <h3>Emotion-Aware Advertising</h3>
              <p>belo doesn&apos;t just know what people talk about. It understands how they feel when they say it. Ad targeting based on mood and intent, not just demographics. Brands reach users when they&apos;re genuinely receptive.</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.08}>
              <h3>Marketing Intelligence</h3>
              <p>Anonymized, aggregated communication patterns as a market research tool. Real-time emotional sentiment across cities, demographics, product categories. This data doesn&apos;t exist elsewhere.</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.16}>
              <h3>AI Data Licensing</h3>
              <p>Paralinguistic patterns. Typing rhythms, emotional markers, communication cadence. Licensed to AI companies for training more human-like systems. Vector embeddings, not raw messages. With user consent.</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.24}>
              <h3>Premium &amp; Digital Twins</h3>
              <p>Free users get the core experience. Premium tiers unlock Digital Twins. AI models of your communication style that draft messages in your voice, suggest responses, represent you in async conversations.</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.32}>
              <h3>Enterprise</h3>
              <p>Communication analytics for teams. Sentiment tracking, burnout pattern detection, customer support tools that detect frustration in real time. The same ambient AI, applied to B2B.</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.4}>
              <h3>Regional Ad Market</h3>
              <p>Uzbekistan&apos;s digital ad market projected at <span className="revenue-highlight">$368M</span> by 2028. Kazakhstan&apos;s internet ad revenue growing <span className="revenue-highlight">29%</span> year-over-year. Establishing belo as a core platform captures a share of this growth.</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== TECHNOLOGY ===== */}
      <section className="tech-section">
        <img src="/images/tech-bg.webp" alt="" className="section-bg" />
        <div className="section-bg-fade" />

        <div className="tech-content">
          <FadeIn>
            <p className="section-label">Technology</p>
            <h2 className="section-heading">Built on-device, designed to scale</h2>
          </FadeIn>

          <FadeIn>
            <p className="section-text tech-body">
              Sentiment analysis runs locally using micro transformer models. Mood scores, not messages, are exchanged between users via WebSocket. AI inference costs stay near zero. Message content never touches a server.
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
              <p>Over time, each user builds a vector-based profile of their communication style. Continuously updated embeddings, not fine-tuned models.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="tech-point">
              <h3>Data as Embeddings</h3>
              <p>Behavioral and emotional patterns stored as vector embeddings, never raw messages. Applications in health, marketing, education, and AI training. The product comes first.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== DATA SOVEREIGNTY ===== */}
      <section className="sovereignty-section">
        <img src="/images/data_dome_image.webp" alt="" className="section-bg" />
        <div className="section-bg-fade" />

        <div className="sovereignty-content">
          <FadeIn>
            <p className="section-label">Data sovereignty</p>
            <h2 className="section-heading">Data generated in the region stays in the region</h2>
            <p className="section-text">
              Most global platforms extract user data from emerging markets and process it in foreign jurisdictions. GIOIA is building differently. Data sovereignty is a core architectural decision, not a compliance afterthought.
            </p>
            <p className="section-text" style={{ marginTop: '1.2em' }}>
              Central Asian governments are investing in digital independence. Operating locally, with flexible data sovereignty frameworks, is a real structural advantage. The biggest barrier to cross-platform data use isn&apos;t technical. It&apos;s legal.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== CLOSE — overlaid on landscape ===== */}
      <section className="close-section">
        <img src="/images/landscape.webp" alt="" className="close-bg" />
        <div className="close-fade-top" />
        <div className="close-fade-bottom" />

        <FadeIn className={`close-content${formOpen ? ' shifted' : ''}`}>
          <h2 className="close-title">GIOIA</h2>
          <div className={`close-intro${formOpen ? ' out' : ''}`}>
            <p className="close-text">Imagine more.</p>
            <button className="close-cta" onClick={() => setFormOpen(true)}>Get in Touch</button>
          </div>
          <div className={`contact-form-wrap${formOpen ? ' visible' : ''}`}>
            <form className={`contact-form${formStatus === 'sent' ? ' is-sent' : ''}`} onSubmit={async (e) => {
              e.preventDefault();
              setFormStatus('sending');
              const fd = new FormData(e.target as HTMLFormElement);
              fd.append('access_key', 'e9985b76-a8c1-4350-b5ba-fe91f9e45be8');
              try {
                const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.success) {
                  setFormStatus('sent');
                  (e.target as HTMLFormElement).reset();
                  setTimeout(() => { setFormOpen(false); setFormStatus('idle'); }, 1800);
                } else {
                  setFormStatus('error');
                }
              } catch {
                setFormStatus('error');
              }
            }}>
              <div className="contact-fields">
                <input type="text" name="name" placeholder="Name" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="text" name="company" placeholder="Company (optional)" />
                <textarea name="message" placeholder="Message" rows={4} required />
              </div>
              <div className="contact-actions">
                <button type="submit" className="contact-submit" disabled={formStatus === 'sending' || formStatus === 'sent'}>
                  {formStatus === 'sending' ? 'Sending...' : 'Send'}
                </button>
                <button type="button" className="contact-back" onClick={() => { setFormOpen(false); setFormStatus('idle'); }}>Back</button>
              </div>
              {formStatus === 'sent' && <p className="contact-success">Sent successfully.</p>}
              {formStatus === 'error' && <p className="contact-error">Something went wrong. Please try again.</p>}
            </form>
          </div>
        </FadeIn>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <p>&copy; 2026 GIOIA. All rights reserved.</p>
      </footer>
    </main>
  );
}
