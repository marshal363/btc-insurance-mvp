import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  OptionParameters, 
  PremiumCalculationResult, 
  SimulationPoint,
  CalculatorTab
} from "@/lib/types";
import { 
  formatCurrency, 
  formatBTC, 
  formatPercentage, 
  calculateProtectedValue 
} from "@/lib/bitcoin";
import { SimulationChart } from "@/components/simulation-chart";

interface PremiumResultProps {
  type: CalculatorTab;
  calculationResult?: PremiumCalculationResult;
  parameters: OptionParameters;
  simulationPoints?: SimulationPoint[];
  isLoading: boolean;
  isError: boolean;
}

export const PremiumResult = ({
  type,
  calculationResult,
  parameters,
  simulationPoints,
  isLoading,
  isError
}: PremiumResultProps) => {
  // Calculate maximum recovery value
  const maxRecovery = calculateProtectedValue(parameters.strikePrice, parameters.amount);
  
  return (
    <>
      {/* Premium Estimate Card */}
      <Card className="bg-primary-700 text-white rounded-lg">
        <CardContent className="p-6">
          <h3 className="font-medium text-xl mb-2 flex justify-between items-center">
            {type === "buyer" ? (
              <>
                <span>Premium Cost</span>
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  Protection Fee
                </span>
              </>
            ) : (
              <>
                <span>Estimated Income</span>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  Liquidity Fee
                </span>
              </>
            )}
          </h3>
          <div className="text-center my-4 border-2 border-white/20 rounded-lg p-4 bg-primary-800">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-40 mx-auto bg-primary-600" />
                <Skeleton className="h-6 w-32 mx-auto mt-1 bg-primary-600" />
              </>
            ) : isError ? (
              <div className="text-3xl font-bold">Error</div>
            ) : calculationResult ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  {type === "buyer" ? (
                    <span className="text-xs font-medium bg-red-500/20 text-red-200 px-2 py-1 rounded">
                      YOU PAY
                    </span>
                  ) : (
                    <span className="text-xs font-medium bg-green-500/20 text-green-200 px-2 py-1 rounded">
                      YOU RECEIVE
                    </span>
                  )}
                  <span className="text-3xl font-bold">
                    {formatBTC(calculationResult.premium)}
                  </span>
                </div>
                <div className="text-primary-200 mt-1 font-medium">
                  {formatCurrency(calculationResult.premiumUsd)}
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold">--</div>
            )}
          </div>
          <div className="text-sm mt-4 space-y-3">
            <div className="flex justify-between items-center bg-primary-800/50 p-2 rounded">
              <span>Premium Rate</span>
              {isLoading ? (
                <Skeleton className="h-5 w-16 bg-primary-600" />
              ) : isError ? (
                <span className="font-medium">Error</span>
              ) : calculationResult ? (
                <span className="font-medium text-lg">
                  {formatPercentage(calculationResult.premiumRate)}
                </span>
              ) : (
                <span className="font-medium">--</span>
              )}
            </div>
            <div className="flex justify-between items-center bg-primary-800/50 p-2 rounded">
              <span>APY Equivalent</span>
              {isLoading ? (
                <Skeleton className="h-5 w-16 bg-primary-600" />
              ) : isError ? (
                <span className="font-medium">Error</span>
              ) : calculationResult ? (
                <span className="font-medium text-lg">
                  {formatPercentage(calculationResult.apyEquivalent)}
                </span>
              ) : (
                <span className="font-medium">--</span>
              )}
            </div>
          </div>
          <div className="mt-6">
            <Button className="w-full bg-white text-primary-700 hover:bg-primary-50 font-bold text-lg py-6">
              {type === "buyer" ? "Buy Protection Now" : "Provide Liquidity Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Protection Simulation Card */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h3 className="font-medium text-lg mb-4">
            {type === "buyer" ? "Protection Simulation" : "Risk Simulation"}
          </h3>
          <div className="h-48 relative">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : isError ? (
              <div className="absolute inset-0 flex items-center justify-center text-destructive">
                Unable to generate simulation
              </div>
            ) : simulationPoints && simulationPoints.length > 0 ? (
              <SimulationChart 
                data={simulationPoints} 
                type={type}
                strikePrice={parameters.strikePrice}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No simulation data available
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>{type === "buyer" ? "Protection Trigger" : "Obligation Trigger"}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span className="font-medium text-foreground">
                  {formatCurrency(parameters.strikePrice)}
                </span>
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span>{type === "buyer" ? "Max Recovery" : "Max Obligation"}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span className="font-medium text-foreground">
                  {formatCurrency(maxRecovery)}
                </span>
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span>{type === "buyer" ? "Break-even Price" : "Profit Threshold"}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : isError || !calculationResult ? (
                <span className="font-medium text-foreground">--</span>
              ) : (
                <span className="font-medium text-foreground">
                  {formatCurrency(calculationResult.breakEvenPrice)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
