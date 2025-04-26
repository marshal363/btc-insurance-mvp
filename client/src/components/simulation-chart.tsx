import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { SimulationPoint, CalculatorTab } from "@/lib/types";
import { formatCurrency } from "@/lib/bitcoin";

interface SimulationChartProps {
  data: SimulationPoint[];
  type: CalculatorTab;
  strikePrice: number;
}

export const SimulationChart = ({ data, type, strikePrice }: SimulationChartProps) => {
  // Format the tooltip value
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-xs">
          <p className="font-medium">{`Price: ${formatCurrency(label)}`}</p>
          <p className="text-gray-500">{`BTC Value: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-primary">{`${type === "buyer" ? "Protected" : "Obligation"} Value: ${formatCurrency(payload[1].value)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.1)" />
        <XAxis 
          dataKey="price" 
          tickFormatter={formatTooltipValue} 
          tick={{ fontSize: 10 }}
          domain={['dataMin', 'dataMax']}
        />
        <YAxis 
          tickFormatter={formatTooltipValue} 
          tick={{ fontSize: 10 }}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine 
          x={strikePrice} 
          stroke="#3b82f6" 
          strokeDasharray="3 3" 
          label={{ 
            value: "Strike Price", 
            position: "top", 
            fill: "#3b82f6", 
            fontSize: 10 
          }} 
        />
        <Line 
          type="monotone" 
          dataKey="unprotectedValue" 
          name="Bitcoin Value"
          stroke="#9ca3af" 
          strokeWidth={2}
          dot={false} 
        />
        <Line 
          type="monotone" 
          dataKey="protectedValue" 
          name={type === "buyer" ? "Protected Value" : "Obligation Value"}
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false} 
          fillOpacity={0.1}
          fill={type === "buyer" ? "rgba(59, 130, 246, 0.1)" : "rgba(220, 38, 38, 0.1)"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
