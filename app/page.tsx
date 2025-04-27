'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
export default function Home() {
  // Use useState to create the client to avoid hydration issues
  const [queryClient] = useState(() => new QueryClient());
  
  // For debugging purposes, show a minimal UI first
  return (
    <QueryClientProvider client={queryClient}>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-blue-600">BitHedge Premium Calculator</h1>
          <p className="text-gray-500 mt-2">Calculate Bitcoin PUT option premiums using the Black-Scholes model</p>
        </header>
        
        <div className="p-6 bg-white rounded-xl shadow-lg my-6">
          <p className="text-gray-700">Application is loading...</p>
        </div>
        
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p suppressHydrationWarning>© {new Date().getFullYear()} BitHedge • Price data refreshed every 30 seconds • Not financial advice</p>
        </footer>
      </main>
    </QueryClientProvider>
  );
}