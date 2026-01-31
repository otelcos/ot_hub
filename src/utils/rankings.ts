/**
 * Ranking calculation utilities for leaderboard data.
 */
import type { LeaderboardEntry, RankingEntry, TCIEntry } from '../types/leaderboard';
import { calculateError } from './calculateTCI';
import { TOP_RANKINGS_COUNT } from '../constants/ui';

/**
 * Calculate TCI rankings from leaderboard data.
 * TCI scores are pre-calculated from HuggingFace; this function sorts and assigns ranks.
 *
 * @param data Array of leaderboard entries
 * @returns Sorted array of TCI entries with ranks assigned
 */
export function calculateTCIRankings(data: LeaderboardEntry[]): TCIEntry[] {
  return data
    .filter(entry => entry.tci !== null)
    .map(entry => ({
      rank: 0,
      model: entry.model,
      provider: entry.provider,
      tci: entry.tci as number,
      error: entry.tci_stderr ?? calculateError(entry.tci as number, 'tci'),
      isNew: entry.rank <= TOP_RANKINGS_COUNT,
    }))
    .sort((a, b) => b.tci - a.tci)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

/**
 * Calculate benchmark rankings for a specific benchmark key.
 *
 * @param data Array of leaderboard entries
 * @param benchmarkKey The benchmark identifier (e.g., 'teleqna', 'telemath')
 * @returns Sorted array of ranking entries with ranks assigned
 */
export function calculateBenchmarkRankings(
  data: LeaderboardEntry[],
  benchmarkKey: string
): RankingEntry[] {
  const key = benchmarkKey as keyof LeaderboardEntry;
  return data
    .filter(entry => entry[key] !== null && typeof entry[key] === 'number')
    .map(entry => ({
      rank: 0,
      model: entry.model,
      provider: entry.provider,
      score: entry[key] as number,
      error: calculateError(entry[key] as number, benchmarkKey),
      isNew: entry.rank <= TOP_RANKINGS_COUNT,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

/**
 * Calculate rankings for either TCI or a specific benchmark.
 * Unified interface for BenchmarkDetailPage.
 *
 * @param data Array of leaderboard entries
 * @param benchmarkKey The benchmark key ('tci' for TCI, or benchmark name)
 * @returns Sorted array of ranking entries with ranks assigned
 */
export function calculateRankings(
  data: LeaderboardEntry[],
  benchmarkKey: string
): RankingEntry[] {
  if (benchmarkKey === 'tci') {
    // Convert TCI rankings to RankingEntry format
    return calculateTCIRankings(data).map(entry => ({
      rank: entry.rank,
      model: entry.model,
      provider: entry.provider,
      score: entry.tci,
      error: entry.error,
      isNew: entry.rank <= TOP_RANKINGS_COUNT,
    }));
  }
  return calculateBenchmarkRankings(data, benchmarkKey);
}
