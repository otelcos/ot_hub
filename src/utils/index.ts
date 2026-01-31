/**
 * Utility functions barrel file.
 */

// TCI and error calculations
export { calculateError } from './calculateTCI';

// Chart utilities
export {
  calculateQuarterBounds,
  generateQuarterlyTicks,
  calculateXAxisDomain,
  calculateBarWidth,
} from './chartUtils';
export type { QuarterLabel, DateBounds } from './chartUtils';

// Date formatting
export { formatMonthTick, formatDate } from './dateFormatting';

// Data transformation
export { transformLeaderboardData } from './transformLeaderboardData';

// Ranking calculations
export {
  calculateTCIRankings,
  calculateBenchmarkRankings,
  calculateRankings,
} from './rankings';

// Linear regression (re-export all)
export * from './linearRegression';
