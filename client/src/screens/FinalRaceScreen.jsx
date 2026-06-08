import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Timer from '../components/Timer';
import LevelBriefing from '../components/LevelBriefing';
import FloorComplete from '../components/FloorComplete';

const TARGET_FIELDS = [
  { key: 'incident_time', type: 'string', example: '14:32' },
  { key: 'incident_date', type: 'string', example: 'March 15, 2024' },
  { key: 'incident_type', type: 'string', example: 'Unauthorized access attempt' },
  { key: 'affected_system', type: 'string', example: 'Floor 3 biometric terminal' },
  { key: 'outcome', type: 'string', example: 'Access denied' },
  { key: 'follow_up_required', type: 'boolean', example: 'true' },
  { key: 'severity', type: 'string', example: 'Escalating' },
  { key: 'prior_incidents_this_week', type: 'integer', example: '2' },
];

const HINTS = [
  'The pilot needs structured data \u2014 8 specific fields from the incident report. List every field name in your prompt. Think about what a security team would need to know.',
  'The evaluation checks for: exact field names matching the target schema, correct data types (boolean for yes/no, integer for counts), JSON-only output with no extra text, and null handling for any missing values.',
  'Your prompt must ask for all 8 fields by their exact names: incident_time, incident_date, incident_type, affected_system, outcome, follow_up_required, severity, and prior_incidents_this_week. Specify JSON format. Say "return ONLY valid JSON \u2014 no explanation." Set boolean and integer types explicitly.',
  'Structure: mention all 8 field names, specify types (string, boolean, integer), require JSON-only output, and handle null for missing data. A single clear paragraph works best.',
];

const INCIDENT_REPORT = `APEX TOWER \u2014 INCIDENT LOG
FLOOR 3 ACCESS BREACH \u2014 MARCH 15, 2024
CLASSIFICATION: RESTRICTED

Time of detection: 14:32
Reporting officer: Martinez, J.
Event type: Unauthorized access attempt
Affected system: Floor 3 biometric terminal
Outcome: Access denied. Subject fled north exit.
Follow-up required: Yes
Previous incidents: 2 similar events this week
Severity note: Escalating pattern detected
Equipment status: Terminal offline post-incident
Witnesses: 2 confirmed, 1 unconfirmed`;

function evaluatePrompt(prompt) {
  if (!prompt || !prompt.trim()) {
    return { fieldsPresent: 0, fieldNamesScore: 0, dataTypesScore: 0, jsonOnlyScore: 0, nullHandlingScore: 0 };
  }

  const p = prompt.toLowerCase();

  // 1. Fields present (40 pts) — does prompt mention each target field?
  const fieldMentions = TARGET_FIELDS.map(f => ({
    key: f.key,
    found: p.includes(f.key.toLowerCase()),
  }));
  const fieldsPresent = fieldMentions.filter(f => f.found).length;

  // 2. Field name accuracy (15 pts) — exact key names
  const fieldNamesScore = fieldMentions.filter(f => f.found).length >= 8 ? 15 :
    fieldMentions.filter(f => f.found).length >= 6 ? 10 :
    fieldMentions.filter(f => f.found).length >= 4 ? 5 : 0;

  // 3. Data types specified (15 pts)
  const hasBoolean = /\bboolean\b|\bbool\b/.test(p);
  const hasInteger = /\binteger\b|\bint\b|\bnumber\b/.test(p);
  const hasString = /\bstring\b|\btext\b/.test(p);
  let dataTypesScore = 0;
  if (hasBoolean && hasInteger) dataTypesScore = 15;
  else if (hasBoolean || hasInteger) dataTypesScore = 10;
  else if (hasString) dataTypesScore = 5;

  // 4. JSON only (15 pts)
  const hasJsonOnly = /\bjson\b/.test(p) && (
    /\bonly\b/.test(p) || /\bstrictly\b/.test(p) || /\bvalid\b/.test(p) ||
    /\bno explanation\b/.test(p) || /\bno extra\b/.test(p) || /\braw\b/.test(p)
  );
  const hasJson = /\bjson\b/.test(p);
  const jsonOnlyScore = hasJsonOnly ? 15 : hasJson ? 10 : 0;

  // 5. Null handling (15 pts)
  const hasNullDetailed = /\bnull\b/.test(p) && (/\bif missing\b/.test(p) || /\bif not found\b/.test(p) || /\bif absent\b/.test(p) || /\botherwise\b/.test(p) || /\buse null\b/.test(p) || /\bhandle.*miss/.test(p));
  const hasNullGeneric = /\bnull\b/.test(p);
  const nullHandlingScore = hasNullDetailed ? 15 : hasNullGeneric ? 5 : 0;

  return { fieldsPresent, fieldNamesScore, dataTypesScore, jsonOnlyScore, nullHandlingScore, fieldMentions };
}

