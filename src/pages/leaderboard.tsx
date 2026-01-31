import React, { useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import LeaderboardTabs from '../components/LeaderboardTabs';
import TCIFullTable from '../components/TCIFullTable';
import CategorySection from '../components/CategorySection';
import type { RankingEntry, TCIEntry } from '../types/leaderboard';
import type { BenchmarkCategory } from '../constants/benchmarks';
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import { calculateTCIRankings, calculateBenchmarkRankings } from '../utils/rankings';

export default function LeaderboardPage(): JSX.Element {
  const { data, loading, error } = useLeaderboardData();
  const [activeTab, setActiveTab] = useState<string>('overall');

  // Calculate TCI rankings (TCI is pre-calculated from HuggingFace)
  const tciRankings = useMemo((): TCIEntry[] => {
    return calculateTCIRankings(data);
  }, [data]);

  // Calculate benchmark rankings
  const getBenchmarkRankings = (benchmarkKey: string): RankingEntry[] => {
    return calculateBenchmarkRankings(data, benchmarkKey);
  };

  if (loading) {
    return (
      <Layout title="Leaderboard" description="Open Telco LLM Leaderboard">
        <div className="leaderboard-page">
          <div className="leaderboard-loading">Loading leaderboard data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Leaderboard" description="Open Telco LLM Leaderboard">
        <div className="leaderboard-page">
          <div className="leaderboard-error">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  const renderTabContent = () => {
    if (activeTab === 'overall') {
      return <TCIFullTable rankings={tciRankings} />;
    }

    return (
      <CategorySection
        category={activeTab as BenchmarkCategory}
        getRankings={getBenchmarkRankings}
      />
    );
  };

  return (
    <Layout title="Leaderboard" description="Open Telco LLM Leaderboard">
      <div className="leaderboard-layout">
        <LeaderboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="leaderboard-page">
          <div className="leaderboard-content">
            {renderTabContent()}
          </div>

          <div className="leaderboard-footer">
            <h3>Submission Guidelines</h3>
            <p>
              Want your model to be included? Go{' '}
              <a href="https://github.com/otelcos/leaderboard" target="_blank" rel="noopener noreferrer">
                here
              </a>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
