import type { LeaderboardEntry } from '../types/leaderboard';
import { normalizeProviderName } from '../constants/providers';
import { calculateAllTCI } from './calculateTCI';

/**
 * Raw row data from the leaderboard JSON file
 */
interface RawLeaderboardRow {
  model: string;
  teleqna: [number, number, number] | null; // [score, stderr, n_samples]
  telelogs: [number, number, number] | null;
  telemath: [number, number, number] | null;
  '3gpp_tsg': [number, number, number] | null;
  teletables: [number, number, number] | null;
  tci?: [number, number, number] | null; // Optional: [score, stderr, 0] - manual override
  date: string;
}

/**
 * Structure of the leaderboard JSON data file
 */
interface RawLeaderboardData {
  rows: Array<{
    row_idx: number;
    row: RawLeaderboardRow;
    truncated_cells: string[];
  }>;
}

/**
 * Parse model name and provider from combined string
 * e.g., "gpt-5.2 (OpenAI)" → { model: "gpt-5.2", provider: "OpenAI" }
 */
function parseModelAndProvider(combined: string): { model: string; provider: string } {
  const match = combined.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (match) {
    return { model: match[1].trim(), provider: normalizeProviderName(match[2]) };
  }
  // Fallback if no provider in parentheses
  return { model: combined, provider: 'Unknown' };
}

/**
 * Calculate mean score from available benchmark scores
 */
function calculateMean(scores: (number | null)[]): number | null {
  const validScores = scores.filter((s): s is number => s !== null);
  if (validScores.length === 0) return null;
  return validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
}

/**
 * Transform raw leaderboard JSON data to LeaderboardEntry array
 *
 * TCI scores are calculated dynamically using IRT (Item Response Theory).
 * If a `tci` field exists in the JSON, it's used as a manual override.
 */
export function transformLeaderboardData(response: RawLeaderboardData): LeaderboardEntry[] {
  // Track which entries have manual TCI overrides
  const manualTciOverrides = new Set<string>();

  const entries: LeaderboardEntry[] = response.rows.map((item) => {
    const row = item.row;
    const { model, provider } = parseModelAndProvider(row.model);

    const teleqna = row.teleqna?.[0] ?? null;
    const teleqna_stderr = row.teleqna?.[1] ?? null;
    const telelogs = row.telelogs?.[0] ?? null;
    const telelogs_stderr = row.telelogs?.[1] ?? null;
    const telemath = row.telemath?.[0] ?? null;
    const telemath_stderr = row.telemath?.[1] ?? null;
    const tsg = row['3gpp_tsg']?.[0] ?? null;
    const tsg_stderr = row['3gpp_tsg']?.[1] ?? null;
    const teletables = row.teletables?.[0] ?? null;
    const teletables_stderr = row.teletables?.[1] ?? null;

    // Check for manual TCI override in JSON
    const tciOverride = row.tci?.[0] ?? null;
    const tciStderrOverride = row.tci?.[1] ?? null;
    if (tciOverride !== null) {
      manualTciOverrides.add(model);
    }

    const mean = calculateMean([teleqna, telelogs, telemath, tsg, teletables]);

    return {
      rank: 0, // Will be assigned after sorting
      model,
      provider,
      repo: '',
      mean,
      teleqna,
      teleqna_stderr,
      telelogs,
      telelogs_stderr,
      telemath,
      telemath_stderr,
      tsg,
      tsg_stderr,
      teletables,
      teletables_stderr,
      tci: tciOverride,        // Will be recalculated unless it's an override
      tci_stderr: tciStderrOverride,
      releaseDate: row.date,   // ISO date string from leaderboard JSON
    };
  });

  // Calculate TCI dynamically using IRT
  // Note: JSON TCI values are ignored - all TCI is calculated at runtime
  // To add a manual override, set tci_override: true in the JSON row
  const { entries: entriesWithTCI } = calculateAllTCI(entries, false);

  // Sort by mean score descending and assign ranks
  entriesWithTCI.sort((a, b) => {
    if (a.mean === null && b.mean === null) return 0;
    if (a.mean === null) return 1;
    if (b.mean === null) return -1;
    return b.mean - a.mean;
  });

  entriesWithTCI.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entriesWithTCI;
}
