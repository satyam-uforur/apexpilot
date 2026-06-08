import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import Timer from '../components/Timer';
import LevelBriefing from '../components/LevelBriefing';

const VARIANTS = [
  {
    id: 'L2-P01',
    title: 'Solving Fuzzy Matrix Games with Triangular Type-2 Intuitionistic Fuzzy Numbers for Water Management Problem',
    authors: '[Research Team, 2024]',
    journal: 'Environmental Decision Systems',
    references: [
      '[1] Roy SK, Bhaumik A (2018) Intelligent water management: a triangular type-2 intuitionistic fuzzy matrix games approach. Water Resour Manag 32(3):949–968',
      '[2] Abrishamchi A, Ebrahimian A, Tajrishi M et al (2005) Case study: application of multicriteria decision making to urban water supply. J Water Resour Plan Manag 131(4):326–335',
      '[3] Zadeh LA (1965) Fuzzy sets. Inf Control 8:338–353',
      '[4] Atanassov KT (1986) Intuitionistic fuzzy sets. Fuzzy Sets Syst 20(1):87–96',
      '[5] Nan JX, Zhang MJ, Li DF (2010) A methodology for matrix games with payoffs of triangular intuitionistic fuzzy numbers. Int J Intell Syst 25(11):1143–1154',
    ],
    question: 'What is the surname of the FIRST AUTHOR listed in reference [2]?',
    answer: ['abrishamchi'],
    wrongCommon: ['a', 'abrishamchi a', 'ebrahimian', 'tajrishi'],
    difficulty: 'Hard',
  },
  {
    id: 'L2-P02',
    title: 'Multi-Objective Optimization of Groundwater Remediation Using Genetic Algorithms with Fuzzy Preference Functions',
    authors: '[Research Team, 2024]',
    journal: 'Water Resources Engineering',
    references: [
      '[1] Deb K, Pratap A, Agarwal S et al (2002) A fast and elitist multiobjective genetic algorithm: NSGA-II. IEEE Trans Evol Comput 6(2):182–197',
      '[2] Gorelick SM, Evans B, Remson I (1983) Identifying sources of groundwater pollution: an optimization approach. Water Resour Res 19(3):779–790',
    ],
    question: 'What is the surname of the FIRST AUTHOR listed in reference [1]?',
    answer: ['deb'],
    wrongCommon: ['pratap', 'agarwal', 'k'],
    difficulty: 'Medium',
  },
  {
    id: 'L2-P03',
    title: 'Neutrosophic Sets Applied to Supplier Selection in Humanitarian Logistics Networks',
    authors: '[Research Team, 2024]',
    journal: 'Logistics Systems Research',
    references: [
      '[1] Smarandache F (1998) Neutrosophy: neutrosophic probability, set and logic. American Research Press, Rehoboth',
      '[2] Tzeng GH, Huang JJ (2011) Multiple attribute decision making: methods and applications. CRC Press, Boca Raton',
      '[3] Peng JJ, Wang JQ, Wu XH et al (2015) Multi-valued neutrosophic sets and power aggregation operators with their applications. Int J Comput Intell Syst 8(2):345–363',
    ],
    question: 'What is the surname of the FIRST AUTHOR listed in reference [3]?',
    answer: ['peng'],
    wrongCommon: ['wang', 'wu', 'jj', 'peng jj'],
    difficulty: 'Medium',
  },
  {
    id: 'L2-P04',
    title: 'Hesitant Fuzzy Linguistic Preference Relations in Group Decision Making for Renewable Energy Site Selection',
    authors: '[Research Team, 2024]',
    journal: 'Energy Systems Research',
    references: [
      '[1] Rodríguez RM, Martínez L, Herrera F (2012) Hesitant fuzzy linguistic term sets for decision making. IEEE Trans Fuzzy Syst 20(1):109–119',
      '[2] Büyüközkan G, Güleryüz S (2016) Multi criteria group decision making approach for smart phone selection using intuitionistic fuzzy information. Comput Ind Eng 101:14–22',
    ],
    question: 'What is the surname of the FIRST AUTHOR listed in reference [1]?',
    answer: ['rodríguez', 'rodriguez'],
    wrongCommon: ['martinez', 'herrera', 'rm'],
    difficulty: 'Hard',
  },
  {
    id: 'L2-P05',
    title: 'A Novel Interval-Valued Pythagorean Fuzzy TOPSIS Method for Evaluating Sustainable Transport Systems',
    authors: '[Research Team, 2024]',
    journal: 'Transportation Research',
    references: [
      '[1] Yager RR (2013) Pythagorean fuzzy subsets. In: Proc joint IFSA world congress NAFIPS annual meeting, pp 57–61',
      '[2] Ilbahar E, Kara\u015fan A, Cebi S et al (2018) A novel approach to risk assessment for occupational health and safety using Pythagorean fuzzy AHP and fuzzy inference system. Saf Sci 103:124–136',
    ],
    question: 'What is the surname of the FIRST AUTHOR listed in reference [2]?',
    answer: ['ilbahar'],
    wrongCommon: ['karasan', 'cebi', 'e'],
    difficulty: 'Medium',
  },
];

