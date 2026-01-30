import React from 'react';
import { BENCHMARKS, BENCHMARK_COLORS } from '../../../src/constants/benchmarks';

interface BenchmarkCheckboxPanelProps {
  selectedBenchmarks: Set<string>;
  onToggle: (benchmarkKey: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}

export default function BenchmarkCheckboxPanel({
  selectedBenchmarks,
  onToggle,
  onSelectAll,
  onSelectNone,
}: BenchmarkCheckboxPanelProps): JSX.Element {
  // Filter to only benchmarks that have data (not comingSoon)
  const availableBenchmarks = BENCHMARKS.filter((b) => !b.comingSoon);

  return (
    <div className="benchmark-checkbox-panel">
      <div className="benchmark-checkbox-panel__header">
        <span className="benchmark-checkbox-panel__title">Benchmarks</span>
      </div>
      <div className="benchmark-checkbox-panel__list">
        {availableBenchmarks.map((benchmark) => {
          const isChecked = selectedBenchmarks.has(benchmark.key);
          const color = BENCHMARK_COLORS[benchmark.key] || '#6B7280';

          return (
            <label
              key={benchmark.key}
              className={`benchmark-checkbox-panel__item ${isChecked ? '' : 'benchmark-checkbox-panel__item--unchecked'}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(benchmark.key)}
                className="benchmark-checkbox-panel__checkbox"
              />
              <span
                className="benchmark-checkbox-panel__indicator"
                style={{ backgroundColor: color }}
              />
              <span className="benchmark-checkbox-panel__label">{benchmark.title}</span>
            </label>
          );
        })}
      </div>
      <div className="benchmark-checkbox-panel__actions">
        <button
          type="button"
          className="benchmark-checkbox-panel__btn"
          onClick={onSelectAll}
        >
          All
        </button>
        <button
          type="button"
          className="benchmark-checkbox-panel__btn"
          onClick={onSelectNone}
        >
          None
        </button>
      </div>
    </div>
  );
}
