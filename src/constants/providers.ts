/**
 * Provider colors and logos for consistent branding across components
 */

/**
 * Color palette for each provider (used in charts and visualizations)
 */
export const PROVIDER_COLORS: Record<string, string> = {
  'Google': '#1A73E8',      // Google Blue (official, bold)
  'OpenAI': '#10A37F',      // OpenAI Green (official)
  'Meta': '#0866FF',        // Meta Blue (official)
  'Anthropic': '#D97706',   // Anthropic Orange/Coral
  'Claude': '#D97706',
  'Grok': '#1D9BF0',        // X/Twitter Blue
  'Qwen': '#6366F1',        // Indigo
  'Mistral': '#FF6B35',     // Mistral Orange (bold)
  'NetoAI': '#06B6D4',      // Cyan
  'IBM': '#0F62FE',         // IBM Blue (official)
  'IBM Granite': '#0F62FE',
  'DeepSeek': '#8B5CF6',    // Purple
  'LiquidAI': '#F59E0B',    // Amber
  'Microsoft': '#00BCF2',   // Microsoft Cyan
  'Swiss AI': '#EF4444',    // Red
  'ByteDance': '#22C55E',   // Green
  'Amazon': '#FF9900',      // AWS Orange (official)
  'NVIDIA': '#76B900',      // NVIDIA Green (official)
  'Cohere': '#EF4444',      // Red
  'Hugging Face': '#FFB800', // HuggingFace Yellow
  'Other': '#6B7280',       // Neutral gray
};

/**
 * Logo filenames for each provider (stored in /static/img/logos/)
 */
export const PROVIDER_LOGOS: Record<string, string> = {
  'Google': 'deepmind.png',
  'OpenAI': 'openai.png',
  'Meta': 'meta.png',
  'Anthropic': 'anthropic.png',
  'Claude': 'anthropic.png',
  'Grok': 'xai.png',
  'Qwen': 'qwen.png',
  'Mistral': 'mistral.png',
  'IBM': 'ibm.png',
  'IBM Granite': 'ibm.png',
  'DeepSeek': 'deepseek.png',
  'LiquidAI': 'liquidai.png',
  'Microsoft': 'microsoft.png',
  'ByteDance': 'bytedance.png',
  'Amazon': 'amazon.png',
  'NVIDIA': 'nvidia.png',
  'Cohere': 'cohere.png',
  'Hugging Face': 'huggingface.png',
  'NetoAI': 'NetoAI-logo.png',
};

/**
 * Get provider color with fallback (case-insensitive lookup)
 */
export function getProviderColor(provider: string): string {
  // Try exact match first
  if (PROVIDER_COLORS[provider]) {
    return PROVIDER_COLORS[provider];
  }

  // Try case-insensitive lookup
  const lowerProvider = provider.toLowerCase();
  const matchedKey = Object.keys(PROVIDER_COLORS).find(
    key => key.toLowerCase() === lowerProvider
  );

  return matchedKey ? PROVIDER_COLORS[matchedKey] : PROVIDER_COLORS['Other'];
}

/**
 * Get provider logo filename (returns undefined if not found)
 */
export function getProviderLogo(provider: string): string | undefined {
  return PROVIDER_LOGOS[provider];
}

/**
 * Base path for logo images
 */
export const LOGO_BASE_PATH = '/ot_hub/img/logos/';

/**
 * Get full logo URL for a provider (case-insensitive lookup)
 */
export function getProviderLogoUrl(provider: string): string | undefined {
  // Try exact match first
  let logo = PROVIDER_LOGOS[provider];

  // If no exact match, try case-insensitive lookup
  if (!logo) {
    const lowerProvider = provider.toLowerCase();
    const matchedKey = Object.keys(PROVIDER_LOGOS).find(
      key => key.toLowerCase() === lowerProvider
    );
    if (matchedKey) {
      logo = PROVIDER_LOGOS[matchedKey];
    }
  }

  return logo ? `${LOGO_BASE_PATH}${logo}` : undefined;
}
