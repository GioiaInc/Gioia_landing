'use client';

import { useState, useEffect } from 'react';
import { docsQuotes, type DocsQuote } from '@/lib/docs-quotes';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuoteTrack({ quotes }: { quotes: DocsQuote[] }) {
  return (
    <>
      {quotes.map((q, i) => (
        <blockquote key={i} className="quote-col-item">
          <p className="quote-col-text">&ldquo;{q.text}&rdquo;</p>
          <footer className="quote-col-author">— {q.author}</footer>
        </blockquote>
      ))}
    </>
  );
}

export default function QuoteColumns() {
  const [shuffled, setShuffled] = useState<DocsQuote[] | null>(null);

  useEffect(() => {
    setShuffled(shuffle(docsQuotes));
  }, []);

  if (!shuffled) return null;

  const mid = Math.ceil(shuffled.length / 2);
  const left = shuffled.slice(0, mid);
  const right = shuffled.slice(mid);

  return (
    <>
      <div className="quote-col quote-col-left" aria-hidden="true">
        <div className="quote-col-track quote-col-track-left">
          <QuoteTrack quotes={left} />
          <QuoteTrack quotes={left} />
        </div>
      </div>
      <div className="quote-col quote-col-right" aria-hidden="true">
        <div className="quote-col-track quote-col-track-right">
          <QuoteTrack quotes={right} />
          <QuoteTrack quotes={right} />
        </div>
      </div>
    </>
  );
}
