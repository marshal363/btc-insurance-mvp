import { useState } from "react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HelpCircle } from "lucide-react";
import { 
  OptionParameters, 
  BitcoinPriceData, 
  TimePeriodOption, 
  CalculatorTab 
} from "@/lib/types";
import { 
  formatCurrency, 
  calculateExpiryDate, 
  percentageToStrikePrice 
} from "@/lib/bitcoin";
import { Skeleton } from "@/components/ui/skeleton";

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
        const response = await fetch(`/api/bitcoin/volatility/${days}`);
        
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
  
  return (
    <div className="p-6">
      {/* Protected Value (Strike Price) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-primary/10 p-1.5 rounded-full mr-2">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <Label className="font-medium text-base">
              {type === "buyer" ? "Protected Value" : "Obligation Level"}
            </Label>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-4 text-sm">
              {type === "buyer" 
                ? "The price at which your Bitcoin is protected. You'll be compensated for price drops below this level."
                : "The price at which you're obligated to buy Bitcoin. If the price drops below this level, you'll buy at this price."}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground flex items-center">
              <span className={`inline-flex h-2 w-2 rounded-full ${strikePercentage >= 90 ? 'bg-primary' : 'bg-amber-500'} mr-1.5`}></span>
              {`${strikePercentage}% of Current Price`}
            </span>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : isError ? (
              <span className="text-sm font-medium text-destructive">Error</span>
            ) : (
              <span className="text-lg font-semibold">
                {formatCurrency(parameters.strikePrice, "USD", true)}
              </span>
            )}
          </div>
          {isLoading || isError ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="py-2">
              <Slider
                defaultValue={[100]}
                value={[strikePercentage]}
                onValueChange={handleStrikePercentageChange}
                max={100}
                min={70}
                step={1}
                className="ios-slider-track"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>70%</span>
                <span>80%</span>
                <span>90%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Protection Amount */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-primary/10 p-1.5 rounded-full mr-2">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Label className="font-medium text-base">
              {type === "buyer" ? "Protection Amount" : "Capital Commitment"}
            </Label>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-4 text-sm">
              {type === "buyer"
                ? "The amount of Bitcoin you want to protect with this option contract."
                : "The amount of Bitcoin you're obligated to buy if the price drops below the strike price."}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-primary font-medium">₿</span>
            </div>
            <Input
              type="text"
              id="amount"
              value={parameters.amount.toString()}
              onChange={handleAmountChange}
              className="ios-input pl-10 pr-20 h-14 text-lg font-medium"
              disabled={isLoading || isError}
            />
            <div className="absolute inset-y-0 right-0 flex items-center mr-4">
              <Select defaultValue="BTC">
                <SelectTrigger className="h-8 py-0 pl-2 pr-7 border-0 bg-transparent text-muted-foreground">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="sats">sats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Value: {isLoading || isError ? "Loading..." : formatCurrency(calculateUsdValue(), "USD", true)}
            </span>
            <div className="flex space-x-1">
              {[25, 50, 75, 100].map(percent => (
                <Button 
                  key={percent}
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAmount(percent)}
                  className={`h-8 min-w-[40px] rounded-full px-2 ${
                    (parameters.amount === 0.25 && percent === 25) ||
                    (parameters.amount === 0.5 && percent === 50) ||
                    (parameters.amount === 0.75 && percent === 75) ||
                    (parameters.amount === 1.0 && percent === 100)
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'border-gray-200'
                  }`}
                >
                  {percent}%
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Protection Period */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-primary/10 p-1.5 rounded-full mr-2">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Label className="font-medium text-base">
              {type === "buyer" ? "Protection Period" : "Income Period"}
            </Label>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-4 text-sm">
              {type === "buyer"
                ? "How long you want your Bitcoin to be protected. Longer periods typically cost more."
                : "Duration for which you're providing protection. Longer periods typically generate more income."}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-4 gap-3">
            {timePeriods.map((period) => (
              <div 
                key={period.id} 
                className={`flex flex-col items-center justify-center rounded-xl border p-3 cursor-pointer transition-all 
                  ${selectedPeriod === period.id 
                    ? 'bg-primary/10 border-primary/30 text-primary' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                onClick={() => handlePeriodChange(period.id)}
              >
                <span className="text-lg font-semibold">{period.days}</span>
                <span className="text-xs">days</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm flex justify-between items-center">
            <div className="text-muted-foreground">
              Expires on: <span className="font-medium">{calculateExpiryDate(parameters.timeToExpiry * 365)}</span>
            </div>
            {parameters.timeToExpiry > 0.082 && (
              <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                {parameters.timeToExpiry >= 0.25 ? 'Long-term' : 'Medium-term'} contract
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Parameters */}
      <div className="mb-6">
        <Collapsible
          open={isAdvancedOpen}
          onOpenChange={setIsAdvancedOpen}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-primary/10 p-1.5 rounded-full mr-2">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <Label className="font-medium text-base">Advanced Parameters</Label>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 h-8 text-primary">
                {isAdvancedOpen ? (
                  <>
                    <span>Hide</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Show</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="animate-in slide-in-from-top-5 duration-300">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="volatility" className="text-sm font-medium text-muted-foreground">
                      Historical Volatility
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-60 p-3 text-xs">
                        Volatility represents Bitcoin's price fluctuation intensity, affecting option premiums. Higher volatility increases premiums.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative rounded-md">
                    <Input
                      id="volatility"
                      type="text"
                      value={parameters.volatility.toFixed(1)}
                      onChange={handleVolatilityChange}
                      disabled={isLoading || isError}
                      className="ios-input pr-10 text-lg font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-primary font-medium">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="risk-free-rate" className="text-sm font-medium text-muted-foreground">
                      Risk-Free Rate
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-60 p-3 text-xs">
                        The risk-free interest rate (like US Treasury bonds yield) is used in option pricing. Higher rates generally increase put option costs.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative rounded-md">
                    <Input
                      id="risk-free-rate"
                      type="text"
                      value={parameters.riskFreeRate.toFixed(1)}
                      onChange={handleRiskFreeRateChange}
                      disabled={isLoading || isError}
                      className="ios-input pr-10 text-lg font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-primary font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground">
                <p>These parameters are used in the Black-Scholes option pricing model calculation. Default values are based on current market conditions.</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
