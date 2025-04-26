import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BitcoinPriceCard } from "@/components/bitcoin-price-card";
import { PremiumCalculatorTabs } from "@/components/premium-calculator-tabs";
import { getBitcoinPriceData } from "@/lib/bitcoin";
import { BitcoinPriceData, CalculatorTab } from "@/lib/types";

const Home = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("buyer");
  
  // Get bitcoin price data
  const { 
    data: bitcoinData, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['/api/bitcoin/price'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Manual polling fallback for bitcoin data if query fails
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isError) {
      intervalId = setInterval(async () => {
        try {
          const data = await getBitcoinPriceData();
          // Update data manually
        } catch (err) {
          console.error('Failed to fetch Bitcoin price data:', err);
        }
      }, 60000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isError]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9 8.5h6"></path>
              <path d="M9 12h6"></path>
              <path d="M9 15.5h6"></path>
              <path d="M9 8.5v7"></path>
              <path d="M15 8.5v7"></path>
            </svg>
            <h1 className="text-2xl font-bold">BitHedge Premium Calculator</h1>
          </div>
          <div className="flex items-center">
            {!isError ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                <svg className="mr-1.5 h-2 w-2 text-primary-400" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3"></circle>
                </svg>
                Oracle Connected
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                <svg className="mr-1.5 h-2 w-2 text-warning-400" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3"></circle>
                </svg>
                Oracle Disconnected
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-8">
        <BitcoinPriceCard 
          isLoading={isLoading} 
          isError={isError}
          data={bitcoinData as BitcoinPriceData}
        />
        
        <PremiumCalculatorTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          bitcoinData={bitcoinData as BitcoinPriceData}
          isLoading={isLoading}
          isError={isError}
        />
      </main>

      <footer className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} BitHedge Protection Calculator. All prices updated in real-time.</p>
            <p className="mt-1">Data provided by BitHedge Oracle Service. Calculations for educational purposes.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary">Documentation</a>
            <a href="#" className="text-muted-foreground hover:text-primary">API</a>
            <a href="#" className="text-muted-foreground hover:text-primary">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
