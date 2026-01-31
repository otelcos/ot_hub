import React, { useMemo, useState, useCallback } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { LeaderboardEntry } from '../../../src/types/leaderboard';
import { getBenchmarkScore, parseReleaseDate } from '../../../src/types/leaderboard';
import { useLeaderboardData } from '../../../src/hooks/useLeaderboardData';
import { BENCHMARKS, BENCHMARK_COLORS } from '../../../src/constants/benchmarks';
import { formatMonthTick } from '../../../src/utils/dateFormatting';
import { calculateQuarterBounds, generateQuarterlyTicks, calculateXAxisDomain } from '../../../src/utils/chartUtils';
import BenchmarkCheckboxPanel from './BenchmarkCheckboxPanel';
import DateRangeSlider from './DateRangeSlider';

interface FrontierPoint {
  releaseDate: number;
  model: string;
  provider: string;
  [key: string]: number | string | undefined; // Dynamic benchmark scores
}

/**
 * Compute unified timeline data with frontier values for all benchmarks.
 * This creates a single data array where each point has the running max for each benchmark.
 * Only processes entries with valid release dates.
 */
function computeUnifiedFrontierData(
  data: LeaderboardEntry[],
  benchmarkKeys: string[],
  endDate: number
): FrontierPoint[] {
  // Collect all events (model releases with their scores)
  // Filter to only entries with valid release dates
  const events: Array<{
    releaseDate: number;
    model: string;
    provider: string;
    scores: Record<string, number>;
  }> = [];

  for (const entry of data) {
    const releaseDate = parseReleaseDate(entry);
    if (releaseDate === undefined) {
      continue; // Skip entries without valid release dates
    }

    const scores: Record<string, number> = {};

    for (const key of benchmarkKeys) {
      const score = getBenchmarkScore(entry, key);
      if (score !== undefined) {
        scores[key] = score;
      }
    }

    if (Object.keys(scores).length > 0) {
      events.push({
        releaseDate,
        model: entry.model,
        provider: entry.provider,
        scores,
      });
    }
  }

  // Sort by release date
  events.sort((a, b) => a.releaseDate - b.releaseDate);

  if (events.length === 0) return [];

  // Track running maximums for each benchmark
  const runningMax: Record<string, number> = {};
  for (const key of benchmarkKeys) {
    runningMax[key] = 0;
  }

  // Build frontier data points
  const frontierData: FrontierPoint[] = [];

  for (const event of events) {
    let hasNewMax = false;

    // Check if this event sets a new max for any benchmark
    for (const [key, score] of Object.entries(event.scores)) {
      if (score > (runningMax[key] || 0)) {
        hasNewMax = true;
        runningMax[key] = score;
      }
    }

    // Only add point if there's a new frontier
    if (hasNewMax) {
      const point: FrontierPoint = {
        releaseDate: event.releaseDate,
        model: event.model,
        provider: event.provider,
      };

      // Add current running max for each benchmark
      for (const key of benchmarkKeys) {
        if (runningMax[key] > 0) {
          point[key] = runningMax[key];
        }
      }

      frontierData.push(point);
    }
  }

  // Add final point at end date to extend lines
  if (frontierData.length > 0) {
    const lastPoint = frontierData[frontierData.length - 1];
    if (lastPoint.releaseDate < endDate) {
      const endPoint: FrontierPoint = {
        releaseDate: endDate,
        model: '',
        provider: '',
      };
      for (const key of benchmarkKeys) {
        if (runningMax[key] > 0) {
          endPoint[key] = runningMax[key];
        }
      }
      frontierData.push(endPoint);
    }
  }

  return frontierData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const date = label ? new Date(label) : null;
  const dateStr = date
    ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="frontier-tooltip">
      <div className="frontier-tooltip__date">{dateStr}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="frontier-tooltip__row">
          <span
            className="frontier-tooltip__color"
            style={{ backgroundColor: entry.color }}
          />
          <span className="frontier-tooltip__name">{entry.name}</span>
          <span className="frontier-tooltip__value">
            {entry.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BenchmarksFrontierChart(): JSX.Element {
  const { data: leaderboardData, loading, error } = useLeaderboardData();

  // Get available benchmark keys (not comingSoon)
  const availableBenchmarkKeys = useMemo(() => {
    return BENCHMARKS.filter((b) => !b.comingSoon).map((b) => b.key);
  }, []);

  // Selection state
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<Set<string>>(
    () => new Set(availableBenchmarkKeys)
  );
  const [dateRange, setDateRange] = useState<[number, number] | null>(null);

  // Toggle individual benchmark
  const toggleBenchmark = useCallback((key: string) => {
    setSelectedBenchmarks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Select all/none
  const selectAllBenchmarks = useCallback(() => {
    setSelectedBenchmarks(new Set(availableBenchmarkKeys));
  }, [availableBenchmarkKeys]);

  const selectNoneBenchmarks = useCallback(() => {
    setSelectedBenchmarks(new Set());
  }, []);

  // Filter to entries with valid release dates for all date-based calculations
  const entriesWithDates = useMemo(() => {
    return leaderboardData.filter((entry) => parseReleaseDate(entry) !== undefined);
  }, [leaderboardData]);

  // Calculate date bounds for slider (snapped to quarters)
  const dateBounds = useMemo(() => {
    const dates = entriesWithDates.map((d) => parseReleaseDate(d) as number);
    return calculateQuarterBounds(dates);
  }, [entriesWithDates]);

  // Filter data by date range (only entries with valid release dates)
  const filteredData = useMemo(() => {
    if (!dateRange) return entriesWithDates;
    const [minSelected, maxSelected] = dateRange;
    return entriesWithDates.filter((entry) => {
      const releaseDate = parseReleaseDate(entry) as number;
      return releaseDate >= minSelected && releaseDate <= maxSelected;
    });
  }, [entriesWithDates, dateRange]);

  // Compute unified frontier data
  const frontierData = useMemo(() => {
    const endDate = dateRange ? dateRange[1] : dateBounds.max;
    return computeUnifiedFrontierData(
      filteredData,
      availableBenchmarkKeys,
      endDate
    );
  }, [filteredData, availableBenchmarkKeys, dateRange, dateBounds.max]);

  // X-axis domain (uses entries with valid dates only)
  const xAxisDomain = useMemo(() => {
    const dates = entriesWithDates.map((d) => parseReleaseDate(d) as number);
    return calculateXAxisDomain(dates);
  }, [entriesWithDates]);

  // Generate quarterly tick values for X-axis
  const quarterlyTicks = useMemo(() => {
    const dates = entriesWithDates.map((d) => parseReleaseDate(d) as number);
    return generateQuarterlyTicks(dates);
  }, [entriesWithDates]);

  // Get benchmark info for selected benchmarks
  const selectedBenchmarkInfo = useMemo(() => {
    return BENCHMARKS.filter(
      (b) => !b.comingSoon && selectedBenchmarks.has(b.key)
    ).map((b) => ({
      key: b.key,
      title: b.title,
      color: BENCHMARK_COLORS[b.key] || '#6B7280',
    }));
  }, [selectedBenchmarks]);

  if (loading) {
    return <div className="tci-loading">Loading benchmark data...</div>;
  }

  if (error) {
    return <div className="tci-error">Error loading data: {error}</div>;
  }

  return (
    <div className="frontier-chart-container">
      <div className="frontier-chart-main">
        <div className="frontier-chart-wrapper">
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart
              data={frontierData}
              margin={{ top: 40, right: 20, bottom: 35, left: 5 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#b8b4ac"
                strokeOpacity={0.5}
                vertical={false}
                horizontal={true}
              />
              <XAxis
                type="number"
                dataKey="releaseDate"
                domain={xAxisDomain}
                ticks={quarterlyTicks}
                tickFormatter={formatMonthTick}
                tick={{ fontSize: 13, fill: '#5c5552', fontFamily: "'Inter', sans-serif", dy: 10 }}
                axisLine={{ stroke: '#d4d0c8' }}
                tickLine={false}
                scale="time"
                name="Release Date"
                interval="preserveStartEnd"
              />
              <YAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fontSize: 13, fill: '#5c5552', fontFamily: "'Inter', sans-serif" }}
                axisLine={{ stroke: '#d4d0c8' }}
                tickLine={false}
                name="Accuracy"
                label={{
                  value: 'Accuracy (%)',
                  angle: 0,
                  position: 'top',
                  offset: 20,
                  dx: 30,
                  style: { fontSize: '14px', fontWeight: 500, fill: '#5c5552', fontFamily: "'Inter', sans-serif" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Render a line for each selected benchmark */}
              {selectedBenchmarkInfo.map((benchmark) => (
                <Line
                  key={benchmark.key}
                  dataKey={benchmark.key}
                  name={benchmark.title}
                  type="stepAfter"
                  stroke={benchmark.color}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Date Range Slider */}
          <DateRangeSlider
            minDate={dateBounds.min}
            maxDate={dateBounds.max}
            value={dateRange ?? [dateBounds.min, dateBounds.max]}
            onChange={setDateRange}
            quarterLabels={dateBounds.quarters}
          />
        </div>
      </div>

      {/* Benchmark selection panel */}
      <BenchmarkCheckboxPanel
        selectedBenchmarks={selectedBenchmarks}
        onToggle={toggleBenchmark}
        onSelectAll={selectAllBenchmarks}
        onSelectNone={selectNoneBenchmarks}
      />
    </div>
  );
}
