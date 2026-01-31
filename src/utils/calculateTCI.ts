/**
 * TCI (Telco Capability Index) calculation using Item Response Theory (IRT)
 *
 * This module implements dynamic TCI calculation using the 2-Parameter Logistic (2PL)
 * IRT model. Benchmark difficulty and discrimination parameters are fitted from
 * leaderboard data, ensuring the scoring adapts as models improve.
 *
 * The implementation mirrors the Python version in leaderboard/.github/scripts/tci/
 */

import { TCI_CONFIG, IRT_CONFIG, BENCHMARK_KEYS } from '../constants/benchmarks';
import type { LeaderboardEntry, IRTParameters } from '../types/leaderboard';

// ===============================================================================
// Core Math Functions
// ===============================================================================

/**
 * Numerically stable sigmoid function
 */
export function sigmoid(x: number): number {
  const clipped = Math.max(-500, Math.min(500, x));
  return 1.0 / (1.0 + Math.exp(-clipped));
}

/**
 * Logit (inverse sigmoid) function
 */
function logit(p: number): number {
  const clamped = Math.max(0.01, Math.min(0.99, p));
  return Math.log(clamped / (1 - clamped));
}

// ===============================================================================
// IRT Parameter Extraction and Helpers
// ===============================================================================

interface ScoreMatrix {
  scores: number[][];
  mask: boolean[][];
  models: string[];
  benchmarks: readonly string[];
}

interface ExtractedParams {
  D: number[];
  alpha: number[];
  C: number[];
}

/**
 * Extract IRT parameters from flat parameter array
 */
function extractParams(params: number[], nBenchmarks: number): ExtractedParams {
  return {
    D: params.slice(0, nBenchmarks),
    alpha: params.slice(nBenchmarks, 2 * nBenchmarks),
    C: params.slice(2 * nBenchmarks),
  };
}

/**
 * Build score matrix from leaderboard entries
 */
function buildScoreMatrix(entries: LeaderboardEntry[]): ScoreMatrix {
  const models = entries.map(e => e.model);
  const scores: number[][] = [];
  const mask: boolean[][] = [];

  for (const entry of entries) {
    const row: number[] = [];
    const maskRow: boolean[] = [];

    for (const bench of BENCHMARK_KEYS) {
      const score = entry[bench];
      const isValid = score !== null && score !== undefined;
      row.push(isValid ? score / 100.0 : 0);
      maskRow.push(isValid);
    }

    scores.push(row);
    mask.push(maskRow);
  }

  return { scores, mask, models, benchmarks: BENCHMARK_KEYS };
}

// ===============================================================================
// IRT Optimization
// ===============================================================================

interface RegularizationParams {
  lambdaD: number;
  lambdaAlpha: number;
  lambdaC: number;
}

/**
 * Compute objective function and gradient together to avoid redundant calculations
 */
function computeObjectiveAndGradient(
  params: number[],
  matrix: ScoreMatrix,
  reg: RegularizationParams
): { loss: number; gradient: number[] } {
  const nBenchmarks = matrix.benchmarks.length;
  const nModels = matrix.models.length;
  const { D, alpha, C } = extractParams(params, nBenchmarks);

  // Initialize accumulators
  let loss = 0;
  const gradD = new Array<number>(nBenchmarks).fill(0);
  const gradAlpha = new Array<number>(nBenchmarks).fill(0);
  const gradC = new Array<number>(nModels).fill(0);

  // Compute prediction loss and gradients in single pass
  for (let i = 0; i < nModels; i++) {
    for (let j = 0; j < nBenchmarks; j++) {
      if (!matrix.mask[i][j]) continue;

      const z = alpha[j] * (C[i] - D[j]);
      const pred = sigmoid(z);
      const diff = matrix.scores[i][j] - pred;
      const sigmoidGrad = pred * (1 - pred);

      loss += diff * diff;
      gradD[j] += 2 * diff * alpha[j] * sigmoidGrad;
      gradAlpha[j] += -2 * diff * (C[i] - D[j]) * sigmoidGrad;
      gradC[i] += -2 * diff * alpha[j] * sigmoidGrad;
    }
  }

  // Add regularization terms
  for (let j = 0; j < nBenchmarks; j++) {
    loss += reg.lambdaD * D[j] * D[j];
    loss += reg.lambdaAlpha * (alpha[j] - 1.0) * (alpha[j] - 1.0);
    gradD[j] += 2 * reg.lambdaD * D[j];
    gradAlpha[j] += 2 * reg.lambdaAlpha * (alpha[j] - 1.0);
  }

  for (let i = 0; i < nModels; i++) {
    loss += reg.lambdaC * C[i] * C[i];
    gradC[i] += 2 * reg.lambdaC * C[i];
  }

  return { loss, gradient: [...gradD, ...gradAlpha, ...gradC] };
}

