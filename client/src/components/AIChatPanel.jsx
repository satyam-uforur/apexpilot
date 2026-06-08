import React, { useState, useRef, useEffect } from 'react';

const LEVEL_RESPONSES = {
  tutorial: {
    system: 'TOWER INTERFACE — I can help identify patterns and convert values. Describe what you observe.',
    hints: ['Look at the relationship between consecutive terms.', 'If the rule is not obvious, try subtraction.', 'The next value determines the ASCII code you need to submit.'],
  },
  level_1: {
    system: 'LEVEL 1 BRIEF — Pattern Recognition Protocol. I am your Tower Interface. Describe what you observe.',
    hints: ['Look at the corners of the grid first.', 'Most of the 144 numbers are noise. Only a few are in the ASCII uppercase letter range (65-90).', 'Find all numbers between 65 and 90. Convert each to its ASCII character. Arrange them by position.'],
  },
  level_2: {
    system: 'LEVEL 2 BRIEF — Fault Lines. Send me the corrupted code or describe what patterns you notice.',
    hints: ['Count every error carefully. Some are easy to miss.', 'Look for patterns: operators, typos, missing keywords.', 'The most frequent category will tell you the answer format.'],
  },
  level_3: {
    system: 'LEVEL 3 BRIEF — Citation Trace. I can identify authors and references from paper citations.',
    hints: ['Look at the reference list carefully.', 'The first author is listed first in each citation.', 'Search for the paper title or author name online.'],
  },
  final: {
    system: 'APEX PROTOCOL — Final Challenge. I can help evaluate evidence authenticity.',
    hints: ['Cross-reference claims with official databases.', 'Look for contradictions in dates, names, and figures.', 'Authentic evidence has verifiable metadata.'],
  },
};

