import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercentage, formatBTC } from "@/lib/bitcoin";
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
        <h3 className="font-medium text-lg">
          {type === "buyer" ? "How Your Protection is Calculated" : "How Your Income is Calculated"} 
        </h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost">
            {isOpen ? "Hide Details" : "Show Details"}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm mb-2">
              {type === "buyer" 
                ? "Bitcoin PUT Option (Protection)" 
                : "Bitcoin PUT Option (Income Generation)"}
            </h4>
            <p className="text-sm text-muted-foreground">
              {type === "buyer" 
                ? "Your protection premium is calculated using the Black-Scholes option pricing model adjusted for Bitcoin's specific characteristics:" 
                : "Your income from providing liquidity is calculated using the Black-Scholes option pricing model adjusted for Bitcoin:"
              }
            </p>
            <div className="mt-2 bg-card rounded p-3 font-mono text-xs overflow-auto">
              <pre>P = K * e^(-r * T) * N(-d2) - S * N(-d1)</pre>
              <pre>where:</pre>
              <pre>d1 = (ln(S/K) + (r + σ²/2) * T) / (σ * √T)</pre>
              <pre>d2 = d1 - σ * √T</pre>
              <pre>S = current price (${formatCurrency(parameters.currentPrice)})</pre>
              <pre>K = strike price (${formatCurrency(parameters.strikePrice)})</pre>
              <pre>r = risk-free rate ({parameters.riskFreeRate}%)</pre>
              <pre>T = time to expiration ({parameters.timeToExpiry.toFixed(4)} years)</pre>
              <pre>σ = volatility ({parameters.volatility.toFixed(1)}%)</pre>
              <pre>N = cumulative normal distribution</pre>
            </div>
            {calculationResult && (
              <div className="mt-4 p-3 bg-primary-100 rounded text-sm">
                <div className="font-semibold">Calculation Results:</div>
                <div className="mt-1">
                  {type === "buyer" ? (
                    <>Premium: {formatBTC(calculationResult.premium)} ({formatCurrency(calculationResult.premiumUsd)})</>
                  ) : (
                    <>Income: {formatBTC(calculationResult.premium)} ({formatCurrency(calculationResult.premiumUsd)})</>
                  )}
                </div>
                <div className="mt-1">
                  {type === "buyer" ? (
                    <>This is {formatPercentage(calculationResult.premiumRate)} of your Bitcoin value</>
                  ) : (
                    <>This is {formatPercentage(calculationResult.premiumRate)} of the protected Bitcoin value</>
                  )}
                </div>
                <div className="mt-1">
                  APY Equivalent: {formatPercentage(calculationResult.apyEquivalent)}
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">
              {type === "buyer" ? "Your Protection Details" : "Your Income Opportunity"}
            </h4>
            <div className="space-y-2 bg-white p-3 rounded-md shadow-sm">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Bitcoin Price</span>
                <span className="font-medium">{formatCurrency(parameters.currentPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {type === "buyer" ? "Protected Value (Strike)" : "Obligation Level (Strike)"}
                </span>
                <span className="font-medium">
                  {formatCurrency(parameters.strikePrice)} 
                  <span className="text-xs ml-1 text-muted-foreground">
                    ({((parameters.strikePrice / parameters.currentPrice) * 100).toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {type === "buyer" ? "Protection Duration" : "Income Period"}
                </span>
                <span className="font-medium">
                  {Math.round(parameters.timeToExpiry * 365)} days 
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Historical Volatility {parameters.timeToExpiry * 365 < 60 ? "(30d)" : "(60-90d)"}
                </span>
                <span className="font-medium">{parameters.volatility.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Risk-Free Rate</span>
                <span className="font-medium">{parameters.riskFreeRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm font-medium bg-primary-50 p-2 rounded mt-2">
                <span className="text-primary-700">
                  {type === "buyer" ? "Bitcoin Amount Protected" : "Capital Commitment"}
                </span>
                <span className="text-primary-700">
                  {parameters.amount.toFixed(4)} BTC 
                  <span className="block text-xs text-right text-muted-foreground">
                    ({formatCurrency(parameters.amount * parameters.currentPrice)})
                  </span>
                </span>
              </div>
            </div>
            
            {calculationResult && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm mb-2">Option Greeks Explained</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Delta</span>
                      <span className={calculationResult.delta < 0 ? "text-red-500" : "text-green-500"}>
                        {calculationResult.delta.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type === "buyer" 
                        ? "How much your protection value changes when Bitcoin price moves $1" 
                        : "How much your obligation changes when Bitcoin price moves $1"}
                    </p>
                  </div>
                  
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Theta</span>
                      <span className={calculationResult.theta < 0 ? "text-red-500" : "text-green-500"}>
                        {calculationResult.theta.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type === "buyer" 
                        ? "How much your protection value decreases each day as expiration approaches" 
                        : "How much your position improves each day as expiration approaches"}
                    </p>
                  </div>
                  
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Break-even Price</span>
                      <span className="font-medium">
                        {formatCurrency(calculationResult.breakEvenPrice)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type === "buyer" 
                        ? "The price below which your protection starts making a net profit" 
                        : "The price at which your income equals potential obligation costs"}
                    </p>
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
