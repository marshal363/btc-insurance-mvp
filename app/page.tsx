'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BitcoinPriceCard } from '../client/src/components/bitcoin-price-card';
import { PremiumCalculatorTabs } from '../client/src/components/premium-calculator-tabs';
import { CalculatorTab, BitcoinPriceData } from './lib/types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: true,
    },
  },
});

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}

function HomeContent() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('buyer');
  
  // Fetch Bitcoin price data using React Query
  const bitcoinPriceQuery = useQuery<BitcoinPriceData>({
    queryKey: ['bitcoinPrice'],
    queryFn: async () => {
      const response = await fetch('/api/bitcoin/price');
      if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin price data');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">BitHedge Premium Calculator</h1>
        <p className="text-muted-foreground mt-2">Calculate Bitcoin PUT option premiums using the Black-Scholes model</p>
      </header>

      <BitcoinPriceCard 
        isLoading={bitcoinPriceQuery.isLoading} 
        isError={bitcoinPriceQuery.isError} 
        data={bitcoinPriceQuery.data} 
      />

      <PremiumCalculatorTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bitcoinData={bitcoinPriceQuery.data}
        isLoading={bitcoinPriceQuery.isLoading}
        isError={bitcoinPriceQuery.isError}
      />
    </main>
  );
}