import React from 'react';
import LeaderboardCard from './LeaderboardCard';
import type { RankingEntry } from '../types/leaderboard';
import type { BenchmarkCategory } from '../constants/benchmarks';
import { getBenchmarksByCategory } from '../constants/benchmarks';

interface CategorySectionProps {
  category: BenchmarkCategory;
  getRankings: (key: string) => RankingEntry[];
}

export default function CategorySection({
  category,
  getRankings,
}: CategorySectionProps): JSX.Element {
  const benchmarks = getBenchmarksByCategory(category);

  if (benchmarks.length === 0) {
    return (
      <div className="category-empty">
        No benchmarks available for this category.
      </div>
    );
  }

  return (
    <div className="category-section">
      <div className="category-benchmarks">
        {benchmarks.map((benchmark) => {
          const rankings = getRankings(benchmark.key);

          if (benchmark.comingSoon) {
            return (
              <div key={benchmark.key} className="benchmark-coming-soon-wrapper">
                <div className="leaderboard-card benchmark-coming-soon">
                  <div className="leaderboard-card-header">
                    <div className="leaderboard-card-title-section">
                      <h3 className="leaderboard-card-title">{benchmark.title}</h3>
                      <p className="leaderboard-card-description">{benchmark.description}</p>
                    </div>
                  </div>
                  <div className="leaderboard-rankings coming-soon-placeholder">
                    <div className="coming-soon-rows">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="coming-soon-row" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="coming-soon-badge">Coming Soon!</div>
              </div>
            );
          }

          if (rankings.length === 0) return null;

          return (
            <LeaderboardCard
              key={benchmark.key}
              title={benchmark.title}
              description={benchmark.description}
              rankings={rankings}
              benchmarkKey={benchmark.key}
            />
          );
        })}
      </div>
    </div>
  );
}
