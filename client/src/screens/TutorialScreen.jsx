import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import AIChatPanel from '../components/AIChatPanel';
import Timer from '../components/Timer';
import LevelBriefing from '../components/LevelBriefing';
import { TUTORIAL_GRIDS, TUTORIAL_NOTES, TUTORIAL_HINTS, ANSWER_CELLS } from '../data/tutorialGrids';

export default function TutorialScreen() {
  const { state, dispatch, loadLevelContent, submitLevelAnswer } = useGame();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [startTime] = useState(Date.now());
  const [finalResult, setFinalResult] = useState(null);
  const [briefingDone, setBriefingDone] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth > 767
  );

  const variant = state.variantAssignments?.tutorial || 'TUT-01';
  const grid = TUTORIAL_GRIDS[variant];
  const note = TUTORIAL_NOTES[variant];

  useEffect(() => { loadLevelContent('tutorial'); }, [loadLevelContent]);
  useEffect(() => {
    if (finalResult) {
      const t = setTimeout(() => setReveal(true), 800);
      return () => clearTimeout(t);
    }
  }, [finalResult]);

  const isCorner = (r, c) => ANSWER_CELLS.corners.some(cell => cell.r === r && cell.c === c);
  const isCross = (r, c) => ANSWER_CELLS.cross.some(cell => cell.r === r && cell.c === c);
  const isLetterRange = (val) => val >= 65 && val <= 90;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const answerKey = answer.trim().toUpperCase().replace(/\s+/g, '');
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const result = await submitLevelAnswer('tutorial',
      (sid, ans, ts) => fetch('/api/level/tutorial/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, answer: ans, timeSpent: ts }),
      }).then(r => r.json()),
      state.sessionId, answerKey, timeSpent
    );
    if (result && result.valid) {
      setFinalResult(result);
      dispatch({ type: 'LEVEL_COMPLETED', payload: { level: 'level_1', data: { completed: true, score: result.score } } });
    } else {
      setMessage(result?.message || 'Incorrect. Keep observing the grid.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= TUTORIAL_HINTS.length) return;
    setCurrentHint(TUTORIAL_HINTS[hintsUsed]);
    setHintsUsed(u => u + 1);
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'level_2' });
  };

  if (!briefingDone) {
    return <LevelBriefing level="level_1" onContinue={() => setBriefingDone(true)} />;
  }

  return (
    <div className="screen ground-floor">
      <div className="floor-atmosphere" />
      <div className="vignette" />
      <div className="ground-floor-line" />
      <div className="floor-header ground-header">
        <span className="floor-label">FLOOR 1</span>
        <span className="ground-badge">1</span>
        <span className="mission-name">THE FIRST SIGNAL</span>
        <Timer seconds={0} running={false} />
      </div>

      <div className="two-panel tutorial-panels">
        <div className="left-panel">
          <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>

            <div className="card" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-surface)' }}>
              <p className="text-dim" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>
                {finalResult
                  ? 'PASSWORD VERIFIED. The elevator hums to life. Floor 1 awaits.'
                  : 'A corrupted signal matrix — 144 data points. The password is hidden within. Not all numbers matter.'}
              </p>
            </div>

            <div className="card" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: 'var(--bg-void)', borderColor: 'var(--border-dim)',
              padding: 'var(--space-4)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                <span className="text-muted" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  CORRUPTED SIGNAL MATRIX
                </span>
                <span className="text-ghost" style={{ fontSize: '10px', letterSpacing: '0.15em', marginLeft: 'var(--space-4)', textTransform: 'uppercase' }}>
                  144 DATA POINTS | 12×12 GRID
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '2px',
                maxWidth: '480px',
                margin: '0 auto',
                width: '100%',
              }}>
                {grid.map((row, r) =>
                  row.map((val, c) => {
                    const corner = isCorner(r, c);
                    const cross = isCross(r, c);
                    const letter = isLetterRange(val);
                    const identified = finalResult && (corner || cross);
                    return (
                      <div key={`${r}-${c}`}
                        className={`grid-cell${corner ? ' corner' : ''}${identified ? ' identified' : ''}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: cross
                            ? 'rgba(0, 255, 179, 0.025)'
                            : 'var(--bg-surface-2)',
                          border: corner
                            ? '1px solid rgba(0, 255, 179, 0.12)'
                            : '1px solid var(--border-hairline)',
                          boxShadow: corner ? 'inset 0 0 6px rgba(0, 255, 179, 0.04)' : 'none',
                          color: letter && !finalResult
                            ? 'var(--text-primary)'
                            : identified
                              ? 'var(--green-apex)'
                              : 'var(--text-ghost)',
                          fontWeight: letter ? 500 : 400,
                        }}>
                        {val}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="instruction-note mt-3">
                Note: "{note}"
              </div>
            </div>

            {reveal && (
              <div className="card glow-green" style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                <div className="text-green" style={{ fontSize: 'var(--text-xl)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
                  FLOOR 1 CLEARED
                </div>
                <p className="text-dim mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                  You found 9 numbers in the ASCII letter range and converted them to characters.
                </p>
                <p className="text-muted mt-2" style={{ fontSize: 'var(--text-xs)' }}>
                  Score: {finalResult?.score || 0} points
                  {hintsUsed > 0 && ` (${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used: -${hintsUsed * 25} pts)`}
                </p>
                <button className="cta-primary mt-4" onClick={handleContinue}>
                  ASCEND TO FLOOR 2
                </button>
              </div>
            )}
          </div>

          {!finalResult && (
            <div className="submission-bar ground-bar">
              <input
                type="text"
                className={`answer-input${message && !message.includes('VERIFIED') ? ' wrong' : ''}`}
                placeholder="ENTER DECODED PASSWORD..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button className="submit-btn" onClick={handleSubmit} disabled={!answer.trim()}>
                SUBMIT
              </button>
              {message && (
                <div className={`text-${message.includes('VERIFIED') ? 'green' : 'red'}`} style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
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
                color: TUTORIAL_HINTS.length - hintsUsed <= 1 ? 'var(--red-alert)' : 'var(--green-apex)',
              }}>
                <span>{TUTORIAL_HINTS.length - hintsUsed}</span>/{TUTORIAL_HINTS.length}
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
                disabled={hintsUsed >= TUTORIAL_HINTS.length || finalResult}
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
                  <div className="hint-label" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>HINT</div>
                  <div className="hint-text" style={{ fontStyle: 'italic' }}>{currentHint}</div>
                </div>
              )}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <AIChatPanel level="tutorial" disabled={!!finalResult} showBudget={false} />
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
