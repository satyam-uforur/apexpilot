const API_BASE = '/api';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function startSession(candidateName) {
  return api('/session/start', {
    method: 'POST',
    body: JSON.stringify({ candidateName }),
  });
}

export function getSession(sessionId) {
  return api(`/session/${sessionId}`);
}

export function submitTutorialAnswer(sessionId, answer, timeSpent) {
  return api('/level/tutorial/submit', {
    method: 'POST',
    body: JSON.stringify({ sessionId, answer, timeSpent }),
  });
}

export function submitLevel1Answer(sessionId, answer, timeSpent) {
  return api('/level/1/submit', {
    method: 'POST',
    body: JSON.stringify({ sessionId, answer, timeSpent }),
  });
}

export function submitLevel2Answer(sessionId, answer, timeSpent) {
  return api('/level/2/submit', {
    method: 'POST',
    body: JSON.stringify({ sessionId, answer, timeSpent }),
  });
}

export function submitFinalAnswer(sessionId, answer, confidence, evidence, timeSpent) {
  return api('/final/submit', {
    method: 'POST',
    body: JSON.stringify({ sessionId, answer, confidence, evidence, timeSpent }),
  });
}

export function getLevelContent(level) {
  return api(`/level/${level}/content`);
}

export function getReport(sessionId) {
  return api(`/session/${sessionId}/report`);
}
