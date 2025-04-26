'use client';

import React, { useState, useEffect, useRef } from "react";
import { BitcoinPriceData } from "../lib/types";
import { RefreshCw, ArrowUp, ArrowDown, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BitcoinPriceCardProps {
  isLoading: boolean;
  isError: boolean;
  data?: BitcoinPriceData;
}

export const BitcoinPriceCard = ({ isLoading, isError, data }: BitcoinPriceCardProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);
  const [priceChanged, setPriceChanged] = useState(false);
  const prevPriceRef = useRef<number | null>(null);
  
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
      // Store current price before refresh for comparison
      const prevPrice = data?.currentPrice || 0;
      
      // Get the current period if available
      const period = data?.period || 30;
      const response = await fetch('/api/bitcoin/price', { 
        method: 'GET',
        cache: 'no-store'
      });
      
      const refreshedData = await response.json();
      console.log("Price data refreshed successfully");
      
      // Manually trigger price change animation if price actually changed
      if (Math.abs(refreshedData.currentPrice - prevPrice) > 0.01) {
        // Wait a small delay so component has time to re-render with new price
        setTimeout(() => {
          // Determine direction
          const direction = refreshedData.currentPrice > prevPrice ? 'up' : 'down';
          setPriceDirection(direction);
          
          // Add to history
          setPriceHistory(prev => {
            const newHistory = [...prev, refreshedData.currentPrice];
            if (newHistory.length > 20) {
              return newHistory.slice(newHistory.length - 20);
            }
            return newHistory;
          });
          
          // Trigger animation
          setPriceChanged(true);
          
          // Reset animation flag after animation completes
          setTimeout(() => {
            setPriceChanged(false);
          }, 2000);
        }, 200);
      }
    } catch (error) {
      console.error("Failed to refresh price data", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Calculate the position in the 24h range (as percentage)
  const getRangePosition = () => {
    if (!data) return 50; // Default to middle
    
    const { currentPrice, dayLow, dayHigh } = data;
    const range = dayHigh - dayLow;
    
    // Prevent division by zero and ensure range is meaningful
    if (range === 0 || range < 0.01) return 50;
    
    // Clamp value between 0-100% to ensure slider is always visible
    const position = ((currentPrice - dayLow) / range) * 100;
    return Math.max(2, Math.min(98, position));
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
  
  // Effect to track price changes
  useEffect(() => {
    if (!data || isLoading) return;
    
    const currentPrice = data.currentPrice;
    
    // Skip the initial render
    if (prevPriceRef.current !== null) {
      const prevPrice = prevPriceRef.current;
      
      // Only trigger animation if there's a meaningful price change
      if (Math.abs(currentPrice - prevPrice) > 0.01) {
        // Determine direction
        const direction = currentPrice > prevPrice ? 'up' : 'down';
        setPriceDirection(direction);
        
        // Add to history (maintain last 20 prices)
        setPriceHistory(prev => {
          const newHistory = [...prev, currentPrice];
          if (newHistory.length > 20) {
            return newHistory.slice(newHistory.length - 20);
          }
          return newHistory;
        });
        
        // Trigger price changed animation
        setPriceChanged(true);
        
        // Reset animation flag after animation completes
        setTimeout(() => {
          setPriceChanged(false);
        }, 2000);
      }
    }
    
    // Update the ref with current price
    prevPriceRef.current = currentPrice;
  }, [data, isLoading]);
  
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 mb-8 border border-blue-100/50 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOCIgc3Ryb2tlPSIjMkI2Q0I5IiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4wNSIvPjxwYXRoIGQ9Ik01NCAzMGMwLTkuOTQtOC4wNi0xOC0xOC0xOHMtMTggOC4wNi0xOCAxOCIgc3Ryb2tlPSIjMkI2Q0I5IiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-40"></div>
      
      <div className="relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-full mr-3 shadow-sm">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 8H15M9 16H15M12 3V21M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold leading-none text-blue-900">BTC Price Feed</h2>
              {!isLoading && !isError && data?.exchanges && data.exchanges.length > 0 && (
                <div className="text-sm text-blue-600 mt-1 flex items-center">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                  <span className="font-medium">{data.exchanges.length} Sources Active</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">Last Updated</span>
              {isLoading ? (
                <div className="h-5 w-24 bg-blue-100 animate-pulse rounded"></div>
              ) : isError ? (
                <span className="text-sm font-medium text-red-500">Unavailable</span>
              ) : (
                <span className="text-sm font-medium text-blue-800">{getLastUpdatedText(data!.lastUpdated)}</span>
              )}
            </div>
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="inline-flex items-center justify-center rounded-full h-9 px-4 py-2 text-sm font-medium border border-blue-200 bg-white/80 backdrop-blur-sm hover:bg-blue-50 disabled:opacity-50 text-blue-600 shadow-sm transition-colors"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  <span>Refreshing</span>
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {/* Current Price */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm p-5 relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-blue-50 rounded-full opacity-50"></div>
          
          <div className="relative">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-blue-100 mr-2">
                <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-sm font-medium text-blue-800 mb-0">Current Price</div>
            </div>
            
            {isLoading ? (
              <div className="h-12 w-40 mt-3 bg-blue-100 animate-pulse rounded"></div>
            ) : isError ? (
              <p className="text-2xl font-semibold text-red-500 mt-3">Error</p>
            ) : (
              <div className="mt-3">
                <div className="flex items-baseline relative">
                  {/* Animated price with color feedback */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={data!.currentPrice.toString()}
                      initial={{ 
                        opacity: 0, 
                        y: priceDirection === 'up' ? 20 : (priceDirection === 'down' ? -20 : 0) 
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: priceChanged ? 1.03 : 1
                      }}
                      exit={{ 
                        opacity: 0,
                        y: priceDirection === 'up' ? -20 : (priceDirection === 'down' ? 20 : 0),
                        position: 'absolute'
                      }}
                      transition={{ duration: 0.4 }}
                      className={`text-3xl font-bold ${
                        priceChanged && priceDirection === 'up' 
                          ? 'text-green-600' 
                          : priceChanged && priceDirection === 'down'
                            ? 'text-red-600'
                            : 'text-blue-900'
                      }`}
                    >
                      {formatCurrency(data!.currentPrice, "USD", true)}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Direction indicator that fades in when price changes */}
                  {priceChanged && priceDirection && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`ml-2 p-1 rounded-full ${
                        priceDirection === 'up' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {priceDirection === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </motion.div>
                  )}
                  
                  {/* 24h change indicator */}
                  {data && (
                    <div className={`ml-3 flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${
                      data.priceChangePercentage24h >= 0 
                        ? 'bg-green-100 text-green-600 border border-green-200' 
                        : 'bg-red-100 text-red-600 border border-red-200'
                    }`}>
                      {data.priceChangePercentage24h >= 0 ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercentage(Math.abs(data.priceChangePercentage24h))}
                    </div>
                  )}
                </div>
                
                {/* Sparkline mini chart if we have price history */}
                {priceHistory.length > 1 && (
                  <div className="mt-2 h-10 relative">
                    <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                        d={`M ${priceHistory.map((price, index) => {
                          const x = (index / (priceHistory.length - 1)) * 100;
                          
                          // Normalize the price values to fit in the chart height
                          const min = Math.min(...priceHistory);
                          const max = Math.max(...priceHistory);
                          const range = max - min;
                          const normalizedHeight = range === 0 
                            ? 15 
                            : 28 - ((price - min) / range) * 25;
                          
                          return `${index === 0 ? 'M' : 'L'} ${x} ${normalizedHeight}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke={priceDirection === 'up' ? '#16a34a' : priceDirection === 'down' ? '#dc2626' : '#3b82f6'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-blue-600/70 flex items-center">
                    <span className="mr-2">Change in the last 24 hours</span>
                    
                    {/* Pulse dot when new data arrives */}
                    {priceChanged && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ 
                          opacity: [0, 1, 0], 
                          scale: [0.5, 1, 1.5, 1],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: 2,
                          repeatType: "reverse"
                        }}
                        className={`inline-block h-2 w-2 rounded-full ${
                          priceDirection === 'up' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></motion.span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowSources(!showSources)}
                    className={`text-xs font-medium flex items-center px-2.5 py-1.5 rounded-md border transition-all duration-200 ${
                      showSources 
                        ? "bg-blue-100 text-blue-700 border-blue-200 shadow-inner" 
                        : "bg-blue-50 text-blue-600 hover:text-blue-800 border-blue-100 hover:bg-blue-100"
                    }`}
                  >
                    <svg className={`h-3.5 w-3.5 mr-1.5 transition-transform duration-200 ${showSources ? 'rotate-180' : ''}`} 
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showSources ? "Hide Sources" : "View Sources"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 24h Range */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm p-5 relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-blue-100 rounded-full opacity-50"></div>
          
          <div className="relative">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-blue-100 mr-2">
                <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <div className="text-sm font-medium text-blue-800 mb-0">24h Trading Range</div>
            </div>
            
            {isLoading ? (
              <div className="h-12 w-full mt-3 bg-blue-100 animate-pulse rounded"></div>
            ) : isError ? (
              <div className="text-sm text-red-500 mt-3">Data unavailable</div>
            ) : (
              <div className="mt-3">
                {/* Trading range values */}
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="font-semibold text-blue-900">{formatCurrency(data!.dayLow, "USD", true)}</div>
                    <div className="text-xs text-blue-600/70 mt-0.5">24h Low</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-900">{formatCurrency(data!.dayHigh, "USD", true)}</div>
                    <div className="text-xs text-blue-600/70 mt-0.5">24h High</div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="h-2 w-full bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 rounded-full overflow-hidden">{/* No overlay needed */}
                    <motion.div 
                      className="absolute h-5 w-5 -ml-2.5 bg-white rounded-full top-1/2 -translate-y-1/2 border-2 border-blue-500 shadow-md"
                      style={{left: `${getRangePosition()}%`}}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ 
                        scale: [0.8, 1.1, 1],
                        opacity: 1,
                        y: [0, -3, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        times: [0, 0.5, 1],
                        repeat: priceChanged ? 1 : 0,
                        repeatType: "reverse"
                      }}
                    ></motion.div>
                    
                    {/* Pulse effect */}
                    {priceChanged && (
                      <motion.div 
                        className={`absolute h-8 w-8 -ml-4 rounded-full top-1/2 -translate-y-1/2 ${
                          priceDirection === 'up' ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{left: `${getRangePosition()}%`}}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ 
                          opacity: [0, 0.3, 0],
                          scale: [0.6, 1.5, 2]
                        }}
                        transition={{
                          duration: 1.2,
                          ease: "easeOut",
                          times: [0, 0.4, 1],
                          repeat: 1,
                          repeatType: "loop"
                        }}
                      ></motion.div>
                    )}
                  </div>
                  {/* No need for additional labels since we have them above */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Historical Volatility */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm p-5 relative overflow-hidden group">
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          
          <div className="relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-1.5 rounded-full bg-blue-100 mr-2">
                  <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-blue-800">Volatility Index</div>
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                {data?.period ? `${data.period} days` : "30 days"}
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-12 w-20 mt-3 bg-blue-100 animate-pulse rounded"></div>
            ) : isError ? (
              <p className="text-2xl font-semibold text-red-500 mt-3">Error</p>
            ) : (
              <div className="mt-3">
                <div className="text-3xl font-bold text-blue-900">{formatPercentage(data!.historicalVolatility)}</div>
                
                <div className="flex items-center mt-3">
                  <div className="h-1.5 flex-1 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute h-3 w-3 -ml-1.5 bg-white rounded-full top-1/2 -translate-y-1/2 border-2 border-purple-500 shadow-sm"
                      style={{left: `${Math.min(100, data!.historicalVolatility/1.5)}%`}}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ 
                        scale: [0.8, 1, 0.8],
                        opacity: 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    ></motion.div>
                    
                    {/* Color overlay based on volatility level */}
                    <motion.div 
                      className="absolute inset-0 rounded-full" 
                      style={{
                        background: `linear-gradient(90deg, rgba(34, 197, 94, 0) 0%, rgba(34, 197, 94, ${data!.historicalVolatility < 30 ? 0.2 : 0}) 30%, 
                        rgba(234, 179, 8, ${data!.historicalVolatility >= 30 && data!.historicalVolatility < 60 ? 0.2 : 0}) 50%, 
                        rgba(239, 68, 68, ${data!.historicalVolatility >= 60 ? 0.2 : 0}) 70%, rgba(239, 68, 68, 0) 100%)`,
                        width: '100%',
                        height: '100%'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    ></motion.div>
                  </div>
                  <div className="ml-3 text-xs font-medium text-purple-600 px-1.5 py-0.5 bg-purple-50 rounded border border-purple-100">
                    {data!.historicalVolatility < 30 ? 'Low' 
                      : data!.historicalVolatility < 60 ? 'Medium' 
                      : 'High'}
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="text-xs text-blue-600/70">Drives premium pricing</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Exchange Sources */}
      <AnimatePresence>
        {showSources && !isLoading && !isError && data?.exchanges && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-6 pt-6 border-t border-blue-100 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-2">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-blue-900">Price Oracle Network</h3>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold border border-green-100 shadow-sm flex items-center">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                {data.exchanges.length} Connected Sources
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl overflow-hidden border border-blue-100 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-blue-50/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {data.exchanges.map((exchange, index) => (
                      <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-700 font-bold text-xs">
                              {exchange.name.charAt(0)}
                            </div>
                            {exchange.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-blue-900">
                          {formatCurrency(exchange.price, "USD", true)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                          {getLastUpdatedText(exchange.lastUpdated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden mr-3">
                              <div 
                                className={`h-full rounded-full ${
                                  exchange.confidence > 90 ? 'bg-green-500' : 
                                  exchange.confidence > 75 ? 'bg-green-400' : 
                                  exchange.confidence > 60 ? 'bg-yellow-500' : 'bg-yellow-400'
                                }`}
                                style={{width: `${exchange.confidence}%`}}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-blue-800 w-8">{exchange.confidence.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-blue-50/80 border-t border-blue-100 flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    Oracle Network Information
                  </p>
                  <p className="text-xs text-blue-600/80 leading-relaxed">
                    BitHedge aggregates price data from multiple exchanges using a confidence-weighted consensus algorithm.
                    Higher confidence scores indicate greater reliability and lower latency in the price feed.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};