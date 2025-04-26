import { apiRequest } from "./queryClient";
import { BitcoinPriceData, OptionParameters, PremiumCalculationResult, SimulationPoint } from "./types";

// Get current Bitcoin data
export async function getBitcoinPriceData(): Promise<BitcoinPriceData> {
  const response = await apiRequest("GET", "/api/bitcoin/price", undefined);
  return response.json();
}

// Calculate option premium
export async function calculatePremium(params: OptionParameters): Promise<PremiumCalculationResult> {
  const response = await apiRequest("POST", "/api/option/premium", params);
  return response.json();
}

// Generate simulation points for the chart
export async function generateSimulationPoints(
  params: OptionParameters
): Promise<SimulationPoint[]> {
  const response = await apiRequest("POST", "/api/option/simulation", params);
  return response.json();
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = "USD", ios: boolean = false): string {
  if (ios) {
    // iOS-style modern currency formatting - cleaner with less symbols
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: "narrowSymbol",
    }).format(amount);
    
    // For iOS-style UX, we want a clean format without extra decimal places for large numbers
    return formatted;
  }
  
  // Standard formatting
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format BTC amount
export function formatBTC(amount: number): string {
  if (amount < 0.001) {
    // Convert to satoshis for very small amounts
    const satoshis = Math.round(amount * 100000000);
    return `${satoshis.toLocaleString()} sats`;
  }
  
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: amount < 0.01 ? 6 : 5,
    maximumFractionDigits: 8,
  }).format(amount) + " BTC";
}

// Format percentage
export function formatPercentage(percent: number, minimumFractionDigits: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(percent / 100);
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Calculate expiration date from days
export function calculateExpiryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// Convert percentage of current price to strike price
export function percentageToStrikePrice(currentPrice: number, percentage: number): number {
  return (currentPrice * percentage) / 100;
}

// Calculate protected BTC value in USD
export function calculateProtectedValue(strikePrice: number, amount: number): number {
  return strikePrice * amount;
}
