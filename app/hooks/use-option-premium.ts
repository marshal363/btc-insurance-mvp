'use client';

import { useMutation } from '@tanstack/react-query';
import { OptionParameters, PremiumCalculationResult } from '../lib/types';

export function usePremiumCalculation() {
  return useMutation<PremiumCalculationResult, Error, OptionParameters>({
    mutationFn: async (params: OptionParameters) => {
      const response = await fetch('/api/option/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate premium');
      }
      
      return response.json();
    },
  });
}