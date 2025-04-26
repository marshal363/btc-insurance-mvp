'use client';

import { useMutation } from '@tanstack/react-query';
import { OptionParameters, SimulationPoint } from '../lib/types';

export function useSimulationPoints() {
  return useMutation<SimulationPoint[], Error, OptionParameters>({
    mutationFn: async (params: OptionParameters) => {
      const response = await fetch('/api/option/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate simulation points');
      }
      
      return response.json();
    },
  });
}