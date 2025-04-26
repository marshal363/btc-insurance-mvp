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
  
  // Time period options
  const timePeriods: TimePeriodOption[] = [
    { id: "30d", label: "30 Days", days: 30 },
    { id: "60d", label: "60 Days", days: 60 },
    { id: "90d", label: "90 Days", days: 90 },
    { id: "custom", label: "Custom", days: 30 }
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
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    const selectedPeriod = timePeriods.find(p => p.id === value);
    if (selectedPeriod) {
      onParameterChange({ timeToExpiry: selectedPeriod.days / 365 });
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
    <div>
      {/* Protected Value (Strike Price) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="font-medium">
            {type === "buyer" ? "Protected Value (Strike Price)" : "Obligation Level (Strike Price)"}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-80">
              {type === "buyer" 
                ? "The price at which your Bitcoin is protected. You'll be compensated for price drops below this level."
                : "The price at which you're obligated to buy Bitcoin. If the price drops below this level, you'll buy at this price."}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {`${strikePercentage}% of Current Price`}
            </span>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : isError ? (
              <span className="text-sm font-medium text-destructive">Error</span>
            ) : (
              <span className="text-sm font-medium">
                {formatCurrency(parameters.strikePrice)}
              </span>
            )}
          </div>
          {isLoading || isError ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            <Slider
              defaultValue={[100]}
              value={[strikePercentage]}
              onValueChange={handleStrikePercentageChange}
              max={100}
              min={70}
              step={1}
              className="w-full"
            />
          )}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>70%</span>
            <span>80%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Protection Amount */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="font-medium">
            {type === "buyer" ? "Protection Amount" : "Capital Commitment"}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-80">
              {type === "buyer"
                ? "The amount of Bitcoin you want to protect with this option contract."
                : "The amount of Bitcoin you're obligated to buy if the price drops below the strike price."}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted-foreground sm:text-sm">₿</span>
          </div>
          <Input
            type="text"
            id="amount"
            value={parameters.amount.toString()}
            onChange={handleAmountChange}
            className="pl-10 pr-20"
            disabled={isLoading || isError}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Select defaultValue="BTC">
              <SelectTrigger className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-muted-foreground sm:text-sm">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="sats">sats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground flex justify-between">
          <span>Value: {isLoading || isError ? "Loading..." : formatCurrency(calculateUsdValue())}</span>
          <div className="flex space-x-2">
            <Button variant="link" size="sm" className="text-primary h-4 p-0" onClick={() => handleQuickAmount(25)}>25%</Button>
            <Button variant="link" size="sm" className="text-primary h-4 p-0" onClick={() => handleQuickAmount(50)}>50%</Button>
            <Button variant="link" size="sm" className="text-primary h-4 p-0" onClick={() => handleQuickAmount(75)}>75%</Button>
            <Button variant="link" size="sm" className="text-primary h-4 p-0" onClick={() => handleQuickAmount(100)}>100%</Button>
          </div>
        </div>
      </div>

      {/* Protection Period */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="font-medium">
            {type === "buyer" ? "Protection Period" : "Income Period"}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-80">
              {type === "buyer"
                ? "How long you want your Bitcoin to be protected. Longer periods typically cost more."
                : "Duration for which you're providing protection. Longer periods typically generate more income."}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="bg-primary-50 rounded-lg p-4">
          <RadioGroup 
            value={selectedPeriod} 
            onValueChange={handlePeriodChange}
            disabled={isLoading || isError}
            className="flex flex-wrap gap-4"
          >
            {timePeriods.map((period) => (
              <div key={period.id} className="flex items-center">
                <RadioGroupItem id={period.id} value={period.id} />
                <Label htmlFor={period.id} className="ml-2 text-sm">
                  {period.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="mt-3 text-sm text-muted-foreground">
            Expires on: {calculateExpiryDate(parameters.timeToExpiry * 365)}
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
          <div className="flex items-center justify-between mb-2">
            <Label className="font-medium">Advanced Parameters</Label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                {isAdvancedOpen ? "Hide" : "Show"}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="volatility" className="text-xs font-medium text-muted-foreground mb-1 block">
                    Volatility
                  </Label>
                  <div className="relative rounded-md shadow-sm">
                    <Input
                      id="volatility"
                      type="text"
                      value={parameters.volatility.toFixed(1)}
                      onChange={handleVolatilityChange}
                      disabled={isLoading || isError}
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-muted-foreground sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="risk-free-rate" className="text-xs font-medium text-muted-foreground mb-1 block">
                    Risk-Free Rate
                  </Label>
                  <div className="relative rounded-md shadow-sm">
                    <Input
                      id="risk-free-rate"
                      type="text"
                      value={parameters.riskFreeRate.toFixed(1)}
                      onChange={handleRiskFreeRateChange}
                      disabled={isLoading || isError}
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-muted-foreground sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
