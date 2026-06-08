const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { SessionManager } = require('./sessionManager');
const { setSessionVariants, verifyTutorialAnswer, verifyLevel1Answer, verifyLevel2Answer, verifyFinalAnswer, getLevelContent } = require('./answerKey');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const sessionManager = new SessionManager();

app.use(express.static(path.join(__dirname, '../../public')));

app.post('/api/session/start', (req, res) => {
  const session = sessionManager.createSession(req.body.candidateName || null);
  setSessionVariants(session.sessionId, session.variantAssignments);
  res.json({
    sessionId: session.sessionId,
    candidateId: session.candidateId,
    startedAt: session.startedAt,
    variantAssignments: session.variantAssignments,
  });
});

app.get('/api/session/:sessionId', (req, res) => {
  const session = sessionManager.getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

app.post('/api/level/tutorial/submit', (req, res) => {
  const { sessionId, answer, timeSpent } = req.body;
  const result = verifyTutorialAnswer(sessionId, answer, timeSpent);
  if (result.valid) {
    sessionManager.updateLevel(sessionId, 'tutorial', {
      completed: true, score: result.score, time: timeSpent,
    });
  }
  res.json(result);
});

app.post('/api/level/1/submit', (req, res) => {
  const { sessionId, answer, timeSpent } = req.body;
  const result = verifyLevel1Answer(sessionId, answer, timeSpent);
  if (result.valid) {
    sessionManager.updateLevel(sessionId, 'level_1', {
      completed: true, score: result.score, time: timeSpent,
    });
  }
  res.json(result);
});

app.post('/api/level/2/submit', (req, res) => {
  const { sessionId, answer, timeSpent } = req.body;
  const result = verifyLevel2Answer(sessionId, answer, timeSpent);
  if (result.valid) {
    sessionManager.updateLevel(sessionId, 'level_2', {
      completed: true, score: result.score, time: timeSpent,
    });
  }
  res.json(result);
});

app.post('/api/final/submit', (req, res) => {
  const { sessionId, answer, confidence, evidence, timeSpent } = req.body;
  const session = sessionManager.getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const result = verifyFinalAnswer(sessionId, answer, confidence, evidence);
  if (result.passed) {
    sessionManager.completeGame(sessionId, {
      answer, confidence, evidence_quality: result.evidenceQuality, time: timeSpent, passed: true,
    });
  }
  res.json(result);
});

app.get('/api/session/:sessionId/report', (req, res) => {
  const report = sessionManager.generateReport(req.params.sessionId);
  if (!report) return res.status(404).json({ error: 'Report not available' });
  res.json(report);
});

app.get('/api/level/:level/content', (req, res) => {
  const content = getLevelContent(req.params.level);
  if (!content) return res.status(404).json({ error: 'Level not found' });
  res.json(content);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`ApexRank server running on port ${PORT}`);
  });
}

module.exports = app;
