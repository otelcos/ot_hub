import React from 'react';

export type DashboardView = 'tci' | 'benchmarks';

interface ViewToggleProps {
  activeView: DashboardView;
  onChange: (view: DashboardView) => void;
}

export default function ViewToggle({ activeView, onChange }: ViewToggleProps): JSX.Element {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle__btn ${activeView === 'tci' ? 'view-toggle__btn--active' : ''}`}
        onClick={() => onChange('tci')}
        type="button"
      >
        Telco Capability Index
      </button>
      <button
        className={`view-toggle__btn ${activeView === 'benchmarks' ? 'view-toggle__btn--active' : ''}`}
        onClick={() => onChange('benchmarks')}
        type="button"
      >
        Frontier Progress
      </button>
    </div>
  );
}
