'use client';

import React, { useState } from "react";
// Import UI components with absolute paths from the app directory
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../components/ui/tooltip";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { HelpCircle } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

import { 
  OptionParameters, 
  BitcoinPriceData, 
  TimePeriodOption, 
  CalculatorTab 
} from "../lib/types";

interface ParameterInputsProps {
  type: CalculatorTab;
  parameters: OptionParameters;
  onParameterChange: (params: Partial<OptionParameters>) => void;
  bitcoinData?: BitcoinPriceData;
  isLoading: boolean;
  isError: boolean;
}

export const ParameterInputs = ({
  type,
  parameters,
  onParameterChange,
  bitcoinData,
  isLoading,
  isError
}: ParameterInputsProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30d");
  const [strikePercentage, setStrikePercentage] = useState<number>(100);
  
  // Time period options - updated to match exact requirements
  const timePeriods: TimePeriodOption[] = [
    { id: "30d", label: "30 Days", days: 30 },
    { id: "90d", label: "90 Days", days: 90 },
    { id: "180d", label: "180 Days", days: 180 },
    { id: "360d", label: "360 Days", days: 360 }
  ];
  
  // Handle strike price percentage change
  const handleStrikePercentageChange = (value: number[]) => {
    const percentage = value[0];
    setStrikePercentage(percentage);
    
    if (bitcoinData) {
      const newStrikePrice = percentageToStrikePrice(bitcoinData.currentPrice, percentage);
      onParameterChange({ strikePrice: newStrikePrice });
    }
  };
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value);
    if (!isNaN(amount)) {
      onParameterChange({ amount });
    }
  };
  
  // Handle quick amount selection
  const handleQuickAmount = (percentage: number) => {
    // In a real app, this would be based on the user's wallet balance
    // For now, we'll just set fixed amounts
    const amounts = {
      25: 0.25,
      50: 0.5,
      75: 0.75,
      100: 1.0
    };
    
    onParameterChange({ amount: amounts[percentage as keyof typeof amounts] });
  };
  
  // Handle time period change
  const handlePeriodChange = async (value: string) => {
    setSelectedPeriod(value);
    const selectedPeriod = timePeriods.find(p => p.id === value);
    
    if (selectedPeriod) {
      // Update timeToExpiry
      onParameterChange({ timeToExpiry: selectedPeriod.days / 365 });
      
      // Update volatility based on time period
      try {
        const days = selectedPeriod.days;
        
        // Skip for custom period
        if (value === "custom") return;
        
        // Fetch volatility for the selected time period
        const response = await fetch(`/api/bitcoin/volatility?days=${days}`);
        
        if (response.ok) {
          const data = await response.json();
          onParameterChange({ volatility: data.volatility });
        }
      } catch (error) {
        console.error("Error fetching volatility for period:", error);
      }
    }
  };
  
  // Handle volatility change
  const handleVolatilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volatility = parseFloat(e.target.value);
    if (!isNaN(volatility)) {
      onParameterChange({ volatility });
    }
  };
  
  // Handle risk-free rate change
  const handleRiskFreeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const riskFreeRate = parseFloat(e.target.value);
    if (!isNaN(riskFreeRate)) {
      onParameterChange({ riskFreeRate });
    }
  };
  
  // Calculate USD value
  const calculateUsdValue = () => {
    if (bitcoinData && parameters.amount) {
      return bitcoinData.currentPrice * parameters.amount;
    }
    return 0;
  };

  // Format currency for display
  const formatCurrency = (amount: number, currency: string = "USD", ios: boolean = false): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  };

  // Format percentage for display
  const formatPercentage = (percent: number, minimumFractionDigits: number = 2): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits: minimumFractionDigits,
    });
    
    return formatter.format(percent / 100);
  };

  // Calculate expiry date
  const calculateExpiryDate = (days: number): string => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate strike price from percentage
  const percentageToStrikePrice = (currentPrice: number, percentage: number): number => {
    return (percentage / 100) * currentPrice;
  };
  
  // For the initial migration, let's display a simplified version
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-medium text-lg mb-4">
        {type === "buyer" ? "Protection Parameters" : "Liquidity Parameters"}
      </h3>
      
      {/* Strike Price / Protected Value */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm text-muted-foreground">
            {type === "buyer" ? "Protected Value" : "Obligation Level"}
          </Label>
          <div className="text-right">
            <div className="text-lg font-semibold">
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                formatCurrency(parameters.strikePrice)
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {strikePercentage}% of current price
            </div>
          </div>
        </div>
        
        <Slider 
          value={[strikePercentage]}
          onValueChange={handleStrikePercentageChange}
          max={100}
          min={70}
          step={1}
          disabled={isLoading || isError}
          className="mt-2"
        />
      </div>
      
      {/* Amount */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">
          {type === "buyer" ? "Protection Amount" : "Capital Commitment"}
        </Label>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-primary font-medium">₿</span>
          </div>
          <Input
            type="text"
            value={parameters.amount.toString()}
            onChange={handleAmountChange}
            className="pl-8 h-12"
            disabled={isLoading || isError}
          />
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Value: {formatCurrency(calculateUsdValue())}
        </div>
        
        <div className="flex space-x-2 mt-2">
          {[25, 50, 75, 100].map(percent => (
            <Button 
              key={percent}
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAmount(percent)}
              className="rounded-full"
            >
              {percent}%
            </Button>
          ))}
        </div>
      </div>
      
      {/* Time Period */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">
          {type === "buyer" ? "Protection Period" : "Income Period"}
        </Label>
        
        <div className="grid grid-cols-4 gap-2">
          {timePeriods.map((period) => (
            <Button 
              key={period.id}
              variant={selectedPeriod === period.id ? "default" : "outline"}
              className="h-auto py-2 px-3 flex flex-col items-center"
              onClick={() => handlePeriodChange(period.id)}
            >
              <span className="text-lg font-semibold">{period.days}</span>
              <span className="text-xs">days</span>
            </Button>
          ))}
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Expires on: {calculateExpiryDate(parameters.timeToExpiry * 365)}
        </div>
      </div>
      
      {/* Advanced Parameters (Toggle) */}
      <Collapsible
        open={isAdvancedOpen}
        onOpenChange={setIsAdvancedOpen}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full flex justify-between mb-2">
            <span>Advanced Parameters</span>
            <HelpCircle className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          {/* Volatility */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Volatility (%)
            </Label>
            <Input
              type="number"
              value={parameters.volatility.toString()}
              onChange={handleVolatilityChange}
              className="h-12"
            />
          </div>
          
          {/* Risk-Free Rate */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Risk-Free Rate (%)
            </Label>
            <Input
              type="number"
              value={parameters.riskFreeRate.toString()}
              onChange={handleRiskFreeRateChange}
              className="h-12"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};