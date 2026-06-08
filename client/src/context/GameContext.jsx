import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import * as api from '../api/client';

const GameContext = createContext();

const initialState = {
  screen: 'entry',
  sessionId: null,
  candidateId: null,
  startedAt: null,
  variantAssignments: null,
    levelStates: {
      level_0: { completed: false, score: 0 },
      level_1: { completed: false, score: 0 },
      level_2: { completed: false, score: 0 },
      level_3: { completed: false, score: 0 },
      level_4: { submitted: false, passed: false },
    },
  levelContent: null,
  currentLevel: null,
  hintsRemaining: 5,
  totalScore: 0,
  report: null,
  loading: false,
  error: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'SESSION_STARTED':
      return { ...state, sessionId: action.payload.sessionId, candidateId: action.payload.candidateId, startedAt: action.payload.startedAt, variantAssignments: action.payload.variantAssignments, screen: 'intro' };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LEVEL_CONTENT':
      return { ...state, levelContent: action.payload };
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };
    case 'LEVEL_COMPLETED':
      return {
        ...state,
        levelStates: { ...state.levelStates, [action.payload.level]: { ...state.levelStates[action.payload.level], ...action.payload.data } },
        totalScore: state.totalScore + (action.payload.data.score || 0),
      };
    case 'SET_REPORT':
      return { ...state, report: action.payload, screen: 'report' };
    case 'USE_HINT':
      return { ...state, hintsRemaining: Math.max(0, state.hintsRemaining - 1) };
    case 'GAME_COMPLETED':
      return { ...state, levelStates: { ...state.levelStates, level_4: { submitted: true, passed: action.payload.passed } } };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startSession = useCallback(async (name) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await api.startSession(name);
      dispatch({ type: 'SESSION_STARTED', payload: data });
    } catch (e) {
      console.warn('API unreachable, using offline fallback:', e.message);
      const fallback = {
        sessionId: 'offline_' + Date.now(),
        candidateId: name || 'GHOST',
        startedAt: new Date().toISOString(),
        variantAssignments: { level_0: 'a', level_1: 'a', level_2: 'a', level_3: 'a', level_4: 'a' },
      };
      dispatch({ type: 'SESSION_STARTED', payload: fallback });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadLevelContent = useCallback(async (level) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await api.getLevelContent(level);
      dispatch({ type: 'SET_LEVEL_CONTENT', payload: data });
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: level });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const submitLevelAnswer = useCallback(async (level, submitFn, ...args) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await submitFn(...args);
      return result;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const generateReport = useCallback(async () => {
    if (!state.sessionId) return;
    try {
      const report = await api.getReport(state.sessionId);
      dispatch({ type: 'SET_REPORT', payload: report });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [state.sessionId]);

  return (
    <GameContext.Provider value={{
      state, dispatch, startSession, loadLevelContent,
      submitLevelAnswer, generateReport,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
