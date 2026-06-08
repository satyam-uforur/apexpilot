const ANSWER_KEY = {
  tutorial: {
    'TUT-01': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-02': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-03': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-04': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-05': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-06': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-07': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-08': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-09': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
    'TUT-10': { answer: 'RISESTAND', acceptable: ['RISESTAND', 'risestand', 'RiseStand', 'RISE STAND', 'Rise Stand'] },
  },
  level1: {
    'L1-F01': {
      answer: '31SYNTAX',
      acceptable: ['31SYNTAX', '31 SYNTAX', '31-SYNTAX', '31 syntax', '31Syntax'],
      count: 31,
      category: 'SYNTAX',
    },
  },
  level2: {
    'L2-P01': { answer: 'gao', acceptable: ['gao', 'bofei gao', 'Gao', 'Bofei Gao'] },
    'L2-P02': { answer: 'jiang', acceptable: ['jiang', 'changjiu jiang', 'Jiang', 'Changjiu Jiang'] },
    'L2-P03': { answer: 'li', acceptable: ['li', 'cheng li', 'Li', 'Cheng Li'] },
    'L2-P04': { answer: 'tang', acceptable: ['tang', 'chuning tang', 'Tang', 'Chuning Tang'] },
    'L2-P05': { answer: 'zhang', acceptable: ['zhang', 'dehao zhang', 'Zhang', 'Dehao Zhang'] },
  },
  final: {
    'FIN-01': {
      answer: 'NovaTech Fusion is an existing product with negative reviews; launch claims are fabricated',
      acceptableKeywords: ['NovaTech', 'fabricated', 'negative reviews', 'existing product'],
      authenticEvidence: ['USPTO database', 'independent review', 'patent filing'],
      fabricatedEvidence: ['fake press release', 'fabricated testimonials'],
    },
    'FIN-02': {
      answer: 'Breach is real but severity is understated by fabricated statements',
      acceptableKeywords: ['breach', 'real', 'severity understated', 'fabricated', 'FinCore'],
      authenticEvidence: ['SEC filings', 'news archives', 'breach notification'],
      fabricatedEvidence: ['CEO statement blaming interns', 'no customer impact claim'],
    },
    'FIN-03': {
      answer: 'AI was used in preliminary research only; no human trials exist',
      acceptableKeywords: ['preliminary', 'in-vitro', 'no human trials', 'AI research'],
      authenticEvidence: ['PubMed', 'research paper', 'preliminary'],
      fabricatedEvidence: ['clinical trial results', 'patient testimonials', 'fabricated'],
    },
    'FIN-04': {
      answer: 'Trace water confirmed but abundance claims are fabricated',
      acceptableKeywords: ['trace water', 'confirmed', 'abundance claim', 'fabricated', 'NASA'],
      authenticEvidence: ['NASA official release', 'peer-reviewed papers'],
      fabricatedEvidence: ['fake NASA press release', 'fabricated quantity'],
    },
    'FIN-05': {
      answer: 'Actual improvement is about 2x; 1000x claim is fabricated',
      acceptableKeywords: ['2x', 'improvement', '1000x fabricated', 'benchmark'],
      authenticEvidence: ['manufacturer specs', 'independent benchmarks'],
      fabricatedEvidence: ['fabricated benchmark', 'fake comparison'],
    },
  },
};

const sessions = {};

function setSessionVariants(sessionId, variants) {
  sessions[sessionId] = { variants };
}

function getSessionVariants(sessionId) {
  return sessions[sessionId]?.variants || null;
}

function verifyTutorialAnswer(sessionId, answer, timeSpent) {
  const variants = getSessionVariants(sessionId);
  if (!variants) return { valid: false, score: 0, message: 'No session found' };
  const variant = variants.tutorial;
  const key = ANSWER_KEY.tutorial[variant];
  if (!key) return { valid: false, score: 0, message: 'Invalid variant' };
  const matched = key.acceptable.some(a => a.toLowerCase() === (answer || '').toString().toLowerCase().trim());
  if (!matched) return { valid: false, score: 0, message: 'Incorrect. Keep observing.' };
  let score = 150;
  if (timeSpent < 60) score += 50;
  return { valid: true, score, message: 'PASSWORD VERIFIED' };
}

function verifyLevel1Answer(sessionId, answer, timeSpent) {
  const variants = getSessionVariants(sessionId);
  if (!variants) return { valid: false, score: 0, message: 'No session found' };
  const variant = variants.level1;
  const key = ANSWER_KEY.level1[variant];
  if (!key) return { valid: false, score: 0, message: 'Invalid variant' };
  const matched = key.acceptable.some(a => a.toLowerCase() === (answer || '').toString().toLowerCase().trim());
  if (!matched) return { valid: false, score: 0, message: 'Fault signature rejected. Keep counting.' };
  let score = 200;
  const timeBonus = timeSpent < 120 ? 100 : timeSpent < 300 ? 50 : timeSpent < 600 ? 25 : 0;
  score += timeBonus;
  return { valid: true, score, message: 'Corruption signature identified. Fault lines mapped.' };
}

