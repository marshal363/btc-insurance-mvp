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

  // Calculate expiry date with fixed format to avoid hydration errors
  const calculateExpiryDate = (days: number): string => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    // Use fixed date format to avoid hydration issues
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[expiryDate.getMonth()];
    const day = expiryDate.getDate();
    const year = expiryDate.getFullYear();
    
    return `${month} ${day}, ${year}`;
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium text-blue-600">
              {type === "buyer" ? "Protected Value" : "Obligation Level"}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="max-w-xs">
                  <p>{type === "buyer" 
                    ? "The price at which your protection activates. Lower values offer more protection but cost more premium." 
                    : "The price level where you must fulfill your obligation. Higher values mean less risk but lower premium income."
                  }</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-gray-900 flex items-center justify-end">
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <>
                  <span>{formatCurrency(parameters.strikePrice)}</span>
                  <span className={`ml-2 text-xs px-1.5 py-1 rounded ${
                    type === "buyer"
                      ? strikePercentage < 85 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      : strikePercentage > 90 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  }`}>
                    {type === "buyer"
                      ? strikePercentage < 85 ? "High Premium" : "Low Premium"
                      : strikePercentage > 90 ? "Low Income" : "High Income"
                    }
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {strikePercentage}% of current price
            </div>
          </div>
        </div>
        
        <div className="relative mt-4">
          <Slider 
            value={[strikePercentage]}
            onValueChange={handleStrikePercentageChange}
            max={100}
            min={70}
            step={1}
            disabled={isLoading || isError}
            className="mt-2"
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>More Protection {type === "buyer" ? "(Higher Cost)" : "(Higher Income)"}</span>
            <span>Less Protection {type === "buyer" ? "(Lower Cost)" : "(Lower Income)"}</span>
          </div>
          
          {/* Gradient background for slider - positioned below the slider */}
          <div className={`absolute top-2 h-2 rounded-full pointer-events-none ${
            type === "buyer"
              ? "bg-gradient-to-r from-green-500/20 to-red-500/20"
              : "bg-gradient-to-r from-red-500/20 to-green-500/20"
          }`} style={{
            left: "0%",
            width: "100%",
            zIndex: "-1"
          }}></div>
        </div>
      </div>
      
      {/* Amount */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium text-blue-600">
              {type === "buyer" ? "Protection Amount" : "Capital Commitment"}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="max-w-xs">
                  <p>{type === "buyer" 
                    ? "The amount of Bitcoin you want to protect. Higher amounts result in higher premiums but more protection." 
                    : "The amount of Bitcoin you're willing to commit. Higher amounts generate more income but increase potential obligations."
                  }</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculateUsdValue())}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              USD Value
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-blue-600 font-medium">₿</span>
          </div>
          <Input
            type="text"
            value={parameters.amount.toString()}
            onChange={handleAmountChange}
            className="pl-8 h-12 pr-24 border-blue-100 focus:border-blue-300 focus:ring-blue-200"
            disabled={isLoading || isError}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <span className="text-xs font-medium text-gray-500 mr-3">BTC</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-3">
          {[25, 50, 75, 100].map(percent => (
            <Button 
              key={percent}
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAmount(percent)}
              className={`flex-1 rounded-full border-blue-100 hover:bg-blue-50 hover:text-blue-600 ${
                parameters.amount === percent/100 ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-600'
              }`}
            >
              {percent === 25 && '0.25 BTC'}
              {percent === 50 && '0.50 BTC'}
              {percent === 75 && '0.75 BTC'}
              {percent === 100 && '1.00 BTC'}
            </Button>
          ))}
        </div>
        
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-600 flex items-start">
          <svg className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {type === "buyer"
              ? `For each 0.1 BTC protected, you'll pay approximately ${formatCurrency(0.002 * (bitcoinData && 'currentPrice' in bitcoinData ? bitcoinData.currentPrice : 0))} in premium.`
              : `For each 0.1 BTC committed, you'll earn approximately ${formatCurrency(0.002 * (bitcoinData && 'currentPrice' in bitcoinData ? bitcoinData.currentPrice : 0))} in premium income.`
            }
          </span>
        </div>
      </div>
      
      {/* Time Period */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium text-blue-600">
              {type === "buyer" ? "Protection Period" : "Income Period"}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="max-w-xs">
                  <p>{type === "buyer" 
                    ? "How long you want protection for. Longer periods result in higher premiums." 
                    : "How long you're committing capital. Longer periods generate more premium income but extend your obligation."
                  }</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              Expires on: <span className="text-blue-600">{calculateExpiryDate(parameters.timeToExpiry * 365)}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 mt-2">
          {timePeriods.map((period) => (
            <Button 
              key={period.id}
              variant={selectedPeriod === period.id ? "default" : "outline"}
              className={`h-auto py-3 px-3 flex flex-col items-center rounded-xl transition-all ${
                selectedPeriod === period.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border-blue-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
              }`}
              onClick={() => handlePeriodChange(period.id)}
            >
              <span className="text-lg font-semibold">{period.days}</span>
              <span className="text-xs mt-0.5">days</span>
              {selectedPeriod === period.id && (
                <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white`}>
                  {period.days <= 90 ? 'Short Term' : period.days <= 180 ? 'Medium Term' : 'Long Term'}
                </div>
              )}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-3 mt-2">
          {timePeriods.map((period) => (
            <div key={`info-${period.id}`} className={`text-center text-xs ${
              selectedPeriod === period.id ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {period.days === 30 && 'Lower Cost'}
              {period.days === 90 && 'Balanced'}
              {period.days === 180 && 'Strategic'}
              {period.days === 360 && 'Maximum Coverage'}
            </div>
          ))}
        </div>
        
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-600 flex items-start">
          <svg className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {type === "buyer"
              ? `Longer protection periods usually cost more but provide extended downside coverage.`
              : `Longer commitment periods generally earn more premium but extend your capital lockup period.`
            }
          </span>
        </div>
      </div>
      
      {/* Advanced Parameters (Toggle) */}
      <Collapsible
        open={isAdvancedOpen}
        onOpenChange={setIsAdvancedOpen}
        className="mt-6 border-t border-gray-100 pt-4"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex justify-between items-center rounded-lg bg-blue-50/50 hover:bg-blue-50 text-blue-700 border border-blue-100 py-2"
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Advanced Parameters</span>
            </div>
            <span className="text-xs text-blue-500">
              {isAdvancedOpen ? "Hide" : "Show"}
            </span>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 mt-4 px-1 pt-2 pb-2 rounded-lg">
          {/* Volatility */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium text-blue-600">
                  Volatility (%)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                        <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start" className="max-w-xs">
                      <p>The expected price fluctuation of Bitcoin over the protection period. Higher volatility increases premium costs.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {parameters.volatility.toFixed(1)}%
              </div>
            </div>
            
            <div className="relative">
              <Input
                type="range"
                min="10"
                max="120"
                step="0.1"
                value={parameters.volatility.toString()}
                onChange={handleVolatilityChange}
                className="h-12 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Low (10%)</span>
                <span>Typical (60%)</span>
                <span>High (120%)</span>
              </div>
            </div>
            
            <div className="mt-2 p-1.5 bg-blue-50 rounded border border-blue-100 text-xs text-blue-600">
              Bitcoin's historical 30-day volatility: {bitcoinData?.historicalVolatility.toFixed(1) || "Loading..."}%
            </div>
          </div>
          
          {/* Risk-Free Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium text-blue-600">
                  Risk-Free Rate (%)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                        <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start" className="max-w-xs">
                      <p>The baseline interest rate used in the Black-Scholes model. Typically uses the rate of Treasury bonds matching the option duration.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {parameters.riskFreeRate.toFixed(2)}%
              </div>
            </div>
            
            <div className="relative">
              <Input
                type="range"
                min="0"
                max="10"
                step="0.01"
                value={parameters.riskFreeRate.toString()}
                onChange={handleRiskFreeRateChange}
                className="h-12 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
              </div>
            </div>
            
            <div className="mt-2 p-1.5 bg-blue-50 rounded border border-blue-100 text-xs text-blue-600">
              Current typical rate for {Math.round(parameters.timeToExpiry * 365)}-day US Treasury: 4.5%
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};