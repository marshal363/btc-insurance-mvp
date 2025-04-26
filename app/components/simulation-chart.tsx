'use client';

import React, { useMemo, useState, useCallback } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Legend,
  ReferenceArea
} from 'recharts';
import { SimulationPoint, CalculatorTab } from "../lib/types";

interface SimulationChartProps {
  data: SimulationPoint[];
  type: CalculatorTab;
  strikePrice: number;
}

export const SimulationChart = ({ data, type, strikePrice }: SimulationChartProps) => {
  // State for zooming functionality
  const [zoomState, setZoomState] = useState<{
    left?: number;
    right?: number;
    refAreaLeft?: number;
    refAreaRight?: number;
    animation: boolean;
  }>({
    animation: true,
  });
  
  // Track active tooltip index for highlighting
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  // Enhanced tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pricePoint = payload[0].payload.price;
      const unprotectedValue = payload[0].payload.unprotectedValue;
      const protectedValue = payload[0].payload.protectedValue;
      const spotPrice = data[Math.floor(data.length / 2)]?.price || 0;
      const isProtectionActive = pricePoint < strikePrice;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-md text-sm">
          <div className="mb-2 pb-2 border-b border-gray-100">
            <p className="font-semibold text-base">Bitcoin at {formatCurrency(pricePoint)}</p>
            <p className="text-muted-foreground text-xs">
              {pricePoint < spotPrice 
                ? `${((spotPrice - pricePoint) / spotPrice * 100).toFixed(1)}% below` 
                : `${((pricePoint - spotPrice) / spotPrice * 100).toFixed(1)}% above`} current price
            </p>
          </div>
          
          <div className="space-y-3 pt-1">
            <div>
              <p className="flex justify-between">
                <span className="text-red-500 font-medium">Without Protection:</span>
                <span className="font-mono">{formatCurrency(unprotectedValue)}</span>
              </p>
              {isProtectionActive && (
                <p className="text-xs text-red-400 mt-0.5">
                  {formatProfitLoss(unprotectedValue, spotPrice * data[0].unprotectedValue / data[0].price)}
                </p>
              )}
            </div>
            
            <div>
              <p className="flex justify-between">
                <span className={`font-medium ${type === "buyer" ? "text-green-500" : "text-blue-500"}`}>
                  {type === "buyer" ? "With Protection" : "As Provider"}:
                </span>
                <span className="font-mono">{formatCurrency(protectedValue)}</span>
              </p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                {isProtectionActive 
                  ? <span className="text-green-500">Protection active below strike price</span>
                  : <span className="text-amber-500">No protection needed above strike</span>
                }
              </p>
            </div>
          </div>
          
          {isProtectionActive && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-purple-600">
                Protection value: {formatCurrency(protectedValue - unprotectedValue)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom legend formatter
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex justify-center gap-4 text-xs font-medium mt-1">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
        
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1 rounded-sm bg-purple-500 opacity-20" />
          <span className="text-gray-700">Protection Zone</span>
        </div>
      </div>
    );
  };

  // Process and format chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((point, index) => ({
      ...point,
      price: Math.round(point.price),
      unprotectedValue: Math.round(point.unprotectedValue),
      protectedValue: Math.round(point.protectedValue),
      // Add difference for clearer visualization of the protection value
      protectionValue: Math.round(point.protectedValue - point.unprotectedValue),
      index  // Store index for reference
    }));
  }, [data]);

  // Simplified zooming - we'll use just the brush component instead of mouse events
  // since the dynamic domain is causing type issues
  const resetZoom = () => {
    setZoomState({
      animation: true,
    });
  };

  // Handle hover over chart points
  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Dynamic domain calculations for better visualization
  const dataMin = Math.min(...chartData.map(d => Math.min(d.protectedValue, d.unprotectedValue)));
  const dataMax = Math.max(...chartData.map(d => Math.max(d.protectedValue, d.unprotectedValue)));
  const domain = [dataMin * 0.95, dataMax * 1.05]; // Add some padding

  // Find break-even price index
  const breakEvenIndex = chartData.findIndex((point, i) => {
    if (i === 0) return false;
    // Where the lines cross - protection value changes from positive to negative
    return (chartData[i-1].protectedValue > chartData[i-1].unprotectedValue) && 
           (point.protectedValue <= point.unprotectedValue);
  });
  
  const breakEvenPrice = breakEvenIndex > 0 ? chartData[breakEvenIndex].price : null;
  
  return (
    <div className="h-full w-full relative">
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 5, left: 5, bottom: 30 }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <defs>
                <linearGradient id="protectionZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              {/* Protection zone reference area */}
              <ReferenceArea 
                x1={chartData[0]?.price} 
                x2={strikePrice} 
                fill="url(#protectionZone)" 
                fillOpacity={0.3}
                stroke="none"
              />
              
              <XAxis 
                dataKey="price" 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto'] as ['auto', 'auto']}
                allowDataOverflow={true}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                domain={domain}
                tick={{ fontSize: 11 }}
                allowDataOverflow={true}
              />
              
              <RechartsTooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '5 5' }}
                wrapperStyle={{ zIndex: 100 }}
              />
              
              <Legend content={renderLegend} />
              
              {/* Reference lines */}
              <ReferenceLine 
                x={strikePrice} 
                stroke="#6366F1" 
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{ 
                  value: 'Strike', 
                  position: 'top',
                  fill: '#6366F1',
                  fontSize: 11,
                  fontWeight: 600 
                }}
              />
              
              {breakEvenPrice && (
                <ReferenceLine 
                  x={breakEvenPrice} 
                  stroke="#0ea5e9" 
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  label={{ 
                    value: 'Break-even', 
                    position: 'insideTopRight',
                    fill: '#0ea5e9',
                    fontSize: 10
                  }}
                />
              )}
              
              {zoomState.refAreaLeft && zoomState.refAreaRight && (
                <ReferenceArea
                  x1={zoomState.refAreaLeft}
                  x2={zoomState.refAreaRight}
                  strokeOpacity={0.3}
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              )}
              
              <Area 
                type="monotone" 
                dataKey="unprotectedValue" 
                stroke="#f43f5e" 
                fill="#f43f5e" 
                fillOpacity={0.2}
                name="Without Protection"
                isAnimationActive={zoomState.animation}
              />
              <Area 
                type="monotone" 
                dataKey="protectedValue" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
                name={type === "buyer" ? "With Protection" : "As Provider"}
                isAnimationActive={zoomState.animation}
              />
              
              <Brush 
                height={20}
                dataKey="price"
                stroke="#8884d8"
                tickFormatter={formatCurrency}
                startIndex={0}
                endIndex={chartData.length - 1}
                onChange={(e) => {
                  if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
                    const startPrice = chartData[e.startIndex]?.price;
                    const endPrice = chartData[e.endIndex]?.price;
                    if (startPrice !== undefined && endPrice !== undefined) {
                      setZoomState({
                        left: startPrice,
                        right: endPrice,
                        animation: false,
                      });
                    }
                  }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Zoom controls */}
          {(zoomState.left || zoomState.right) && (
            <button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-xs px-2 py-1 rounded-md shadow-sm border border-gray-200 text-gray-700 transition-colors"
              onClick={resetZoom}
            >
              Reset Zoom
            </button>
          )}
        </>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
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