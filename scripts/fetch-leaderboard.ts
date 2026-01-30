/**
 * Build-time script to fetch leaderboard data from HuggingFace
 *
 * This script runs during the build process (not in the browser) to:
 * 1. Authenticate with HuggingFace using HF_TOKEN
 * 2. Fetch data from the private GSMA/leaderboard dataset
 * 3. Write the response to static/data/leaderboard.json
 *
 * The token is never exposed to end users - they receive pre-fetched static data.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const HUGGINGFACE_API_URL =
  'https://datasets-server.huggingface.co/rows?dataset=GSMA/leaderboard&config=default&split=train&offset=0&length=100';

const OUTPUT_PATH = join(process.cwd(), 'static', 'data', 'leaderboard.json');

async function fetchLeaderboardData(): Promise<void> {
  const token = process.env.HF_TOKEN;

  if (!token) {
    console.error('Error: HF_TOKEN environment variable is required');
    console.error('Set it with: HF_TOKEN=hf_xxx npm run build');
    process.exit(1);
  }

  console.log('Fetching leaderboard data from HuggingFace...');

  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Ensure output directory exists
    const outputDir = dirname(OUTPUT_PATH);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write data to static file
    writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));

    console.log(`Successfully wrote leaderboard data to ${OUTPUT_PATH}`);
    console.log(`Fetched ${data.rows?.length ?? 0} entries`);
  } catch (error) {
    console.error('Failed to fetch leaderboard data:', error);
    process.exit(1);
  }
}

fetchLeaderboardData();
