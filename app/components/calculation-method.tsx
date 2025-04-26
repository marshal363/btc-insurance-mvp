'use client';

import React from "react";
import { 
  OptionParameters, 
  PremiumCalculationResult, 
  CalculatorTab 
} from "../lib/types";

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
  const formatPercentage = (percent: number, minimumFractionDigits: number = 2): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits: minimumFractionDigits,
    });
    
    return formatter.format(percent / 100);
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-medium text-base mb-4">Calculation Method</h3>
      
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <p>
          The premium is calculated using the Black-Scholes option pricing model, 
          which is widely used in the financial industry to determine fair prices for options.
        </p>
        
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Parameters Used</h4>
          <ul className="space-y-1 text-sm">
            <li><span className="font-medium">Current Price:</span> ${parameters.currentPrice.toLocaleString()}</li>
            <li><span className="font-medium">Strike Price:</span> ${parameters.strikePrice.toLocaleString()}</li>
            <li><span className="font-medium">Time to Expiry:</span> {(parameters.timeToExpiry * 365).toFixed(0)} days</li>
            <li><span className="font-medium">Volatility:</span> {formatPercentage(parameters.volatility)}</li>
            <li><span className="font-medium">Risk-Free Rate:</span> {formatPercentage(parameters.riskFreeRate)}</li>
          </ul>
        </div>
        
        {calculationResult && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Option Greeks (Sensitivity Indicators)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Delta</div>
                <div className="font-medium">{calculationResult.delta.toFixed(4)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Gamma</div>
                <div className="font-medium">{calculationResult.gamma.toFixed(6)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Theta</div>
                <div className="font-medium">{calculationResult.theta.toFixed(4)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Vega</div>
                <div className="font-medium">{calculationResult.vega.toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> This calculator provides an estimate based on standard market models. 
            Actual premium rates may vary in real trading environments due to market conditions, 
            liquidity, and other factors.
          </p>
        </div>
      </div>
    </div>
  );
};