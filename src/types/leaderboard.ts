/**
 * Shared type definitions for leaderboard data structures
 */

/**
 * Fitted IRT (Item Response Theory) parameters from the 2PL model.
 *
 * These parameters are dynamically fitted from leaderboard data,
 * ensuring benchmark difficulty adapts as models improve.
 */
export interface IRTParameters {
  /** Difficulty parameter (D_b) for each benchmark - higher = harder */
  difficulty: Record<string, number>;
  /** Slope/discrimination parameter (α_b) for each benchmark */
  slope: Record<string, number>;
  /** Capability parameter (C_m) for each model */
  capability: Record<string, number>;
  /** Final loss value from optimization */
  fitResidual: number;
  /** Number of models used in fitting */
  nModels: number;
  /** Number of benchmarks used in fitting */
  nBenchmarks: number;
}

/**
 * Raw entry from the leaderboard JSON file
 */
export interface LeaderboardEntry {
  rank: number;
  provider: string;
  model: string;
  repo: string;
  mean: number | null;
  teleqna: number | null;
  teleqna_stderr: number | null;
  telelogs: number | null;
  telelogs_stderr: number | null;
  telemath: number | null;
  telemath_stderr: number | null;
  tsg: number | null;
  tsg_stderr: number | null;
  teletables: number | null;
  teletables_stderr: number | null;
  tci: number | null;
  tci_stderr: number | null;
  releaseDate?: string; // ISO date string from JSON (e.g., "2025-11-18")
}

/**
 * Entry for benchmark-specific rankings (used by LeaderboardCard)
 */
export interface RankingEntry {
  rank: number;
  model: string;
  provider: string;
  score: number;
  error: number;
  isNew?: boolean;
}

/**
 * Entry for TCI rankings (used by TCIHeroCard)
 */
export interface TCIEntry {
  rank: number;
  model: string;
  provider: string;
  tci: number;
  error: number;
  isNew?: boolean;
}

/**
 * Data point for scatter chart visualization
 */
export interface TCIDataPoint {
  rank: number;
  tci: number;
  model: string;
  provider: string;
  color: string;
  isLabeled: boolean;
  teleqna: number | null;
  telelogs: number | null;
  telemath: number | null;
  tsg: number | null;
  teletables: number | null;
  releaseDate: number; // Unix timestamp for chart X-axis
}

/**
 * Question types for benchmark examples
 */
export type QuestionType = 'mcq' | 'open-ended' | 'log-analysis' | 'text-classification';

export interface MCQQuestion {
  type: 'mcq';
  question: string;
  options: string[];
}

export interface OpenEndedQuestion {
  type: 'open-ended';
  question: string;
}

export interface LogAnalysisQuestion {
  type: 'log-analysis';
  prompt: string;
  tableExcerpt: {
    headers: string[];
    rows: string[][];
  };
  options: string[];
}

export interface TextClassificationQuestion {
  type: 'text-classification';
  passage: string;
  options: string[];
}

export type BenchmarkQuestion =
  | MCQQuestion
  | OpenEndedQuestion
  | LogAnalysisQuestion
  | TextClassificationQuestion;

/**
 * Benchmark category type
 */
export type BenchmarkCategory = 'overall' | 'knowledge' | 'network-optimisation';

/**
 * Benchmark configuration
 */
export interface BenchmarkConfig {
  key: string;
  title: string;
  description: string;
  icon?: string;
  samples?: string;
  category?: BenchmarkCategory;
  paperLink?: string;
  datasetLink?: string;
  questions?: BenchmarkQuestion[];
  comingSoon?: boolean;
}

/**
 * Type-safe benchmark score keys that exist as numeric fields on LeaderboardEntry
 */
export type BenchmarkScoreKey = 'teleqna' | 'telelogs' | 'telemath' | 'tsg' | 'teletables';

/**
 * Type guard to check if a key is a valid benchmark score key
 */
export function isBenchmarkScoreKey(key: string): key is BenchmarkScoreKey {
  return ['teleqna', 'telelogs', 'telemath', 'tsg', 'teletables'].includes(key);
}

/**
 * Safely extract a benchmark score from a LeaderboardEntry.
 * Returns undefined if the key is invalid or the score is null.
 */
export function getBenchmarkScore(entry: LeaderboardEntry, key: string): number | undefined {
  if (!isBenchmarkScoreKey(key)) {
    return undefined;
  }
  const score = entry[key];
  return typeof score === 'number' ? score : undefined;
}

/**
 * Check if an entry has a valid release date
 */
export function hasValidReleaseDate(entry: LeaderboardEntry): entry is LeaderboardEntry & { releaseDate: string } {
  return typeof entry.releaseDate === 'string' && entry.releaseDate.length > 0;
}

/**
 * Parse release date string to timestamp. Returns undefined if invalid.
 */
export function parseReleaseDate(entry: LeaderboardEntry): number | undefined {
  if (!hasValidReleaseDate(entry)) {
    return undefined;
  }
  const timestamp = new Date(entry.releaseDate).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}
