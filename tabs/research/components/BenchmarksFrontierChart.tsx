import React, { useMemo, useState, useCallback, lazy, Suspense } from 'react';
import type { Data, Layout, Config } from 'plotly.js';
import type { LeaderboardEntry } from '../../../src/types/leaderboard';
import { getBenchmarkScore, parseReleaseDate } from '../../../src/types/leaderboard';
import { useLeaderboardData } from '../../../src/hooks/useLeaderboardData';
import { BENCHMARKS, BENCHMARK_COLORS } from '../../../src/constants/benchmarks';
import BrowserOnly from '@docusaurus/BrowserOnly';
import BenchmarkLegend from './BenchmarkLegend';

// Lazy load Plotly to avoid SSR issues
const Plot = lazy(() => import('react-plotly.js'));

// Epoch-inspired styling (matching TCI implementation)
const GRID_COLOR = '#EBF5F4';
const FRAME_COLOR = '#CCD8D9';
const TICK_LABEL_COLOR = '#5C737B';

interface FrontierPoint {
  releaseDate: number;
  model: string;
  provider: string;
  [key: string]: number | string | undefined;
}

/**
 * Compute unified timeline data with frontier values for all benchmarks.
 * Creates a single data array where each point has the running max for each benchmark.
 * Only processes entries with valid release dates.
 */
function computeUnifiedFrontierData(
  data: LeaderboardEntry[],
  benchmarkKeys: string[],
  endDate: number
): FrontierPoint[] {
  const events: Array<{
    releaseDate: number;
    model: string;
    provider: string;
    scores: Record<string, number>;
  }> = [];

  for (const entry of data) {
    const releaseDate = parseReleaseDate(entry);
    if (releaseDate === undefined) {
      continue;
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

  events.sort((a, b) => a.releaseDate - b.releaseDate);

  if (events.length === 0) return [];

  const runningMax: Record<string, number> = {};
  for (const key of benchmarkKeys) {
    runningMax[key] = 0;
  }

  const frontierData: FrontierPoint[] = [];

  for (const event of events) {
    let hasNewMax = false;

    for (const [key, score] of Object.entries(event.scores)) {
      if (score > (runningMax[key] || 0)) {
        hasNewMax = true;
        runningMax[key] = score;
      }
    }

    if (hasNewMax) {
      const point: FrontierPoint = {
        releaseDate: event.releaseDate,
        model: event.model,
        provider: event.provider,
      };

      for (const key of benchmarkKeys) {
        if (runningMax[key] > 0) {
          point[key] = runningMax[key];
        }
      }

      frontierData.push(point);
    }
  }

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

export default function BenchmarksFrontierChart(): JSX.Element {
  const { data: leaderboardData, loading, error } = useLeaderboardData();

  // Get available benchmark keys (not comingSoon)
  const availableBenchmarkKeys = useMemo(() => {
    return BENCHMARKS.filter((b) => !b.comingSoon).map((b) => b.key);
  }, []);

  // Selection state for benchmark legend
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<Set<string>>(
    () => new Set(availableBenchmarkKeys)
  );

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

  // Filter to entries with valid release dates for all date-based calculations
  const entriesWithDates = useMemo(() => {
    return leaderboardData.filter((entry) => parseReleaseDate(entry) !== undefined);
  }, [leaderboardData]);

  // Calculate date bounds
  const dateBounds = useMemo(() => {
    const dates = entriesWithDates.map((d) => parseReleaseDate(d) as number);
    if (dates.length === 0) return { min: Date.now(), max: Date.now() };
    return {
      min: Math.min(...dates),
      max: Math.max(...dates),
    };
  }, [entriesWithDates]);

  // Compute unified frontier data
  const frontierData = useMemo(() => {
    return computeUnifiedFrontierData(
      entriesWithDates,
      availableBenchmarkKeys,
      dateBounds.max
    );
  }, [entriesWithDates, availableBenchmarkKeys, dateBounds.max]);

  // Get benchmark info for legend
  const benchmarkInfo = useMemo(() => {
    return BENCHMARKS.filter((b) => !b.comingSoon).map((b) => ({
      key: b.key,
      title: b.title,
      color: BENCHMARK_COLORS[b.key] || '#6B7280',
    }));
  }, []);

  // Get selected benchmark info (for rendering lines)
  const selectedBenchmarkInfo = useMemo(() => {
    return benchmarkInfo.filter((b) => selectedBenchmarks.has(b.key));
  }, [benchmarkInfo, selectedBenchmarks]);

  // Build Plotly traces - one line per selected benchmark with step shape
  const traces = useMemo((): Data[] => {
    return selectedBenchmarkInfo.map((benchmark) => {
      // Filter points that have data for this benchmark
      const pointsWithData = frontierData.filter(
        (p) => p[benchmark.key] !== undefined
      );

      return {
        x: pointsWithData.map((p) => new Date(p.releaseDate)),
        y: pointsWithData.map((p) => p[benchmark.key] as number),
        mode: 'lines',
        name: benchmark.title,
        line: {
          color: benchmark.color,
          width: 2.5,
          shape: 'hv', // horizontal-then-vertical = stepAfter effect
        },
        hovertemplate:
          `<b>${benchmark.title}</b><br>` +
          'Accuracy: %{y:.1f}%<br>' +
          'Date: %{x|%b %Y}' +
          '<extra></extra>',
        type: 'scatter',
      };
    });
  }, [frontierData, selectedBenchmarkInfo]);

  // Calculate x-axis range with padding
  const xAxisRange = useMemo(() => {
    if (frontierData.length === 0) return undefined;
    const padding = (dateBounds.max - dateBounds.min) * 0.02;
    return [
      new Date(dateBounds.min - padding),
      new Date(dateBounds.max + padding),
    ];
  }, [frontierData, dateBounds]);

  // Plotly layout configuration
  const layout = useMemo((): Partial<Layout> => ({
    xaxis: {
      title: { text: 'Release Date' },
      gridcolor: GRID_COLOR,
      linecolor: FRAME_COLOR,
      tickfont: { size: 11, color: TICK_LABEL_COLOR },
      range: xAxisRange,
      rangeslider: {
        visible: true,
        thickness: 0.08,
      },
    },
    yaxis: {
      title: { text: 'Accuracy (%)' },
      gridcolor: GRID_COLOR,
      linecolor: FRAME_COLOR,
      tickfont: { size: 11, color: TICK_LABEL_COLOR },
      range: [0, 100],
      tickvals: [0, 20, 40, 60, 80, 100],
    },
    showlegend: false, // Using BenchmarkLegend component instead
    hovermode: 'closest',
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    height: 550,
    margin: { l: 60, r: 20, t: 60, b: 80 },
  }), [xAxisRange]);

  // Plotly config
  const config = useMemo((): Partial<Config> => ({
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    responsive: true,
  }), []);

  if (loading) {
    return <div className="tci-loading">Loading benchmark data...</div>;
  }

  if (error) {
    return <div className="tci-error">Error loading data: {error}</div>;
  }

  return (
    <div className="frontier-chart-container">
      {/* Benchmark Legend - horizontal pills above chart */}
      <BenchmarkLegend
        benchmarks={benchmarkInfo}
        selectedBenchmarks={selectedBenchmarks}
        onToggle={toggleBenchmark}
        dataPointCount={frontierData.length}
      />

      <BrowserOnly fallback={<div className="tci-loading">Loading chart...</div>}>
        {() => (
          <Suspense fallback={<div className="tci-loading">Loading chart...</div>}>
            <Plot
              data={traces}
              layout={layout}
              config={config}
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        )}
      </BrowserOnly>
    </div>
  );
}
