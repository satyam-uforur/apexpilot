import React from 'react';

const FLOORS = [
  { key: 'level_3', label: 'HELIPAD', num: 'R', type: 'rooftop' },
  { key: 'level_2', label: 'F2', num: '2' },
  { key: 'level_1', label: 'F1', num: '1' },
  { key: 'level_0', label: 'ENTRY', num: 'E' },
];

const FLOOR_ORDER = ['level_0', 'level_1', 'level_2', 'level_3'];

export default function TowerSpine({ currentScreen, levelStates }) {
  const currentIdx = FLOOR_ORDER.indexOf(currentScreen);

  const getFloorState = (key, idx) => {
    if (idx === currentIdx) return 'current';
    if (levelStates?.[key]?.completed) return 'cleared';
    return 'locked';
  };

  return (
    <div className="tower-spine">
      {FLOORS.map((floor, idx) => {
        const state = getFloorState(floor.key, idx);
        return (
          <div key={floor.key} className={`floor-segment ${state}`}>
            <span style={{
              color: state === 'current' ? 'var(--green-apex)' : state === 'cleared' ? 'var(--green-mid)' : 'var(--text-ghost)',
            }}>
              {floor.type === 'rooftop' ? 'H' : floor.num}
            </span>
            <span style={{
              color: state === 'current' ? 'var(--green-apex)' : state === 'cleared' ? 'var(--green-mid)' : 'var(--text-ghost)',
            }}>{floor.label}</span>
          </div>
        );
      })}
      <div className="floor-segment ground">
        <span>GROUND</span>
      </div>
    </div>
  );
}
