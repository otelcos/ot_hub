---
id: benchmarks
title: Benchmarks
sidebar_label: Benchmarks
hide_table_of_contents: true
---

import BenchmarkCard from '@site/tabs/research/components/BenchmarkCard';

<div className="research-tabs">
  <a href="/dashboards" className="research-tab">Dashboard</a>
  <a href="/benchmarks" className="research-tab active">Benchmarks</a>
  <a href="/models" className="research-tab">Models</a>
</div>

# Benchmarks

Explore evaluations across 5 distinct benchmarks, covering telecommunications knowledge, network operations, mathematical reasoning, and standards comprehension.

<div className="benchmark-grid">

<BenchmarkCard
  title="TeleQnA"
  description="Evaluating telecommunications general knowledge."
  link="/leaderboard/teleqna"
  paperLink="https://arxiv.org/abs/2310.15051"
  datasetLink="https://huggingface.co/datasets/netop/TeleQnA"
/>

<BenchmarkCard
  title="TeleLogs"
  description="Evaluating root cause analysis capabilities for 5G network."
  link="/leaderboard/telelogs"
  paperLink="https://arxiv.org/abs/2507.21974"
  datasetLink="https://huggingface.co/datasets/netop/TeleLogs"
/>

<BenchmarkCard
  title="TeleMath"
  description="Evaluating mathematical reasoning in signal processing, network optimisation, and performance analysis."
  link="/leaderboard/telemath"
  paperLink="https://arxiv.org/abs/2506.10674"
  datasetLink="https://huggingface.co/datasets/netop/TeleMath"
/>

<BenchmarkCard
  title="3GPP-TSG"
  description="Evaluating 3GPP protocols knowledge."
  link="/leaderboard/tsg"
  datasetLink="https://huggingface.co/datasets/eaguaida/gsma_sample"
/>

<BenchmarkCard
  title="TeleYAML"
  description="Evaluates LLM capability to generate valid YAML configurations for telecommunications network elements. Tests understanding of 5G core network parameters and configuration syntax."
/>

</div>
