import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TCIDataPoint } from '../../../src/types/leaderboard';
import { useLeaderboardData } from '../../../src/hooks/useLeaderboardData';
import { useIsMobile } from '../../../src/hooks/useIsMobile';
import { getProviderColor } from '../../../src/constants/providers';
import { getModelReleaseDate, formatReleaseDate, formatQuarterTick } from '../../../src/constants/modelReleaseDates';
import ProviderIcon from '../../../src/components/ProviderIcon';
import DateRangeSlider from './DateRangeSlider';

// Number of top models to label on the chart
const TOP_LABELED_COUNT = 5;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TCIDataPoint }>;
}

const MinimalTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="tci-tooltip">
      <div className="tci-tooltip__model">{data.model}</div>
      <div className="tci-tooltip__org">{data.provider}</div>
      <div className="tci-tooltip__score" style={{ color: data.color }}>
        TCI: {data.tci}
      </div>
    </div>
  );
};

interface LegendItemProps {
  provider: { name: string; color: string };
  isHighlighted: boolean;
  onClick: () => void;
}

const LegendItem: React.FC<LegendItemProps> = ({ provider, isHighlighted, onClick }) => (
  <div
    className={`tci-legend__item ${!isHighlighted ? 'tci-legend__item--dimmed' : ''}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <ProviderIcon provider={provider.name} size={14} />
    <span className="tci-legend__item-name">{provider.name}</span>
  </div>
);

interface OrganizationLegendProps {
  providers: Array<{ name: string; color: string }>;
  selectedOrgs: Set<string>;
  onToggle: (org: string) => void;
  resultCount: number;
}

const OrganizationLegend: React.FC<OrganizationLegendProps> = ({
  providers,
  selectedOrgs,
  onToggle,
  resultCount,
}) => (
  <div className="tci-legend">
    <div className="tci-legend__count">{resultCount} Results</div>
    <div className="tci-legend__title">Organization</div>
    {providers.map((p) => (
      <LegendItem
        key={p.name}
        provider={p}
        isHighlighted={selectedOrgs.size === 0 || selectedOrgs.has(p.name)}
        onClick={() => onToggle(p.name)}
      />
    ))}
  </div>
);

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: TCIDataPoint;
  index?: number;
  isOrgHighlighted: boolean;
  isModelSelected: boolean;
  isTopModel: boolean;
  onClick: () => void;
  hasAnimated: boolean;
}

const CustomDot: React.FC<CustomDotProps> = ({
  cx,
  cy,
  payload,
  index = 0,
  isOrgHighlighted,
  isModelSelected,
  isTopModel,
  onClick,
  hasAnimated,
}) => {
  if (!cx || !cy || !payload) return null;

  const baseOpacity = isOrgHighlighted ? 0.7 : 0.15;
  const radius = isModelSelected ? 5 : 4;

  return (
    <g
      {...(!hasAnimated && { className: 'tci-dot', style: { animationDelay: `${(index ?? 0) * 25}ms` } })}
      onClick={onClick}
      cursor="pointer"
    >
      {/* Glow effect for selected models */}
      {isModelSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={9}
          fill={payload.color}
          fillOpacity={0.25}
          className="tci-dot__glow"
        />
      )}
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={payload.color}
        fillOpacity={baseOpacity}
        stroke={isModelSelected ? payload.color : 'rgba(255,255,255,0.5)'}
        strokeWidth={isModelSelected ? 1.5 : 0.5}
      />
      {/* Label for top 3 models */}
      {isTopModel && isOrgHighlighted && (
        <text
          x={cx}
          y={cy - 12}
          fill={payload.color}
          fontSize={12}
          fontWeight={500}
          fontFamily="'Source Sans 3', sans-serif"
          textAnchor="middle"
          {...(!hasAnimated && { className: 'tci-label' })}
        >
          {payload.model}
        </text>
      )}
    </g>
  );
};

interface TopLabelProps {
  data: TCIDataPoint[];
  xScale: (value: number) => number;
  yScale: (value: number) => number;
}

const TopLabels: React.FC<TopLabelProps> = ({ data, xScale, yScale }) => {
  // Get top 5 models by TCI score
  const topModels = useMemo(() => {
    return [...data]
      .sort((a, b) => b.tci - a.tci)
      .slice(0, TOP_LABELED_COUNT);
  }, [data]);

  return (
    <g className="tci-labels">
      {topModels.map((model, idx) => {
        const x = xScale(model.releaseDate);
        const y = yScale(model.tci);

        // Offset labels to avoid overlap
        const yOffset = -14 - (idx % 2) * 10;

        return (
          <text
            key={model.model}
            x={x}
            y={y + yOffset}
            fill={model.color}
            fontSize={10}
            fontWeight={500}
            fontFamily="'Source Sans 3', sans-serif"
            textAnchor="middle"
            className="tci-label"
            style={{ animationDelay: `${(idx + data.length) * 25}ms` }}
          >
            {model.model}
          </text>
        );
      })}
    </g>
  );
};

export default function TelcoCapabilityIndex(): JSX.Element {
  const { data: leaderboardData, loading, error } = useLeaderboardData();
  const isMobile = useIsMobile();

  // Selection state
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<[number, number] | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Toggle organization highlight
  const toggleOrg = useCallback((org: string) => {
    setSelectedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(org)) {
        next.delete(org);
      } else {
        next.add(org);
      }
      return next;
    });
  }, []);

  // Toggle model selection
  const toggleModel = useCallback((model: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(model)) {
        next.delete(model);
      } else {
        next.add(model);
      }
      return next;
    });
  }, []);

  // Reset all selections
  const resetSelection = useCallback(() => {
    setSelectedOrgs(new Set());
    setSelectedModels(new Set());
    setDateRange(null);
  }, []);

  // Disable animation class after initial load to prevent replay on interactions
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1000); // Wait for all staggered animations to complete
    return () => clearTimeout(timer);
  }, []);

  // Transform data for chart
  const chartData = useMemo((): TCIDataPoint[] => {
    return leaderboardData
      .filter((entry) => entry.tci !== null)
      .map((entry) => ({
        rank: entry.rank,
        tci: entry.tci as number,
        model: entry.model,
        provider: entry.provider,
        color: getProviderColor(entry.provider),
        isLabeled: false, // Will determine dynamically
        teleqna: entry.teleqna,
        telelogs: entry.telelogs,
        telemath: entry.telemath,
        tsg: entry.tsg,
        teletables: entry.teletables,
        releaseDate: getModelReleaseDate(entry.model),
      }));
  }, [leaderboardData]);

  // Calculate date bounds for slider (snapped to quarters)
  const dateBounds = useMemo(() => {
    if (chartData.length === 0) {
      return {
        min: new Date('2023-01-01').getTime(),
        max: new Date('2026-01-01').getTime(),
        quarters: [] as { timestamp: number; label: string }[],
      };
    }

    const dates = chartData.map((d) => d.releaseDate);
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
    const quarters: { timestamp: number; label: string }[] = [];
    let current = new Date(minQuarterStart);

    while (current.getTime() <= maxQuarterEnd) {
      const quarter = Math.floor(current.getMonth() / 3) + 1;
      quarters.push({
        timestamp: current.getTime(),
        label: `Q${quarter} ${current.getFullYear()}`,
      });
      current.setMonth(current.getMonth() + 3);
    }

    return {
      min: minQuarterStart,
      max: maxQuarterEnd,
      quarters,
    };
  }, [chartData]);

  // Filter chart data by date range
  const filteredChartData = useMemo(() => {
    if (!dateRange) return chartData;
    const [minSelected, maxSelected] = dateRange;
    return chartData.filter(
      (d) => d.releaseDate >= minSelected && d.releaseDate <= maxSelected
    );
  }, [chartData, dateRange]);

  // Generate quarterly tick values for X-axis
  const quarterlyTicks = useMemo(() => {
    if (chartData.length === 0) return [];

    const dates = chartData.map((d) => d.releaseDate);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);

    // Add padding (60 days) to bounds
    const padding = 60 * 24 * 60 * 60 * 1000;
    const startBound = minDate - padding;
    const endBound = maxDate + padding;

    // Get year range
    const startYear = new Date(startBound).getFullYear();
    const endYear = new Date(endBound).getFullYear();

    const ticks: number[] = [];
    const quarterMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct

    for (let year = startYear; year <= endYear + 1; year++) {
      for (const month of quarterMonths) {
        const tickDate = new Date(year, month, 1).getTime();
        if (tickDate >= startBound && tickDate <= endBound) {
          ticks.push(tickDate);
        }
      }
    }

    return ticks;
  }, [chartData]);

  // Extract unique providers
  const providers = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string; color: string }[] = [];
    leaderboardData.forEach((entry) => {
      if (!seen.has(entry.provider)) {
        seen.add(entry.provider);
        result.push({
          name: entry.provider,
          color: getProviderColor(entry.provider),
        });
      }
    });
    return result;
  }, [leaderboardData]);

  // Top 3 models by TCI score (for labels) - uses filtered data
  const topModelNames = useMemo(() => {
    return new Set(
      [...filteredChartData]
        .sort((a, b) => b.tci - a.tci)
        .slice(0, 3)
        .map((d) => d.model)
    );
  }, [filteredChartData]);

  // Y-axis domain calculation - uses filtered data
  const yAxisDomain = useMemo(() => {
    if (filteredChartData.length === 0) return [90, 150];
    const tciValues = filteredChartData.map((d) => d.tci);
    const minTCI = Math.min(...tciValues);
    const maxTCI = Math.max(...tciValues);
    const padding = (maxTCI - minTCI) * 0.15;
    return [
      Math.floor((minTCI - padding) / 5) * 5,
      Math.ceil((maxTCI + padding) / 5) * 5,
    ];
  }, [filteredChartData]);

  // Y-axis ticks
  const yAxisTicks = useMemo(() => {
    const [min, max] = yAxisDomain;
    const ticks: number[] = [];
    for (let i = min; i <= max; i += 10) {
      ticks.push(i);
    }
    return ticks;
  }, [yAxisDomain]);

  // X-axis (date) domain
  const xAxisDomain = useMemo(() => {
    if (chartData.length === 0) {
      return [new Date('2023-01-01').getTime(), new Date('2026-01-01').getTime()];
    }
    const dates = chartData.map((d) => d.releaseDate);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    // Add padding (2 months on each side)
    const padding = 60 * 24 * 60 * 60 * 1000; // 60 days in ms
    return [minDate - padding, maxDate + padding];
  }, [chartData]);

  // Check if any selection is active
  const hasSelection = selectedOrgs.size > 0 || selectedModels.size > 0 || dateRange !== null;

  // Memoized shape renderer to prevent animation replay on re-renders
  const renderShape = useCallback(
    (props: unknown) => {
      const typedProps = props as { cx?: number; cy?: number; payload?: TCIDataPoint; index?: number };
      const { payload } = typedProps;
      if (!payload) return null;

      const isOrgHighlighted =
        selectedOrgs.size === 0 || selectedOrgs.has(payload.provider);
      const isModelSelected = selectedModels.has(payload.model);
      const isTopModel = topModelNames.has(payload.model);

      return (
        <CustomDot
          {...typedProps}
          isOrgHighlighted={isOrgHighlighted}
          isModelSelected={isModelSelected}
          isTopModel={isTopModel}
          onClick={() => toggleModel(payload.model)}
          hasAnimated={hasAnimated}
        />
      );
    },
    [selectedOrgs, selectedModels, topModelNames, toggleModel, hasAnimated]
  );

  if (loading) {
    return (
      <div className="tci-loading">
        Loading leaderboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="tci-error">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="tci-chart-container">
      {/* Organization Legend - horizontal pills above chart */}
      <OrganizationLegend
        providers={providers}
        selectedOrgs={selectedOrgs}
        onToggle={toggleOrg}
        resultCount={filteredChartData.length}
      />

      <div className="tci-chart-wrapper">
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 58, right: 20, bottom: 35, left: 5 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#b8b4ac"
              strokeOpacity={0.7}
              vertical={false}
              horizontal={true}
            />
            <XAxis
              type="number"
              dataKey="releaseDate"
              domain={xAxisDomain}
              ticks={quarterlyTicks}
              tickFormatter={formatQuarterTick}
              tick={{ fontSize: 11, fill: '#5c5552', fontFamily: "'Source Sans 3', sans-serif" }}
              axisLine={{ stroke: '#d4d0c8' }}
              tickLine={false}
              scale="time"
              name="Release Date"
            />
            <YAxis
              type="number"
              dataKey="tci"
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tick={{ fontSize: 11, fill: '#5c5552', fontFamily: "'Source Sans 3', sans-serif" }}
              axisLine={{ stroke: '#d4d0c8' }}
              tickLine={false}
              name="Score"
              label={{
                value: 'Score',
                angle: 0,
                position: 'top',
                offset: 34,
                dx: 15,
                style: { fontSize: '12px', fill: '#5c5552', fontFamily: "'Source Sans 3', sans-serif" },
              }}
            />
            <Tooltip content={<MinimalTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#a61d2d' }} />
            <Scatter data={filteredChartData} shape={renderShape}>
              {filteredChartData.map((entry) => (
                <Cell key={entry.model} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Date Range Slider */}
        <DateRangeSlider
          minDate={dateBounds.min}
          maxDate={dateBounds.max}
          value={dateRange ?? [dateBounds.min, dateBounds.max]}
          onChange={setDateRange}
          quarterLabels={dateBounds.quarters}
        />

        {/* Reset button - only visible when selection active */}
        {hasSelection && (
          <button className="tci-reset" onClick={resetSelection}>
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
}
