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
          {'icon' in category && (
            <span className="leaderboard-tab-icon">
              <img
                src={category.icon}
                alt=""
                className="pixel-art-icon"
                width={18}
                height={18}
              />
            </span>
          )}
          {category.label}
        </button>
      ))}
    </nav>
  );
}
