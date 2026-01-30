const fs = require('fs');
const path = require('path');

const API_URL = 'https://datasets-server.huggingface.co/rows?dataset=GSMA/leaderboard&config=default&split=train';
const OUTPUT_PATH = path.join(__dirname, '../static/data/leaderboard.json');

async function fetchLeaderboard() {
  console.log('Fetching leaderboard data from HuggingFace...');

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  // Write the data
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
  console.log(`Leaderboard data written to ${OUTPUT_PATH}`);
}

fetchLeaderboard().catch(err => {
  console.error('Error fetching leaderboard:', err.message);
  process.exit(1);
});
