import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const LINES = [
  { text: 'THE TOWER WAS NEVER TESTING INTELLIGENCE.', type: 'normal', delay: 1800 },
  { text: '', type: 'blank', delay: 200 },
  { text: 'AI ALREADY HAS INTELLIGENCE.', type: 'normal', delay: 1800 },
  { text: '', type: 'blank', delay: 200 },
  { text: 'THE TOWER WAS TESTING SOMETHING ELSE.', type: 'normal', delay: 1800 },
  { text: '', type: 'blank', delay: 800 },
  { text: 'HOW HUMANS USE IT.', type: 'emphasis', delay: 2400 },
  { text: '', type: 'blank', delay: 1000 },
  { text: 'Some chose cooperation. Some chose competition.', type: 'small', delay: 400 },
  { text: 'Some relied on AI. Some challenged it.', type: 'small', delay: 400 },
  { text: 'Some verified. Some guessed.', type: 'small', delay: 400 },
  { text: '', type: 'blank', delay: 800 },
  { text: 'The challenges were temporary.', type: 'small', delay: 800 },
  { text: 'The habits were permanent.', type: 'small', delay: 800 },
  { text: '', type: 'blank', delay: 800 },
  { text: 'WELCOME TO APEXRANK.', type: 'welcome', delay: 2000 },
];

export default function RevealScreen() {
  const { state, generateReport } = useGame();
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleLines < LINES.length) {
      const timer = setTimeout(() => setVisibleLines(v => v + 1), LINES[visibleLines].delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDone(true);
        generateReport();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, generateReport]);

  return (
    <div className="screen" style={{
      justifyContent: 'center', alignItems: 'center',
      background: 'var(--bg-void)',
      opacity: done ? 0 : 1,
      transition: 'opacity 1s ease',
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{
            marginBottom: '0.5rem',
            fontSize: line.type === 'emphasis' ? 'var(--text-3xl)' : line.type === 'welcome' ? 'var(--text-4xl)' : line.type === 'normal' ? 'var(--text-lg)' : 'var(--text-sm)',
            color: line.type === 'welcome' ? 'var(--green-apex)' : line.type === 'emphasis' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: line.type === 'welcome' ? "'Bebas Neue', sans-serif" : "'IBM Plex Mono', monospace",
            letterSpacing: line.type === 'welcome' ? '0.15em' : '0.03em',
            fontWeight: line.type === 'emphasis' ? '600' : '400',
            animation: 'fadeIn 0.6s ease',
            textTransform: line.type === 'welcome' ? 'uppercase' : 'none',
          }}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
