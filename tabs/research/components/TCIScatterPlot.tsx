import React, { useMemo, lazy, Suspense } from 'react';
import type { Data, Layout, Config, Annotations } from 'plotly.js';
import type { TCIDataPoint } from '../../../src/types/leaderboard';
import type { ForecastBandPoint, RegressionStats } from '../../../src/utils/linearRegression';
import { getProviderColor } from '../../../src/constants/providers';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Lazy load Plotly to avoid SSR issues
const Plot = lazy(() => import('react-plotly.js'));

interface TCIScatterPlotProps {
  data: TCIDataPoint[];
  forecastData: ForecastBandPoint[];
  stats: RegressionStats | null;
  width: number;
  height: number;
  selectedOrgs: Set<string>;
}

// Epoch-inspired styling (matching Python implementation)
const TCI_PRIMARY = '#0099B1';
const TCI_SECONDARY = '#2E5AA8';
const TEXT_COLOR = '#2B424B';
const GRID_COLOR = '#EBF5F4';
const FRAME_COLOR = '#CCD8D9';
const TICK_LABEL_COLOR = '#5C737B';

export default function TCIScatterPlot({
  data,
  forecastData,
  stats,
  width,
  height,
  selectedOrgs,
}: TCIScatterPlotProps): JSX.Element {
  // Split forecast data into historical and projection
  const historicalData = useMemo(
    () => forecastData.filter((d) => !d.isForecast),
    [forecastData]
  );
  const projectionData = useMemo(
    () => forecastData.filter((d) => d.isForecast),
    [forecastData]
  );

  // Group data by provider
  const providerGroups = useMemo(() => {
    const groups = new Map<string, TCIDataPoint[]>();
    for (const point of data) {
      const existing = groups.get(point.provider) || [];
      existing.push(point);
      groups.set(point.provider, existing);
    }
    return groups;
  }, [data]);

  // Build Plotly traces
  const traces = useMemo((): Data[] => {
    const result: Data[] = [];

    // 1. Historical confidence band (filled area)
    if (historicalData.length > 0) {
      const dates = historicalData.map((d) => new Date(d.releaseDate));
      const upper = historicalData.map((d) => d.upper);
      const lower = historicalData.map((d) => d.lower);

      result.push({
        x: [...dates, ...dates.slice().reverse()],
        y: [...upper, ...lower.slice().reverse()],
        fill: 'toself',
        fillcolor: 'rgba(0, 153, 177, 0.1)',
        line: { color: 'rgba(0,0,0,0)' },
        hoverinfo: 'skip',
        showlegend: false,
        name: 'Historical 95% CI',
        type: 'scatter',
      });
    }

    // 2. Forecast confidence band (filled area)
    if (projectionData.length > 0) {
      const dates = projectionData.map((d) => new Date(d.releaseDate));
      const upper = projectionData.map((d) => d.upper);
      const lower = projectionData.map((d) => d.lower);

      result.push({
        x: [...dates, ...dates.slice().reverse()],
        y: [...upper, ...lower.slice().reverse()],
        fill: 'toself',
        fillcolor: 'rgba(46, 90, 168, 0.12)',
        line: { color: 'rgba(0,0,0,0)' },
        hoverinfo: 'skip',
        showlegend: false,
        name: 'Forecast 95% CI',
        type: 'scatter',
      });
    }

    // 3. Historical trend line (solid)
    if (historicalData.length > 0) {
      result.push({
        x: historicalData.map((d) => new Date(d.releaseDate)),
        y: historicalData.map((d) => d.regressionTCI),
        mode: 'lines',
        name: stats ? `Trend (R²=${stats.rSquared.toFixed(2)})` : 'Trend',
        line: { color: TCI_PRIMARY, width: 2, dash: 'dash' },
        hovertemplate: 'Trend: %{y:.1f}<extra></extra>',
        type: 'scatter',
      });
    }

    // 4. Forecast projection line (dashed)
    if (projectionData.length > 0) {
      result.push({
        x: projectionData.map((d) => new Date(d.releaseDate)),
        y: projectionData.map((d) => d.regressionTCI),
        mode: 'lines',
        name: '12-Month Projection',
        line: { color: TCI_SECONDARY, width: 2, dash: 'dash' },
        hovertemplate: 'Projected: %{y:.1f}<extra></extra>',
        type: 'scatter',
      });
    }

    // 5. Scatter points grouped by provider
    const sortedProviders = Array.from(providerGroups.keys()).sort();
    for (const provider of sortedProviders) {
      const points = providerGroups.get(provider)!;
      const color = getProviderColor(provider);

      // Determine visibility based on selectedOrgs
      const isVisible = selectedOrgs.size === 0 || selectedOrgs.has(provider);

      result.push({
        x: points.map((p) => new Date(p.releaseDate)),
        y: points.map((p) => p.tci),
        error_y: {
          type: 'data',
          array: points.map((p) => p.teleqna?.[1] || 0), // Use error from data
          visible: true,
          color: color,
        },
        mode: 'markers',
        name: provider,
        marker: {
          size: 10,
          color: color,
          line: { color: 'white', width: 1 },
          opacity: isVisible ? 0.85 : 0.25,
        },
        text: points.map((p) => p.model),
        customdata: points.map((p) => ({
          cost: p.totalCost,
        })),
        hovertemplate:
          '<b>%{text}</b><br>' +
          `Provider: ${provider}<br>` +
          'TCI: %{y:.1f}<br>' +
          'Date: %{x|%b %d, %Y}' +
          '<extra></extra>',
        type: 'scatter',
        visible: isVisible ? true : 'legendonly',
      });
    }

    return result;
  }, [data, historicalData, projectionData, providerGroups, stats, selectedOrgs]);

  // Build annotations for current and projected values
  const annotations = useMemo(() => {
    if (!stats) return [];

    const result: Partial<Annotations>[] = [];

    // Current and Projected TCI - top right
    let tciText = `Current TCI: ${stats.currentTCI.toFixed(1)}`;
    if (projectionData.length > 0) {
      tciText += `<br>Projected TCI: ${stats.projectedTCI.toFixed(1)}`;
    }

    result.push({
      x: 0.98,
      y: 0.98,
      xref: 'paper',
      yref: 'paper',
      text: tciText,
      showarrow: false,
      font: { family: 'monospace', size: 11, color: TEXT_COLOR },
      align: 'right',
      bgcolor: 'rgba(255,255,255,0.8)',
      borderpad: 4,
    });

    // Stats annotation (R² and growth rate) - top left
    result.push({
      x: 0.02,
      y: 0.98,
      xref: 'paper',
      yref: 'paper',
      text: `R² = ${stats.rSquared.toFixed(3)}<br>Growth: ${stats.growthPerYear > 0 ? '+' : ''}${stats.growthPerYear.toFixed(1)} TCI/year`,
      showarrow: false,
      font: { family: 'monospace', size: 11, color: TEXT_COLOR },
      align: 'left',
      bgcolor: 'rgba(255,255,255,0.8)',
      borderpad: 4,
    });

    return result;
  }, [stats, projectionData]);

  // Calculate x-axis ranges
  const { initialRange, fullRange } = useMemo(() => {
    if (data.length === 0) return { initialRange: undefined, fullRange: undefined };
    const dates = data.map((d) => d.releaseDate);
    const minDate = Math.min(...dates);
    const maxDataDate = Math.max(...dates);
    const maxProjectionDate = projectionData.length > 0
      ? Math.max(...projectionData.map((d) => d.releaseDate))
      : maxDataDate;

    // Small padding
    const padding = (maxDataDate - minDate) * 0.02;

    return {
      // Initial view: start to last model (no projection visible)
      initialRange: [new Date(minDate), new Date(maxDataDate + padding)],
      // Full range for slider: includes projection
      fullRange: [new Date(minDate), new Date(maxProjectionDate + padding)],
    };
  }, [data, projectionData]);

  // Plotly layout configuration
  const layout = useMemo((): Partial<Layout> => ({
    xaxis: {
      title: { text: 'Release Date' },
      gridcolor: GRID_COLOR,
      linecolor: FRAME_COLOR,
      tickfont: { size: 11, color: TICK_LABEL_COLOR },
      autorange: false,
      range: initialRange, // Initial view ends at last model
      rangeslider: {
        visible: true,
        thickness: 0.08,
        range: fullRange, // Full range includes projection (hard bounds)
        autorange: false,
      },
    },
    yaxis: {
      title: { text: 'TCI Score' },
      gridcolor: GRID_COLOR,
      linecolor: FRAME_COLOR,
      tickfont: { size: 11, color: TICK_LABEL_COLOR },
    },
    showlegend: false, // Using OrganizationLegend component instead
    hovermode: 'closest',
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    width: width,
    height: height,
    margin: { l: 60, r: 40, t: 40, b: 80 },
    annotations: annotations as Annotations[],
  }), [width, height, annotations, initialRange, fullRange]);

  // Plotly config
  const config = useMemo((): Partial<Config> => ({
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    responsive: true,
  }), []);

  return (
    <div className="tci-scatter-container">
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
