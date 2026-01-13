import React, { useMemo, useState, useCallback } from 'react';
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
import { getProviderColor } from '../../../src/constants/providers';
import { getModelReleaseDate, formatReleaseDate } from '../../../src/constants/modelReleaseDates';
import ProviderIcon from '../../../src/components/ProviderIcon';

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
}) => {
  if (!cx || !cy || !payload) return null;

  const baseOpacity = isOrgHighlighted ? 0.7 : 0.15;
  const radius = isModelSelected ? 5 : 4;

  return (
    <g
      className="tci-dot"
      style={{ animationDelay: `${index * 25}ms` }}
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
          className="tci-label"
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

  // Selection state
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());

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
        releaseDate: getModelReleaseDate(entry.model),
      }));
  }, [leaderboardData]);

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

  // Top 3 models by TCI score (for labels)
  const topModelNames = useMemo(() => {
    return new Set(
      [...chartData]
        .sort((a, b) => b.tci - a.tci)
        .slice(0, 3)
        .map((d) => d.model)
    );
  }, [chartData]);

  // Y-axis domain calculation
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [90, 150];
    const tciValues = chartData.map((d) => d.tci);
    const minTCI = Math.min(...tciValues);
    const maxTCI = Math.max(...tciValues);
    const padding = (maxTCI - minTCI) * 0.15;
    return [
      Math.floor((minTCI - padding) / 5) * 5,
      Math.ceil((maxTCI + padding) / 5) * 5,
    ];
  }, [chartData]);

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
  const hasSelection = selectedOrgs.size > 0 || selectedModels.size > 0;

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
      <h2 className="tci-title">Telco Capabilities Index (TCI)</h2>
      <p className="tci-description">
        A unified measure of AI model performance across telecommunications-specific tasks,
        using IRT-inspired methodology for meaningful cross-model comparisons.
      </p>

      <div className="tci-chart-wrapper">
        {/* Organization Legend */}
        <OrganizationLegend
          providers={providers}
          selectedOrgs={selectedOrgs}
          onToggle={toggleOrg}
          resultCount={chartData.length}
        />

        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 58, right: 170, bottom: 35, left: 5 }}>
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
              tickFormatter={formatReleaseDate}
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
            <Scatter data={chartData} shape={(props: unknown) => {
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
                />
              );
            }}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

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
