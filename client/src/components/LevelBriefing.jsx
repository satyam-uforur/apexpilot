import React, { useState, useEffect, useCallback } from 'react';

const BRIEFINGS = {
  level_0: {
    lines: [
      'A signal has been intercepted.',
      'The pattern is corrupted at position 5.',
      'Each value is a signal unit.',
      'The missing unit = next in sequence.',
      'Submit the ASCII code of that unit.',
    ],
    button: 'BEGIN ANALYSIS',
  },
  level_1: {
    lines: [
      'The Tower stands where nothing should stand.',
      'At its base, a signal — old, buried, waiting.',
      '144 data points. Only 9 carry meaning.',
      'Separate the signal from the noise.',
    ],
    button: 'BEGIN FLOOR 1',
  },
  level_2: {
    lines: [
      'Floor 2 — Fault Lines.',
      'The tower\'s security module has been corrupted.',
      'Faults injected with precision.',
      'The damage forms a pattern.',
      'Read the code. Count the errors.',
      'The saboteur left a signature.',
    ],
    button: 'BEGIN FLOOR 2',
  },
  level_3: {
    lines: [
      'A research document has been recovered from the tower\'s archive.',
      'Academic papers contain references. References contain authors.',
      'One surname \u2014 precisely extracted \u2014 unlocks this floor.',
      'The paper title is shown. The question is specific.',
      'The answer is not displayed openly.',
      'Search. Find the paper. Read the reference. Extract the name.',
    ],
    button: 'BEGIN FLOOR 3',
  },
  level_4: {
    lines: [
      'No more floors.',
      'The roof. The helicopter.',
      'The pilot has one condition:',
      '"Prove you can direct an AI."',
      'Write the prompt that extracts what I need.',
      'Score above 80%. Or you stay on the roof.',
    ],
    button: 'CONFRONT THE THRESHOLD',
  },
};

export default function LevelBriefing({ level, onContinue }) {
  const [visible, setVisible] = useState(0);
  const [pulse, setPulse] = useState(false);

  const briefing = BRIEFINGS[level];
  if (!briefing) {
    onContinue();
    return null;
  }

  useEffect(() => {
    if (visible < briefing.lines.length) {
      const t = setTimeout(() => setVisible(v => v + 1), 500);
      return () => clearTimeout(t);
    }
  }, [visible, briefing.lines.length]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  const allRevealed = visible >= briefing.lines.length;

  return (
    <div className="level-briefing">
      <div className="briefing-vignette" />
      <div className="briefing-content">
        <div className="briefing-sub" style={{ animation: 'fadeSlideIn 0.6s ease-out forwards' }}>
          LEVEL {level === 'level_4' ? '—' : level.replace('level_', '')}
        </div>

        <div className="briefing-lines">
          {briefing.lines.map((line, i) => (
            <div
              key={i}
              className={`briefing-line ${i < visible ? 'revealed' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {i < visible && (
                <span className="briefing-text">
                  {line}
                  {i === visible - 1 && i < briefing.lines.length - 1 && (
                    <span className="briefing-cursor">▋</span>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>

        {allRevealed && (
          <div className="briefing-action">
            <button className="cta-primary briefing-btn" onClick={handleContinue}>
              {briefing.button}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
