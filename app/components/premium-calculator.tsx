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
    const basePrice = bitcoinData?.currentPrice || 0;
    
    // For sellers (who provide liquidity), we use a different default strike price
    // Typically 5-10% below current price for sellers
    const adjustedStrikePrice = type === "seller" 
      ? basePrice * 0.9  // 90% of current price for sellers - more attractive to provide protection
      : basePrice;       // 100% of current price for buyers - full protection
      
    // Default amount is also different - sellers typically provide more capital
    const defaultAmount = type === "seller" ? 0.5 : 0.25;
    
    return {
      currentPrice: basePrice,
      strikePrice: adjustedStrikePrice,
      timeToExpiry: 30 / 365, // 30 days in years
      volatility: bitcoinData?.historicalVolatility || 0,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Parameters section - hidden on mobile when results view is active */}
        <div 
          className={`col-span-2 space-y-6 ${mobileView === "results" ? "hidden md:block" : ""}`}
        >
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
        <div 
          className={`flex flex-col space-y-6 ${mobileView === "inputs" ? "hidden md:block" : ""}`}
        >
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
      
      {/* Calculation method - always visible */}
      <div className={`mt-6 pt-6 ${mobileView === "inputs" ? "hidden md:block" : ""}`}>
        <CalculationMethod
          parameters={parameters}
          calculationResult={premiumMutation.data}
          type={type}
        />
      </div>
    </div>
  );
};