import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { saveGameStart, getLeaderboard } from '../lib/leaderboard';

export default function EntryScreen() {
  const { startSession, state } = useGame();
  const [name, setName] = useState('');
  const [showHow, setShowHow] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    const data = await getLeaderboard();
    setLeaderboard(data);
    setLbLoading(false);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('apex_candidate_name') || '';
    setName(saved);
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const handleEnter = async () => {
    const trimmed = name.trim();
    const isAnon = !trimmed;
    const username = isAnon
      ? 'GHOST_' + String(Math.floor(1000 + Math.random() * 9000))
      : trimmed.replace(/\s+/g, '_').slice(0, 20);

    try {
      await saveGameStart(username, isAnon);
    } catch (e) {
      console.warn('saveGameStart failed (non-fatal):', e);
    }
    await startSession(username);
  };

  if (state.loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'var(--bg-void)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem',
        color: 'var(--text-ghost)', letterSpacing: '0.15em',
      }}>
        INITIALIZING...
      </div>
    );
  }

  return (
    <div className="screen" style={{
      background: 'transparent',
      overflow: 'auto',
    }}>
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        maxWidth: '600px', width: '100%', padding: '2rem', margin: '0 auto',
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-hero)',
          letterSpacing: '0.15em', color: 'var(--text-primary)',
          marginBottom: '0.5rem', textShadow: '0 0 60px rgba(0,0,0,0.9)',
        }}>
          APEX<span style={{ color: 'var(--green-apex)', textShadow: '0 0 30px var(--green-glow)' }}> TOWER</span>
        </h1>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-xl)',
          letterSpacing: '0.6em', color: 'var(--green-apex)',
          marginBottom: '2rem', textShadow: '0 0 24px var(--green-glow)',
        }}>
          THE ASCENT
        </div>

        <div className="card" style={{
          marginBottom: '2rem', textAlign: 'left',
          background: 'rgba(14,14,28,0.25)',
          borderColor: 'var(--border-dim)', lineHeight: '1.8',
          fontSize: 'var(--text-sm)', padding: 'var(--space-6)',
        }}>
          <p className="text-dim">Every year, thousands enter the Tower.</p>
          <p className="text-dim">Very few reach the top.</p>
          <p className="text-dim mt-3">Everyone claims they can use AI.</p>
          <p className="text-primary mt-3">The Tower decides who actually can.</p>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <div className="text-muted" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ENTER CALLSIGN
          </div>
          <input
            type="text" placeholder="Leave blank to enter as GHOST"
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            maxLength={20}
            style={{
              width: '100%', textAlign: 'center',
              background: 'rgba(20,20,42,0.2)',
              border: '1px solid var(--border-dim)', color: 'var(--text-code)',
              padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'var(--text-sm)',
            }}
          />
          <div className="text-ghost" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', marginTop: '4px' }}>
            Anonymous players appear as GHOST_XXXX on leaderboard
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <button className="cta-advanced" onClick={handleEnter} disabled={state.loading}>
            {state.loading ? 'INITIALIZING...' : 'ENTER THE TOWER'}
          </button>
          <button className="cta-secondary" onClick={() => setShowHow(true)}>HOW IT WORKS</button>
        </div>

        <div className="card" style={{
          background: 'rgba(14,14,28,0.25)', borderColor: 'var(--border-dim)',
          textAlign: 'left', padding: 'var(--space-6)',
        }}>
          <div className="text-muted" style={{
            fontSize: 'var(--text-xs)', letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'var(--text-lg)', color: 'var(--text-primary)',
            }}>
              LEADERBOARD
            </span>
          </div>
          {lbLoading ? (
            <div className="text-ghost" style={{ fontSize: 'var(--text-sm)' }}>LOADING...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-ghost" style={{ fontSize: 'var(--text-sm)' }}>No scores yet. Be the first.</div>
          ) : (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 60px',
                gap: 'var(--space-2)', padding: '0 0 var(--space-2) 0',
                borderBottom: '1px solid var(--border-hairline)',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-sm)',
                color: 'var(--text-ghost)', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <span>RANK</span>
                <span>USERNAME</span>
                <span style={{ textAlign: 'right' }}>SCORE</span>
              </div>
              {leaderboard.map((entry, i) => {
                const isGhost = entry.is_anonymous;
                const rankColor = i === 0 ? 'var(--green-apex)' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : null;
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 60px',
                    gap: 'var(--space-2)', padding: 'var(--space-2) 0',
                    borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border-hairline)' : 'none',
                    alignItems: 'center',
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-sm)',
                  }}>
                    <span style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 'var(--text-sm)', color: rankColor || 'var(--text-ghost)',
                    }}>
                      {rankColor && <span style={{ color: rankColor, marginRight: '2px' }}>●</span>}
                      #{i + 1}
                    </span>
                    <span style={{
                      color: isGhost ? 'var(--text-ghost)' : 'var(--text-primary)',
                      fontStyle: isGhost ? 'italic' : 'normal',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.username}
                    </span>
                    <span style={{
                      textAlign: 'right',
                      fontFamily: "'Orbitron', sans-serif",
                      color: 'var(--green-apex)',
                    }}>
                      {entry.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showHow && (
        <div className="how-modal" style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(3,3,10,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="how-modal-content" style={{
            width: 'min(620px,92vw)', maxHeight: '80vh', overflowY: 'auto',
            background: 'var(--bg-surface)', border: '1px solid var(--border-bright)',
            padding: 'var(--space-10)',
          }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400,
              fontSize: 'var(--text-3xl)', letterSpacing: '0.1em',
              color: 'var(--green-apex)', marginBottom: 'var(--space-2)',
            }}>HOW THE TOWER WORKS</h2>
            <div className="how-modal-body" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              {[
                { num: '01', title: 'The Tower Is A Climb', desc: 'Ascend floor by floor. Each floor is a challenge that tests how you actually use AI — not whether you can. Progress means going up.' },
                { num: '02', title: 'Prompt Budget Is Finite', desc: 'Every floor grants a limited number of AI prompts. Spend them wisely. Precision beats volume.' },
                { num: '03', title: 'Alliance Or Solo', desc: 'Mid-climb you will face a choice: form an alliance to share fragments of the route, or ascend alone. Both paths reach the roof.' },
                { num: '04', title: 'The Rooftop Decides', desc: 'At the summit, only one candidate achieves APEX RANK. Answer, confidence, and evidence must all clear threshold.' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border-hairline)' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', sans-serif", fontSize: 'var(--text-xl)', color: 'var(--green-deep)', minWidth: '42px' }}>{s.num}</div>
                  <div>
                    <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
              <button className="cta-primary mt-6" onClick={() => setShowHow(false)} style={{ width: '100%' }}>GOT IT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
