import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import type { TCIDataPoint } from '../../../src/types/leaderboard';
import { parseReleaseDate } from '../../../src/types/leaderboard';
import { useLeaderboardData } from '../../../src/hooks/useLeaderboardData';
import { getProviderColor } from '../../../src/constants/providers';
import { fitLinearRegression, generateForecastData } from '../../../src/utils/linearRegression';
import { FORECAST_MONTHS } from '../../../src/constants/ui';
import OrganizationLegend from './OrganizationLegend';
import TCIScatterPlot from './TCIScatterPlot';

export default function TelcoCapabilityIndex(): JSX.Element {
  const { data: leaderboardData, loading, error } = useLeaderboardData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800); // Default width

  // Selection state for organization filter
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());

  // Responsive width with RAF to ensure DOM is ready
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(Math.max(400, width));
      }
    };

    // Use RAF to ensure DOM is painted before measuring
    requestAnimationFrame(() => {
      updateWidth();
      // Force Plotly to recalculate by dispatching resize event
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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
        isLabeled: false,
        teleqna: entry.teleqna,
        telelogs: entry.telelogs,
        telemath: entry.telemath,
        tsg: entry.tsg,
        teletables: entry.teletables,
        releaseDate: parseReleaseDate(entry) as number,
        totalCost: entry.total_cost,
        costEfficiency: entry.cost_efficiency,
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

  // Forecast data with historical trend and future projection
  const { forecastData, stats } = useMemo(() => {
    const params = fitLinearRegression(chartData);
    if (!params) return { forecastData: [], stats: null };
    return generateForecastData(chartData, params, FORECAST_MONTHS);
  }, [chartData]);

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
    <div className="tci-chart-container" ref={containerRef}>
      {/* Organization Legend - horizontal pills above chart */}
      <OrganizationLegend
        providers={providers}
        selectedOrgs={selectedOrgs}
        onToggle={toggleOrg}
        resultCount={chartData.length}
      />

      <div className="tci-chart-wrapper">
        {/* Plotly Scatter Plot with built-in range slider */}
        <TCIScatterPlot
          data={chartData}
          forecastData={forecastData}
          stats={stats}
          width={containerWidth}
          height={500}
          selectedOrgs={selectedOrgs}
        />
      </div>
    </div>
  );
}
