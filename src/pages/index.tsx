import React from 'react';
import Layout from '@theme/Layout';
import FeatureCard from '@site/src/components/FeatureCard';
import styles from './index.module.css';

// Collaborators data
const collaborators = [
  { name: 'Huawei', logo: '/img/collaborators/huawei.png', url: 'https://huawei.com', scale: 1 },
  { name: 'Nvidia', logo: '/img/collaborators/nvidia.png', url: 'https://nvidia.com', scale: 1 },
  { name: 'Khalifa University', logo: '/img/collaborators/khalifa-university.png', url: 'https://ku.ac.ae', scale: 2 },
  { name: 'AT&T', logo: '/img/collaborators/att.png', url: 'https://att.com', scale: 1 },
  { name: 'Orange', logo: '/img/collaborators/orange.png', url: 'https://orange.com', scale: 1 },
  { name: 'Vodafone', logo: '/img/collaborators/vodafone.png', url: 'https://vodafone.com', scale: 1 },
  { name: 'Google', logo: '/img/collaborators/google.png', url: 'https://google.com', scale: 1 },
  { name: 'SoftBank', logo: '/img/collaborators/softbank.svg', url: 'https://softbank.com', scale: 1 },
];

// Feature card data
const features = [
  {
    title: 'Telco Capability Index',
    description:
      'Track performance over time in frontier models on telecommunication tasks',
    href: '/leaderboard/tci',
    videoSrc: '/videos/telco_capability.mp4',
  },
  {
    title: 'Models',
    description:
      'To achieve L5 autonomous level in telecoms, we need specialised models that can be deployed at scale',
    href: '/models',
    videoSrc: '/videos/telco_models.mp4',
  },
  {
    title: 'Data',
    description:
      'We bring together experts across the industry to open-source massive datasets',
    href: '/data',
    videoSrc: '/videos/dataa.mp4',
  },
  {
    title: 'Compute',
    description:
      'We make compute available for developers building open-source models',
    href: '/resources',
    videoSrc: '/videos/compute.mp4',
  },
];

// Features Section - 4 horizontal cards
function FeaturesSection(): JSX.Element {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              href={feature.href}
              videoSrc={feature.videoSrc}
              animationDelay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Collaborators Section - Partner logos
function CollaboratorsSection(): JSX.Element {
  return (
    <section className={styles.collaboratorsSection}>
      <h3 className={styles.collaboratorsTitle}>Our Collaborators</h3>
      <div className={styles.collaboratorsGrid}>
        {collaborators.map((collab) => (
          <a
            key={collab.name}
            href={collab.url}
            className={styles.collaboratorLogo}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={collab.logo}
              alt={collab.name}
              style={collab.scale !== 1 ? { transform: `scale(${collab.scale})` } : undefined}
            />
          </a>
        ))}
      </div>
    </section>
  );
}

// Mission Section - Atomicwork-style split layout
function MissionSection(): JSX.Element {
  return (
    <section className={styles.missionSection}>
      {/* The Challenge - Anthropic-style bold statement */}
      <div className={styles.statementSection}>
        <h2 className={styles.statementHeadline}>
          <span className={styles.underline}>Connectivity</span> underpins
          modern society, yet frontier AI models{' '}
          <span className={styles.underline}>fail</span> on telecoms.
        </h2>
        <p className={styles.statementBody}>
          Surging capabilities in reasoning, math and code have not translated
          to real enterprise use cases. In telecoms, models hallucinate 3GPP
          standards, regulations and network configurations — blocking the path
          to{' '}
          <a
            href="https://www.nokia.com/autonomous-networks/"
            target="_blank"
            rel="noopener noreferrer"
          >
            autonomous L5 networks
          </a>
          .
        </p>
      </div>

      {/* THE SOLUTION - Text Left, Placeholder Right */}
      <div className={styles.splitSection}>
        <div className={styles.splitTextColumn}>
          <h3 className={styles.missionBlockTitle}>
            AI will transform how networks operate.
          </h3>
          <p>
            GSMA Open-Telco is the cross-industry collaboration ensuring that
            transformation is open, accurate, and telco-grade.
          </p>
        </div>
        <div className={styles.splitImageColumn}>
          <img
            src="/videos/everyone.png"
            alt="Open Telco AI collaboration"
            className={styles.splitImage}
          />
        </div>
      </div>

      {/* JOIN US - Image Left, Text Right */}
      <div className={`${styles.splitSection} ${styles.splitSectionGap}`}>
        <div className={styles.splitImageColumn}>
          <img
            src="/videos/join_us.png"
            alt="Join the Open Telco AI community"
            className={styles.splitImage}
          />
        </div>
        <div className={styles.splitTextColumn}>
          <h3 className={styles.missionBlockTitle}>Join Us</h3>
          <p>
            We offer resources, benchmarks, and community to accelerate your
            work. Join competitions, contribute evaluations, or benchmark your
            models.
          </p>
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
        <FeaturesSection />
        <MissionSection />
        <CollaboratorsSection />
      </main>
    </Layout>
  );
}
