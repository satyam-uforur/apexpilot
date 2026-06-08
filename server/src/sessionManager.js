const { v4: uuidv4 } = require('uuid');

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.eloTracker = new Map();
  }

  createSession(candidateName) {
    const session = {
      sessionId: uuidv4(),
      candidateId: uuidv4().slice(0, 8).toUpperCase(),
      candidateName: candidateName || null,
      startedAt: Date.now(),
      levelStates: {
        tutorial: { completed: false, score: 0, time: 0 },
        level_1: { completed: false, score: 0, time: 0 },
        level_2: { completed: false, score: 0, time: 0 },
        final: { submitted: false, answer: null, confidence: 0, evidenceQuality: 0, time: 0, passed: false },
      },
      variantAssignments: this._assignVariants(),
      eloBefore: this._getDefaultElo(candidateName),
      eloDelta: 0,
      totalScore: 0,
      completed: false,
      postGameReport: null,
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  _assignVariants() {
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return {
      tutorial: pickRandom(['TUT-01', 'TUT-02', 'TUT-03', 'TUT-04', 'TUT-05', 'TUT-06', 'TUT-07', 'TUT-08', 'TUT-09', 'TUT-10']),
      level1: pickRandom(['FIN-01', 'FIN-02', 'FIN-03', 'FIN-04', 'FIN-05']),
      level2: pickRandom(['L2-P01', 'L2-P02', 'L2-P03', 'L2-P04', 'L2-P05']),
      final: 'L1-F01',
    };
  }

  _getDefaultElo(name) {
    return this.eloTracker.get(name) || 1000;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  updateLevel(sessionId, level, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.levelStates[level] = { ...session.levelStates[level], ...data };
    session.totalScore = this._calculateTotalScore(session);
    return true;
  }

  completeGame(sessionId, finalData) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.levelStates.final = { ...session.levelStates.final, ...finalData, submitted: true };
    session.completed = true;
    session.postGameReport = this._generateReport(session);
    return true;
  }

  _calculateTotalScore(session) {
    let total = 0;
    for (const key of Object.keys(session.levelStates)) {
      total += session.levelStates[key].score || 0;
    }
    return total;
  }

  generateReport(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.completed) return null;
    return this._generateReport(session);
  }

  _generateReport(session) {
    const skillScores = this._computeSkillScores(session);
    const overall = Math.round(Object.values(skillScores).reduce((a, b) => a + b, 0) / Object.values(skillScores).length);
    const eloDelta = this._computeEloDelta(session, overall);
    const rank = this._getRank(session.eloBefore + eloDelta);
    const sortedSkills = Object.entries(skillScores).sort((a, b) => b[1] - a[1]);
    return {
      candidateId: session.candidateId,
      timestamp: new Date().toISOString(),
      totalTime: Math.floor((Date.now() - session.startedAt) / 1000),
      skillScores,
      overallScore: overall,
      eloBefore: session.eloBefore,
      eloDelta,
      eloAfter: session.eloBefore + eloDelta,
      rank,
      topStrengths: sortedSkills.slice(0, 3).map(([k, v]) => ({ skill: k, score: v })),
      topWeaknesses: sortedSkills.slice(-3).reverse().map(([k, v]) => ({ skill: k, score: v })),
      levelBreakdown: Object.entries(session.levelStates).map(([k, v]) => ({
        level: k,
        completed: v.completed || v.submitted,
        score: v.score || 0,
      })),
      recommendation: this._generateRecommendation(sortedSkills),
    };
  }

  _computeSkillScores(session) {
    const ls = session.levelStates;
    const weights = {
      tutorial: { observation: 0.4, promptEngineering: 0.2, reasoning: 0.1, verification: 0.1, research: 0.05, adaptability: 0.05, communication: 0.05, competitive: 0.05 },
      level_1: { observation: 0.1, promptEngineering: 0.3, reasoning: 0.2, verification: 0.2, research: 0.05, adaptability: 0.05, communication: 0.05, competitive: 0.05 },
      level_2: { observation: 0.05, promptEngineering: 0.15, reasoning: 0.15, verification: 0.3, research: 0.3, adaptability: 0.05, communication: 0, competitive: 0 },
      final: { observation: 0.3, promptEngineering: 0.15, reasoning: 0.25, verification: 0.15, research: 0.05, adaptability: 0.05, communication: 0, competitive: 0.05 },
    };
    const skills = { observation: 0, promptEngineering: 0, reasoning: 0, verification: 0, research: 0, adaptability: 0, communication: 0, competitive: 0 };
    const totalWeights = { observation: 0, promptEngineering: 0, reasoning: 0, verification: 0, research: 0, adaptability: 0, communication: 0, competitive: 0 };
    for (const [level, scores] of Object.entries(ls)) {
      const w = weights[level];
      if (!w) continue;
      const levelScore = scores.score || 0;
      const maxScore = { tutorial: 200, level_1: 100, level_2: 300, final: 300 }[level] || 300;
      const normalized = Math.min(levelScore / maxScore, 1);
      for (const [skill, weight] of Object.entries(w)) {
        skills[skill] += normalized * weight * 100;
        totalWeights[skill] += weight;
      }
    }
    for (const skill of Object.keys(skills)) {
      skills[skill] = totalWeights[skill] > 0 ? Math.round(skills[skill] / totalWeights[skill]) : 0;
    }
    return skills;
  }

  _computeEloDelta(session, overall) {
    const expectedScore = 0.5;
    const actualScore = overall / 100;
    const K = 32;
    return Math.round(K * (actualScore - expectedScore));
  }

  _getRank(elo) {
    if (elo >= 3500) return 'Apex';
    if (elo >= 3000) return 'Master';
    if (elo >= 2500) return 'Diamond';
    if (elo >= 2000) return 'Platinum';
    if (elo >= 1500) return 'Gold';
    if (elo >= 1000) return 'Silver';
    if (elo >= 500) return 'Bronze';
    return 'Iron';
  }

  _generateRecommendation(sortedSkills) {
    const weakest = sortedSkills[sortedSkills.length - 1][0];
    const tips = {
      observation: 'Practice finding signal in noisy data. Try the Pattern Recognition Dojo.',
      promptEngineering: 'Practice information compression. Write shorter, more precise prompts.',
      reasoning: 'Work through problems step by step. Document your chain of thought.',
      verification: 'Always cross-check claims against primary sources before accepting them.',
      research: 'Use multiple tools. Don\'t rely on a single source for verification.',
      adaptability: 'When a strategy fails, pivot immediately. Don\'t persist with what isn\'t working.',
      communication: 'Practice relaying complex information clearly and concisely to others.',
      competitive: 'Balance speed with accuracy. Haste without verification costs points.',
    };
    return tips[weakest] || 'Keep practicing to improve your overall APEX Rank.';
  }
}

module.exports = { SessionManager };
