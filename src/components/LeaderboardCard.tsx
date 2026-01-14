import React from 'react';
import Link from '@docusaurus/Link';
import type { RankingEntry } from '../types/leaderboard';
import RankingRow from './RankingRow';

export type { RankingEntry };

interface LeaderboardCardProps {
  title: string;
  description: string;
  icon?: string;
  rankings: RankingEntry[];
  maxScore?: number;
  benchmarkKey: string;
}

export default function LeaderboardCard({
  title,
  description,
  icon,
  rankings,
  maxScore = 100,
  benchmarkKey,
}: LeaderboardCardProps): JSX.Element {
  const getBarWidth = (score: number) => Math.max(5, score);

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-card-header">
        {icon && <span className="leaderboard-card-icon">{icon}</span>}
        <div className="leaderboard-card-title-section">
          <h3 className="leaderboard-card-title">{title}</h3>
          <p className="leaderboard-card-description">{description}</p>
        </div>
      </div>

      <div className="leaderboard-rankings">
        {rankings.slice(0, 3).map((entry, index) => (
          <RankingRow
            key={`${entry.model}-${index}`}
            rank={entry.rank}
            model={entry.model}
            provider={entry.provider}
            score={entry.score}
            error={entry.error}
            barWidth={getBarWidth(entry.score)}
            isNew={entry.isNew}
            showProviderIcon={true}
          />
        ))}
      </div>

      <Link to={`/leaderboard/${benchmarkKey}`} className="view-full-ranking">
        View Full Ranking <span className="arrow">&rarr;</span>
      </Link>
    </div>
  );
}
