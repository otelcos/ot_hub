/**
 * Model release dates for TCI chart time-based X-axis
 * Dates are approximate based on public announcements
 */

export const MODEL_RELEASE_DATES: Record<string, string> = {
  // OpenAI models
  'gpt-5.2': '2025-12-11',
  'gpt-5-mini': '2025-08-07',
  'gpt-oss-120b': '2025-08-04',
  'gpt-oss-20b': '2025-08-05',
  'gpt-4o': '2024-05-13',
  'gpt-4o-mini': '2024-07-18',
  'gpt-4-turbo': '2024-04-09',
  'gpt-4': '2023-03-14',
  'gpt-3.5-turbo': '2023-03-01',
  'o1': '2024-12-05',
  'o1-mini': '2024-09-12',
  'o1-preview': '2024-09-12',
  'o3': '2025-04-16',
  'o3-mini': '2025-01-31',
  'o4-mini': '2025-04-16',

  // Anthropic models
  'claude-opus-4.5': '2025-11-24',
  'claude-sonnet-4': '2025-05-22',
  'claude-haiku-4.5': '2025-10-15',
  'claude-3.5-sonnet': '2024-06-20',
  'claude-3.5-haiku': '2024-11-04',
  'claude-3-opus': '2024-03-04',
  'claude-3-sonnet': '2024-03-04',
  'claude-3-haiku': '2024-03-13',

  // Google models
  'gemini-3-flash-preview': '2025-12-17',
  'gemini-2.5-pro': '2025-03-25',
  'gemini-2.5-flash': '2025-04-17',
  'gemini-2.0-flash': '2024-12-11',
  'gemini-2.0-flash-thinking': '2024-12-19',
  'gemini-1.5-pro': '2024-05-14',
  'gemini-1.5-flash': '2024-05-14',
  'gemini-1.0-pro': '2023-12-06',

  // DeepSeek models
  'deepseek-v3.2': '2025-09-29',
  'deepseek-v3': '2024-12-26',
  'deepseek-r1': '2025-01-20',
  'deepseek-r1-lite': '2024-11-20',
  'deepseek-v2.5': '2024-09-05',

  // Mistral models
  'ministral-8b-2512': '2025-12-03',
  'mistral-large': '2024-02-26',
  'mistral-medium': '2023-12-11',
  'mistral-small': '2024-02-26',
  'mixtral-8x7b': '2023-12-11',
  'mixtral-8x22b': '2024-04-17',
  'codestral': '2024-05-29',
  'pixtral-12b': '2024-09-11',
  'pixtral-large': '2024-11-18',

  // Meta models
  'llama-3.3-70b': '2024-12-06',
  'llama-3.2-90b': '2024-09-25',
  'llama-3.2-11b': '2024-09-25',
  'llama-3.1-405b': '2024-07-23',
  'llama-3.1-70b': '2024-07-23',
  'llama-3.1-8b': '2024-07-23',
  'llama-3-70b': '2024-04-18',
  'llama-3-8b': '2024-04-18',
  'llama-4-maverick': '2025-04-05',
  'llama-4-scout': '2025-04-05',

  // xAI models
  'grok-2': '2024-08-13',
  'grok-3': '2025-02-17',

  // Qwen models
  'qwen-2.5-72b': '2024-09-19',
  'qwen-2.5-32b': '2024-09-19',
  'qwen-2.5-7b': '2024-09-19',
  'qwen-2-72b': '2024-06-06',
  'qwen-max': '2024-01-30',
  'qwq-32b': '2024-11-28',

  // IBM models
  'granite-3.1-8b': '2024-12-09',
  'granite-3.0-8b': '2024-10-21',
  'granite-3.0-2b': '2024-10-21',

  // Amazon models
  'nova-pro': '2024-12-03',
  'nova-lite': '2024-12-03',
  'nova-micro': '2024-12-03',

  // Cohere models
  'command-r-plus': '2024-04-04',
  'command-r': '2024-03-11',

  // Microsoft models
  'phi-4': '2024-12-12',
  'phi-3.5-mini': '2024-08-20',
  'phi-3-medium': '2024-05-21',
};

/**
 * Estimate release date from model name patterns
 * Used as fallback when model is not in the mapping
 */
function estimateDateFromModelName(model: string): Date {
  const lowerModel = model.toLowerCase();

  // Try to extract version numbers and estimate
  const versionMatch = lowerModel.match(/(\d+)\.?(\d*)/);
  if (versionMatch) {
    const majorVersion = parseInt(versionMatch[1], 10);
    // Higher versions generally newer
    const baseYear = 2023;
    const estimatedYear = Math.min(baseYear + Math.floor(majorVersion / 2), 2025);
    return new Date(`${estimatedYear}-06-01`);
  }

  // Default to mid-2024 for unknown models
  return new Date('2024-06-01');
}

/**
 * Get release date for a model
 * @param model Model name (without provider suffix)
 * @returns Unix timestamp in milliseconds
 */
export function getModelReleaseDate(model: string): number {
  // Normalize model name (lowercase, trim)
  const normalizedModel = model.toLowerCase().trim();

  // Try exact match first
  if (MODEL_RELEASE_DATES[model]) {
    return new Date(MODEL_RELEASE_DATES[model]).getTime();
  }

  // Try case-insensitive lookup
  const matchedKey = Object.keys(MODEL_RELEASE_DATES).find(
    key => key.toLowerCase() === normalizedModel
  );

  if (matchedKey) {
    return new Date(MODEL_RELEASE_DATES[matchedKey]).getTime();
  }

  // Fallback to estimation
  return estimateDateFromModelName(model).getTime();
}

/**
 * Format date for display on chart axis
 */
export function formatReleaseDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${month}. ${year}`;
}

/**
 * Format timestamp as quarter label for X-axis ticks
 */
export function formatQuarterTick(timestamp: number): string {
  const date = new Date(timestamp);
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}
