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
  
  const [parameters, setParameters] = useState<OptionParameters>(getDefaultParameters());
  
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
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <ParameterInputs
            type={type}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
        
        <div className="flex flex-col space-y-6">
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
    </div>
  );
};