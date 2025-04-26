'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BitcoinPriceCard } from './components/bitcoin-price-card';
import { PremiumCalculatorTabs } from './components/premium-calculator-tabs';
import { CalculatorTab } from './lib/types';
import { useBitcoinPrice } from './hooks/use-bitcoin-price';

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
  
  // Fetch Bitcoin price data using our custom hook
  const bitcoinPriceQuery = useBitcoinPrice();

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