import React from 'react';
import { BENCHMARK_CATEGORIES } from '../constants/benchmarks';

interface LeaderboardTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function LeaderboardTabs({
  activeTab,
  onTabChange,
}: LeaderboardTabsProps): JSX.Element {
  return (
    <nav className="leaderboard-tabs" role="tablist">
      {BENCHMARK_CATEGORIES.map((category) => (
        <button
          key={category.id}
          role="tab"
          aria-selected={activeTab === category.id}
          className={`leaderboard-tab ${activeTab === category.id ? 'active' : ''}`}
          onClick={() => onTabChange(category.id)}
        >
          <span className="leaderboard-tab-icon">{category.icon}</span>
          <span className="leaderboard-tab-label">{category.label}</span>
        </button>
      ))}
    </nav>
  );
}
