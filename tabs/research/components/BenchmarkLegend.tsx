import React from 'react';

interface BenchmarkInfo {
  key: string;
  title: string;
  color: string;
}

interface BenchmarkLegendProps {
  benchmarks: BenchmarkInfo[];
  selectedBenchmarks: Set<string>;
  onToggle: (key: string) => void;
  dataPointCount: number;
}

export default function BenchmarkLegend({
  benchmarks,
  selectedBenchmarks,
  onToggle,
  dataPointCount,
}: BenchmarkLegendProps): JSX.Element {
  return (
    <div className="frontier-legend">
      <span className="frontier-legend__count">
        {dataPointCount} frontier updates
      </span>
      <span className="frontier-legend__title">Benchmarks:</span>
      {benchmarks.map((benchmark) => {
        const isSelected = selectedBenchmarks.has(benchmark.key);
        return (
          <button
            key={benchmark.key}
            className={`frontier-legend__item ${!isSelected ? 'frontier-legend__item--dimmed' : ''}`}
            onClick={() => onToggle(benchmark.key)}
            type="button"
          >
            <span
              className="frontier-legend__indicator"
              style={{ backgroundColor: benchmark.color }}
            />
            <span className="frontier-legend__name">{benchmark.title}</span>
          </button>
        );
      })}
    </div>
  );
}
