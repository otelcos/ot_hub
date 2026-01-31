---
id: dashboards
title: Dashboard
sidebar_label: Dashboard
hide_table_of_contents: true
---

import { useState } from 'react';
import TelcoCapabilityIndex from '@site/tabs/research/components/TelcoCapabilityIndex';
import TCIFaq from '@site/tabs/research/components/TCIFaq';
import ViewToggle from '@site/tabs/research/components/ViewToggle';
import BenchmarksFrontierChart from '@site/tabs/research/components/BenchmarksFrontierChart';

export function DashboardContent() {
  const [activeView, setActiveView] = useState('tci');
  return (
    <>
      <ViewToggle activeView={activeView} onChange={setActiveView} />
      {activeView === 'tci' ? (
        <>
          <h1>Telco Capability Index</h1>
          <p style={{fontSize: '14px', lineHeight: '1.5', textAlign: 'justify', color: '#5c5552', marginTop: '-8px'}}>
            The Telco Capabilities Index (TCI) combines scores from many different AI benchmarks into a single "general capability" scale, allowing comparisons between models even over timespans long enough for single benchmarks to reach saturation.
          </p>
          <p style={{fontSize: '14px', marginTop: '8px', marginBottom: '16px'}}>
            <a href="#what-does-tci-represent">Learn more about how the TCI is calculated.</a>
          </p>
          <TelcoCapabilityIndex />
          <TCIFaq />
        </>
      ) : (
        <>
          <h1>Frontier Progress Timeline</h1>
          <p style={{fontSize: '14px', lineHeight: '1.5', textAlign: 'justify', color: '#5c5552', marginTop: '-8px'}}>
            Track the best model performance over time for each benchmark. The staircase lines show the frontier—each step up represents a new model achieving the highest score on that benchmark.
          </p>
          <BenchmarksFrontierChart />
        </>
      )}
    </>
  );
}

<div className="research-tabs">
  <a href="/dashboards" className="research-tab active">Dashboard</a>
  <a href="/benchmarks" className="research-tab">Benchmarks</a>
  <a href="/models" className="research-tab">Models</a>
</div>

<DashboardContent />
