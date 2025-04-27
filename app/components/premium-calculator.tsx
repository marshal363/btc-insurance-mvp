'use client';

import React, { useState, useEffect } from "react";
import { 
  OptionParameters, 
  BitcoinPriceData, 
  PremiumCalculationResult, 
  SimulationPoint,
  CalculatorTab
} from "../lib/types";
import { usePremiumCalculation } from "../hooks/use-option-premium";
import { useSimulationPoints } from "../hooks/use-simulation-points";
import { ParameterInputs } from "./parameter-inputs";
import { PremiumResult } from "./premium-result";
import { CalculationMethod } from "./calculation-method";
import { SimulationChart } from "./simulation-chart";

// Helper components
const Spinner = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className || ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// For mobile navigation between parameters and results
type MobileView = "inputs" | "results";

interface PremiumCalculatorProps {
  type: CalculatorTab;
  bitcoinData?: BitcoinPriceData;
  isLoading: boolean;
  isError: boolean;
}

export const PremiumCalculator = ({ 
  type, 
  bitcoinData,
  isLoading,
  isError
}: PremiumCalculatorProps) => {
  // Default parameters with customization based on buyer/seller
  const getDefaultParameters = (): OptionParameters => {
    // Use a fixed default price initially to avoid hydration errors
    const basePrice = bitcoinData?.currentPrice || 50000; // Use fixed fallback
    
    // Round values to avoid floating point precision issues that might cause hydration errors
    const roundedBasePrice = Math.round(basePrice * 100) / 100;
    
    // For sellers (who provide liquidity), we use a different default strike price
    // Typically 5-10% below current price for sellers
    const adjustedStrikePrice = type === "seller" 
      ? Math.round(roundedBasePrice * 0.9 * 100) / 100  // 90% of current price for sellers
      : roundedBasePrice;       // 100% of current price for buyers
      
    // Default amount is also different - sellers typically provide more capital
    const defaultAmount = type === "seller" ? 0.5 : 0.25;
    
    // Use a fixed volatility initially to avoid hydration errors
    const defaultVolatility = bitcoinData?.historicalVolatility || 60;
    
    return {
      currentPrice: roundedBasePrice,
      strikePrice: adjustedStrikePrice,
      timeToExpiry: 30 / 365, // 30 days in years
      volatility: defaultVolatility,
      riskFreeRate: 4.5, // Default risk-free rate (%)
      amount: defaultAmount // Default BTC amount varies by type
    };
  };
  
  // State for parameters and mobile view toggle
  const [parameters, setParameters] = useState<OptionParameters>(getDefaultParameters());
  const [mobileView, setMobileView] = useState<MobileView>("inputs");
  
  // Update parameters when bitcoin data or type changes
  useEffect(() => {
    if (bitcoinData && !isLoading && !isError) {
      const updatedParams = getDefaultParameters();
      setParameters(prev => ({
        ...prev,
        currentPrice: updatedParams.currentPrice,
        strikePrice: updatedParams.strikePrice,
        volatility: updatedParams.volatility,
        amount: updatedParams.amount
      }));
    }
  }, [bitcoinData, isLoading, isError, type]); // Add type to dependencies
  
  // Use our custom hooks for premium calculation and simulation points
  const premiumMutation = usePremiumCalculation();
  const simulationMutation = useSimulationPoints();
  
  // Calculate premium when parameters change
  useEffect(() => {
    if (parameters.currentPrice > 0 && !isLoading && !isError) {
      premiumMutation.mutate(parameters);
      simulationMutation.mutate(parameters);
    }
  }, [parameters, isLoading, isError]);
  
  // Handle parameter changes
  const handleParameterChange = (updatedParams: Partial<OptionParameters>) => {
    setParameters(prev => ({
      ...prev,
      ...updatedParams
    }));
  };
  
  // Invert premium calculation result for seller
  const adjustPremiumForType = (result: PremiumCalculationResult | undefined): PremiumCalculationResult | undefined => {
    if (!result) return undefined;
    
    if (type === "seller") {
      return {
        ...result,
        delta: -result.delta,
        theta: -result.theta
      };
    }
    
    return result;
  };
  
  return (
    <div className="p-4 sm:p-6">
      {/* Mobile tab navigation */}
      <div className="md:hidden mb-6">
        <div className="flex w-full p-1 bg-gray-100 rounded-full">
          <button
            className={`flex-1 text-center py-2.5 px-4 text-sm font-medium rounded-full transition-all ${
              mobileView === "inputs" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMobileView("inputs")}
          >
            Parameters
          </button>
          <button
            className={`flex-1 text-center py-2.5 px-4 text-sm font-medium rounded-full transition-all ${
              mobileView === "results" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setMobileView("results")}
          >
            Results
          </button>
        </div>
      </div>

      {/* Desktop layout - New arrangement based on provided mockup */}
      <div className="hidden md:grid md:grid-cols-12 gap-6">
        {/* Parameters section - 6 columns on desktop */}
        <div className="col-span-6 row-span-2">
          <ParameterInputs
            type={type}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
        
        {/* Right column layout */}
        <div className="col-span-6 grid grid-rows-2 gap-6">
          {/* Cost card - Top right */}
          <div className="row-span-1">
            <div className="bg-blue-600 rounded-xl text-white h-full">
              <PremiumResult
                type={type}
                calculationResult={adjustPremiumForType(premiumMutation.data)}
                parameters={parameters}
                simulationPoints={simulationMutation.data}
                isLoading={isLoading || premiumMutation.isPending}
                isError={isError || premiumMutation.isError}
              />
            </div>
          </div>
          
          {/* Visualization - Bottom right */}
          <div className="row-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 h-full">
              <h3 className="font-medium text-lg mb-2">
                Protection Visualization
              </h3>
              {simulationMutation.isPending || isLoading ? (
                <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : simulationMutation.isError || isError ? (
                <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <h3 className="text-base font-medium mb-2">Error</h3>
                    <p className="text-sm text-gray-500">
                      Unable to load simulation data
                    </p>
                  </div>
                </div>
              ) : (
                simulationMutation.data && (
                  <SimulationChart 
                    data={simulationMutation.data} 
                    type={type}
                    strikePrice={parameters.strikePrice} 
                  />
                )
              )}
              
              {/* Key metrics under the chart */}
              {!simulationMutation.isPending && !isLoading && !simulationMutation.isError && !isError && premiumMutation.data && (
                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-blue-500 mb-1">Protection Trigger</div>
                    <div className="text-base font-medium text-blue-700">
                      ${Math.round(parameters.strikePrice).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-400">
                      {Math.round((parameters.strikePrice / parameters.currentPrice) * 100)}% of current price
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-blue-500 mb-1">Max Recovery</div>
                    <div className="text-base font-medium text-blue-700">
                      ${Math.round(parameters.strikePrice * parameters.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-400">
                      For {parameters.amount} BTC @ ${Math.round(parameters.strikePrice).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-blue-500 mb-1">Break-even</div>
                    <div className="text-base font-medium text-blue-700">
                      ${Math.round(premiumMutation.data.breakEvenPrice).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-400">
                      {Math.round((premiumMutation.data.breakEvenPrice / parameters.currentPrice) * 100)}% of current price
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scenario explanations */}
              {!simulationMutation.isPending && !isLoading && !simulationMutation.isError && !isError && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">
                      What happens if Bitcoin drops?
                    </div>
                    <div className="text-xs text-blue-600">
                      If Bitcoin drops below your protection level, you'll be compensated for the difference, offsetting your losses.
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">
                      What if it rises?
                    </div>
                    <div className="text-xs text-blue-600">
                      If Bitcoin rises, you'll benefit from the upside while having paid a small premium for peace of mind.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Mobile tab navigation already exists above */}
        
        {/* Parameters section - hidden on mobile when results view is active */}
        <div className={`space-y-6 ${mobileView === "results" ? "hidden" : ""}`}>
          <ParameterInputs
            type={type}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
        
        {/* Results section - hidden on mobile when inputs view is active */}
        <div className={`space-y-6 ${mobileView === "inputs" ? "hidden" : ""}`}>
          <PremiumResult
            type={type}
            calculationResult={adjustPremiumForType(premiumMutation.data)}
            parameters={parameters}
            simulationPoints={simulationMutation.data}
            isLoading={isLoading || premiumMutation.isPending}
            isError={isError || premiumMutation.isError}
          />
          
          <CalculationMethod
            parameters={parameters}
            calculationResult={premiumMutation.data}
            type={type}
          />
        </div>
      </div>
    </div>
  );
};