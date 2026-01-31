/**
 * Shared utilities for chart components.
 */
import {
  TCI_MIN_SCORE,
  TCI_DEFAULT_MAX,
  MIN_BAR_WIDTH_PERCENT,
  DATE_PADDING_MS,
} from '../constants/ui';

/**
 * Quarter label for date slider
 */
export interface QuarterLabel {
  timestamp: number;
  label: string;
}

/**
 * Date bounds with quarter-snapped boundaries for chart sliders
 */
export interface DateBounds {
  min: number;
  max: number;
  quarters: QuarterLabel[];
}

/**
 * Calculate date bounds snapped to quarter boundaries.
 * Used by TelcoCapabilityIndex and BenchmarksFrontierChart for consistent date ranges.
 *
 * @param dates Array of timestamps from data points
 * @returns DateBounds with min/max snapped to quarters and quarter labels
 */
export function calculateQuarterBounds(dates: number[]): DateBounds {
  if (dates.length === 0) {
    return {
      min: new Date('2023-01-01').getTime(),
      max: new Date('2026-01-01').getTime(),
      quarters: [],
    };
  }

  const rawMin = Math.min(...dates);
  const rawMax = Math.max(...dates);

  // Floor min to quarter start
  const minDate = new Date(rawMin);
  const minQuarterStart = new Date(
    minDate.getFullYear(),
    Math.floor(minDate.getMonth() / 3) * 3,
    1
  ).getTime();

  // Ceiling max to next quarter start
  const maxDate = new Date(rawMax);
  const maxQuarterEnd = new Date(
    maxDate.getFullYear(),
    (Math.floor(maxDate.getMonth() / 3) + 1) * 3,
    1
  ).getTime();

  // Generate quarter labels for slider
  const quarters: QuarterLabel[] = [];
  const current = new Date(minQuarterStart);

  while (current.getTime() <= maxQuarterEnd) {
    const month = current.toLocaleString('default', { month: 'short' });
    quarters.push({
      timestamp: current.getTime(),
      label: `${month}. ${current.getFullYear()}`,
    });
    current.setMonth(current.getMonth() + 3);
  }

  return {
    min: minQuarterStart,
    max: maxQuarterEnd,
    quarters,
  };
}

/**
 * Generate semi-annual tick values for X-axis (Q2 and Q4 only).
 * Creates ticks at Apr and Oct for consistent 6-month intervals.
 * This prevents uneven spacing when data ends mid-year.
 *
 * @param dates Array of timestamps from data points
 * @returns Array of timestamps for semi-annual ticks
 */
export function generateQuarterlyTicks(dates: number[]): number[] {
  if (dates.length === 0) return [];

  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);

  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(maxDate).getFullYear();

  const ticks: number[] = [];
  // Only Q2 (Apr) and Q4 (Oct) for consistent 6-month intervals
  const semiAnnualMonths = [3, 9]; // Apr, Oct

  for (let year = startYear; year <= endYear + 1; year++) {
    for (const month of semiAnnualMonths) {
      const tickDate = new Date(year, month, 1).getTime();
      // Include ticks within data range plus small buffer
      const buffer = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (tickDate >= minDate - buffer && tickDate <= maxDate + buffer) {
        ticks.push(tickDate);
      }
    }
  }

  return ticks;
}

/**
 * Calculate X-axis domain with padding.
 *
 * @param dates Array of timestamps from data points
 * @param paddingMs Optional padding in milliseconds (defaults to DATE_PADDING_MS)
 * @returns Tuple of [min, max] timestamps with padding
 */
export function calculateXAxisDomain(
  dates: number[],
  paddingMs: number = DATE_PADDING_MS
): [number, number] {
  if (dates.length === 0) {
    return [new Date('2023-01-01').getTime(), new Date('2026-01-01').getTime()];
  }

  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);

  return [minDate - paddingMs, maxDate + paddingMs];
}

/**
 * Calculate bar width percentage for TCI score visualization.
 * Normalizes TCI scores to a 0-100% range for progress bars.
 *
 * @param score The TCI or benchmark score
 * @param scores Array of all scores (to calculate range)
 * @param options Configuration for bar width calculation
 * @returns Width as percentage (MIN_BAR_WIDTH_PERCENT-100)
 */
export function calculateBarWidth(
  score: number,
  scores: number[],
  options: { minScore?: number; defaultMax?: number; isPercentage?: boolean } = {}
): number {
  const {
    minScore = TCI_MIN_SCORE,
    defaultMax = TCI_DEFAULT_MAX,
    isPercentage = false,
  } = options;

  if (isPercentage) {
    // For percentage-based scores (0-100), just use the score directly
    return Math.max(MIN_BAR_WIDTH_PERCENT, score);
  }

  // For TCI-style scores with custom range
  const maxScore = Math.max(...scores, defaultMax);
  const range = maxScore - minScore;
  // Guard against division by zero when all scores are identical
  if (range === 0) return MIN_BAR_WIDTH_PERCENT;
  return Math.max(MIN_BAR_WIDTH_PERCENT, ((score - minScore) / range) * 100);
}

/**
 * Calculate minor gridline positions by subdividing major tick intervals.
 *
 * @param majorTicks Array of major tick positions
 * @param divisions Number of subdivisions between each pair of major ticks
 * @returns Array of minor gridline positions
 */
export function calculateMinorGridPositions(
  majorTicks: number[],
  divisions: number
): number[] {
  const minorPositions: number[] = [];

  for (let i = 0; i < majorTicks.length - 1; i++) {
    const start = majorTicks[i];
    const end = majorTicks[i + 1];
    const interval = (end - start) / divisions;

    for (let j = 1; j < divisions; j++) {
      minorPositions.push(start + interval * j);
    }
  }

  return minorPositions;
}
