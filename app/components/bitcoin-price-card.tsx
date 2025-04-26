'use client';

import React, { useState } from "react";
import { BitcoinPriceData } from "../lib/types";

// UI Components
const Button = ({ 
  children, 
  onClick, 
  disabled, 
  size = "default", 
  variant = "default", 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean; 
  size?: string; 
  variant?: string; 
  className?: string 
}) => {
  // Determine the base styles based on the variant
  let variantStyles = "bg-primary text-white hover:bg-primary/90";
  if (variant === "outline") {
    variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  }
  
  // Determine the size styles
  let sizeStyles = "h-10 px-4 py-2";
  if (size === "sm") {
    sizeStyles = "h-9 px-3 py-1 text-sm";
  }
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </button>
  );
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
);

// Mock toast hook
const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
      console.log(`Toast: ${title} - ${description}${variant ? ` (${variant})` : ''}`);
    }
  };
};

interface BitcoinPriceCardProps {
  isLoading: boolean;
  isError: boolean;
  data?: BitcoinPriceData;
}

export const BitcoinPriceCard = ({ isLoading, isError, data }: BitcoinPriceCardProps) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSources, setShowSources] = useState(false);
  
  // Format the last updated time
  const getLastUpdatedText = (timestamp: string) => {
    const lastUpdated = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Get the current period if available
      const period = data?.period || 30;
      await fetch('/api/bitcoin/price', { 
        method: 'GET',
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      toast({
        title: "Price Data Refreshed",
        description: "Bitcoin price data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh Bitcoin price data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Calculate the position in the 24h range (as percentage)
  const getRangePosition = () => {
    if (!data) return 50; // Default to middle
    
    const { currentPrice, dayLow, dayHigh } = data;
    const range = dayHigh - dayLow;
    if (range === 0) return 50;
    
    return ((currentPrice - dayLow) / range) * 100;
  };

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = "USD", ios: boolean = false): string => {
    if (ios) {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency,
        maximumFractionDigits: 0
      }).format(amount);
    }

    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency
    }).format(amount);
  };

  // Format percentage helper
  const formatPercentage = (percent: number, minimumFractionDigits: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits: 2
    }).format(percent / 100);
  };
  
  return (
    <>
      <div className="ios-card p-6 backdrop-blur mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14l2.5 2.5L16 10"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold leading-none">BTC Price Feed</h2>
              {!isLoading && !isError && data?.exchanges && data.exchanges.length > 0 && (
                <div className="text-sm text-muted-foreground mt-1 flex items-center">
                  <span className="inline-flex h-2 w-2 rounded-full bg-success mr-1.5"></span>
                  {data.exchanges.length} Sources Active
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : isError ? (
                <span className="text-sm font-medium text-destructive">Unavailable</span>
              ) : (
                <span className="text-sm font-medium">{getLastUpdatedText(data!.lastUpdated)}</span>
              )}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="ios-button h-9 px-4 py-0 rounded-full"
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Refreshing</span>
                </>
              ) : (
                <>
                  <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Price */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-2">Current Price</span>
            {isLoading ? (
              <Skeleton className="h-12 w-40 mt-1" />
            ) : isError ? (
              <p className="text-2xl font-semibold text-destructive">Error</p>
            ) : (
              <div className="flex items-end mt-1">
                <span className="price-display">{formatCurrency(data!.currentPrice, "USD", true)}</span>
                {data && (
                  <span className={`ml-3 mb-1 flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                    data.priceChangePercentage24h >= 0 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d={data.priceChangePercentage24h >= 0 
                          ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                          : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                      />
                    </svg>
                    {formatPercentage(Math.abs(data.priceChangePercentage24h))}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 24h Range */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <span className="text-sm font-medium text-muted-foreground mb-2">24h Trading Range</span>
            {isLoading ? (
              <Skeleton className="h-12 w-full mt-2" />
            ) : isError ? (
              <div className="text-sm text-destructive mt-3">Data unavailable</div>
            ) : (
              <div className="mt-4">
                <div className="relative mt-2">
                  <div className="ios-slider-track">
                    <div 
                      className="ios-slider-thumb absolute top-1/2 -translate-y-1/2"
                      style={{left: `${getRangePosition()}%`}}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-4">
                    <span className="font-medium">{formatCurrency(data!.dayLow, "USD", true)}</span>
                    <span className="font-medium">{formatCurrency(data!.dayHigh, "USD", true)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Historical Volatility */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Volatility Index</span>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary font-medium rounded-full">
                {data?.period ? `${data.period} days` : "30 days"}
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-12 w-20 mt-1" />
            ) : isError ? (
              <p className="text-2xl font-semibold text-destructive">Error</p>
            ) : (
              <div className="mt-1">
                <div className="price-display">{formatPercentage(data!.historicalVolatility)}</div>
                <div className="mt-2 text-sm text-muted-foreground flex justify-between items-center">
                  <span>Drives premium pricing</span>
                  <button 
                    onClick={() => setShowSources(!showSources)}
                    className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium flex items-center"
                  >
                    {showSources ? (
                      <>
                        <span>Hide Sources</span>
                        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>View Sources</span>
                        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Exchange Sources */}
        {showSources && !isLoading && !isError && data?.exchanges && (
          <div className="mt-6 pt-6 border-t border-gray-100" id="volatility-sources">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Price Oracle Network</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
                {data.exchanges.length} Connected Sources
              </span>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.exchanges.map((exchange, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/10'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {exchange.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {formatCurrency(exchange.price, "USD", true)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {getLastUpdatedText(exchange.lastUpdated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
                              <div 
                                className="h-full bg-success" 
                                style={{width: `${exchange.confidence}%`}}
                              ></div>
                            </div>
                            <span className="text-xs font-medium w-8">{exchange.confidence.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-secondary/10 border-t border-gray-100">
                <p className="text-xs text-muted-foreground">
                  BitHedge aggregates price data from multiple exchanges using a confidence-weighted consensus algorithm.
                  Higher confidence scores indicate greater reliability and lower latency in the price feed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};