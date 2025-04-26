'use client';

import React from 'react';
import { CalculatorTab } from "../lib/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type: CalculatorTab;
  data: any[];
  strikePrice: number;
}

export const ChartTooltip = ({ 
  active, 
  payload, 
  label, 
  type, 
  data, 
  strikePrice 
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const pricePoint = payload[0].payload.price;
    const unprotectedValue = payload[0].payload.unprotectedValue;
    const protectedValue = payload[0].payload.protectedValue;
    const spotPrice = data[Math.floor(data.length / 2)]?.price || 0;
    const isProtectionActive = pricePoint < strikePrice;

    // Format currency for display
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    // Format profit/loss amount with color
    const formatProfitLoss = (value: number, baseValue: number) => {
      const diff = value - baseValue;
      const isProfit = diff >= 0;
      
      return (
        <span className={isProfit ? "text-green-500" : "text-red-500"}>
          {isProfit ? "+" : ""}{formatCurrency(diff)} ({isProfit ? "+" : ""}
          {(diff / baseValue * 100).toFixed(1)}%)
        </span>
      );
    };
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-md text-sm">
        <div className="mb-2 pb-2 border-b border-gray-100">
          <p className="font-semibold text-base">Bitcoin at {formatCurrency(pricePoint)}</p>
          <p className="text-gray-500 text-xs">
            {pricePoint < spotPrice 
              ? `${((spotPrice - pricePoint) / spotPrice * 100).toFixed(1)}% below` 
              : `${((pricePoint - spotPrice) / spotPrice * 100).toFixed(1)}% above`} current price
          </p>
        </div>
        
        <div className="space-y-3 pt-1">
          <div>
            <p className="flex justify-between">
              <span className="text-red-500 font-medium">Without Protection:</span>
              <span className="font-mono font-semibold">{formatCurrency(unprotectedValue)}</span>
            </p>
            {isProtectionActive && (
              <p className="text-xs text-red-500 mt-0.5 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {formatProfitLoss(unprotectedValue, spotPrice * data[0].unprotectedValue / data[0].price)}
              </p>
            )}
          </div>
          
          <div>
            <p className="flex justify-between">
              <span className={`font-medium ${type === "buyer" ? "text-green-500" : "text-blue-500"}`}>
                {type === "buyer" ? "With Protection" : "As Provider"}:
              </span>
              <span className="font-mono font-semibold">{formatCurrency(protectedValue)}</span>
            </p>
            <p className="text-xs mt-0.5 flex items-center">
              {isProtectionActive 
                ? <span className="text-green-500 flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Protection active at this price
                  </span>
                : <span className="text-amber-500 flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No protection needed above strike
                  </span>
              }
            </p>
          </div>
        </div>
        
        {isProtectionActive && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-purple-600 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                Protection value: 
              </p>
              <span className="font-mono font-semibold text-purple-700 text-sm">
                {formatCurrency(protectedValue - unprotectedValue)}
              </span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-1.5 mt-1.5">
              <div 
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, Math.max(0, ((protectedValue - unprotectedValue) / protectedValue) * 100))}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};