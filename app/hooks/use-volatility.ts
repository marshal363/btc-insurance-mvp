'use client';

import { useQuery } from '@tanstack/react-query';

interface VolatilityResult {
  volatility: number;
}

export function useVolatility(days: number = 30) {
  return useQuery<VolatilityResult>({
    queryKey: ['volatility', days],
    queryFn: async () => {
      const response = await fetch(`/api/bitcoin/volatility?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch volatility data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}