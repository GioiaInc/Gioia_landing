'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax calculation for background blobs
  const parallaxOffset = scrollY * 0.3;

  return (
    <main className="relative min-h-screen">
      {/* Animated gradient background */}
      <div className="gradient-bg" />

      {/* Floating gradient blobs with parallax */}
      <div
        className="blob blob-1"
        style={{ '--rotation': '-15deg', transform: `translate(0, ${parallaxOffset * 0.5}px) rotate(-15deg)` } as React.CSSProperties}
      />
      <div
        className="blob blob-2"
        style={{ '--rotation': '20deg', transform: `translate(0, ${parallaxOffset * 0.3}px) rotate(20deg)` } as React.CSSProperties}
      />
      <div
        className="blob blob-3"
        style={{ '--rotation': '-25deg', transform: `translate(0, ${parallaxOffset * 0.4}px) rotate(-25deg)` } as React.CSSProperties}
      />
      <div
        className="blob blob-4"
        style={{ '--rotation': '35deg', transform: `translate(0, ${parallaxOffset * 0.35}px) rotate(35deg)` } as React.CSSProperties}
      />

      {/* Content container */}
      <div className="relative z-10 px-6 py-12 max-w-6xl mx-auto">

        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="brand-logo text-5xl md:text-6xl text-[#4a3f55] tracking-wide">
              GIOIA
            </h1>
            <span className="text-4xl md:text-5xl text-[#9b85a8] font-light">|</span>
            <span className="font-body text-4xl md:text-5xl text-[#7d6b8a]">
              balo
            </span>
          </div>
          <p className="font-body italic text-xl md:text-2xl text-[#5c4d6b] max-w-2xl mx-auto">
            Building AI infrastructure through <span className="font-semibold">exceptional design</span>
          </p>
        </header>

        {/* Problem & Solution Section */}
        <section className="grid md:grid-cols-2 gap-6 mb-12 items-stretch">
          <ScrollReveal>
            <div className="glass-card p-8 h-full flex flex-col">
              <h2 className="section-heading text-lg md:text-xl mb-6 text-center">THE PROBLEM</h2>
              <div className="flex-1 flex items-center">
                <p className="body-text text-center">
                  Digital communication is broken. Text-based messaging accounts for less than 20% of human communication, the rest is paralinguistic cues like tone, timing, and emotion. This gap leaves people feeling disconnected and makes digital interaction feel transactional rather than human.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="glass-card p-8 h-full flex flex-col">
              <h2 className="section-heading text-lg md:text-xl mb-6 text-center">THE SOLUTION</h2>
              <div className="flex-1 flex items-center">
                <p className="body-text text-center">
                  GIOIA reimagines digital products with design and user experience as the foundation. Our first product, <em>balo</em>, is a new communication platform built to bridge the nonverbal gap by focusing on how people experience connection over time. Through thoughtful design research, we study how conversation dynamics, emotional context, and shared moments shape human relationships, and use those insights to create more meaningful digital communication.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Why This Matters & Why Now Section */}
        <section className="mb-16">
          <ScrollReveal>
            <div className="glass-card p-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h2 className="section-heading text-lg md:text-xl mb-6 text-center">WHY THIS MATTERS</h2>
                  <p className="body-text text-center">
                    Better communication = better AI. When people enjoy communicating, they communicate more. More communication means richer data for AI training. We believe AI should feel invisible. Present but not intrusive, seamlessly integrated into daily life. Our platform becomes an extension of the user, understanding communication patterns across neurotypes and preferences, enabling AI that truly understands individuals.
                  </p>
                </div>
                <div>
                  <h2 className="section-heading text-lg md:text-xl mb-6 text-center">WHY NOW</h2>
                  <p className="body-text text-center">
                    While major tech companies are distracted with incremental improvements, we have the opportunity to fundamentally rethink communication. The digital landscape is consolidating between US, Russia and China. Central Asia represents a unique opportunity to build an independent pillar of global AI infrastructure. True innovation doesn&apos;t come from asking users what they want, it comes from deep research into human behavior and surprising them with something better.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Market Strategy Section */}
        <section className="mb-16">
          <ScrollReveal>
            <h2 className="section-heading text-2xl md:text-3xl text-center mb-10">
              MARKET STRATEGY
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 mb-10 items-stretch">
            <ScrollReveal delay={100}>
              <div className="glass-pill px-8 py-6 h-full flex items-center justify-center">
                <p className="body-text text-center">
                  <strong className="font-heading text-xs uppercase tracking-wider">Initial Market:</strong>{' '}
                  Central Asia, a region currently served primarily by Western, Chinese, and Russian tech infrastructure, but with limited local ownership and control.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass-pill px-8 py-6 h-full flex items-center justify-center">
                <p className="body-text text-center">
                  <strong className="font-heading text-xs uppercase tracking-wider">Strategic Advantage:</strong>{' '}
                  We&apos;re working to give countries more sovereignty over their digital infrastructure. Local data centers will allow citizens and governments to maintain privacy and control. Data can then be used to train localized AI models.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Growth Loop Flow */}
          <ScrollReveal delay={300}>
            <div className="text-center py-8">
              <p className="font-body text-lg md:text-xl text-[#4a3f55] leading-relaxed">
                <em>balo</em> attracts users{' '}
                <span className="flow-arrow text-[#9b85a8]">→</span>{' '}
                regular interactions produce data{' '}
                <span className="flow-arrow text-[#9b85a8]">→</span>{' '}
                data enhances regional AI{' '}
                <span className="flow-arrow text-[#9b85a8]">→</span>
                <br className="hidden md:block" />
                AI spreads to sectors like banking, healthcare, and education{' '}
                <span className="flow-arrow text-[#9b85a8]">→</span>{' '}
                growing ecosystem
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Current Designs Section */}
        <section className="mb-16">
          <ScrollReveal>
            <h2 className="section-heading text-2xl md:text-3xl text-center mb-10">
              CURRENT DESIGNS
            </h2>
          </ScrollReveal>

          {/* Phone Mockups */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {/* Dark theme phones */}
            <ScrollReveal delay={0}>
              <div className="phone-mockup">
                <Image
                  src="/images/phone-dark-1.png"
                  alt="balo app dark theme - constellation view"
                  width={300}
                  height={600}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={50}>
              <div className="phone-mockup">
                <Image
                  src="/images/phone-dark-2.png"
                  alt="balo app dark theme - connections"
                  width={300}
                  height={600}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="phone-mockup">
                <Image
                  src="/images/phone-dark-3.png"
                  alt="balo app dark theme - network"
                  width={300}
                  height={600}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
            </ScrollReveal>

            {/* Light theme phones */}
            <ScrollReveal delay={150}>
              <div className="phone-mockup">
                <Image
                  src="/images/phone-light-1.png"
                  alt="balo app light theme - constellation"
                  width={300}
                  height={600}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="phone-mockup">
                <Image
                  src="/images/phone-light-2.png"
                  alt="balo app light theme - connections"
                  width={300}
                  height={600}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <div className="phone-mockup">
                <Image
                  src="/images/phone-light-3.png"
                  alt="balo app light theme - network"
                  width={300}
                  height={600}
                  className="w-full h-auto rounded-3xl"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 pb-16 border-t border-[#d4c8e0]/30">
          <ScrollReveal>
            <div className="mb-8">
              <span className="brand-logo text-3xl text-[#5c4d6b]">GIOIA</span>
              <span className="mx-3 text-[#9b85a8]">·</span>
              <span className="font-body italic text-lg text-[#7d6b8a]">
                Reimagining digital experience through design
              </span>
            </div>

            {/* Contact Section */}
            <div className="contact-glass inline-block px-10 py-6">
              <h3 className="font-heading text-sm uppercase tracking-wider text-white/90 mb-3">
                Get in Touch
              </h3>
              <a
                href="mailto:hello@gioia.io"
                className="font-body text-xl text-white/80 hover:text-white transition-colors"
              >
                hello@gioia.io
              </a>
            </div>
          </ScrollReveal>
        </footer>
      </div>
    </main>
  );
}

// Scroll reveal component for animations
function ScrollReveal({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out h-full ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}
