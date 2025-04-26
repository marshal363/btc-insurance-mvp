'use client';

import React, { useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { SimulationPoint, CalculatorTab } from "../lib/types";

interface SimulationChartProps {
  data: SimulationPoint[];
  type: CalculatorTab;
  strikePrice: number;
}

export const SimulationChart = ({ data, type, strikePrice }: SimulationChartProps) => {
  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm text-xs">
          <p className="font-medium mb-1">Price: {formatCurrency(payload[0].payload.price)}</p>
          <p className="text-red-500">
            Without Protection: {formatCurrency(payload[0].payload.unprotectedValue)}
          </p>
          <p className="text-green-500">
            {type === "buyer" ? "With Protection" : "As Provider"}: 
            {formatCurrency(payload[0].payload.protectedValue)}
          </p>
          <p className="text-xs mt-1 text-gray-500">
            {payload[0].payload.price < strikePrice 
              ? "Protection active" 
              : "No protection needed"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Process data to ensure it's properly formatted
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(point => ({
      ...point,
      price: Math.round(point.price),
      unprotectedValue: Math.round(point.unprotectedValue),
      protectedValue: Math.round(point.protectedValue)
    }));
  }, [data]);

  // Determine min and max for better chart display
  const dataMin = Math.min(...chartData.map(d => Math.min(d.protectedValue, d.unprotectedValue)));
  const dataMax = Math.max(...chartData.map(d => Math.max(d.protectedValue, d.unprotectedValue)));
  const domain = [dataMin * 0.9, dataMax * 1.1]; // Add some padding
  
  return (
    <div className="h-full w-full">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="price" 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 10 }}
              tickCount={3}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              domain={domain}
              tick={{ fontSize: 10 }}
              tickCount={3}
            />
            <RechartsTooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <ReferenceLine 
              x={strikePrice} 
              stroke="#6366F1" 
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{ 
                value: 'Strike', 
                position: 'top',
                fill: '#6366F1',
                fontSize: 10,
                fontWeight: 'bold' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="unprotectedValue" 
              stroke="#f43f5e" 
              fill="#f43f5e" 
              fillOpacity={0.2}
              name="Without Protection"
            />
            <Area 
              type="monotone" 
              dataKey="protectedValue" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.2}
              name={type === "buyer" ? "With Protection" : "As Provider"}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-base font-medium mb-2">Payoff Simulation</h3>
            <p className="text-sm text-gray-500">
              No simulation data available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};