/**
 * Linear regression with confidence band for visualizing model capability trends.
 *
 * Uses ordinary least squares: y = mx + b
 * - m: slope (rate of TCI improvement over time)
 * - b: y-intercept
 *
 * Confidence band uses standard error of the estimate with 95% CI (±1.96 SE).
 */

export interface LinearParams {
  slope: number;      // m: rate of change
  intercept: number;  // b: y-intercept
  rSquared: number;   // Coefficient of determination (goodness of fit)
}

export interface DataPoint {
  releaseDate: number;
  tci: number;
}

export interface CombinedBandPoint {
  releaseDate: number;
  regressionTCI: number;
  upper: number;       // Confidence band upper
  lower: number;       // Confidence band lower
  upperPred: number;   // Prediction band upper
  lowerPred: number;   // Prediction band lower
}

export interface ForecastBandPoint extends CombinedBandPoint {
  isForecast: boolean; // true for projection, false for historical
}

export interface RegressionStats {
  rSquared: number;
  growthPerYear: number;     // TCI points per year
  currentTCI: number;        // TCI at last data point
  projectedTCI: number;      // TCI at forecast end
  lastDataDate: number;      // timestamp of last data point
  forecastEndDate: number;   // timestamp of forecast end
}

/**
 * Fit a linear regression line to the data using least squares.
 *
 * Formulas:
 * - slope (m) = Σ(xi - x̄)(yi - ȳ) / Σ(xi - x̄)²
 * - intercept (b) = ȳ - m * x̄
 *
 * @param data Array of data points with releaseDate (timestamp) and tci (score)
 * @returns Linear regression parameters, or null if insufficient data
 */
export function fitLinearRegression(data: DataPoint[]): LinearParams | null {
  // Need at least 2 points for a line
  if (data.length < 2) {
    return null;
  }

  const n = data.length;
  const xValues = data.map(d => d.releaseDate);
  const yValues = data.map(d => d.tci);

  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

  // Calculate slope numerator and denominator
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }

  // Prevent division by zero (all x values are the same)
  if (denominator === 0) {
    return null;
  }

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared (coefficient of determination)
  const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = data.reduce((sum, point) => {
    const predicted = slope * point.releaseDate + intercept;
    return sum + Math.pow(point.tci - predicted, 2);
  }, 0);
  const rSquared = ssTotal === 0 ? 1 : 1 - (ssResidual / ssTotal);

  return { slope, intercept, rSquared };
}

/**
 * Calculate the standard error at a specific x value.
 *
 * The standard error varies based on distance from the mean x value,
 * creating the characteristic "bowtie" shape of confidence bands.
 *
 * SE(ŷ) = s * sqrt(1/n + (x - x̄)² / Σ(xi - x̄)²)
 *
 * @param x The x value to calculate SE for
 * @param data Original data points
 * @param params Regression parameters
 * @returns Standard error at x
 */
function calculateStandardErrorAtX(
  x: number,
  data: DataPoint[],
  params: LinearParams
): number {
  const n = data.length;
  // Guard against division by zero (requires n >= 3 for meaningful SE)
  if (n < 3) return 0;

  const xValues = data.map(d => d.releaseDate);
  const xMean = xValues.reduce((sum, xi) => sum + xi, 0) / n;

  // Sum of squared deviations from mean
  const ssX = xValues.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
  if (ssX === 0) return 0;

  // Residual sum of squares
  const ssResidual = data.reduce((sum, point) => {
    const predicted = params.slope * point.releaseDate + params.intercept;
    return sum + Math.pow(point.tci - predicted, 2);
  }, 0);

  // Standard error of the estimate (root mean square error)
  const s = Math.sqrt(ssResidual / (n - 2));

  // Standard error at specific x
  const se = s * Math.sqrt(1 / n + Math.pow(x - xMean, 2) / ssX);

  return se;
}

/**
 * Calculate the prediction error at a specific x value.
 *
 * Prediction intervals are wider than confidence intervals because they
 * account for both the uncertainty in the regression line AND the variance
 * of individual observations around that line.
 *
 * SE_pred = s * sqrt(1 + 1/n + (x - x̄)² / Σ(xi - x̄)²)
 *
 * Note the "1 +" term - this is the key difference from confidence intervals.
 */
function calculatePredictionErrorAtX(
  x: number,
  data: DataPoint[],
  params: LinearParams
): number {
  const n = data.length;
  // Guard against division by zero (requires n >= 3 for meaningful PE)
  if (n < 3) return 0;

  const xValues = data.map(d => d.releaseDate);
  const xMean = xValues.reduce((sum, xi) => sum + xi, 0) / n;

  const ssX = xValues.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
  if (ssX === 0) return 0;

  const ssResidual = data.reduce((sum, point) => {
    const predicted = params.slope * point.releaseDate + params.intercept;
    return sum + Math.pow(point.tci - predicted, 2);
  }, 0);

  const s = Math.sqrt(ssResidual / (n - 2));

  // Note: "1 +" accounts for individual observation variance
  const se = s * Math.sqrt(1 + 1 / n + Math.pow(x - xMean, 2) / ssX);

  return se;
}

