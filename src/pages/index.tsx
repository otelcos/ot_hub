import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

// Hero Section - Minimal, Technical, Data-driven
function HeroSection(): JSX.Element {
  return (
    <section className={styles.hero}>
      {/* Subtle grid background */}
      <div className={styles.heroGrid} aria-hidden="true" />

      {/* Radial glow accent */}
      <div className={styles.heroGlow} aria-hidden="true" />

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Evaluating AI as Network Engineers
        </h1>
        <p className={styles.heroSubtitle}>
          Open-source benchmarks to measure AI capabilities in telecommunications.
          Built by GSMA with leading operators and research institutions.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/leaderboard" className={styles.ctaPrimary}>
            View Leaderboard
          </Link>
          <Link to="/research/dashboard" className={styles.ctaSecondary}>
            Explore Research
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main Homepage Component
export default function Home(): JSX.Element {
  return (
    <Layout
      title="Open Telco - AI Benchmarks for Telecommunications"
      description="GSMA's industry-standard benchmark suite for evaluating language models on telecom-specific tasks. Measure reasoning, troubleshooting, and network management capabilities."
    >
      <main>
        <HeroSection />
      </main>
    </Layout>
  );
}