/**
 * Project alpha parameters to satisfy bounds [alphaMin, alphaMax]
 */
function projectAlpha(params: number[], nBenchmarks: number): number[] {
  const result = [...params];
  const { alphaMin, alphaMax } = IRT_CONFIG.bounds;

  for (let j = nBenchmarks; j < 2 * nBenchmarks; j++) {
    result[j] = Math.max(alphaMin, Math.min(alphaMax, result[j]));
  }

  return result;
}

/**
 * Gradient descent optimization with momentum and adaptive learning rate
 */
function optimize(
  matrix: ScoreMatrix,
  reg: RegularizationParams,
  maxIter: number
): { params: number[]; loss: number } {
  const nBenchmarks = matrix.benchmarks.length;
  const nModels = matrix.models.length;

  // Initialize: D=0, alpha=1, C=0
  let params = [
    ...new Array<number>(nBenchmarks).fill(0),
    ...new Array<number>(nBenchmarks).fill(1),
    ...new Array<number>(nModels).fill(0),
  ];

  let learningRate = 0.1;
  const momentum = 0.9;
  let velocity = new Array<number>(params.length).fill(0);
  let prevLoss = Infinity;

  for (let iter = 0; iter < maxIter; iter++) {
    const { loss, gradient } = computeObjectiveAndGradient(params, matrix, reg);

    // Adaptive learning rate
    if (loss > prevLoss) {
      learningRate *= 0.5;
      velocity = velocity.map(v => v * 0.5);
    } else if (loss < prevLoss - 1e-6) {
      learningRate = Math.min(learningRate * 1.05, 0.5);
    }

    // Momentum update
    velocity = velocity.map((v, i) => momentum * v - learningRate * gradient[i]);
    params = params.map((p, i) => p + velocity[i]);
    params = projectAlpha(params, nBenchmarks);

    // Convergence check
    const gradNorm = Math.sqrt(gradient.reduce((sum, g) => sum + g * g, 0));
    if (gradNorm < 1e-6 || Math.abs(loss - prevLoss) < 1e-8) {
      break;
    }

    prevLoss = loss;
  }

  const { loss: finalLoss } = computeObjectiveAndGradient(params, matrix, reg);
  return { params, loss: finalLoss };
}

/**
 * Create default parameters when fitting fails or no data available
 */
function createDefaultParameters(models: string[]): IRTParameters {
  return {
    difficulty: Object.fromEntries(BENCHMARK_KEYS.map(k => [k, 0.0])),
    slope: Object.fromEntries(BENCHMARK_KEYS.map(k => [k, 1.0])),
    capability: Object.fromEntries(models.map(m => [m, 0.0])),
    fitResidual: Infinity,
    nModels: models.length,
    nBenchmarks: BENCHMARK_KEYS.length,
  };
}

/**
 * Fit IRT parameters from leaderboard entries
 *
 * Uses 2PL IRT model: P(m,b) = sigmoid(alpha_b * (C_m - D_b))
 */
export function fitIRTParameters(entries: LeaderboardEntry[]): IRTParameters {
  if (entries.length === 0) {
    return createDefaultParameters([]);
  }

  const matrix = buildScoreMatrix(entries);

  // Check for valid scores
  const hasValidScores = matrix.mask.some(row => row.some(v => v));
  if (!hasValidScores) {
    return createDefaultParameters(matrix.models);
  }

  // Adjust regularization for sparse data
  const nValid = matrix.mask.flat().filter(v => v).length;
  const nParams = matrix.models.length + 2 * BENCHMARK_KEYS.length;
  const sparsityMultiplier = nValid < nParams ? 2.0 : 1.0;

  const reg: RegularizationParams = {
    lambdaD: IRT_CONFIG.regularization.lambdaD * sparsityMultiplier,
    lambdaAlpha: IRT_CONFIG.regularization.lambdaAlpha * sparsityMultiplier,
    lambdaC: IRT_CONFIG.regularization.lambdaC * sparsityMultiplier,
  };

  const { params, loss } = optimize(matrix, reg, IRT_CONFIG.maxIterations);
  const { D, alpha, C } = extractParams(params, BENCHMARK_KEYS.length);

  return {
    difficulty: Object.fromEntries(BENCHMARK_KEYS.map((k, j) => [k, D[j]])),
    slope: Object.fromEntries(BENCHMARK_KEYS.map((k, j) => [k, alpha[j]])),
    capability: Object.fromEntries(matrix.models.map((m, i) => [m, C[i]])),
    fitResidual: loss,
    nModels: matrix.models.length,
    nBenchmarks: BENCHMARK_KEYS.length,
  };
}

