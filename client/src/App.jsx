import React, { Suspense, lazy } from 'react';
import { useGame } from './context/GameContext';
import TowerSpine from './components/TowerSpine';
import useLowEndDevice from './hooks/useLowEndDevice';

const EntryScreen = lazy(() => import('./screens/EntryScreen'));
const IntroScreen = lazy(() => import('./screens/IntroScreen'));
const Level0Screen = lazy(() => import('./screens/Level0Screen'));
const Level1Screen = lazy(() => import('./screens/Level1Screen'));
const Level2Screen = lazy(() => import('./screens/Level2Screen'));
const FinalRaceScreen = lazy(() => import('./screens/FinalRaceScreen'));
const RevealScreen = lazy(() => import('./screens/RevealScreen'));
const PostGameReport = lazy(() => import('./screens/PostGameReport'));

const GAME_SCREENS = new Set([
  'level_0', 'level_1', 'level_2', 'level_3',
]);

const FALLBACK = <div style={{ height: '100vh', background: 'var(--bg-tower)' }} />;

export default function App() {
  const { state } = useGame();
  const isLowEnd = useLowEndDevice();
  const effectiveScreen = GAME_SCREENS.has(state.currentLevel) ? state.currentLevel : state.screen;
  const showSpine = GAME_SCREENS.has(state.screen);

  const renderScreen = () => {
    switch (state.screen) {
      case 'entry': return <EntryScreen />;
      case 'intro': return <IntroScreen />;
      case 'level_0': return <Level0Screen />;
      case 'level_1': return <Level1Screen />;
      case 'level_2': return <Level2Screen />;
      case 'level_3': return <FinalRaceScreen />;
      case 'reveal': return <RevealScreen />;
      case 'report': return <PostGameReport />;
      default: return <EntryScreen />;
    }
  };

  return (
    <div className={`app${isLowEnd ? ' low-end' : ''}`}>
      <div className="main-content">
        {state.error && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: 'rgba(255,60,90,0.15)', color: 'var(--red-alert)',
            padding: '0.5rem 1.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
          }}>
            ERROR: {state.error}
          </div>
        )}
        <Suspense fallback={FALLBACK}>
          {renderScreen()}
        </Suspense>
      </div>
      {showSpine && <TowerSpine currentScreen={effectiveScreen} levelStates={state.levelStates} />}
    </div>
  );
}
