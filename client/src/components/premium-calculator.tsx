import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ParameterInputs } from "@/components/parameter-inputs";
import { PremiumResult } from "@/components/premium-result";
import { CalculationMethod } from "@/components/calculation-method";
import { 
  OptionParameters, 
  BitcoinPriceData, 
  PremiumCalculationResult, 
  SimulationPoint,
  CalculatorTab
} from "@/lib/types";
import { calculatePremium, generateSimulationPoints } from "@/lib/bitcoin";

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
  // Default parameters
  const defaultParams: OptionParameters = {
    currentPrice: bitcoinData?.currentPrice || 0,
    strikePrice: bitcoinData?.currentPrice || 0,
    timeToExpiry: 30 / 365, // 30 days in years
    volatility: bitcoinData?.historicalVolatility || 0,
    riskFreeRate: 4.5, // Default risk-free rate (%)
    amount: 0.25 // Default BTC amount
  };
  
  const [parameters, setParameters] = useState<OptionParameters>(defaultParams);
  
  // Update parameters when bitcoin data changes
  useEffect(() => {
    if (bitcoinData && !isLoading && !isError) {
      setParameters(prev => ({
        ...prev,
        currentPrice: bitcoinData.currentPrice,
        strikePrice: bitcoinData.currentPrice,
        volatility: bitcoinData.historicalVolatility
      }));
    }
  }, [bitcoinData, isLoading, isError]);
  
  // Premium calculation mutation
  const premiumMutation = useMutation({
    mutationFn: (params: OptionParameters) => calculatePremium(params),
    onError: (error) => {
      console.error("Failed to calculate premium:", error);
    }
  });
  
  // Simulation points mutation
  const simulationMutation = useMutation({
    mutationFn: (params: OptionParameters) => generateSimulationPoints(params),
    onError: (error) => {
      console.error("Failed to generate simulation:", error);
    }
  });
  
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
      
      <CalculationMethod
        parameters={parameters}
        calculationResult={premiumMutation.data}
        type={type}
      />
    </div>
  );
};
