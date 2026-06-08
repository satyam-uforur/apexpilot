import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import AIChatPanel from '../components/AIChatPanel';
import Timer from '../components/Timer';
import LevelBriefing from '../components/LevelBriefing';
import FloorComplete from '../components/FloorComplete';
import { TUTORIAL_GRIDS, TUTORIAL_NOTES, TUTORIAL_HINTS, ANSWER_CELLS } from '../data/tutorialGrids';

function computeAnswer(grid) {
  const corners = ANSWER_CELLS.corners.map(({ r, c }) => String.fromCharCode(grid[r][c]));
  const cross = ANSWER_CELLS.cross.map(({ r, c }) => String.fromCharCode(grid[r][c]));
  return [...corners, ...cross].join('');
}

export default function Level1Screen() {
  const { state, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [briefingDone, setBriefingDone] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const [hintsOpen, setHintsOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth > 767
  );

  const rawVariant = state.variantAssignments?.level1;
  const variant = TUTORIAL_GRIDS[rawVariant] ? rawVariant : 'TUT-01';
  const grid = TUTORIAL_GRIDS[variant];
  const note = TUTORIAL_NOTES[variant];
  const expected = useMemo(() => computeAnswer(grid), [grid]);

  const isCorner = (r, c) => ANSWER_CELLS.corners.some(cell => cell.r === r && cell.c === c);
  const isCross = (r, c) => ANSWER_CELLS.cross.some(cell => cell.r === r && cell.c === c);
  const isLetterRange = (val) => val >= 65 && val <= 90;

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const answerKey = answer.trim().toUpperCase().replace(/\s+/g, '');
    if (answerKey === expected) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scoreMap = { 0: 200, 1: 150, 2: 100 };
      const baseScore = scoreMap[attempts] || 50;
      const penalty = hintsUsed * 25;
      const bonus = timeSpent < 60 ? 75 : timeSpent < 120 ? 50 : 0;
      const score = Math.max(0, baseScore - penalty + bonus);
      setFinalScore(score);
      setMessage('PASSWORD VERIFIED.');
      dispatch({ type: 'LEVEL_COMPLETED', payload: { level: 'level_1', data: { completed: true, score } } });
    } else {
      setMessage('Incorrect. Keep observing the grid.');
      setAttempts(a => a + 1);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= TUTORIAL_HINTS.length || state.hintsRemaining <= 0) return;
    setCurrentHint(TUTORIAL_HINTS[hintsUsed]);
    setHintsUsed(u => u + 1);
    dispatch({ type: 'USE_HINT' });
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
      <div className="floor-header ground-header">
        <span className="floor-label">FLOOR 1</span>
        <span className="ground-badge">1</span>
        <span className="mission-name">THE FIRST SIGNAL</span>
        <Timer seconds={0} running={false} />
      </div>

      <div className="two-panel">
        <div className="left-panel">
          <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>

            <div className="card" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-surface)' }}>
              <p className="text-dim" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>
                {finalScore !== null
                  ? 'PASSWORD VERIFIED. The elevator hums to life. Floor 2 awaits.'
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
                    const identified = finalScore !== null && (corner || cross);
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
                          color: letter && finalScore === null
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

          </div>

          {finalScore === null && (
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
                disabled={hintsUsed >= TUTORIAL_HINTS.length || state.hintsRemaining <= 0 || finalScore !== null}
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
              <AIChatPanel level="level_1" disabled={finalScore !== null} showBudget={false} />
            </div>
          </div>
          )}
        </div>
      </div>

      {finalScore !== null && (
        <FloorComplete
          floorNum={1}
          title="THE FIRST SIGNAL"
          description="You found 9 numbers in the ASCII letter range and converted them to characters."
          score={finalScore}
          hintsUsed={hintsUsed}
          nextFloor={2}
          onAscend={handleContinue}
        />
      )}
    </div>
  );
}
