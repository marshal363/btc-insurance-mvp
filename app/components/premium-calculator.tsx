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

      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-12 gap-6">
        {/* Parameters section - 5 columns on desktop */}
        <div className="col-span-5 space-y-6">
          <ParameterInputs
            type={type}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
        
        {/* Results section - 7 columns on desktop */}
        <div className="col-span-7">
          <div className="grid grid-cols-1 gap-6">
            {/* Cost card */}
            <div>
              <PremiumResult
                type={type}
                calculationResult={adjustPremiumForType(premiumMutation.data)}
                parameters={parameters}
                simulationPoints={simulationMutation.data}
                isLoading={isLoading || premiumMutation.isPending}
                isError={isError || premiumMutation.isError}
              />
            </div>
            
            {/* Calculation method */}
            <div>
              <CalculationMethod
                parameters={parameters}
                calculationResult={premiumMutation.data}
                type={type}
              />
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