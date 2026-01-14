import React from 'react';
import Link from '@docusaurus/Link';
import type { TCIEntry } from '../types/leaderboard';
import RankingRow from './RankingRow';

export type { TCIEntry };

interface TCIHeroCardProps {
  rankings: TCIEntry[];
}

export default function TCIHeroCard({
  rankings,
}: TCIHeroCardProps): JSX.Element {
  const minTCI = 90;
  const maxTCI = Math.max(...rankings.map(r => r.tci), 150);
  const range = maxTCI - minTCI;
  const getBarWidth = (tci: number) => Math.max(5, ((tci - minTCI) / range) * 100);

  const displayRankings = rankings.slice(0, 3);

  return (
    <div className="leaderboard-card tci-hero-card">
      <div className="leaderboard-card-header">
        <div className="leaderboard-card-title-section">
          <h3 className="leaderboard-card-title">Telco Capability Index (TCI)</h3>
        </div>
      </div>

      <div className="leaderboard-rankings">
        {displayRankings.map((entry, index) => (
          <RankingRow
            key={`${entry.model}-${index}`}
            rank={entry.rank}
            model={entry.model}
            provider={entry.provider}
            score={entry.tci}
            error={entry.error}
            barWidth={getBarWidth(entry.tci)}
            showProviderIcon={true}
            isNew={entry.isNew}
          />
        ))}
      </div>

      <Link to="/leaderboard/tci" className="view-full-ranking">
        View Full Ranking <span className="arrow">&rarr;</span>
      </Link>
    </div>
  );
}
