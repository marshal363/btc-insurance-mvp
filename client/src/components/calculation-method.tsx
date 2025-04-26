import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercentage } from "@/lib/bitcoin";
import { OptionParameters, PremiumCalculationResult, CalculatorTab } from "@/lib/types";

interface CalculationMethodProps {
  parameters: OptionParameters;
  calculationResult?: PremiumCalculationResult;
  type: CalculatorTab;
}

export const CalculationMethod = ({
  parameters,
  calculationResult,
  type
}: CalculationMethodProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-8 bg-primary-50 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg">How This Is Calculated</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost">
            {isOpen ? "Hide Details" : "Show Details"}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm mb-2">Black-Scholes Model</h4>
            <p className="text-sm text-muted-foreground">
              The premium is calculated using the Black-Scholes option pricing model adjusted for Bitcoin's specific characteristics:
            </p>
            <div className="mt-2 bg-card rounded p-3 font-mono text-xs overflow-auto">
              <pre>P = K * e^(-r * T) * N(-d2) - S * N(-d1)</pre>
              <pre>where:</pre>
              <pre>d1 = (ln(S/K) + (r + σ²/2) * T) / (σ * √T)</pre>
              <pre>d2 = d1 - σ * √T</pre>
              <pre>S = current price</pre>
              <pre>K = strike price</pre>
              <pre>r = risk-free rate</pre>
              <pre>T = time to expiration (years)</pre>
              <pre>σ = volatility</pre>
              <pre>N = cumulative normal distribution</pre>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Key Inputs Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Bitcoin Price</span>
                <span className="font-medium">{formatCurrency(parameters.currentPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Protected Value (Strike)</span>
                <span className="font-medium">
                  {formatCurrency(parameters.strikePrice)} 
                  ({((parameters.strikePrice / parameters.currentPrice) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Protection Period</span>
                <span className="font-medium">
                  {Math.round(parameters.timeToExpiry * 365)} days 
                  ({parameters.timeToExpiry.toFixed(4)} years)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volatility (30-day historical)</span>
                <span className="font-medium">{parameters.volatility.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Risk-Free Rate</span>
                <span className="font-medium">{parameters.riskFreeRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount Covered</span>
                <span className="font-medium">
                  {parameters.amount.toFixed(4)} BTC 
                  ({formatCurrency(parameters.amount * parameters.currentPrice)})
                </span>
              </div>
            </div>
            
            {calculationResult && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm mb-2">Option Greeks</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Delta</span>
                    <span className="font-medium">{calculationResult.delta.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gamma</span>
                    <span className="font-medium">{calculationResult.gamma.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Theta</span>
                    <span className="font-medium">{calculationResult.theta.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Vega</span>
                    <span className="font-medium">{calculationResult.vega.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
