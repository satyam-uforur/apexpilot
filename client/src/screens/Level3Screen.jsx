import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Timer from '../components/Timer';
import LevelBriefing from '../components/LevelBriefing';

const CODE_LINES = [
  { text: 'def factorial(n):', ok: true },
  { text: '  if n <= 1', ok: false, error: 'SyntaxError:expected:' },
  { text: '      return 1', ok: false, error: 'IndentationError:' },
  { text: '  result = 1', ok: true },
  { text: '  for i in range(1, n+1)', ok: false, error: 'SyntaxError:invalid' },
  { text: '  result *= i', ok: true },
  { text: '  return result', ok: true },
  { text: '', ok: true },
  { text: 'def main():', ok: true },
  { text: '  num = 7', ok: true },
  { text: '  print(factorial(num))', ok: true },
  { text: '', ok: true },
  { text: 'main()', ok: true },
  { text: '', ok: true },
  { text: '# signature: typ3c0d3fall', ok: true },
];

const ERROR_TEXTS = [
  'SyntaxError:expected:',
  'IndentationError:',
  'SyntaxError:invalid',
];

const HINTS = [
  'The code is intentionally broken. There are exactly 3 errors. Each error produces a specific message. Read the messages carefully.',
  'Each error message has a specific number of characters. Add all 3 together. The total is part of the password.',
  'The first letters of each error message (in order, as they appear in the code) spell a word. Combine that with the total character count.',
  'Total error message characters = 31. First letters spell: TYPECODEFALL. Enter: 31TYPECODEFALL.',
];

export default function Level3Screen() {
  const { state, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('briefing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeExpired, setTimeExpired] = useState(false);
  const [revealedErrors, setRevealedErrors] = useState(new Set());
  const [hintsOpen, setHintsOpen] = useState(false);

  const toggleError = (idx) => {
    const next = new Set(revealedErrors);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setRevealedErrors(next);
  };

  const handleSubmit = () => {
    if (!answer.trim() || timeExpired) return;
    const normalized = answer.trim().toUpperCase();
    if (normalized === '31TYPECODEFALL') {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scoreMap = { 0: 200, 1: 150, 2: 100 };
      const baseScore = scoreMap[attempts] || 50;
      const penalty = hintsUsed * 25;
      const bonus = timeSpent < 60 ? 75 : timeSpent < 120 ? 50 : 0;
      const finalScore = Math.max(0, baseScore - penalty + bonus);
      setMessage('FAULT LINE IDENTIFIED. SABOTEUR SIGNATURE CONFIRMED.');
      setStage('complete');
      dispatch({ type: 'LEVEL_COMPLETED', payload: { level: 'level_2', data: { completed: true, score: finalScore } } });
    } else {
      setMessage('SIGNATURE MISMATCH. The count is wrong or the phrase is wrong.');
      setAttempts(a => a + 1);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= HINTS.length || state.hintsRemaining <= 0) return;
    setCurrentHint(HINTS[hintsUsed]);
    setHintsUsed(u => u + 1);
    dispatch({ type: 'USE_HINT' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'level_3' });
  };

  const handleTimeUp = () => {
    setTimeExpired(true);
    setMessage('TIME EXPIRED.');
  };

  const errorLineIndices = CODE_LINES.map((l, i) => !l.ok ? i : -1).filter(i => i >= 0);

  if (stage === 'briefing') {
    return <LevelBriefing level="level_2" onContinue={() => setStage('playing')} />;
  }

  return (
    <div className="screen">
      <div className="floor-atmosphere floor-atmo-1" />
      <div className="vignette" />
      <div className="floor-header">
        <span className="floor-label">FLOOR 2</span>
        <span className="mission-name">FAULT LINES</span>
        <Timer seconds={600} onExpire={handleTimeUp} />
      </div>

      <div className="two-panel">
        <div className="left-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>

            {stage === 'complete' && (
              <div className="card glow-green" style={{ textAlign: 'center' }}>
                <div className="text-green" style={{ fontSize: 'var(--text-xl)', fontFamily: "'Bebas Neue', sans-serif" }}>
                  FAULT LINE IDENTIFIED
                </div>
                <p className="text-dim mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                  The saboteur&apos;s signature was hidden in plain sight. The errors told you the number. The comment told you the phrase.
                </p>
                <button className="cta-primary mt-4" onClick={handleContinue}>
                  ASCEND TO FLOOR 3
                </button>
              </div>
            )}

            <p className="text-dim" style={{ fontSize: 'var(--text-xs)', lineHeight: '1.6' }}>
              <span className="text-red" style={{ fontWeight: 600 }}>OBJECTIVE:</span> The tower's security module has been corrupted. Faults injected with precision. Read the code. Find the errors. Each error produces a message. One player found the aggregate. The saboteur left a signature.
            </p>

            <div className="card" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: 'var(--bg-void)', borderColor: 'var(--border-dim)',
              overflow: 'hidden', minHeight: 0,
            }}>
              <div style={{
                flex: 1, overflow: 'auto', padding: 'var(--space-4)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 'var(--text-sm)',
                lineHeight: '1.8', whiteSpace: 'pre',
              }}>
                {CODE_LINES.map((line, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    opacity: line.ok ? 0.7 : 1,
                  }}>
                    <span style={{ color: 'var(--text-ghost)', fontSize: '10px', width: '24px', textAlign: 'right', userSelect: 'none' }}>
                      {i + 1}
                    </span>
                    <span style={{ color: line.ok ? 'var(--text-code)' : 'var(--red-alert)' }}>
                      {line.text || ' '}
                    </span>
                    {!line.ok && (
                      <button
                        className="copy-error-btn"
                        onClick={() => toggleError(i)}
                        style={{
                          fontSize: '9px', padding: '2px 6px',
                          background: revealedErrors.has(i) ? 'var(--green-dark)' : 'var(--bg-surface)',
                          border: '1px solid var(--border-dim)',
                          color: revealedErrors.has(i) ? 'var(--green-apex)' : 'var(--text-ghost)',
                          cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: '0.05em', whiteSpace: 'nowrap',
                        }}
                      >
                        {revealedErrors.has(i) ? 'HIDE' : 'ERROR'}
                      </button>
                    )}
                    {revealedErrors.has(i) && (
                      <span style={{ color: 'var(--amber-warn)', fontSize: 'var(--text-xs)' }}>
                        {'<--'} {line.error}
                      </span>
                    )}
                  </div>
                ))}
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-hairline)', color: 'var(--text-ghost)', fontSize: 'var(--text-xs)' }}>
                  {'# hint: the sum of all error message characters is the first part of the password'}
                </div>
              </div>
            </div>
          </div>

          {stage !== 'complete' && (
            <div className="submission-bar">
              <input
                type="text"
                className={`answer-input${message ? ' wrong' : ''}`}
                placeholder="ENTER PASSWORD..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
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

        <div className={'right-panel' + (hintsOpen ? '' : ' collapsed')} style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            className="hint-panel-header hints-toggle"
            onClick={() => setHintsOpen(o => !o)}
            style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
          >
            <span className="hint-panel-title" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HINTS
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="hint-count" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'var(--text-sm)', color: state.hintsRemaining <= 1 ? 'var(--red-alert)' : 'var(--green-apex)' }}>
                {state.hintsRemaining}/5
              </span>
              <span className="hints-arrow" style={{ fontSize: '10px', color: 'var(--text-ghost)', transition: 'transform 0.3s ease', transform: hintsOpen ? 'rotate(180deg)' : 'none' }}>▴</span>
            </span>
          </div>
          <div className="right-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-4)' }}>
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
      </div>
    </div>
  );
}
