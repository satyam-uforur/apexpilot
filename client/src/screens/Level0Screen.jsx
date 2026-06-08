import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import Timer from '../components/Timer';
import LevelBriefing from '../components/LevelBriefing';

const PATTERNS = [
  { seq: [1, 2, 3, 4], ans: 5 },
  { seq: [2, 3, 4, 5], ans: 6 },
  { seq: [3, 4, 5, 6], ans: 7 },
  { seq: [4, 5, 6, 7], ans: 8 },
  { seq: [5, 6, 7, 8], ans: 9 },
  { seq: [9, 8, 7, 6], ans: 5 },
  { seq: [8, 7, 6, 5], ans: 4 },
  { seq: [7, 6, 5, 4], ans: 3 },
  { seq: [6, 5, 4, 3], ans: 2 },
  { seq: [5, 4, 3, 2], ans: 1 },
  { seq: [1, 3, 5, 7], ans: 9 },
  { seq: [9, 7, 5, 3], ans: 1 },
  { seq: [1, 2, 1, 2], ans: 1 },
  { seq: [3, 5, 3, 5], ans: 3 },
  { seq: [2, 7, 2, 7], ans: 2 },
  { seq: [4, 6, 4, 6], ans: 4 },
  { seq: [3, 3, 3, 3], ans: 3 },
  { seq: [7, 7, 7, 7], ans: 7 },
  { seq: [1, 1, 2, 3], ans: 5 },
  { seq: [1, 2, 3, 5], ans: 8 },
];

const HINTS = [
  'The sequence follows a rule. The rule is simple \u2014 not mathematical complexity. Look at the relationship between each number and the one before it.',
  'Once you know the next number, the table on screen converts it for you. The hard part is finding the number. The easy part is looking it up.',
  'The next number is a single digit. It is between 1 and 9. Its ASCII code is between 49 and 57.',
];

const ASCII_MAP = [
  ['0', '48'], ['1', '49'], ['2', '50'], ['3', '51'],
  ['4', '52'], ['5', '53'], ['6', '54'], ['7', '55'],
  ['8', '56'], ['9', '57'],
];

