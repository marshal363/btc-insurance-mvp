'use client';

import React, { useState } from "react";
import { BitcoinPriceData } from "../lib/types";
import { RefreshCw, ArrowUp, ArrowDown, CheckCircle } from "lucide-react";

interface BitcoinPriceCardProps {
  isLoading: boolean;
  isError: boolean;
  data?: BitcoinPriceData;
}

export const BitcoinPriceCard = ({ isLoading, isError, data }: BitcoinPriceCardProps) => {
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
      console.log("Price data refreshed successfully");
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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold leading-none">BTC Price Feed</h2>
            {!isLoading && !isError && data?.exchanges && data.exchanges.length > 0 && (
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                {data.exchanges.length} Sources Active
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">Last Updated</span>
            {isLoading ? (
              <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : isError ? (
              <span className="text-sm font-medium text-red-500">Unavailable</span>
            ) : (
              <span className="text-sm font-medium">{getLastUpdatedText(data!.lastUpdated)}</span>
            )}
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="inline-flex items-center justify-center rounded-full h-9 px-4 py-2 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Price */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">Current Price</div>
          {isLoading ? (
            <div className="h-12 w-40 mt-1 bg-gray-200 animate-pulse rounded"></div>
          ) : isError ? (
            <p className="text-2xl font-semibold text-red-500">Error</p>
          ) : (
            <div className="flex items-end mt-1">
              <span className="text-3xl font-bold">{formatCurrency(data!.currentPrice, "USD", true)}</span>
              {data && (
                <div className={`ml-3 mb-1 flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                  data.priceChangePercentage24h >= 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
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
          )}
        </div>

        {/* 24h Range */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">24h Trading Range</div>
          {isLoading ? (
            <div className="h-12 w-full mt-2 bg-gray-200 animate-pulse rounded"></div>
          ) : isError ? (
            <div className="text-sm text-red-500 mt-3">Data unavailable</div>
          ) : (
            <div className="mt-4">
              <div className="relative mt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div 
                    className="absolute h-4 w-4 -ml-2 bg-blue-600 rounded-full top-1/2 -translate-y-1/2 border-2 border-white shadow-md"
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">Volatility Index</span>
            <div className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
              {data?.period ? `${data.period} days` : "30 days"}
            </div>
          </div>
          {isLoading ? (
            <div className="h-12 w-20 mt-1 bg-gray-200 animate-pulse rounded"></div>
          ) : isError ? (
            <p className="text-2xl font-semibold text-red-500">Error</p>
          ) : (
            <div className="mt-1">
              <div className="text-3xl font-bold">{formatPercentage(data!.historicalVolatility)}</div>
              <div className="mt-2 text-sm text-gray-500 flex justify-between items-center">
                <span>Drives premium pricing</span>
                <button 
                  onClick={() => setShowSources(!showSources)}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  {showSources ? "Hide Sources" : "View Sources"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Exchange Sources */}
      {showSources && !isLoading && !isError && data?.exchanges && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Price Oracle Network</h3>
            <div className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-100">
              {data.exchanges.length} Connected Sources
            </div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.exchanges.map((exchange, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {exchange.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {formatCurrency(exchange.price, "USD", true)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getLastUpdatedText(exchange.lastUpdated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
                            <div 
                              className="h-full bg-green-500" 
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
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                BitHedge aggregates price data from multiple exchanges using a confidence-weighted consensus algorithm.
                Higher confidence scores indicate greater reliability and lower latency in the price feed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};