// ===============================================================================
// TCI Calculation
// ===============================================================================

interface BenchmarkScore {
  bench: string;
  observed: number;
  stderr: number | null;
}

/**
 * Extract valid benchmark scores from an entry
 */
function extractBenchmarkScores(entry: LeaderboardEntry): BenchmarkScore[] {
  const scores: BenchmarkScore[] = [];

  for (const bench of BENCHMARK_KEYS) {
    const score = entry[bench];
    if (score === null || score === undefined) continue;

    const stderrKey = `${bench}_stderr` as keyof LeaderboardEntry;
    const stderr = entry[stderrKey] as number | null;

    scores.push({
      bench,
      observed: score / 100.0,
      stderr: stderr !== null ? stderr / 100.0 : null,
    });
  }

  return scores;
}

/**
 * Calculate TCI score for a single entry using fitted IRT parameters
 *
 * The TCI is computed as a weighted average of transformed scores:
 * 1. Each benchmark score is transformed via logit
 * 2. The benchmark difficulty is added back (inverse of IRT)
 * 3. Weights are the slope parameters
 * 4. Final score is scaled to the TCI range
 */
export function calculateTCI(entry: LeaderboardEntry, irtParams: IRTParameters): number | null {
  const scores = extractBenchmarkScores(entry);

  if (scores.length < IRT_CONFIG.minScoresRequired) {
    return null;
  }

  let totalWeight = 0;
  let weightedCapability = 0;

  for (const { bench, observed } of scores) {
    const D_b = irtParams.difficulty[bench] ?? 0;
    const alpha_b = irtParams.slope[bench] ?? 1;

    weightedCapability += (logit(observed) + D_b) * alpha_b;
    totalWeight += alpha_b;
  }

  const rawCapability = weightedCapability / totalWeight;
  const tci = IRT_CONFIG.baseScore + rawCapability * IRT_CONFIG.scaleFactor;

  return Math.round(tci * 10) / 10;
}

/**
 * Calculate TCI standard error for an entry
 *
 * Uses error propagation through the weighted average transformation
 */
export function calculateTCIStderr(entry: LeaderboardEntry, irtParams: IRTParameters): number | null {
  const scores = extractBenchmarkScores(entry);

  if (scores.length < IRT_CONFIG.minScoresRequired) {
    return null;
  }

  let totalWeight = 0;
  let varianceSum = 0;

  for (const { bench, observed, stderr } of scores) {
    const alpha_b = irtParams.slope[bench] ?? 1;
    totalWeight += alpha_b;

    // Estimate variance from stderr or use default based on score
    const variance = stderr !== null
      ? stderr * stderr
      : (0.02 * (1 + (1 - observed) * 0.5)) ** 2;

    // Logit derivative for error propagation: d(logit)/dp = 1/(p*(1-p))
    const p = Math.max(0.01, Math.min(0.99, observed));
    const logitDerivative = 1 / (p * (1 - p));

    varianceSum += (alpha_b * logitDerivative) ** 2 * variance;
  }

  const scaledVariance = (IRT_CONFIG.scaleFactor / totalWeight) ** 2 * varianceSum;
  const stderrResult = Math.sqrt(scaledVariance);

  return Math.round(stderrResult * 10) / 10;
}

/**
 * Fit IRT parameters and calculate TCI for all entries
 *
 * This is the main entry point for dynamic TCI calculation.
 * If an entry already has a TCI value in the JSON (manual override), it's preserved.
 */
export function calculateAllTCI(
  entries: LeaderboardEntry[],
  preserveExisting: boolean = false
): { entries: LeaderboardEntry[]; irtParams: IRTParameters } {
  const irtParams = fitIRTParameters(entries);

  for (const entry of entries) {
    if (preserveExisting && entry.tci !== null) {
      continue;
    }

    entry.tci = calculateTCI(entry, irtParams);
    entry.tci_stderr = calculateTCIStderr(entry, irtParams);
  }

  return { entries, irtParams };
}

// ===============================================================================
// Error Bar Calculation (kept for backwards compatibility)
// ===============================================================================

/**
 * Calculate synthetic error based on score and benchmark difficulty
 *
 * Higher scores have lower error, lower scores have higher error.
 * Each benchmark has a different base error reflecting measurement uncertainty.
 */
export function calculateError(score: number, benchmarkKey: string): number {
  const baseError = TCI_CONFIG.baseErrors[benchmarkKey] || 2.0;
  return Math.round((baseError * (1 + (100 - score) / 200)) * 100) / 100;
}
