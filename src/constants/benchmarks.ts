/**
 * Benchmark configurations and metadata
 */

import type { BenchmarkConfig, BenchmarkCategory } from '../types/leaderboard';

export type { BenchmarkCategory };

/**
 * Category tab definitions for leaderboard navigation
 */
export const BENCHMARK_CATEGORIES = [
  { id: 'overall', label: 'Overall', icon: '/img/benchmark-icons/trophy-overall.svg' },
  { id: 'knowledge', label: 'Knowledge', icon: '/img/benchmark-icons/knowledge-icon.png' },
  { id: 'network-optimisation', label: 'Network Ops', icon: '/img/benchmark-icons/network-optimisation-icon.png' },
] as const;

/**
 * Full benchmark configurations with metadata
 */
export const BENCHMARKS: BenchmarkConfig[] = [
  {
    key: 'teleqna',
    title: 'TeleQnA',
    description: 'Evaluating telecommunications general knowledge.',
    samples: '10,000',
    category: 'knowledge',
    paperLink: 'https://arxiv.org/abs/2310.15051',
    datasetLink: 'https://huggingface.co/datasets/netop/TeleQnA',
    questions: [
      {
        type: 'mcq',
        question: 'What is the typical coverage range of LPWANs (Low-Power Wide Area Networks) in urban areas?',
        options: ['A few meters', '2-5 km', '10-15 km', '50-100 km'],
      },
      {
        type: 'mcq',
        question: 'What is the Laplace transform or the PGF used for?',
        options: [
          'Determining the mean, variance, and coefficient of variation',
          'Determining the maximum likelihood estimates of mean value parameters',
          'Determining the probability generating function of distributions',
          'Establishing specific results in queueing theory',
          'None of the above',
        ],
      },
      {
        type: 'mcq',
        question: 'What is the maximum number of S-NSIs that a GN-NSI can consist of?',
        options: ['4', '6', '8', '10', '12'],
      },
    ],
  },
  {
    key: 'telemath',
    title: 'TeleMath',
    description: 'Evaluating mathematical reasoning in telecommunication settings.',
    samples: '500',
    category: 'knowledge',
    paperLink: 'https://arxiv.org/abs/2506.10674',
    datasetLink: 'https://huggingface.co/datasets/netop/TeleMath',
    questions: [
      {
        type: 'open-ended',
        question: 'Determine the average number of items sold daily when the store receives a Poisson-distributed number of customers with a parameter $\\lambda = 100.0$, and each customer buys a random quantity of items following a geometric distribution with a probability of purchase $p_g(k) = 0.3 (1 - 0.3)^k$.',
      },
      {
        type: 'open-ended',
        question: 'Calculate the signal power, expressed in dBm, at the input of the receiver for a space probe transmitting binary data via BPSK from 80000 km away, given a transmitted power of 50 dBm at a carrier frequency of 1.2 GHz over a narrowband channel, with transmit and receive antenna gains of 30 dB and 50 dB respectively, and an effective noise temperature at the receiver input of 280 K.',
      },
      {
        type: 'open-ended',
        question: 'Let $y$ be an exponential random variable with parameter $\\lambda = 1.5$, and let $v$ be a random variable that, conditioned on $y = a$, follows a Poisson distribution with parameter $a$. What is the probability mass function (PMF) of $v$ when $k = 1$ and $\\lambda = 1$?',
      },
    ],
  },
  {
    key: 'telelogs',
    title: 'TeleLogs',
    description: 'Evaluating root cause analysis capabilities for 5G network.',
    samples: '1,000+',
    category: 'network-optimisation',
    paperLink: 'https://arxiv.org/abs/2507.21974',
    datasetLink: 'https://huggingface.co/datasets/netop/TeleLogs',
    questions: [
      {
        type: 'log-analysis',
        prompt: 'Given the user plane drive test data and engineering parameters below, identify the root cause of the performance issue.',
        tableExcerpt: {
          headers: ['Timestamp', 'PCI', 'SS-RSRP (dBm)', 'SS-SINR (dB)', 'DL Throughput (Mbps)'],
          rows: [
            ['15:23:52', '712', '-77.0', '15.93', '1351.25'],
            ['15:23:53', '71', '-80.97', '6.6', '366.57'],
            ['15:23:54', '71', '-85.5', '1.81', '334.0'],
            ['15:23:55', '71', '-88.21', '5.4', '431.94'],
            ['15:23:56', '71', '-78.45', '13.59', '566.34'],
          ],
        },
        options: [
          'C1: The serving cell\'s downtilt angle is too large, causing weak coverage at the far end.',
          'C2: The serving cell\'s coverage distance exceeds 1km, resulting in over-shooting.',
          'C3: A neighboring cell provides higher throughput.',
          'C4: Non-colocated co-frequency neighboring cells cause severe overlapping coverage.',
          'C5: Frequent handovers degrade performance.',
          'C6: Neighbor cell and serving cell have the same PCI mod 30, leading to interference.',
          'C7: Test vehicle speed exceeds 40km/h, impacting user throughput.',
          'C8: Average scheduled RBs are below 160, affecting throughput.',
        ],
      },
      {
        type: 'log-analysis',
        prompt: 'Given the user plane drive test data and engineering parameters below, identify the root cause of the performance issue.\n\nNote: Default electronic downtilt value 255 = 6 degrees. Beam Scenario DEFAULT/SCENARIO_1-5 = 6° vertical beamwidth.',
        tableExcerpt: {
          headers: ['Timestamp', 'PCI', 'SS-RSRP (dBm)', 'SS-SINR (dB)', 'DL Throughput (Mbps)'],
          rows: [
            ['13:17:12', '129', '-72.15', '28.0', '1376.03'],
            ['13:17:13', '129', '-72.48', '27.83', '1449.05'],
            ['13:17:17', '129', '-84.0', '19.87', '575.25'],
            ['13:17:18', '307', '-86.53', '18.41', '588.41'],
            ['13:17:21', '307', '-88.38', '14.22', '1212.64'],
          ],
        },
        options: [
          'C1: The serving cell\'s downtilt angle is too large, causing weak coverage at the far end.',
          'C2: The serving cell\'s coverage distance exceeds 1km, resulting in over-shooting.',
          'C3: A neighboring cell provides higher throughput.',
          'C4: Non-colocated co-frequency neighboring cells cause severe overlapping coverage.',
          'C5: Frequent handovers degrade performance.',
          'C6: Neighbor cell and serving cell have the same PCI mod 30, leading to interference.',
          'C7: Test vehicle speed exceeds 40km/h, impacting user throughput.',
          'C8: Average scheduled RBs are below 160, affecting throughput.',
        ],
      },
      {
        type: 'log-analysis',
        prompt: 'Given the user plane drive test data and engineering parameters below, identify the root cause of the performance issue.\n\nNote: Default electronic downtilt value 255 = 6 degrees. Beam Scenario DEFAULT/SCENARIO_1-5 = 6° vertical beamwidth.',
        tableExcerpt: {
          headers: ['Timestamp', 'PCI', 'SS-RSRP (dBm)', 'SS-SINR (dB)', 'DL Throughput (Mbps)'],
          rows: [
            ['11:29:25', '477', '-81.98', '2.54', '750.04'],
            ['11:29:27', '477', '-84.97', '2.46', '1124.87'],
            ['11:29:29', '477', '-84.46', '1.51', '213.28'],
            ['11:29:31', '338', '-85.17', '0.55', '236.93'],
            ['11:29:34', '338', '-75.75', '17.39', '838.58'],
          ],
        },
        options: [
          'C1: The serving cell\'s downtilt angle is too large, causing weak coverage at the far end.',
          'C2: The serving cell\'s coverage distance exceeds 1km, resulting in over-shooting.',
          'C3: A neighboring cell provides higher throughput.',
          'C4: Non-colocated co-frequency neighboring cells cause severe overlapping coverage.',
          'C5: Frequent handovers degrade performance.',
          'C6: Neighbor cell and serving cell have the same PCI mod 30, leading to interference.',
          'C7: Test vehicle speed exceeds 40km/h, impacting user throughput.',
          'C8: Average scheduled RBs are below 160, affecting throughput.',
        ],
      },
    ],
  },
  {
    key: 'tsg',
    title: '3GPP-TSG',
    description: 'Evaluating 3GPP protocols knowledge.',
    samples: '5,000+',
    category: 'knowledge',
    paperLink: 'https://arxiv.org/abs/2407.09424',
    datasetLink: 'https://huggingface.co/datasets/eaguaida/gsma_sample',
    questions: [
      {
        type: 'text-classification',
        passage: 'HSS will not able to record which S-CSCF maybe error. And also if the S-CSCF is unavailable, the S-CSCF maybe also unable to send Cx-SAR message to notify HSS deregister related IMPU. HSS maybe still record the IMPU as registered. If the user found that it can not do re-registration, he may choose to initiate a new initial-registration in the FULL IMS environment. That may help network to reselect a new S-CSCF. Then the new selected S-CSCF will notify HSS to do correction. If we forbidden that function, that also means user maybe not get service until the recorded S-CSCF recover. For every registration time HSS can only return the recorded S-CSCF in the Cx-UAA message. That means if user found that he can\'t do periodic registration then nothing he can do until S-CSCF recover. He also can not get any IMS service during that period time. That we think is not user or operator would like. From our view we think we should give network flexibility to recover from the error, and not introduce that error to user and make them feel not convenience to use.',
        options: ['CT1', 'CT3', 'CT4', 'CT6', 'SA1', 'SA2', 'SA3'],
      },
      {
        type: 'text-classification',
        passage: 'The benefits of the service-based interface become more apparent when the degree of connectivity between NFs increases (i.e. when the number of potential service consumers is large). That is why the service-based interface goes hand-in-hand with the messaging bus that can be found in almost all consolidated architectures (e.g. IRF, MIF, MRFF). Note that in the extreme case the messaging bus can provide a full-mesh connectivity among all NFs, although only some connections in the full-mesh may actually make sense. The definition of a service-based interface can co-exist with the "traditional" P2P architecture. The P2P architecture can be viewed as an essential graph with minimal connectivity that is needed for enabling the basic mobile system to work.',
        options: ['CT1', 'CT3', 'RAN2', 'RAN3', 'SA1', 'SA2', 'SA5'],
      },
    ],
  },
  {
    key: 'teletables',
    title: 'TeleTables',
    description: 'Evaluating LLM knowledge and table interpretation of 3GPP telecom standards.',
    samples: 'TBD',
    category: 'knowledge',
    paperLink: 'https://arxiv.org/abs/2601.04202',
    datasetLink: 'https://huggingface.co/datasets/netop/TeleTables',
    questions: [
      {
        type: 'mcq',
        question: 'What is the number of beams used in the simulation?',
        options: ['6 beams', '3 beams', '4 beams', '2 beams', '5 beams'],
      },
      {
        type: 'mcq',
        question: 'If the encoded sequence for Q_m=4 has 6 \'x\' placeholders, which Q_m value has a sequence where the number of \'x\' placeholders is exactly double that of Q_m=4?',
        options: ['8', '6', '2', '1', '4'],
      },
      {
        type: 'mcq',
        question: 'Which row has the highest number of transitions between 0 and 1 in its binary sequence?',
        options: ['Row 5', 'Row 3', 'Row 25', 'Row 7', 'Row 15'],
      },
    ],
  },
  {
    key: 'teleyaml',
    title: 'TeleYAML',
    description: 'Evaluating understanding of 5G core networks parameters and configuration syntax.',
    samples: 'TBD',
    category: 'network-optimisation',
    comingSoon: true,
    questions: [],
  },
];