const HINTS = [
  'Academic citations list authors in a specific order. The first name listed carries the most weight. Find the right reference. Find the first name in it. The format will tell you what is surname and what is initial.',
  'In this citation style, authors appear as SURNAME INITIAL. Not INITIAL SURNAME. The answer is a surname. It is longer than four letters. It does not appear in the first or last reference shown.',
  'The answer starts with a letter at the beginning of the alphabet. It has between 5 and 11 letters. Only the surname — not the initial after it.',
];

function normalize(input) {
  return input.trim().toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[íï]/g, 'i').replace(/[éèê]/g, 'e').replace(/[óòô]/g, 'o').replace(/[áàâ]/g, 'a').replace(/[úùû]/g, 'u');
}

function getWrongFeedback(input, variant) {
  const norm = normalize(input);
  if (norm.length <= 1) return 'That appears to be an initial, not a surname.';
  if (norm.includes(' ')) return 'Submit the surname only. Not the full author entry.';
  const allSurnames = variant.references
    .flatMap(r => {
      const match = r.match(/\[(\d+)\]/);
      if (!match) return [];
      const idx = parseInt(match[1], 10);
      const afterBracket = r.slice(r.indexOf(']') + 1).trim();
      const authors = afterBracket.split(/[\(\d]/)[0].trim();
      return authors.split(',').map(a => a.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    });
  if (allSurnames.includes(norm) && !variant.answer.includes(norm)) {
    return 'That name appears in the references but is not the first author of the requested reference. Check which reference the question asks about.';
  }
  return 'Incorrect. Reread the citation carefully.';
}

export default function Level2Screen() {
  const { state, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('briefing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeExpired, setTimeExpired] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth > 767
  );

  const variant = useMemo(() => {
    const raw = state.variantAssignments?.level3;
    const variants = VARIANTS;
    if (raw && variants[raw]) return variants[raw];
    const idx = Math.floor(Math.random() * variants.length);
    return variants[idx];
  }, [state.variantAssignments]);

  const handleSubmit = () => {
    if (!answer.trim() || timeExpired) return;
    const norm = normalize(answer);
    if (variant.answer.includes(norm)) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scoreMap = { 0: 200, 1: 150, 2: 100 };
      const baseScore = scoreMap[attempts] || 50;
      const penalty = hintsUsed * 25;
      const bonus = timeSpent < 60 ? 75 : timeSpent < 120 ? 50 : 0;
      const finalScore = Math.max(0, baseScore - penalty + bonus);
      setMessage('CITATION VERIFIED.');
      setStage('complete');
      dispatch({ type: 'LEVEL_COMPLETED', payload: { level: 'level_3', data: { completed: true, score: finalScore } } });
    } else {
      setMessage(getWrongFeedback(answer, variant));
      setAttempts(a => a + 1);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= HINTS.length || state.hintsRemaining <= 0) return;
    setCurrentHint(HINTS[hintsUsed]);
    setHintsUsed(u => u + 1);
    dispatch({ type: 'USE_HINT' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'level_4' });
  };

  const handleTimeUp = () => {
    setTimeExpired(true);
    setMessage('TIME EXPIRED.');
  };

  if (stage === 'briefing') {
    return <LevelBriefing level="level_3" onContinue={() => setStage('playing')} />;
  }

  return (
    <div className="screen">
      <div className="floor-atmosphere floor-atmo-2" />
      <div className="vignette" />
      <div className="floor-header">
        <span className="floor-label">FLOOR 3</span>
        <span className="mission-name">CITATION TRACE</span>
        <Timer seconds={600} onExpire={handleTimeUp} />
      </div>

      <div className="two-panel">
        <div className="left-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 0 }}>
            <p className="text-dim" style={{ fontSize: 'var(--text-xs)', lineHeight: '1.6' }}>
              <span className="text-red" style={{ fontWeight: 600 }}>OBJECTIVE:</span> A research document has been recovered. The paper title is real. The question points to a specific citation. The references are not displayed here — you must find the paper and locate the answer yourself.
            </p>

            <div className="card" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: 'var(--bg-void)', borderColor: 'var(--border-dim)',
              overflow: 'hidden', minHeight: 0,
            }}>
              <div style={{
                flex: 1, overflow: 'auto', padding: 'var(--space-4)',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-sm)',
                lineHeight: '1.8',
              }}>
                <div className="text-green" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  FLOOR 3 — CITATION TRACE
                </div>
                <div className="text-ghost" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
                  INTELLIGENCE VERIFICATION PROTOCOL
                </div>

                <div className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)', marginTop: 'var(--space-3)' }}>
                  PAPER:
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)', lineHeight: '1.6' }}>
                  {variant.title}
                </div>

                <div style={{ color: 'var(--text-ghost)', fontSize: '10px', marginBottom: 'var(--space-3)' }}>
                  Authors: {variant.authors} | Journal: {variant.journal}
                </div>

                <div className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                  QUESTION:
                </div>
                <div style={{ color: 'var(--amber-warn)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)', lineHeight: '1.6' }}>
                  {variant.question}
                </div>
                <div className="text-ghost" style={{ fontSize: '10px', fontStyle: 'italic' }}>
                  Submit the surname only. Exact spelling required. Find the paper online to locate the reference.
                </div>
              </div>
            </div>
          </div>

          {stage === 'complete' ? (
            <div className="card glow-green" style={{ textAlign: 'center', flexShrink: 0, margin: 'var(--space-4)' }}>
              <div className="text-green" style={{ fontSize: 'var(--text-xl)', fontFamily: "'Bebas Neue', sans-serif" }}>
                CITATION VERIFIED
              </div>
              <p className="text-dim mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                The reference was real. The author was real. The answer was in plain sight — buried inside a paper most people would never read.
              </p>
              <button className="cta-primary mt-4" onClick={handleContinue}>
                ASCEND TO FLOOR 4
              </button>
            </div>
          ) : (
            <div className="submission-bar">
              <input
                type="text"
                className={`answer-input${message ? ' wrong' : ''}`}
                placeholder="ENTER SURNAME..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={timeExpired}
              />
              <button className="submit-btn" onClick={handleSubmit} disabled={!answer.trim() || timeExpired}>
                SUBMIT
              </button>
              {message && (
                <div className={`text-${message === 'CITATION VERIFIED.' ? 'green' : 'red'}`} style={{ fontSize: 'var(--text-xs)' }}>
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
