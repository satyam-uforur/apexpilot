import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../context/GameContext';
import LevelBriefing from '../components/LevelBriefing';
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
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play().catch(() => setVideoFailed(true));
    }
  }, []);

  const rawVariant = state.variantAssignments?.tutorial;
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
      dispatch({ type: 'GAME_COMPLETED', payload: { passed: true, score: score } });
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
    dispatch({ type: 'SET_SCREEN', payload: 'reveal' });
  };

  if (!briefingDone) {
    return <LevelBriefing level="level_3" onContinue={() => setBriefingDone(true)} />;
  }

  return (
    <div className="helipad-screen">
      {!videoFailed ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="helipad-video-bg"
        >
          <source src="/safinal.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="helipad-bg" />
      )}
      <div className="helipad-tint" />

      <div className="helipad-panel" style={{
        background: 'linear-gradient(to bottom, rgba(1,1,10,0.08), rgba(1,1,10,0.15) 40%, rgba(8,8,16,0.25) 100%)',
        padding: '180px 40px 80px', gap: '16px',
      }}>
        <div className="card" style={{
          background: 'transparent', borderColor: 'rgba(232,232,240,0.08)',
          padding: 'var(--space-4)', overflow: 'auto',
        }}>
          <div className="crossword-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '2px',
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%',
            border: '1px solid rgba(232,232,240,0.12)',
            padding: '2px',
          }}>
            {grid.map((row, r) =>
              row.map((val, c) => {
                const corner = isCorner(r, c);
                const cross = isCross(r, c);
                const identified = finalScore !== null && (corner || cross);
                const isAnswer = corner || cross;
                const borderColor = isAnswer
                  ? corner
                    ? 'rgba(0, 255, 179, 0.5)'
                    : 'rgba(255, 179, 0, 0.5)'
                  : 'transparent';
                return (
                  <div key={`${r}-${c}`}
                    className={`grid-cell${corner ? ' corner' : ''}${identified ? ' identified' : ''}`}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: identified ? 'rgba(0, 255, 179, 0.08)' : 'transparent',
                      border: isAnswer ? `1.5px solid ${borderColor}` : '1px solid rgba(232,232,240,0.08)',
                    }}>
                    {val}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-primary)', textShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.9)' }}>
              CORRUPTED SIGNAL MATRIX
            </span>
            <span style={{ fontSize: '10px', letterSpacing: '0.15em', marginLeft: 'var(--space-4)', textTransform: 'uppercase', color: 'var(--text-secondary)', textShadow: '0 0 6px rgba(0,0,0,0.7)' }}>
              144 DATA POINTS | 12×12 GRID
            </span>
          </div>

          <div className="instruction-note" style={{ background: 'transparent', borderColor: 'rgba(232,232,240,0.06)', color: 'var(--text-primary)', maxHeight: '80px', overflowY: 'auto' }}>
            QUE: "{note}"
          </div>
        </div>

        {finalScore === null && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className={`answer-input${message && !message.includes('VERIFIED') ? ' wrong' : ''}`}
              placeholder="ENTER DECODED PASSWORD..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button className="helipad-submit" onClick={handleSubmit} disabled={!answer.trim()}>
              SUBMIT
            </button>
            <button
              className="hint-btn"
              onClick={handleHint}
              disabled={hintsUsed >= TUTORIAL_HINTS.length || state.hintsRemaining <= 0}
              style={{ padding: '10px 20px', fontSize: 'var(--text-xs)' }}
            >
              REQUEST HINT ({state.hintsRemaining} left)
            </button>
          </div>
        )}

        {message && (
          <div className={`text-${message.includes('VERIFIED') ? 'green' : 'red'}`} style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
            {message}
          </div>
        )}

        {currentHint && (
          <div className="hint-display" style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3)',
            borderLeft: '2px solid var(--amber-warn)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            background: 'transparent',
          }}>
            <div className="hint-label" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>HINT {hintsUsed}/{TUTORIAL_HINTS.length}</div>
            <div className="hint-text" style={{ fontStyle: 'italic' }}>{currentHint}</div>
          </div>
        )}
      </div>

      {finalScore !== null && (
        <div className="extraction-overlay" style={{ background: 'rgba(1,1,10,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="extraction-word">PASSWORD ACCEPTED</div>
          <div className="extraction-subtext">
            The grid decoded. The signal is clear.
            The helicopter blades roar above.
          </div>
          <button className="cta-primary mt-4" onClick={handleContinue}>
            EXTRACT
          </button>
        </div>
      )}
    </div>
  );
}
