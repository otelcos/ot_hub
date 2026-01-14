import React from 'react';
import type { TCIEntry } from '../types/leaderboard';
import RankingRow from './RankingRow';

interface TCIFullTableProps {
  rankings: TCIEntry[];
}

export default function TCIFullTable({
  rankings,
}: TCIFullTableProps): JSX.Element {
  const minTCI = 90;
  const maxTCI = Math.max(...rankings.map(r => r.tci), 150);
  const range = maxTCI - minTCI;
  const getBarWidth = (tci: number) => Math.max(5, ((tci - minTCI) / range) * 100);

  return (
    <div className="tci-full-table">
      <div className="leaderboard-card tci-hero-card">
        <div className="leaderboard-card-header">
          <div className="leaderboard-card-title-section">
            <h3 className="leaderboard-card-title">Telco Capability Index (TCI)</h3>
            <p className="leaderboard-card-description">
              A unified measure of AI model performance across telecommunications-specific tasks,
              using IRT-inspired methodology for meaningful cross-model comparisons.
            </p>
            <a
              href="https://opentelco.io/dashboards"
              target="_blank"
              rel="noopener noreferrer"
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
