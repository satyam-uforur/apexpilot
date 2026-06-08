import React, { useState, useEffect, useRef } from 'react';

const HEX_CHARS = '0123456789ABCDEF';

export default function FloorComplete({ floorNum, title, description, score, hintsUsed, nextFloor, onAscend }) {
  const [phase, setPhase] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [hexText, setHexText] = useState('');
  const [barAnim, setBarAnim] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 600);
    const t3 = setTimeout(() => setPhase(3), 1100);
    const t4 = setTimeout(() => { setPhase(4); setBarAnim(true); }, 1700);
    const t5 = setTimeout(() => setPhase(5), 2400);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, []);

  useEffect(() => {
    if (phase >= 1 && phase < 5) {
      intervalRef.current = setInterval(() => {
        let s = '';
        for (let i = 0; i < 32; i++) s += HEX_CHARS[Math.floor(Math.random() * 16)];
        setHexText(s);
      }, 80);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => {
    const gi = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 80);
    }, 4000);
    return () => clearInterval(gi);
  }, []);

  return (
    <div className="floor-complete-overlay">
      <div className={`floor-complete-panel ${glitch ? 'fc-glitch' : ''}`}>
        <div className="fc-corner fc-corner-tl" />
        <div className="fc-corner fc-corner-tr" />
        <div className="fc-corner fc-corner-bl" />
        <div className="fc-corner fc-corner-br" />

        <div className="fc-scanlines" />

        {phase >= 1 && (
          <div className="fc-hex-line">
            <span className="fc-hex-text">{hexText}</span>
          </div>
        )}

        {phase >= 1 && (
          <div className="fc-floor-label-wrap">
            <span className="fc-floor-tag">FLOOR</span>
            <span className="fc-floor-num">{floorNum}</span>
          </div>
        )}

        {phase >= 2 && (
          <div className="fc-status">
            <span className="fc-status-bracket">[</span>
            <span className="fc-status-text">CLEARED</span>
            <span className="fc-status-bracket">]</span>
          </div>
        )}

        {phase >= 3 && (
          <div className="fc-title">{title}</div>
        )}

        {phase >= 3 && (
          <div className="fc-desc">{description}</div>
        )}

        {phase >= 4 && score !== undefined && (
          <>
            <div className="fc-divider" />
            <div className="fc-score-row">
              <span className="fc-score-label">SCORE</span>
              <span className="fc-score-value">{score}</span>
            </div>
            {hintsUsed > 0 && (
              <div className="fc-hints-row">
                <span className="fc-hints-label">HINTS USED</span>
                <span className="fc-hints-value">{hintsUsed} (-{hintsUsed * 25})</span>
              </div>
            )}
          </>
        )}

        {phase >= 4 && (
          <div className={`fc-bar-track ${barAnim ? 'fc-bar-anim' : ''}`}>
            <div className="fc-bar-fill" />
          </div>
        )}

        {phase >= 5 && (
          <button className="fc-ascend-btn" onClick={onAscend}>
            <span className="fc-btn-arrow">►</span>
            <span className="fc-btn-text">ASCEND F{nextFloor}</span>
            <span className="fc-btn-arrow">◄</span>
          </button>
        )}
      </div>
    </div>
  );
}