export default function AIChatPanel({ level, disabled, maxPrompts, promptsUsed, onPromptSent, showBudget = true }) {
  const [messages, setMessages] = useState(() => {
    const info = LEVEL_RESPONSES[level] || LEVEL_RESPONSES.tutorial;
    const initial = [{ role: 'system', text: info.system }, { role: 'ai', text: 'Awaiting your report, candidate. Describe what you see.' }];
    if (level === 'level_1') initial.push({ role: 'ai', text: 'I can only respond to what you observe. Uploading images is blocked.' });
    return initial;
  });
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(false);
  const chatRef = useRef(null);
  const info = LEVEL_RESPONSES[level] || LEVEL_RESPONSES.tutorial;
  const remaining = maxPrompts ? maxPrompts - (promptsUsed || 0) : null;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const getAIResponse = (userMsg) => {
    const lower = userMsg.toLowerCase();
    if (lower.includes('hint') || lower.includes('help')) return info.hints[Math.floor(Math.random() * info.hints.length)];
    if (level === 'level_1') {
      if ((lower.includes('corner') || lower.includes('border')) && (lower.includes('number') || lower.includes('value') || lower.includes('ascii'))) return 'The four corners are 82, 73, 83, 69. ASCII: R, I, S, E. That spells RISE — but there are more numbers to find.';
      if (lower.includes('range') && (lower.includes('65') || lower.includes('90') || lower.includes('ascii'))) return 'Exactly 9 numbers in the 65-90 ASCII range. Find them all — corners first, then inner positions.';
      if (lower.includes('65') || lower.includes('90') || lower.includes('ascii') || lower.includes('letter')) return 'ASCII 65-90 = uppercase A-Z. Scan the grid for numbers in that range.';
      if (lower.includes('all 9') || lower.includes('nine') || lower.includes('all nine')) return 'Corners: (0,0)=82=R, (0,11)=73=I, (11,0)=83=S, (11,11)=69=E → RISE. Cross: (1,1)=83=S, (1,4)=84=T, (2,2)=65=A, (9,2)=78=N, (9,4)=68=D → STAND. Combined: RISESTAND.';
      if (lower.includes('convert') || lower.includes('character') || lower.includes('spell') || lower.includes('word')) return '82=R, 73=I, 83=S, 69=E, 83=S, 84=T, 65=A, 78=N, 68=D. Corners: RISE. Cross: STAND. Full: RISESTAND.';
      if (lower.includes('risestand') || lower.includes('rise stand')) return 'RISESTAND is the password. Submit it below.';
      if (lower.includes('note') || lower.includes('jargon') || lower.includes('confus') || lower.includes('red herring')) return 'The note is meaningless jargon. Ignore it. Focus on the numbers themselves.';
      return 'Study the grid of 144 numbers. Look for structure — the answer is simpler than it appears.';
    }
    if (level === 'level_2') {
      if (lower.includes('syntax') || lower.includes('missing')) return 'Look for = instead of ==, missing colons, and =+ instead of +=. There are about 14 syntax errors total.';
      if (lower.includes('lexical') || lower.includes('typo') || lower.includes('spell')) return 'Lexical errors are misspelled variable names and keywords. Look for Ture, Flase, Truee, appned, appand, etc.';
      if (lower.includes('type') || lower.includes('str +') || lower.includes('concatenat')) return 'Type errors happen when you try to concatenate str + int or use the wrong function signature.';
      if (lower.includes('count') || lower.includes('total') || lower.includes('how many')) return 'Count all errors across every category. The total is 31. The most common category is SYNTAX with 14 instances.';
      if (lower.includes('category') || lower.includes('dominant') || lower.includes('frequent')) return 'SYNTAX errors dominate with 14 instances. Submit: 31SYNTAX.';
      return 'Examine the corrupted code. I can help identify patterns in the errors.';
    }
    if (level === 'level_3') {
      if (lower.includes('find') || lower.includes('search') || lower.includes('google') || lower.includes('look up')) return 'Search for the exact paper title online. The references section will show the full citation details.';
      if (lower.includes('reference') && (lower.includes('2') || lower.includes('two'))) return 'Reference [2] is listed in the paper. The first author\'s surname is given before their initials.';
      if (lower.includes('surname') || lower.includes('author') || lower.includes('name')) return 'The citation format is: SURNAME INITIALS. The first word before the comma is the surname.';
      if (lower.includes('spell') || lower.includes('letter') || lower.includes('long')) return 'Copy the surname exactly as written — case matters for submission.';
      return 'Look at the references section of the displayed paper. Each reference has a number in brackets. Find the one the question asks about.';
    }
    return 'Noted. Continue your analysis.';
  };

  const handleSend = () => {
    if (!input.trim() || disabled || isThinking) return;
    if (remaining !== null && remaining <= 0) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsThinking(true);
    if (onPromptSent) onPromptSent();
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getAIResponse(userMessage) }]);
      setIsThinking(false);
    }, 800 + Math.random() * 600);
    if (remaining !== null && remaining - 1 === 1) {
      setBudgetWarning(true);
      setTimeout(() => setBudgetWarning(false), 5000);
    }
  };

  return (
    <div className="ai-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showBudget && remaining !== null && (
        <div className="prompt-budget" style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span className="budget-label">PROMPTS</span>
           <span className={`budget-count ${remaining <= 1 ? 'low' : ''}`} style={{ fontFamily: "'JetBrains Mono', sans-serif", fontSize: 'var(--text-2xl)', color: remaining <= 1 ? 'var(--red-alert)' : 'var(--green-apex)' }}>{remaining}</span>
          <div className="budget-pips" style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            {Array.from({ length: maxPrompts }, (_, i) => (
              <div key={i} className={`pip ${i < (promptsUsed || 0) ? 'used' : ''}`} style={{ width: 8, height: 8, borderRadius: '50%', background: i < (promptsUsed || 0) ? 'var(--border-dim)' : 'var(--green-apex)' }} />
            ))}
          </div>
        </div>
      )}

      <div className="chat-history" ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {messages.map((msg, i) => {
          if (msg.role === 'system') return <div key={i} className="message-system" style={{ alignSelf: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-ghost)', textAlign: 'center', padding: 'var(--space-2) 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{msg.text}</div>;
          if (msg.role === 'user') return <div key={i} className="message-user" style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-dim)', borderRadius: '8px 8px 2px 8px', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{msg.text}</div>;
          return <div key={i} className="message-ai" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderLeft: '2px solid var(--green-deep)', borderRadius: '8px 8px 8px 2px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{msg.text}</div>;
        })}
        {isThinking && (
          <div className="message-thinking" style={{ alignSelf: 'flex-start', padding: 'var(--space-3) var(--space-4)' }}>
            <div className="thinking-dots" style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-deep)', display: 'inline-block' }} />)}
            </div>
          </div>
        )}
      </div>

      {budgetWarning && (
        <div className="warning-toast" style={{ position: 'fixed', top: '64px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface)', border: '1px solid var(--border-red)', color: 'var(--red-alert)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-sm)', padding: 'var(--space-3) var(--space-6)', zIndex: 200, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          PROMPT BUDGET LOW — 1 REMAINING
        </div>
      )}

      <div className="prompt-input-container" style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-dim)', background: 'var(--bg-surface)' }}>
        {remaining !== null && remaining <= 0 && (
          <div className="budget-exhausted-warning" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-xs)', color: 'var(--red-alert)', textAlign: 'center', padding: 'var(--space-2) 0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
            PROMPT BUDGET EXHAUSTED
          </div>
        )}
        <textarea
          className="prompt-input"
          placeholder={remaining !== null && remaining <= 0 ? 'NO PROMPTS REMAINING' : 'Describe the asset to the AI...'}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={disabled || (remaining !== null && remaining <= 0)}
          rows={3}
          style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-sm)', padding: 'var(--space-3)', resize: 'none', minHeight: '60px' }}
        />
        <button
          className="send-prompt-btn"
          onClick={handleSend}
          disabled={disabled || !input.trim() || isThinking || (remaining !== null && remaining <= 0)}
          style={{ marginTop: 'var(--space-2)', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 'var(--text-sm)', padding: 'var(--space-3)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          {isThinking ? 'THINKING...' : 'SEND'}
        </button>
      </div>
    </div>
  );
}
