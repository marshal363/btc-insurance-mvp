'use client';

import React from "react";
import { SimulationPoint, CalculatorTab } from "../lib/types";

interface SimulationChartProps {
  data: SimulationPoint[];
  type: CalculatorTab;
  strikePrice: number;
}

export const SimulationChart = ({ data, type, strikePrice }: SimulationChartProps) => {
  // This is a simplified version of the chart for the initial migration
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h3 className="text-base font-medium mb-2">Payoff Simulation</h3>
        <p className="text-sm text-gray-500">
          {type === "buyer" 
            ? "Shows your portfolio value with and without protection"
            : "Shows your obligation at different price levels"}
        </p>
        <div className="mt-4 bg-primary/10 px-3 py-2 rounded-md">
          <p className="text-xs text-primary">
            Interactive chart will be implemented in the next phase
          </p>
        </div>
      </div>
    </div>
  );
};