/**
 * Generate combined regression data with both confidence and prediction bands.
 *
 * Returns a single array with all bounds at each x position, plus the regression line value.
 * This allows proper layered rendering without visual artifacts.
 */
export function generateCombinedRegressionData(
  data: DataPoint[],
  params: LinearParams,
  xMin: number,
  xMax: number,
  numPoints: number = 50
): CombinedBandPoint[] {
  if (data.length < 3) {
    return [];
  }

  const points: CombinedBandPoint[] = [];
  const step = (xMax - xMin) / (numPoints - 1);
  const zScore = 1.96;

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step;
    const y = params.slope * x + params.intercept;
    const se = calculateStandardErrorAtX(x, data, params);
    const pe = calculatePredictionErrorAtX(x, data, params);
    const confidenceMargin = zScore * se;
    const predictionMargin = zScore * pe;

    points.push({
      releaseDate: x,
      regressionTCI: y,
      upper: y + confidenceMargin,
      lower: y - confidenceMargin,
      upperPred: y + predictionMargin,
      lowerPred: y - predictionMargin,
    });
  }

  return points;
}

/**
 * Generate forecast data with historical trend and future projection.
 *
 * Key difference from generateCombinedRegressionData:
 * - Historical portion uses confidence interval: SE = s * sqrt(1/n + (x-x̄)²/SSx)
 * - Forecast portion uses prediction interval: SE = s * sqrt(1 + 1/n + (x-x̄)²/SSx)
 *   The "1 +" term accounts for increased uncertainty when predicting future values.
 *
 * @see https://github.com/epoch-research/benchmark-stitching
 */
export function generateForecastData(
  data: DataPoint[],
  params: LinearParams,
  forecastMonths: number = 12,
  numHistoricalPoints: number = 50,
  numForecastPoints: number = 30
): { forecastData: ForecastBandPoint[]; stats: RegressionStats } {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_YEAR = 365 * MS_PER_DAY;

  if (data.length < 3) {
    return {
      forecastData: [],
      stats: {
        rSquared: 0,
        growthPerYear: 0,
        currentTCI: 0,
        projectedTCI: 0,
        lastDataDate: 0,
        forecastEndDate: 0,
      },
    };
  }

  const n = data.length;
  const xValues = data.map(d => d.releaseDate);
  const yValues = data.map(d => d.tci);

  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const ssX = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);

  // Calculate residual standard deviation
  const ssResidual = data.reduce((sum, point) => {
    const predicted = params.slope * point.releaseDate + params.intercept;
    return sum + Math.pow(point.tci - predicted, 2);
  }, 0);
  const stdResidual = Math.sqrt(ssResidual / (n - 2));

  const zScore = 1.96; // 95% CI

  // Date bounds
  const minDate = Math.min(...xValues);
  const lastDataDate = Math.max(...xValues);
  const forecastEndDate = lastDataDate + forecastMonths * 30 * MS_PER_DAY;

  const points: ForecastBandPoint[] = [];

  // Generate HISTORICAL points (uses confidence interval - narrower)
  const histStep = (lastDataDate - minDate) / (numHistoricalPoints - 1);
  for (let i = 0; i < numHistoricalPoints; i++) {
    const x = minDate + i * histStep;
    const y = params.slope * x + params.intercept;

    // Confidence interval formula (for mean prediction)
    const se = stdResidual * Math.sqrt(1 / n + Math.pow(x - xMean, 2) / ssX);
    const margin = zScore * se;

    // Prediction interval formula (for individual prediction)
    const pe = stdResidual * Math.sqrt(1 + 1 / n + Math.pow(x - xMean, 2) / ssX);
    const predMargin = zScore * pe;

    points.push({
      releaseDate: x,
      regressionTCI: y,
      upper: y + margin,
      lower: y - margin,
      upperPred: y + predMargin,
      lowerPred: y - predMargin,
      isForecast: false,
    });
  }

  // Generate FORECAST points (uses prediction interval - wider, grows over time)
  const forecastStep = (forecastEndDate - lastDataDate) / numForecastPoints;
  for (let i = 0; i <= numForecastPoints; i++) {
    const x = lastDataDate + i * forecastStep;
    const y = params.slope * x + params.intercept;

    // Prediction interval formula - includes the "1 +" term that makes it widen
    const se = stdResidual * Math.sqrt(1 + 1 / n + Math.pow(x - xMean, 2) / ssX);
    const margin = zScore * se;

    points.push({
      releaseDate: x,
      regressionTCI: y,
      upper: y + margin,
      lower: y - margin,
      upperPred: y + margin, // Same as upper for forecast
      lowerPred: y - margin, // Same as lower for forecast
      isForecast: true,
    });
  }

  // Calculate statistics
  const currentTCI = params.slope * lastDataDate + params.intercept;
  const projectedTCI = params.slope * forecastEndDate + params.intercept;
  const growthPerYear = params.slope * MS_PER_YEAR;

  return {
    forecastData: points,
    stats: {
      rSquared: params.rSquared,
      growthPerYear,
      currentTCI,
      projectedTCI,
      lastDataDate,
      forecastEndDate,
    },
  };
}
