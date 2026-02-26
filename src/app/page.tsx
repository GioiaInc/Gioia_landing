'use client';

import { useEffect, useState, useRef } from 'react';
import { tr, subtitleWords, revenueAdMarketParts } from '@/lib/translations';
import { useLanguage } from '@/lib/useLanguage';


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
  const { lang, toggleLang } = useLanguage();
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

  const adParts = revenueAdMarketParts[lang];

  return (
    <main>
      {/* ===== LANGUAGE TOGGLE ===== */}
      <button className="lang-toggle" onClick={toggleLang} aria-label="Switch language">
        {lang === 'en' ? 'RU' : 'EN'}
      </button>

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
          <p className="hero-byline">{tr('hero.byline', lang)}</p>
        </div>

        <div className="scroll-hint">
          <div className="scroll-chevron" />
        </div>
      </section>

      {/* ===== SUBTITLE / INTRO ===== */}
      <section className="intro-section">
        <WordReveal key={lang} words={subtitleWords[lang]} />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="features-section">
        <FadeIn>
          <p className="section-label">{tr('features.label', lang)}</p>
          <h2 className="section-heading">{tr('features.heading', lang)}</h2>
        </FadeIn>

        <div className="feature-row">
          <FadeIn className="feature-visual">
            <img src="/images/belo_semantic_phone.webp" alt="" className="feature-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>{tr('features.semantic.title', lang)}</h3>
            <p>{tr('features.semantic.desc', lang)}</p>
          </FadeIn>
        </div>

        <div className="feature-row reverse">
          <FadeIn className="feature-visual">
            <img src="/images/belo_nudge_phone.webp" alt="" className="feature-image nudge-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>{tr('features.nudges.title', lang)}</h3>
            <p>{tr('features.nudges.desc', lang)}</p>
          </FadeIn>
        </div>

        <div className="feature-row">
          <FadeIn className="feature-visual">
            <img src="/images/belo_glance_phone.webp" alt="" className="feature-image" />
          </FadeIn>
          <FadeIn className="feature-text" delay={0.15}>
            <h3>{tr('features.glance.title', lang)}</h3>
            <p>{tr('features.glance.desc', lang)}</p>
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
            <p className="section-label">{tr('market.label', lang)}</p>
            <p className="big-number">80M+</p>
            <p className="big-number-sub">
              {tr('market.sub', lang)}
            </p>
          </FadeIn>

          <div className="market-stats">
            <FadeIn>
              <p className="market-stat-line"><span className="stat-highlight">{tr('market.stat1.value', lang)}</span>{tr('market.stat1.text', lang)}</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="market-stat-line"><span className="stat-highlight">{tr('market.stat2.value', lang)}</span>{tr('market.stat2.text', lang)}</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="market-stat-line"><span className="stat-highlight">{tr('market.stat3.value', lang)}</span>{tr('market.stat3.text', lang)}</p>
            </FadeIn>
          </div>

          <FadeIn>
            <p className="market-context">
              {tr('market.context', lang)}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== REVENUE / BUSINESS MODEL ===== */}
      <section className="revenue-section">

        <div className="revenue-content">
          <FadeIn>
            <p className="section-label">{tr('revenue.label', lang)}</p>
            <h2 className="section-heading">{tr('revenue.heading', lang)}</h2>
          </FadeIn>

          <div className="revenue-grid">
            <FadeIn className="revenue-item">
              <h3>{tr('revenue.ads.title', lang)}</h3>
              <p>{tr('revenue.ads.desc', lang)}</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.08}>
              <h3>{tr('revenue.intel.title', lang)}</h3>
              <p>{tr('revenue.intel.desc', lang)}</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.16}>
              <h3>{tr('revenue.data.title', lang)}</h3>
              <p>{tr('revenue.data.desc', lang)}</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.24}>
              <h3>{tr('revenue.premium.title', lang)}</h3>
              <p>{tr('revenue.premium.desc', lang)}</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.32}>
              <h3>{tr('revenue.enterprise.title', lang)}</h3>
              <p>{tr('revenue.enterprise.desc', lang)}</p>
            </FadeIn>
            <FadeIn className="revenue-item" delay={0.4}>
              <h3>{tr('revenue.admarket.title', lang)}</h3>
              <p>{adParts[0]}<span className="revenue-highlight">$368M</span>{adParts[1]}<span className="revenue-highlight">29%</span>{adParts[2]}</p>
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
            <p className="section-label">{tr('tech.label', lang)}</p>
            <h2 className="section-heading">{tr('tech.heading', lang)}</h2>
          </FadeIn>

          <FadeIn>
            <p className="section-text tech-body">
              {tr('tech.body', lang)}
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="tech-point">
              <h3>{tr('tech.ondevice.title', lang)}</h3>
              <p>{tr('tech.ondevice.desc', lang)}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="tech-point">
              <h3>{tr('tech.twins.title', lang)}</h3>
              <p>{tr('tech.twins.desc', lang)}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="tech-point">
              <h3>{tr('tech.embeddings.title', lang)}</h3>
              <p>{tr('tech.embeddings.desc', lang)}</p>
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
            <p className="section-label">{tr('sovereignty.label', lang)}</p>
            <h2 className="section-heading">{tr('sovereignty.heading', lang)}</h2>
            <p className="section-text">
              {tr('sovereignty.text1', lang)}
            </p>
            <p className="section-text" style={{ marginTop: '1.2em' }}>
              {tr('sovereignty.text2', lang)}
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
            <p className="close-text">{tr('close.text', lang)}</p>
            <button className="close-cta" onClick={() => setFormOpen(true)}>{tr('close.cta', lang)}</button>
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
                <input type="text" name="name" placeholder={tr('form.name', lang)} required />
                <input type="email" name="email" placeholder={tr('form.email', lang)} required />
                <input type="text" name="company" placeholder={tr('form.company', lang)} />
                <textarea name="message" placeholder={tr('form.message', lang)} rows={4} required />
              </div>
              <div className="contact-actions">
                <button type="submit" className="contact-submit" disabled={formStatus === 'sending' || formStatus === 'sent'}>
                  {formStatus === 'sending' ? tr('form.sending', lang) : tr('form.send', lang)}
                </button>
                <button type="button" className="contact-back" onClick={() => { setFormOpen(false); setFormStatus('idle'); }}>{tr('form.back', lang)}</button>
              </div>
              {formStatus === 'sent' && <p className="contact-success">{tr('form.success', lang)}</p>}
              {formStatus === 'error' && <p className="contact-error">{tr('form.error', lang)}</p>}
            </form>
          </div>
        </FadeIn>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <p>{tr('footer.copy', lang)}</p>
      </footer>
    </main>
  );
}
