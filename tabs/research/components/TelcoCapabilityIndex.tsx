import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
} from 'recharts';
import type { TCIDataPoint } from '../../../src/types/leaderboard';
import { parseReleaseDate } from '../../../src/types/leaderboard';
import { useLeaderboardData } from '../../../src/hooks/useLeaderboardData';
import { getProviderColor } from '../../../src/constants/providers';
import { formatMonthTick } from '../../../src/utils/dateFormatting';
import ProviderIcon from '../../../src/components/ProviderIcon';
import DateRangeSlider from './DateRangeSlider';
import { fitLinearRegression, generateCombinedRegressionData } from '../../../src/utils/linearRegression';
import { calculateQuarterBounds, generateQuarterlyTicks, calculateXAxisDomain } from '../../../src/utils/chartUtils';
import { DATE_PADDING_MS } from '../../../src/constants/ui';

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

  const baseOpacity = isOrgHighlighted ? 0.85 : 0.25;
  const radius = isModelSelected ? 7 : 5;

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
          r={12}
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
        stroke={isModelSelected ? payload.color : 'rgba(255,255,255,0.7)'}
        strokeWidth={isModelSelected ? 2 : 1}
      />
      {/* Label for top 3 models */}
      {isTopModel && isOrgHighlighted && !isModelSelected && (
        <text
          x={cx}
          y={cy - 12}
          fill={payload.color}
          fontSize={13}
          fontWeight={600}
          fontFamily="'Inter', sans-serif"
          textAnchor="middle"
          {...(!hasAnimated && { className: 'tci-label' })}
        >
          {payload.model}
        </text>
      )}
      {/* Popup for selected model */}
      {isModelSelected && (
        <foreignObject x={cx + 14} y={cy - 18} width={200} height={36} style={{ overflow: 'visible' }}>
          <div className="tci-popup">
            <span className="tci-popup__model">{payload.model}</span>
            <span className="tci-popup__score">{payload.tci}</span>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default function TelcoCapabilityIndex(): JSX.Element {
  const { data: leaderboardData, loading, error } = useLeaderboardData();

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

  // Transform data for chart - only include entries with valid TCI and release date
  const chartData = useMemo((): TCIDataPoint[] => {
    return leaderboardData
      .filter((entry) => {
        if (entry.tci === null) return false;
        const releaseDate = parseReleaseDate(entry);
        return releaseDate !== undefined;
      })
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
        releaseDate: parseReleaseDate(entry) as number,
      }));
  }, [leaderboardData]);

  // Calculate date bounds for slider (snapped to quarters)
  const dateBounds = useMemo(() => {
    const dates = chartData.map((d) => d.releaseDate);
    return calculateQuarterBounds(dates);
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
    const dates = chartData.map((d) => d.releaseDate);
    return generateQuarterlyTicks(dates);
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
    const dates = chartData.map((d) => d.releaseDate);
    return calculateXAxisDomain(dates);
  }, [chartData]);

  // Linear regression line and confidence band data
  const regressionData = useMemo(() => {
    const params = fitLinearRegression(filteredChartData);
    if (!params) return [];

    // Use filtered data's date range, not full xAxisDomain
    const filteredDates = filteredChartData.map((d) => d.releaseDate);
    const filteredMin = Math.min(...filteredDates);
    const filteredMax = Math.max(...filteredDates);

    return generateCombinedRegressionData(
      filteredChartData,
      params,
      filteredMin - DATE_PADDING_MS,
      filteredMax + DATE_PADDING_MS,
      50
    );
  }, [filteredChartData]);

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
          <ComposedChart margin={{ top: 58, right: 20, bottom: 35, left: 5 }}>
            {/* Background fill for entire chart area */}
            <ReferenceArea
              x1={xAxisDomain[0]}
              x2={xAxisDomain[1]}
              y1={yAxisDomain[0]}
              y2={yAxisDomain[1]}
              fill="#faf8f5"
              fillOpacity={1}
              stroke="none"
            />
            <CartesianGrid
              stroke="#e5e5e5"
              strokeOpacity={0.8}
              vertical={true}
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
              dataKey="tci"
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tick={{ fontSize: 13, fill: '#5c5552', fontFamily: "'Inter', sans-serif" }}
              axisLine={{ stroke: '#d4d0c8' }}
              tickLine={false}
              name="Score"
              label={{
                value: 'Score',
                angle: 0,
                position: 'top',
                offset: 34,
                dx: 15,
                style: { fontSize: '14px', fontWeight: 500, fill: '#5c5552', fontFamily: "'Inter', sans-serif" },
              }}
            />
            {/* Confidence band - uncertainty in the trend line (95% CI) */}
            {regressionData.length > 0 && (
              <>
                <Area
                  data={regressionData}
                  dataKey="upper"
                  stroke="none"
                  fill="#9ca3af"
                  fillOpacity={0.2}
                  isAnimationActive={false}
                  legendType="none"
                  baseValue={yAxisDomain[0]}
                />
                <Area
                  data={regressionData}
                  dataKey="lower"
                  stroke="none"
                  fill="#faf8f5"
                  fillOpacity={1}
                  isAnimationActive={false}
                  legendType="none"
                  baseValue={yAxisDomain[0]}
                />
              </>
            )}
            {/* Linear regression line */}
            {regressionData.length > 0 && (
              <Line
                data={regressionData}
                dataKey="regressionTCI"
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeOpacity={0.9}
                dot={false}
                isAnimationActive={false}
                legendType="none"
              />
            )}
            <Scatter data={filteredChartData} shape={renderShape}>
              {filteredChartData.map((entry) => (
                <Cell key={entry.model} fill={entry.color} />
              ))}
            </Scatter>
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
