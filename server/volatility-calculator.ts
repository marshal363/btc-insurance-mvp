import fetch from "node-fetch";

// Cache for volatility data
let volatilityCache = {
  value: 54.2, // Default value
  lastUpdated: new Date().toISOString()
};

/**
 * Calculate historical volatility from price data
 * Normally this would use a database of historical prices, but for simplicity
 * we're using a simulated approach with CoinGecko API for 30 days of data
 */
export async function calculateHistoricalVolatility(): Promise<number> {
  try {
    // Check if cache is fresh (less than 1 hour old)
    const lastUpdated = new Date(volatilityCache.lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return volatilityCache.value;
    }
    
    // Fetch 30 days of Bitcoin price data from CoinGecko
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily"
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const prices = data.prices.map((price: [number, number]) => price[1]);
    
    // Calculate daily returns
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    
    // Calculate standard deviation of returns
    const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    const variance = returns.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / returns.length;
    const dailyStdDev = Math.sqrt(variance);
    
    // Convert to annualized volatility (percentage)
    const annualizedVolatility = dailyStdDev * Math.sqrt(365) * 100;
    
    // Update cache
    volatilityCache = {
      value: annualizedVolatility,
      lastUpdated: now.toISOString()
    };
    
    return annualizedVolatility;
  } catch (error) {
    console.error("Error calculating volatility:", error);
    
    // Return cached value if available, otherwise default
    return volatilityCache.value;
  }
}