export default function Level0Screen() {
  const { state, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('briefing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeExpired, setTimeExpired] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [hintsOpen, setHintsOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth > 767
  );
  const completionRef = useRef(null);
  const leftPanelRef = useRef(null);

  const patternIndex = useState(() => Math.floor(Math.random() * PATTERNS.length))[0];
  const pattern = PATTERNS[patternIndex];
  const expectedCode = 48 + pattern.ans;

  const handleSubmit = () => {
    if (!answer.trim() || timeExpired) return;
    const code = parseInt(answer.trim(), 10);
    if (code === expectedCode) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scoreMap = { 0: 200, 1: 150, 2: 100 };
      const baseScore = scoreMap[attempts] || 50;
      const penalty = hintsUsed * 25;
      const bonus = timeSpent < 60 ? 75 : timeSpent < 120 ? 50 : 0;
      const score = Math.max(0, baseScore - penalty + bonus);
      setFinalScore(score);
      setMessage('SIGNAL PATTERN CONFIRMED.');
      setStage('complete');
      dispatch({ type: 'LEVEL_COMPLETED', payload: { level: 'level_0', data: { completed: true, score } } });
    } else {
      setMessage('INCORRECT. Check the pattern and the ASCII table below.');
      setAttempts(a => a + 1);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  useEffect(() => {
    if (stage === 'complete' && completionRef.current) {
      setTimeout(() => {
        completionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [stage]);

  const handleHint = () => {
    if (hintsUsed >= HINTS.length || state.hintsRemaining <= 0) return;
    setCurrentHint(HINTS[hintsUsed]);
    setHintsUsed(u => u + 1);
    dispatch({ type: 'USE_HINT' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'level_1' });
  };

  const handleTimeUp = () => {
    setTimeExpired(true);
    setMessage('TIME EXPIRED.');
  };

  if (stage === 'briefing') {
    return <LevelBriefing level="level_0" onContinue={() => setStage('playing')} />;
  }

  return (
    <div className="screen">
      <div className="floor-atmosphere" />
      <div className="vignette" />
      <div className="floor-header">
        <span className="floor-label">FLOOR 0</span>
        <span className="mission-name">FAULT LINES</span>
        <Timer seconds={0} running={false} />
      </div>

      <div className="two-panel">
        <div className="left-panel" ref={leftPanelRef}>
          <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>
            {stage === 'complete' && (
              <div ref={completionRef} className="card glow-green" style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="text-green" style={{ fontSize: 'var(--text-xl)', fontFamily: "'Bebas Neue', sans-serif" }}>
                  SIGNAL PATTERN CONFIRMED
                </div>
                <p className="text-dim mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                  You identified the sequence. You converted it correctly. The tower does not test what you know. It tests how precisely you apply what you know.
                </p>
                <p className="text-muted mt-2" style={{ fontSize: 'var(--text-xs)' }}>
                  Score: {finalScore} points
                  {hintsUsed > 0 && ` (${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used: -${hintsUsed * 25} pts)`}
                </p>
                <button className="cta-primary mt-4" onClick={handleContinue}>
                  ASCEND TO FLOOR 1
                </button>
              </div>
            )}
            <p className="text-dim" style={{ fontSize: 'var(--text-xs)', lineHeight: '1.6' }}>
              <span className="text-red" style={{ fontWeight: 600 }}>OBJECTIVE:</span> A signal sequence has been intercepted. The pattern is corrupted at position 5. Identify the missing value. The tower wants the ASCII code of that number.
            </p>

            <div className="card" style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-void)', borderColor: 'var(--border-dim)',
              padding: 'var(--space-8) var(--space-4)', gap: 'var(--space-4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {pattern.seq.map((n, i) => (
                  <React.Fragment key={i}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {n}
                    </span>
                    {i < pattern.seq.length - 1 && (
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '32px', color: 'var(--text-ghost)' }}>,</span>
                    )}
                  </React.Fragment>
                ))}
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '32px', color: 'var(--text-ghost)' }}>,</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: 'var(--green-apex)', lineHeight: 1, animation: 'floor-pulse 2s ease-in-out infinite' }}>
                  [?]
                </span>
              </div>
              <p className="text-ghost" style={{ fontSize: 'var(--text-xs)' }}>
                Each value is a signal unit. The missing unit = next in pattern. Submit the ASCII code of that unit.
              </p>
            </div>

            <div className="card" style={{ background: 'transparent', borderColor: 'var(--border-dim)', padding: 'var(--space-3) var(--space-4)' }}>
              <p className="text-ghost" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)' }}>
                ASCII REFERENCE
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 'var(--text-sm)', textAlign: 'center',
              }}>
                {ASCII_MAP.map(a => (
                  <div key={a[0]} style={{ padding: '4px 0', borderBottom: '1px solid var(--border-hairline)' }}>
                    <div style={{ color: 'var(--text-primary)' }}>{a[0]}</div>
                    <div style={{ color: 'var(--text-code)', fontSize: 'var(--text-xs)' }}>{a[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {stage !== 'complete' && (
            <div className="submission-bar">
              <input
                type="text"
                inputMode="numeric"
                className={`answer-input${message ? ' wrong' : ''}`}
                placeholder="ENTER ASCII CODE (48-57)..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={timeExpired}
              />
              <button className="submit-btn" onClick={handleSubmit} disabled={!answer.trim() || timeExpired}>
                SUBMIT
              </button>
              {message && (
                <div className={`text-${message.includes('CONFIRMED') ? 'green' : 'red'}`} style={{ fontSize: 'var(--text-xs)' }}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`right-panel${hintsOpen ? '' : ' collapsed'}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            className="hint-panel-header hints-toggle"
            onClick={() => setHintsOpen(o => !o)}
            style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
          >
            <span className="hint-panel-title" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HINTS
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="hint-count" style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'var(--text-sm)',
                color: state.hintsRemaining <= 1 ? 'var(--red-alert)' : 'var(--green-apex)',

              }}>

                <span>{state.hintsRemaining}</span>/5
              </span>
              <span className="hints-arrow" style={{
                fontSize: '10px',
                color: 'var(--text-ghost)',
                transition: 'transform 0.2s ease',
                display: 'inline-block',
                transform: hintsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>▾</span>
            </span>
          </div>
          {hintsOpen && (
          <div className="right-panel-scroll" style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent' }}>
            <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <button
                className="hint-btn"
                onClick={handleHint}
                disabled={hintsUsed >= HINTS.length || state.hintsRemaining <= 0 || stage === 'complete'}
                style={{ width: '100%', textAlign: 'left' }}
              >
                REQUEST HINT <span className="hint-cost">(-25 pts)</span>
              </button>
              {currentHint && (
                <div className="hint-display" style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  background: 'var(--bg-surface-2)',
                  borderLeft: '2px solid var(--amber-warn)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                }}>
                  <div className="hint-label" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>HINT {hintsUsed}/{HINTS.length}</div>
                  <div className="hint-text" style={{ fontStyle: 'italic' }}>{currentHint}</div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