/**
 * Leaderboard page benchmark cards (simpler version with category)
 */
export const LEADERBOARD_BENCHMARKS = BENCHMARKS.map(b => ({
  key: b.key,
  title: b.title,
  description: b.description,
  category: b.category,
  comingSoon: b.comingSoon,
}));

/**
 * Get benchmarks filtered by category
 */
export function getBenchmarksByCategory(category: BenchmarkCategory): typeof LEADERBOARD_BENCHMARKS {
  return LEADERBOARD_BENCHMARKS.filter(b => b.category === category);
}

/**
 * TCI calculation parameters
 */
export const TCI_CONFIG = {
  /**
   * Base error values for error bar calculations
   */
  baseErrors: {
    teleqna: 1.5,
    telelogs: 3.6,
    telemath: 2.8,
    tsg: 2.4,
    teletables: 3.6,
    tci: 1.8,
  } as Record<string, number>,
};

/**
 * IRT (Item Response Theory) configuration for dynamic TCI calculation
 */
export const IRT_CONFIG = {
  /** Base TCI score (average capability maps to this) */
  baseScore: 115,
  /** Scale factor for converting capability to TCI */
  scaleFactor: 20,
  /** Minimum number of benchmark scores required to calculate TCI */
  minScoresRequired: 3,

  /**
   * Ridge regularization strengths (tuned for sparse data)
   */
  regularization: {
    /** Difficulty regularization toward 0 */
    lambdaD: 0.1,
    /** Slope regularization toward 1.0 */
    lambdaAlpha: 0.5,
    /** Capability regularization toward 0 */
    lambdaC: 0.1,
  },

  /**
   * Optimization bounds
   */
  bounds: {
    /** Minimum slope value */
    alphaMin: 0.1,
    /** Maximum slope value */
    alphaMax: 5.0,
  },

  /** Maximum iterations for L-BFGS-B optimization */
  maxIterations: 1000,
};

