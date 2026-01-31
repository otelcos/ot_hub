/**
 * Date formatting utilities for charts and display.
 * Release dates are sourced from leaderboard.json (single source of truth).
 */

/**
 * Format timestamp as quarter label for X-axis ticks (e.g., "Q1-24")
 */
export function formatMonthTick(timestamp: number): string {
  const date = new Date(timestamp);
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const year = date.getFullYear().toString().slice(-2);
  return `Q${quarter}-${year}`;
}

/**
 * Format a date string to uppercase locale format (e.g., "JAN 8, 2026")
 * Used in blog cards and other display components.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
}

