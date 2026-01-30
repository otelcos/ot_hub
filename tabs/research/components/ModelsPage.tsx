import React, { useMemo, useState } from 'react';
import { useLeaderboardData } from '../../../src/hooks/useLeaderboardData';
// TCI is now pre-calculated and comes from HuggingFace dataset
import { getTCIColor } from '../../../src/constants/benchmarks';
import ProviderIcon from '../../../src/components/ProviderIcon';
import '../../../src/css/custom.css';

export default function ModelsPage(): JSX.Element {
  const { data, loading, error } = useLeaderboardData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tci' | 'mean' | 'name'>('tci');
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());

  const providers = useMemo(() => {
    return [...new Set(data.map(d => d.provider))].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.model.toLowerCase().includes(query) ||
        d.provider.toLowerCase().includes(query)
      );
    }

    if (selectedProviders.size > 0) {
      result = result.filter(d => selectedProviders.has(d.provider));
    }

    result.sort((a, b) => {
      if (sortBy === 'tci') {
        if (a.tci === null && b.tci === null) return 0;
        if (a.tci === null) return 1;
        if (b.tci === null) return -1;
        return b.tci - a.tci;
      }
      if (sortBy === 'mean') {
        if (a.mean === null && b.mean === null) return 0;
        if (a.mean === null) return 1;
        if (b.mean === null) return -1;
        return b.mean - a.mean;
      }
      return a.model.localeCompare(b.model);
    });

    return result;
  }, [data, searchQuery, selectedProviders, sortBy]);

  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev => {
      const next = new Set(prev);
      if (next.has(provider)) {
        next.delete(provider);
      } else {
        next.add(provider);
      }
      return next;
    });
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading models...</div>;
  }

  if (error) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#E60000' }}>Error: {error}</div>;
  }

  return (
    <div className="models-page-container">
      <div className="models-page-layout">
        {/* Main content */}
        <div className="models-main-content">
          <div className="models-count">
            {filteredData.length} models
          </div>

          {/* Model list */}
          <div className="models-list">
            {filteredData.map((model) => (
              <div
                key={`${model.provider}-${model.model}`}
                className="model-row"
              >
                <div className="model-info">
                  <ProviderIcon provider={model.provider} size={24} />
                  <div className="model-details">
                    <div className="model-name">
                      {model.model}
                    </div>
                    <span className="model-provider-tag">
                      {model.provider}
                    </span>
                  </div>
                </div>

                {/* TCI Score */}
                <div className="model-score-section">
                  <div
                    className="score-badge"
                    style={{ backgroundColor: getTCIColor(model.tci) }}
                  >
                    {model.tci !== null ? Math.round(model.tci) : '—'}
                  </div>
                  <span className="score-label">TCI</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Search & Filter */}
        <div className="models-sidebar">
          {/* Search input */}
          <div className="models-search-container">
            <div className="models-filter-label">Search</div>
            <div className="models-search-input-wrapper">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="models-search-input"
              />
              <svg
                className="models-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          {/* Sort by */}
          <div className="models-sort-container">
            <div className="models-filter-label">Sort by</div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'tci' | 'mean' | 'name')}
              className="models-sort-select"
            >
              <option value="tci">Telco Capability Index</option>
              <option value="mean">Mean Score</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Developer filter */}
          <div>
            <div className="models-filter-label">Developer</div>
            <div className="models-provider-filter">
              {providers.map(provider => (
                <label
                  key={provider}
                  className="models-provider-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={selectedProviders.has(provider)}
                    onChange={() => toggleProvider(provider)}
                  />
                  {provider}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
