import React, { useState, useEffect } from 'react';

export default function Timer({ seconds, onExpire, running = true }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); onExpire?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining, running, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const critical = remaining < 60;

  return (
    <div className={`header-timer ${critical ? 'critical' : ''}`}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