function verifyLevel2Answer(sessionId, answer, timeSpent) {
  const variants = getSessionVariants(sessionId);
  if (!variants) return { valid: false, score: 0, message: 'No session found' };
  const variant = variants.level2;
  const key = ANSWER_KEY.level2[variant];
  if (!key) return { valid: false, score: 0, message: 'Invalid variant' };
  const matched = key.acceptable.some(a => a.toLowerCase() === (answer || '').toString().toLowerCase().trim());
  if (!matched) return { valid: false, score: 0, message: 'Reference not found. Check the citation list again.' };
  let score = 200;
  const timeBonus = timeSpent < 120 ? 100 : timeSpent < 300 ? 50 : timeSpent < 600 ? 25 : 0;
  score += timeBonus;
  return { valid: true, score, message: 'Reference verified. Citation chain confirmed.' };
}

function verifyFinalAnswer(sessionId, answer, confidence, evidence) {
  const variants = getSessionVariants(sessionId);
  if (!variants) return { passed: false, score: 0, message: 'No session found' };
  const variant = variants.final;
  const key = ANSWER_KEY.final[variant];
  if (!key) return { passed: false, score: 0, message: 'Invalid variant' };
  const keywordMatch = key.acceptableKeywords.some(k => (answer || '').toLowerCase().includes(k.toLowerCase()));
  const accuracy = keywordMatch ? 1.0 : 0.0;
  const confidenceMatch = 1.0 - Math.abs((confidence || 50) / 100 - accuracy);
  const evidenceArray = Array.isArray(evidence) ? evidence : [];
  const authenticFound = evidenceArray.filter(e => key.authenticEvidence.some(a => e.toLowerCase().includes(a.toLowerCase()))).length;
  const fabricatedFound = evidenceArray.filter(e => key.fabricatedEvidence.some(f => e.toLowerCase().includes(f.toLowerCase()))).length;
  const evidenceQuality = Math.min((authenticFound + fabricatedFound) / Math.max(key.authenticEvidence.length + key.fabricatedEvidence.length, 1), 1);
  const combinedScore = (accuracy * 0.4) + (confidenceMatch * 0.3) + (evidenceQuality * 0.3);
  const passed = accuracy >= 1.0 && confidence >= 90 && evidenceQuality >= 0.9;
  return {
    passed,
    accuracy,
    confidenceMatch,
    evidenceQuality: Math.round(evidenceQuality * 100),
    combinedScore: Math.round(combinedScore * 100),
    message: passed
      ? 'ALL THRESHOLDS PASSED. APEX RANK ACHIEVED.'
      : `Answer ${accuracy >= 1 ? 'accepted' : 'incorrect'}. Confidence: ${Math.round(confidence)}%${confidence >= 90 ? '' : ' — BELOW THRESHOLD'}. Evidence Quality: ${Math.round(evidenceQuality * 100)}%${evidenceQuality >= 0.9 ? '' : ' — BELOW THRESHOLD'}.`,
  };
}

function getLevelContent(level) {
  const content = {
    tutorial: {
      title: 'FLOOR 0 — THE FIRST SIGNAL',
      description: 'A corrupted signal matrix — 144 data points. The password is hidden within.',
      instruction: 'Study the 12×12 number grid. Only numbers between 65-90 matter. Find the 9 that fall in the ASCII uppercase letter range, convert them to characters, and read them in grid order.',
      hint: '144 numbers. But only 9 matter. Look for structure, not computation.',
    },
    level1: {
      title: 'FLOOR 1 — FAULT LINES',
      description: 'The security module has been corrupted. Find every fault.',
      instruction: 'Count every error in the corrupted code. Identify the most frequent error category. Submit as: <count><CATEGORY>',
      timeLimit: 900,
    },
    level2: {
      title: 'FLOOR 2 — CITATION TRACE',
      description: 'A research paper. A reference. Find the first author.',
      instruction: 'Examine the paper and its references. Identify the first author surname of the specified reference.',
      timeLimit: 900,
    },
    final: {
      title: 'APEX FLOOR — THE FINAL CHALLENGE',
      description: 'The helicopter awaits. Only one candidate can achieve Apex Rank.',
      instruction: 'Investigate the scenario. Identify authentic vs fabricated evidence. Submit a verified conclusion with confidence and evidence citations.',
      timeLimit: 900,
    },
  };
  return content[level] || null;
}

module.exports = {
  ANSWER_KEY,
  setSessionVariants,
  getSessionVariants,
  verifyTutorialAnswer,
  verifyLevel1Answer,
  verifyLevel2Answer,
  verifyFinalAnswer,
  getLevelContent,
};
