import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function CinematicScreen() {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState('loading');
  const [skip, setSkip] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => setPhase('ready');
    const onEnd = () => {
      setPhase('done');
      setTimeout(() => dispatch({ type: 'SET_SCREEN', payload: 'entry' }), 500);
    };

    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('ended', onEnd);

    if (video.readyState >= 3) setPhase('ready');

    return () => {
      video.removeEventListener('canplaythrough', onCanPlay);
      video.removeEventListener('ended', onEnd);
    };
  }, [dispatch]);

  const handleSkip = () => {
    setSkip(true);
    dispatch({ type: 'SET_SCREEN', payload: 'entry' });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <video
        ref={videoRef}
        src="/assets/apex_cinematic.mp4"
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover', opacity: phase === 'ready' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        autoPlay
        muted
        playsInline
      />

      {phase === 'loading' && (
        <div style={{
          position: 'absolute', color: 'var(--text-ghost)',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-sm)',
          letterSpacing: '0.1em',
        }}>
          LOADING...
        </div>
      )}

      <button
        onClick={handleSkip}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000,
          background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-dim)',
          color: 'var(--text-ghost)', padding: '8px 20px',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-xs)',
          letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase',
          opacity: phase === 'ready' ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        SKIP
      </button>
    </div>
  );
}
