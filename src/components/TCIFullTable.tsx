import React from 'react';
import type { TCIEntry } from '../types/leaderboard';
import { calculateBarWidth } from '../utils/chartUtils';
import RankingRow from './RankingRow';

interface TCIFullTableProps {
  rankings: TCIEntry[];
}

export default function TCIFullTable({
  rankings,
}: TCIFullTableProps): JSX.Element {
  const scores = rankings.map(r => r.tci);
  const getBarWidth = (tci: number) => calculateBarWidth(tci, scores);

  return (
    <div className="tci-full-table">
      <div className="leaderboard-card tci-hero-card">
        <div className="leaderboard-card-header">
          <div className="leaderboard-card-title-section">
            <h3 className="leaderboard-card-title">Telco Capability Index (TCI)</h3>
            <a
              href="https://opentelco.io/dashboards"
              className="tci-info-link"
            >
              What is the TCI score?
            </a>
          </div>
        </div>

        <div className="leaderboard-rankings tci-full-rankings">
          {rankings.map((entry, index) => (
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
      </div>
    </div>
  );
}
