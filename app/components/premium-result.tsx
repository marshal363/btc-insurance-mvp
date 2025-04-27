'use client';

import React from "react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { 
  OptionParameters, 
  PremiumCalculationResult, 
  SimulationPoint,
  CalculatorTab
} from "../lib/types";
import { SimulationChart } from "./simulation-chart";

interface PremiumResultProps {
  type: CalculatorTab;
  calculationResult?: PremiumCalculationResult;
  parameters: OptionParameters;
  simulationPoints?: SimulationPoint[];
  isLoading: boolean;
  isError: boolean;
}

export const PremiumResult = ({
  type,
  calculationResult,
  parameters,
  simulationPoints,
  isLoading,
  isError
}: PremiumResultProps) => {
  // Calculate maximum recovery value
  const calculateProtectedValue = (strikePrice: number, amount: number): number => {
    return strikePrice * amount;
  };

  const maxRecovery = calculateProtectedValue(parameters.strikePrice, parameters.amount);

  // Format helpers with consistent output for server/client rendering
  const formatCurrency = (amount: number, currency: string = "USD", ios: boolean = false): string => {
    // Use a more predictable formatting approach to avoid hydration issues
    const value = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    // Round to 2 decimal places and format with commas
    const parts = value.toFixed(2).toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimalPart = parts[1];
    
    const symbol = currency === "USD" ? "$" : currency;
    return `${sign}${symbol}${integerPart}.${decimalPart}`;
  };

  const formatBTC = (amount: number): string => {
    if (amount >= 1) {
      return `${amount.toFixed(4)} BTC`;
    } else {
      // Convert to mBTC for more readable values
      const mBTC = amount * 1000;
      return `${mBTC.toFixed(2)} mBTC`;
    }
  };

  const formatPercentage = (percent: number, minimumFractionDigits: number = 2): string => {
    // Calculate percentage with fixed precision to avoid floating point differences
    const value = percent / 100;
    const formatted = value.toFixed(minimumFractionDigits);
    return `${formatted}%`;
  };
  
  return (
    <div className="space-y-6">
      {/* Premium Estimate Card */}
      <div className="overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg border border-blue-400/20 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNncmlkKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]"></div>
        <div className="relative p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg flex items-center">
              <div className="bg-white/20 p-1.5 rounded-full mr-2">
                {type === "buyer" ? (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </div>
              {type === "buyer" ? "Protection Cost" : "Income Estimate"}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
              type === "buyer" 
                ? 'bg-blue-500/30 text-blue-50 border-blue-300/30' 
                : 'bg-green-500/30 text-green-50 border-green-300/30'
            }`}>
              {type === "buyer" ? "Protection Premium" : "Liquidity Premium"}
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 mt-2 shadow-inner border border-white/10 relative overflow-hidden">
            {/* Triangle decoration */}
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-white/10 rounded-lg rotate-45 transform"></div>
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/5 rounded-lg rotate-45 transform"></div>
            
            {isLoading ? (
              <div className="flex flex-col items-center py-3">
                <Skeleton className="h-12 w-48 bg-white/20" />
                <Skeleton className="h-6 w-36 mt-2 bg-white/20" />
              </div>
            ) : isError ? (
              <div className="text-center py-3">
                <div className="text-2xl font-bold text-white/70">Error loading data</div>
                <p className="text-sm text-white/50 mt-1">Please try again later</p>
              </div>
            ) : calculationResult ? (
              <div className="flex flex-col items-center animate-in fade-in-50 duration-300 py-3 relative z-10">
                <div className={`absolute -top-6 -left-6 w-12 h-12 rounded-full ${
                  type === "buyer"
                    ? 'bg-gradient-to-br from-red-400/20 to-red-600/20'
                    : 'bg-gradient-to-br from-green-400/20 to-green-600/20'
                } blur-xl`}></div>
                
                <div className="flex items-baseline">
                  <span className="premium-value text-5xl font-extrabold tracking-tight text-white">{formatBTC(calculationResult.premium)}</span>
                  <div className={`ml-3 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    type === "buyer" 
                      ? 'bg-red-500/30 text-white border-red-400/30' 
                      : 'bg-green-500/30 text-white border-green-400/30'
                  }`}>
                    {type === "buyer" ? "YOU PAY" : "YOU EARN"}
                  </div>
                </div>
                
                <div className="mt-2 flex flex-col items-center">
                  <span className="text-white text-xl font-medium">
                    {formatCurrency(calculationResult.premiumUsd, "USD", true)}
                  </span>
                  
                  <div className="flex items-center mt-3 space-x-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full ${type === "buyer" ? "bg-red-400" : "bg-green-400"} rounded-full`} 
                        style={{ width: `${Math.min(100, calculationResult.premiumRate * 2)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-white/70">
                      {formatPercentage(calculationResult.premiumRate)}
                    </span>
                  </div>
                  
                  <div className="mt-4 bg-white/10 px-4 py-1.5 rounded-full text-sm text-white border border-white/20 shadow-inner">
                    {type === "buyer" ? "Secures" : "Provides"} {formatCurrency(parameters.strikePrice * parameters.amount, "USD", true)} of {type === "buyer" ? "protection" : "liquidity"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="text-2xl font-bold text-white/70">No data available</div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                <div className="text-sm text-white/70 mb-1 flex items-center">
                  <svg className="h-3 w-3 mr-1 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Premium Rate
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-20 bg-white/20" />
                ) : isError ? (
                  <span className="text-white/50">Error</span>
                ) : calculationResult ? (
                  <div className="text-xl font-bold">{formatPercentage(calculationResult.premiumRate)}</div>
                ) : (
                  <span className="text-white/50">--</span>
                )}
              </div>
              
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                <div className="text-sm text-white/70 mb-1 flex items-center">
                  <svg className="h-3 w-3 mr-1 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  APY Equivalent
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-20 bg-white/20" />
                ) : isError ? (
                  <span className="text-white/50">Error</span>
                ) : calculationResult ? (
                  <div className="text-xl font-bold">{formatPercentage(calculationResult.apyEquivalent)}</div>
                ) : (
                  <span className="text-white/50">--</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold text-base h-12 rounded-full shadow-lg border border-white/80 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/30 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
              <div className="relative">
                {type === "buyer" 
                  ? (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Get Bitcoin Protection</span>
                    </div>
                  ) 
                  : (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Provide Liquidity</span>
                    </div>
                  )}
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Protection Simulation Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-lg flex items-center">
              <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              {type === "buyer" ? "Protection Visualization" : "Risk Analysis"}
            </h3>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-100">
              BTC Price Scenarios
            </span>
          </div>
          
          <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl overflow-hidden">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : isError ? (
                <div className="absolute inset-0 flex items-center justify-center text-destructive">
                  <div className="text-center">
                    <svg className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Unable to generate simulation</p>
                  </div>
                </div>
              ) : simulationPoints && simulationPoints.length > 0 ? (
                <SimulationChart 
                  data={simulationPoints} 
                  type={type}
                  strikePrice={parameters.strikePrice}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <svg className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No simulation data available</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute top-2 right-2 flex space-x-1">
              <div className="bg-white/80 backdrop-blur-sm text-xs py-1 px-2 rounded-md shadow-sm border border-gray-200 text-gray-700 flex items-center">
                <svg className="h-3 w-3 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Drag to zoom
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100 shadow-sm">
              <div className="flex items-center text-xs text-blue-700 mb-1.5 font-medium">
                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {type === "buyer" ? "Protection Trigger" : "Obligation Level"}
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <div className="font-semibold text-blue-800 text-lg">
                  {formatCurrency(parameters.strikePrice, "USD", true)}
                </div>
              )}
              <div className="text-xs text-blue-600/80 mt-1.5">
                {parameters.strikePrice > 0 && (
                  <>{(parameters.strikePrice / parameters.currentPrice * 100).toFixed(0)}% of current price</>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100 shadow-sm">
              <div className="flex items-center text-xs text-blue-700 mb-1.5 font-medium">
                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {type === "buyer" ? "Max Recovery" : "Max Obligation"}
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <div className="font-semibold text-blue-800 text-lg">
                  {formatCurrency(maxRecovery, "USD", true)}
                </div>
              )}
              <div className="text-xs text-blue-600/80 mt-1.5">
                For {parameters.amount} BTC @ {formatCurrency(parameters.strikePrice)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100 shadow-sm">
              <div className="flex items-center text-xs text-blue-700 mb-1.5 font-medium">
                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {type === "buyer" ? "Break-even" : "Profit Threshold"}
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : isError || !calculationResult ? (
                <div className="font-medium">--</div>
              ) : (
                <div className="font-semibold text-blue-800 text-lg">
                  {formatCurrency(calculationResult.breakEvenPrice, "USD", true)}
                </div>
              )}
              <div className="text-xs text-blue-600/80 mt-1.5">
                {calculationResult && (
                  <>{(calculationResult.breakEvenPrice / parameters.currentPrice * 100).toFixed(0)}% of current price</>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="flex items-center text-xs text-blue-700 mb-1.5 font-medium">
                  <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {type === "buyer" ? "What happens if Bitcoin drops?" : "What happens if Bitcoin drops?"}
                </div>
                <div className="text-xs text-blue-600/90 mt-1.5 leading-relaxed">
                  {type === "buyer" 
                    ? "If Bitcoin drops below your protection level, you'll be compensated for the difference, offsetting your losses."
                    : "If Bitcoin drops below the obligation level, you'll need to provide liquidity at the agreed price, even if market price is lower."
                  }
                </div>
              </div>
              
              <div className="flex-1 sm:pl-4 sm:border-l sm:border-blue-200">
                <div className="flex items-center text-xs text-blue-700 mb-1.5 font-medium">
                  <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What if it rises?
                </div>
                <div className="text-xs text-blue-600/90 mt-1.5 leading-relaxed">
                  {type === "buyer" 
                    ? "If Bitcoin rises, you'll benefit from the upside while having paid a small premium for peace of mind."
                    : "If Bitcoin rises above your obligation level, you keep the premium with no further obligation."
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};