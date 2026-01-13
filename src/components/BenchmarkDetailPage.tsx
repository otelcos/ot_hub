import React, { useMemo } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import type { RankingEntry, TCIEntry, LeaderboardEntry } from '../types/leaderboard';
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import { calculateTCI, calculateError } from '../utils/calculateTCI';
import { BENCHMARKS, getDifficultyColor } from '../constants/benchmarks';
import RankingRow from './RankingRow';

interface BenchmarkDetailPageProps {
  benchmarkKey: string;
}

// TCI-specific configuration
const TCI_CONFIG = {
  key: 'tci',
  title: 'Telco Capability Index (TCI)',
  description: 'A unified measure of AI model performance across telecommunications-specific tasks, using IRT-inspired methodology for meaningful cross-model comparisons.',
  longDescription: `The Telco Capability Index (TCI) provides a standardized score for comparing AI model performance across telecommunications domains. Using Item Response Theory (IRT) inspired methodology, TCI weighs each benchmark by its difficulty and discrimination power, producing scores on a normalized scale centered at 115.

Models must complete at least 3 of 4 benchmarks to receive a TCI score. This ensures meaningful comparisons even when some benchmark results are missing.`,
  samples: '4 benchmarks',
  difficulty: 'composite' as const,
};

export default function BenchmarkDetailPage({
  benchmarkKey,
}: BenchmarkDetailPageProps): JSX.Element {
  const { data, loading, error } = useLeaderboardData();
  const isTCI = benchmarkKey === 'tci';

  // Get benchmark config
  const benchmark = isTCI
    ? TCI_CONFIG
    : BENCHMARKS.find(b => b.key === benchmarkKey);

  // Calculate rankings
  const rankings = useMemo(() => {
    if (isTCI) {
      // TCI rankings
      return data
        .map(entry => {
          const tci = calculateTCI(entry);
          if (tci === null) return null;
          return {
            rank: 0,
            model: entry.model,
            provider: entry.provider,
            score: tci,
            error: calculateError(tci, 'tci'),
            isNew: entry.rank <= 3,
          };
        })
        .filter((e): e is RankingEntry => e !== null)
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
    } else {
      // Individual benchmark rankings
      const key = benchmarkKey as keyof LeaderboardEntry;
      return data
        .filter(entry => entry[key] !== null && typeof entry[key] === 'number')
        .map(entry => ({
          rank: 0,
          model: entry.model,
          provider: entry.provider,
          score: entry[key] as number,
          error: calculateError(entry[key] as number, benchmarkKey),
          isNew: entry.rank <= 3,
        }))
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
    }
  }, [data, benchmarkKey, isTCI]);

  // Calculate bar widths
  const getBarWidth = (score: number) => {
    if (rankings.length === 0) return 0;
    if (isTCI) {
      const minTCI = 90;
      const maxTCI = Math.max(...rankings.map(r => r.score), 150);
      const range = maxTCI - minTCI;
      return Math.max(5, ((score - minTCI) / range) * 100);
    } else {
      const topScore = Math.max(...rankings.map(r => r.score));
      return Math.max(5, (score / topScore) * 100);
    }
  };

  if (!benchmark) {
    return (
      <Layout title="Benchmark Not Found">
        <div className="benchmark-detail-page">
          <div className="benchmark-not-found">
            <h1>Benchmark Not Found</h1>
            <p>The requested benchmark "{benchmarkKey}" does not exist.</p>
            <Link to="/leaderboard" className="back-link">&larr; Back to Leaderboard</Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title={benchmark.title}>
        <div className="benchmark-detail-page">
          <div className="benchmark-loading">Loading leaderboard data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={benchmark.title}>
        <div className="benchmark-detail-page">
          <div className="benchmark-error">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  const difficultyColor = benchmark.difficulty && benchmark.difficulty !== 'composite'
    ? getDifficultyColor(benchmark.difficulty)
    : '#6b7280';

  return (
    <Layout title={`${benchmark.title} | Leaderboard`} description={benchmark.description}>
      <div className="benchmark-detail-page">
        <Link to="/leaderboard" className="back-link">
          <span className="back-arrow">&larr;</span> Back to Leaderboard
        </Link>

        <div className="benchmark-detail-grid">
          {/* Left Column - Benchmark Info */}
          <div className="benchmark-info-panel">
            <div className="benchmark-info-card">
              <h1 className="benchmark-info-title">{benchmark.title}</h1>
              <p className="benchmark-info-description">
                {isTCI && 'longDescription' in benchmark
                  ? benchmark.longDescription
                  : benchmark.description}
              </p>

              <div className="benchmark-meta">
                {benchmark.samples && (
                  <div className="benchmark-meta-item">
                    <span className="meta-label">Samples</span>
                    <span className="meta-value">{benchmark.samples}</span>
                  </div>
                )}
                {benchmark.difficulty && benchmark.difficulty !== 'composite' && (
                  <div className="benchmark-meta-item">
                    <span className="meta-label">Difficulty</span>
                    <span
                      className="difficulty-badge"
                      style={{ backgroundColor: difficultyColor }}
                    >
                      {benchmark.difficulty}
                    </span>
                  </div>
                )}
              </div>

              {!isTCI && ('paperLink' in benchmark || 'datasetLink' in benchmark) && (
                <div className="benchmark-links">
                  {benchmark.paperLink && (
                    <a
                      href={benchmark.paperLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="benchmark-link"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Paper
                    </a>
                  )}
                  {benchmark.datasetLink && (
                    <a
                      href={benchmark.datasetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="benchmark-link"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      </svg>
                      Dataset
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Full Leaderboard */}
          <div className="benchmark-full-leaderboard">
            <div className="leaderboard-card full-ranking-card">
              <div className="full-ranking-header">
                <span className="ranking-count">{rankings.length} models</span>
              </div>
              <div className="leaderboard-rankings">
                {rankings.map((entry, index) => (
                  <RankingRow
                    key={`${entry.model}-${index}`}
                    rank={entry.rank}
                    model={entry.model}
                    provider={entry.provider}
                    score={entry.score}
                    error={entry.error}
                    barWidth={getBarWidth(entry.score)}
                    showProviderIcon={true}
                    isNew={entry.isNew}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
