import React from 'react';
import { useGame } from '../context/GameContext';

export default function IntroScreen() {
  const { dispatch } = useGame();
  React.useEffect(() => {
    dispatch({ type: 'SET_SCREEN', payload: 'level_0' });
  }, [dispatch]);
  return null;
}
