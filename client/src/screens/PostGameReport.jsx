import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { saveGameEnd } from '../lib/leaderboard';

const rankMeta = {
  Iron: { icon: '\uD83D\uDD29', color: '#8A8A8A' },
  Bronze: { icon: '\uD83E\uDD4B', color: '#CD7F32' },
  Silver: { icon: '\u2699\uFE0F', color: '#C0C0C0' },
  Gold: { icon: '\uD83E\uDD47', color: '#FFD700' },
  Platinum: { icon: '\uD83D\uDCB0', color: '#E5E4E2' },
  Diamond: { icon: '\uD83D\uDC8E', color: '#B9F2FF' },
  Master: { icon: '\uD83C\uDFC5', color: '#FF6B35' },
  Apex: { icon: '\uD83D\uDC51', color: '#FFD700' },
};
const rankOrder = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Apex'];

const skillLabels = {
  observation: 'Observation', promptEngineering: 'Prompt Eng', reasoning: 'Reasoning',
  verification: 'Verification', research: 'Research', adaptability: 'Adaptability',
  communication: 'Communication', collaboration: 'Collaboration', competitive: 'Competitive',
};

export default function PostGameReport() {
  const { state } = useGame();
  const { report } = state;
  const [animatedScores, setAnimatedScores] = useState({});
  const [animatingRank, setAnimatingRank] = useState(-1);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!report) return;
    saveGameEnd(report.eloAfter);
    const timer = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timer);
  }, [report]);

  useEffect(() => {
    if (!report) return;
    const timer = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timer);
  }, [report]);

  useEffect(() => {
    if (!started || !report) return;
    const targetIdx = rankOrder.indexOf(report.rank);
    if (targetIdx < 0) return;
    const interval = setInterval(() => {
      setAnimatingRank(prev => {
        if (prev >= targetIdx) { clearInterval(interval); return targetIdx; }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [started, report]);

  useEffect(() => {
    if (!started || !report) return;
    Object.entries(report.skillScores).forEach(([key, score], i) => {
      setTimeout(() => setAnimatedScores(prev => ({ ...prev, [key]: score })), 500 + i * 200);
    });
  }, [started, report]);

  if (!report) {
    return <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="loader-bar" style={{ width: '300px' }}><div className="loader-bar-fill thinking" /></div>
      <p className="text-dim mt-4" style={{ fontSize: 'var(--text-sm)' }}>GENERATING REPORT...</p>
    </div>;
  }

  const currentRankIdx = Math.max(0, animatingRank);
  const currentRank = rankOrder[currentRankIdx] || rankOrder[0];

  return (
    <div className="screen" style={{ overflow: 'auto', background: 'var(--bg-tower)' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%', padding: 'var(--space-6)' }}>
        <div className="text-green text-center mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-3xl)', letterSpacing: '0.15em' }}>APEXRANK PERFORMANCE REPORT</div>

        <div className="card mb-4" style={{ borderColor: 'var(--border-dim)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>CANDIDATE</div><div className="text-green">{report.candidateId}</div></div>
            <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>STATUS</div><div className="text-purple">COMPLETED</div></div>
            <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>TIME</div><div>{Math.floor(report.totalTime / 60)}:{String(report.totalTime % 60).padStart(2, '0')}</div></div>
            <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>SCORE</div><div className="text-gold">{report.overallScore}%</div></div>
          </div>
        </div>

        <div className="card mb-4" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="text-dim mb-3" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em' }}>SKILL SCORES</div>
          {Object.entries(report.skillScores).map(([key, score]) => {
            const displayed = animatedScores[key] || 0;
            const color = displayed >= 80 ? 'var(--green-apex)' : displayed >= 60 ? '#FFD700' : 'var(--red-alert)';
            return <div key={key} className="skill-row">
              <span className="skill-name">{skillLabels[key] || key}</span>
              <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: `${displayed}%`, background: color }} /></div>
              <span className="skill-score" style={{ color }}>{displayed}%</span>
            </div>;
          })}
        </div>

        <div className="card mb-4 text-center" style={{ borderColor: rankMeta[currentRank]?.color || 'var(--border-dim)' }}>
          <div className="text-muted mb-2" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em' }}>RANK EARNED</div>
          <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>{rankMeta[currentRank]?.icon || '—'}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-4xl)', color: rankMeta[currentRank]?.color || 'var(--text-primary)', letterSpacing: '0.15em' }}>{currentRank}</div>
          <div className="text-dim mt-2" style={{ fontSize: 'var(--text-sm)' }}>ELO: {report.eloBefore} → <span className="text-green">+{report.eloDelta}</span> → <span className="text-gold">{report.eloAfter}</span></div>
        </div>

        <div className="card mb-4" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="text-green mb-2" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em' }}>TOP 3 STRENGTHS</div>
          {report.topStrengths.map((s, i) => <div key={i} style={{ marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}><span className="text-green mr-1">►</span><span className="text-dim">{skillLabels[s.skill] || s.skill}</span><span className="text-muted ml-1">({s.score}%)</span></div>)}
        </div>

        <div className="card mb-4" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="text-red mb-2" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em' }}>TOP 3 WEAKNESSES</div>
          {report.topWeaknesses.map((s, i) => <div key={i} style={{ marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}><span className="text-red mr-1">►</span><span className="text-dim">{skillLabels[s.skill] || s.skill}</span><span className="text-muted ml-1">({s.score}%)</span></div>)}
        </div>

        <div className="card mb-4" style={{ borderColor: 'var(--accent-purple)' }}>
          <div className="text-purple mb-2" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em' }}>RECOMMENDED IMPROVEMENT</div>
          <p className="text-dim" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{report.recommendation}</p>
        </div>

        <div className="text-center mb-4">
          <button
            className="cta-primary"
            style={{ background: 'var(--purple-rank)', color: '#fff', border: 'none', fontSize: 'var(--text-sm)' }}
            onClick={() => {
              const shareText = `I completed ApexRank Trial!\n\nRank: ${currentRank}\nScore: ${report.overallScore}%\nCandidate: ${report.candidateId}\n\n` +
                `Skills:\n${Object.entries(report.skillScores).map(([k, v]) => `  ${skillLabels[k] || k}: ${v}%`).join('\n')}\n\n` +
                `Can you climb the tower?`;
              if (navigator.share) {
                navigator.share({ title: 'ApexRank Trial Results', text: shareText });
              } else {
                navigator.clipboard.writeText(shareText).then(() => {
                  const btn = document.activeElement;
                  if (btn) { btn.textContent = 'COPIED!'; setTimeout(() => btn.textContent = 'SHARE RESULTS', 2000); }
                });
              }
            }}
          >
            SHARE RESULTS
          </button>
        </div>

        <div className="text-center mb-4">
          <button
            className="cta-primary"
            style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-bright)', fontSize: 'var(--text-sm)' }}
            onClick={() => {
              const text = encodeURIComponent(
                `I completed ApexRank Trial!\nRank: ${currentRank}\nScore: ${report.overallScore}%\nCandidate: ${report.candidateId}\n#ApexRank`
              );
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener');
            }}
          >
            SHARE ON X
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-green" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-xl)', letterSpacing: '0.2em' }}>WELCOME TO APEXRANK</div>
        </div>
      </div>
    </div>
  );
}
