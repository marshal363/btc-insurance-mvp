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
  
  // For the initial migration, we'll render a placeholder
  // This will be replaced later with the actual components
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-xl font-semibold mb-4">
        {type === "buyer" ? "Protection Buyer Calculator" : "Liquidity Provider Calculator"}
      </h3>
      <p className="text-muted-foreground">
        The premium calculator is currently being migrated to Next.js. 
        This is a placeholder that will be replaced with the full component soon.
      </p>
      
      <div className="mt-4 p-4 bg-primary/5 rounded-lg">
        <h4 className="font-medium mb-2">Current Parameters:</h4>
        <ul className="text-sm space-y-1">
          <li><span className="font-medium">Current Price:</span> ${parameters.currentPrice.toFixed(2)}</li>
          <li><span className="font-medium">Strike Price:</span> ${parameters.strikePrice.toFixed(2)}</li>
          <li><span className="font-medium">Time Period:</span> {(parameters.timeToExpiry * 365).toFixed(0)} days</li>
          <li><span className="font-medium">Amount:</span> {parameters.amount} BTC</li>
          <li><span className="font-medium">Volatility:</span> {parameters.volatility.toFixed(2)}%</li>
        </ul>
      </div>
      
      {premiumMutation.data && (
        <div className="mt-4 p-4 bg-success/5 rounded-lg">
          <h4 className="font-medium mb-2">Calculated Premium:</h4>
          <p className="text-xl font-bold">
            {(premiumMutation.data.premium * 1000).toFixed(0)} mBTC
            <span className="text-sm font-normal ml-2 text-muted-foreground">
              (${premiumMutation.data.premiumUsd.toFixed(2)})
            </span>
          </p>
        </div>
      )}
    </div>
  );
};