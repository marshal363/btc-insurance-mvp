'use client';

import React from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
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

  // Format helpers
  const formatCurrency = (amount: number, currency: string = "USD", ios: boolean = false): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
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
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits: minimumFractionDigits,
    });
    
    return formatter.format(percent / 100);
  };
  
  return (
    <div className="space-y-6">
      {/* Premium Estimate Card */}
      <div className="overflow-hidden bg-gradient-to-br from-primary to-primary-700 text-white rounded-xl shadow-sm">
        <div className="p-6">
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
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              type === "buyer" 
                ? 'bg-blue-400/30 text-blue-50' 
                : 'bg-green-400/30 text-green-50'
            }`}>
              {type === "buyer" ? "Protection Premium" : "Liquidity Premium"}
            </span>
          </div>
          
          <div className="bg-white/10 rounded-2xl backdrop-blur-sm p-6 mt-2">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Skeleton className="h-12 w-48 bg-white/20" />
                <Skeleton className="h-6 w-36 mt-2 bg-white/20" />
              </div>
            ) : isError ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-white/70">Error loading data</div>
                <p className="text-sm text-white/50 mt-1">Please try again later</p>
              </div>
            ) : calculationResult ? (
              <div className="flex flex-col items-center">
                <div className="flex items-baseline">
                  <span className="premium-value text-4xl font-bold">{formatBTC(calculationResult.premium)}</span>
                  <div className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                    type === "buyer" 
                      ? 'bg-red-500/20 text-red-100' 
                      : 'bg-green-500/20 text-green-100'
                  }`}>
                    {type === "buyer" ? "YOU PAY" : "YOU EARN"}
                  </div>
                </div>
                <span className="text-white/80 mt-1 text-lg">
                  {formatCurrency(calculationResult.premiumUsd, "USD", true)}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-white/70">No data available</div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm text-white/70 mb-1">Premium Rate</div>
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
              
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm text-white/70 mb-1">APY Equivalent</div>
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
            <Button className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-base h-12">
              {type === "buyer" 
                ? (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Get Bitcoin Protection</span>
                  </div>
                ) 
                : (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Provide Liquidity</span>
                  </div>
                )}
            </Button>
          </div>
        </div>
      </div>

      {/* Protection Simulation Card - Placeholder for now */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-base flex items-center">
              <div className="bg-primary/10 p-1.5 rounded-full mr-2">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              {type === "buyer" ? "Protection Visualization" : "Risk Analysis"}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
              BTC Price Scenarios
            </span>
          </div>
          
          <div className="h-[180px] relative bg-gray-50 rounded-xl overflow-hidden">
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
          
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                {type === "buyer" ? "Protection Trigger" : "Obligation Level"}
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-full" />
              ) : (
                <div className="font-medium">
                  {formatCurrency(parameters.strikePrice, "USD", true)}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                {type === "buyer" ? "Max Recovery" : "Max Obligation"}
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-full" />
              ) : (
                <div className="font-medium">
                  {formatCurrency(maxRecovery, "USD", true)}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                {type === "buyer" ? "Break-even" : "Profit Threshold"}
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-full" />
              ) : isError || !calculationResult ? (
                <div className="font-medium">--</div>
              ) : (
                <div className="font-medium">
                  {formatCurrency(calculationResult.breakEvenPrice, "USD", true)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};