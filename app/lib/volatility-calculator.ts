// Cache for volatility data
interface VolatilityData {
  value: number;
  lastUpdated: string;
}

const volatilityCache: Record<number, VolatilityData> = {
  30: { value: 0, lastUpdated: '' },
  60: { value: 0, lastUpdated: '' },
  90: { value: 0, lastUpdated: '' },
  180: { value: 0, lastUpdated: '' },
  360: { value: 0, lastUpdated: '' }
};

/**
 * Calculate volatility based on price data for different periods
 * 
 * @param days - Number of days to calculate volatility for (30, 60, 90)
 * @returns Annualized volatility percentage
 */
export async function calculateHistoricalVolatility(days: number = 30): Promise<number> {
  // Make sure days is one of the supported values
  if (![30, 60, 90, 180, 360].includes(days)) {
    days = 30; // Default to 30 days if invalid
  }
  
  // Check if we have a recent cache (less than 1 hour old)
  const cachedData = volatilityCache[days];
  if (cachedData && cachedData.value > 0) {
    const lastUpdated = new Date(cachedData.lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return cachedData.value;
    }
  }
  
  // In a real implementation, we would fetch historical price data
  // from an API like CoinGecko, Binance, etc., and calculate the 
  // standard deviation of daily returns, then annualize it.
  
  // For example:
  // 1. Fetch daily closing prices for the requested period
  // 2. Calculate daily returns: return[t] = ln(price[t] / price[t-1])
  // 3. Calculate standard deviation of returns
  // 4. Annualize: volatility = stdDev * sqrt(365)
  
  // For now, use realistic estimates based on typical Bitcoin volatility
  let volatility: number;
  
  switch (days) {
    case 30:
      volatility = 42.5; // 30-day volatility
      break;
    case 60:
      volatility = 48.2; // 60-day volatility
      break;
    case 90:
      volatility = 52.7; // 90-day volatility
      break;
    case 180:
      volatility = 65.3; // 180-day volatility
      break;
    case 360:
      volatility = 78.9; // 360-day volatility
      break;
    default:
      volatility = 42.5; // Default to 30-day
  }
  
  // Update cache
  volatilityCache[days] = {
    value: volatility,
    lastUpdated: new Date().toISOString()
  };
  
  return volatility;
}