/**
 * Benchmark keys used for IRT fitting (must match LeaderboardEntry fields)
 */
export const BENCHMARK_KEYS = ['teleqna', 'telelogs', 'telemath', 'tsg', 'teletables'] as const;

export type BenchmarkKey = (typeof BENCHMARK_KEYS)[number];

/**
 * Benchmark colors for frontier chart visualization
 */
export const BENCHMARK_COLORS: Record<string, string> = {
  teleqna: '#3B82F6',      // Blue
  telemath: '#10B981',     // Emerald
  telelogs: '#F59E0B',     // Amber
  tsg: '#8B5CF6',          // Purple
  teletables: '#EF4444',   // Red
};

/**
 * Get TCI color based on score tier
 */
export function getTCIColor(tci: number | null): string {
  if (tci === null) return '#8a8582';
  if (tci >= 140) return '#047857'; // Emerald 700 - Exceptional
  if (tci >= 135) return '#059669'; // Emerald 600 - Excellent
  if (tci >= 130) return '#10b981'; // Emerald 500 - Very Good
  if (tci >= 125) return '#34d399'; // Emerald 400 - Good
  if (tci >= 120) return '#6ee7b7'; // Emerald 300 - Above Average
  if (tci >= 115) return '#fbbf24'; // Amber 400 - Average
  if (tci >= 110) return '#fb923c'; // Orange 400 - Below Average
  return '#f87171'; // Red 400 - Needs Improvement
}
