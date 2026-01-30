import { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '../types/leaderboard';
import { transformHuggingFaceData } from '../utils/transformHuggingFaceData';

// Static JSON file generated at build time from HuggingFace private dataset
const LEADERBOARD_DATA_URL = '/data/leaderboard.json';

interface UseLeaderboardDataResult {
  data: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

export function useLeaderboardData(): UseLeaderboardDataResult {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(LEADERBOARD_DATA_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load leaderboard data');
        return response.json();
      })
      .then(jsonData => {
        setData(transformHuggingFaceData(jsonData));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