export default function FinalRaceScreen() {
  const { state, dispatch } = useGame();
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState('briefing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [showEval, setShowEval] = useState(false);
  const [evalPhase, setEvalPhase] = useState(0);
  const [finalScore, setFinalScore] = useState(null);
  const [ascendChosen, setAscendChosen] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth > 767
  );
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    const score = evaluatePrompt(prompt);
    const totalScore = score.fieldsPresent * 5 + score.fieldNamesScore + score.dataTypesScore + score.jsonOnlyScore + score.nullHandlingScore;
    const passed = totalScore >= 80;

    setEvalResult({
      ...score,
      totalScore,
      passed,
      totalPossible: 100,
    });
    setShowEval(true);
    setEvalPhase(0);

    setTimeout(() => setEvalPhase(1), 200);
    setTimeout(() => setEvalPhase(2), 600);
    setTimeout(() => setEvalPhase(3), 1000);
    setTimeout(() => setEvalPhase(4), 1400);
    setTimeout(() => setEvalPhase(5), 1800);

    setFinalScore(totalScore);
  };

  const handleHint = () => {
    if (hintsUsed >= HINTS.length || state.hintsRemaining <= 0) return;
    setCurrentHint(HINTS[hintsUsed]);
    setHintsUsed(u => u + 1);
    dispatch({ type: 'USE_HINT' });
  };

  const handleContinue = () => {
    setShowEval(false);
    setAscendChosen(true);
  };

  const handleAscend = () => {
    if (finalScore !== null) {
      dispatch({ type: 'LEVEL_COMPLETED', payload: { level: 'level_1', data: { completed: true, score: finalScore } } });
    }
    dispatch({ type: 'SET_SCREEN', payload: 'level_2' });
  };

  if (stage === 'briefing') {
    return <LevelBriefing level="level_1" onContinue={() => setStage('playing')} />;
  }

  return (
    <div className="screen ground-floor">
      <div className="floor-atmosphere" />
      <div className="vignette" />
      <div className="floor-header ground-header">
        <span className="floor-label">FLOOR 1</span>
        <span className="ground-badge">1</span>
        <span className="mission-name">EXTRACTION PROTOCOL</span>
        <Timer seconds={0} running={false} />
      </div>

      <div className="two-panel">
        <div className="left-panel-wrapper">
          <div className="left-panel">
            <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>

              <p className="text-dim" style={{ fontSize: 'var(--text-xs)', lineHeight: '1.6' }}>
                <span className="text-red" style={{ fontWeight: 600 }}>OBJECTIVE:</span> The pilot needs structured intel from the incident report. Write a prompt that extracts all 8 required fields as clean JSON. Score 80% or higher to pass.
              </p>

              <div className="card" style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                background: 'var(--bg-void)', borderColor: 'var(--border-dim)',
                overflow: 'hidden', minHeight: 0,
              }}>
                <div className="incident-report" style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
                  <span className="incident-report-title">INCIDENT LOG</span>
                  {INCIDENT_REPORT.split('\n').map((line, i) => (
                    <div key={i} className="incident-field">
                      {line.includes(':') ? (
                        <>
                          <span className="incident-key">{line.split(':')[0]}:</span>
                          <span className="incident-value">{line.split(':').slice(1).join(':')}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="prompt-section">
                <span className="prompt-label">YOUR PROMPT</span>
                <textarea
                  className="prompt-textarea"
                  placeholder="Write a prompt that extracts structured JSON from the incident report above..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  style={{ minHeight: '100px' }}
                />
              </div>

              {!ascendChosen && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || showEval}
                >
                  SUBMIT PROMPT
                </button>
                <button
                  className="hint-btn"
                  onClick={handleHint}
                  disabled={hintsUsed >= HINTS.length || state.hintsRemaining <= 0 || showEval}
                  style={{ padding: '10px 20px', fontSize: 'var(--text-xs)' }}
                >
                  REQUEST HINT ({state.hintsRemaining} left)
                </button>
              </div>
              )}

              {currentHint && (
                <div className="hint-display" style={{
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

        <div
          className={'right-panel' + (hintsOpen ? '' : ' collapsed')}
          style={{ display: 'flex', flexDirection: 'column' }}
          onClick={() => { if (hintsOpen) setHintsOpen(false); }}
        >
          <div
            className="hint-panel-header hints-toggle"
            onClick={(e) => { e.stopPropagation(); setHintsOpen(o => !o); }}
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
          <div className="right-panel-scroll" onClick={(e) => e.stopPropagation()} style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-4)' }}>
            <div className="hint-modal-close" onClick={() => setHintsOpen(false)}>✕</div>
            <button
              className="hint-btn"
              onClick={handleHint}
              disabled={hintsUsed >= HINTS.length || state.hintsRemaining <= 0 || showEval}
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

      {showEval && evalResult && (
        <div className="eval-overlay">
          <div className="eval-box">
            <div className="eval-title">PROMPT EVALUATION</div>

            <div className="eval-row">
              <span className="eval-row-label">FIELDS PRESENT</span>
              <div className="eval-bar-track">
                <div
                  className={`eval-bar-fill ${evalPhase >= 1 ? (evalResult.fieldsPresent >= 7 ? 'pass' : evalResult.fieldsPresent >= 4 ? 'partial' : 'fail') : ''}`}
                  style={{ width: evalPhase >= 1 ? `${(evalResult.fieldsPresent / 8) * 100}%` : '0%' }}
                />
              </div>
              <span className="eval-row-score">{evalPhase >= 1 ? `${evalResult.fieldsPresent}/8` : '...'}</span>
            </div>

            <div className="eval-row">
              <span className="eval-row-label">FIELD NAMES</span>
              <div className="eval-bar-track">
                <div
                  className={`eval-bar-fill ${evalPhase >= 2 ? (evalResult.fieldNamesScore === 15 ? 'pass' : evalResult.fieldNamesScore >= 5 ? 'partial' : 'fail') : ''}`}
                  style={{ width: evalPhase >= 2 ? `${(evalResult.fieldNamesScore / 15) * 100}%` : '0%' }}
                />
              </div>
              <span className="eval-row-score">{evalPhase >= 2 ? `${evalResult.fieldNamesScore}/15` : '...'}</span>
            </div>

            <div className="eval-row">
              <span className="eval-row-label">DATA TYPES</span>
              <div className="eval-bar-track">
                <div
                  className={`eval-bar-fill ${evalPhase >= 3 ? (evalResult.dataTypesScore === 15 ? 'pass' : evalResult.dataTypesScore >= 5 ? 'partial' : 'fail') : ''}`}
                  style={{ width: evalPhase >= 3 ? `${(evalResult.dataTypesScore / 15) * 100}%` : '0%' }}
                />
              </div>
              <span className="eval-row-score">{evalPhase >= 3 ? `${evalResult.dataTypesScore}/15` : '...'}</span>
            </div>

            <div className="eval-row">
              <span className="eval-row-label">JSON ONLY</span>
              <div className="eval-bar-track">
                <div
                  className={`eval-bar-fill ${evalPhase >= 4 ? (evalResult.jsonOnlyScore === 15 ? 'pass' : evalResult.jsonOnlyScore >= 5 ? 'partial' : 'fail') : ''}`}
                  style={{ width: evalPhase >= 4 ? `${(evalResult.jsonOnlyScore / 15) * 100}%` : '0%' }}
                />
              </div>
              <span className="eval-row-score">{evalPhase >= 4 ? `${evalResult.jsonOnlyScore}/15` : '...'}</span>
            </div>

            <div className="eval-row">
              <span className="eval-row-label">NULL HANDLING</span>
              <div className="eval-bar-track">
                <div
                  className={`eval-bar-fill ${evalPhase >= 5 ? (evalResult.nullHandlingScore === 15 ? 'pass' : evalResult.nullHandlingScore >= 5 ? 'partial' : 'fail') : ''}`}
                  style={{ width: evalPhase >= 5 ? `${(evalResult.nullHandlingScore / 15) * 100}%` : '0%' }}
                />
              </div>
              <span className="eval-row-score">{evalPhase >= 5 ? `${evalResult.nullHandlingScore}/15` : '...'}</span>
            </div>

            <div className="eval-total">
              <span className="eval-total-label">TOTAL SCORE</span>
              <span className={`eval-total-score ${evalResult.passed ? 'pass' : 'fail'}`}>
                {evalResult.totalScore}/100
              </span>
            </div>

            <div className={`eval-status ${evalResult.passed ? 'pass' : 'fail'}`}>
              {evalResult.passed ? 'THRESHOLD PASSED' : 'BELOW THRESHOLD'}
            </div>

            {evalPhase >= 5 && (
              <div className="eval-feedback">
                {evalResult.fieldsPresent < 8 && (
                  <div className="eval-feedback-item issue">
                    Missing fields: {TARGET_FIELDS.filter((_, i) => !evalResult.fieldMentions[i].found).map(f => f.key).join(', ')}
                  </div>
                )}
                {evalResult.dataTypesScore < 15 && (
                  <div className="eval-feedback-item issue">
                    Specify boolean and integer types in your prompt
                  </div>
                )}
                {evalResult.jsonOnlyScore < 15 && (
                  <div className="eval-feedback-item issue">
                    Add "return ONLY valid JSON \u2014 no explanation" to your prompt
                  </div>
                )}
                {evalResult.nullHandlingScore < 15 && (
                  <div className="eval-feedback-item issue">
                    Add null handling for missing fields (e.g. "use null if not found")
                  </div>
                )}
                {evalResult.fieldsPresent >= 8 && evalResult.dataTypesScore >= 10 && evalResult.jsonOnlyScore >= 10 && (
                  <div className="eval-feedback-item ok">
                    Strong prompt structure. Fine-tune for full marks.
                  </div>
                )}
              </div>
            )}

            {evalPhase >= 5 && (
              <button className="eval-continue" onClick={handleContinue}>
                ASCEND TO FLOOR 2
              </button>
            )}
          </div>
        </div>
      )}

      {ascendChosen && (
        <FloorComplete
          floorNum={1}
          title="EXTRACTION PROTOCOL"
          description="You wrote a precise prompt that extracted structured intelligence."
          score={finalScore}
          hintsUsed={hintsUsed}
          nextFloor={2}
          onAscend={handleAscend}
        />
      )}
    </div>
  );
}
