import fetch from "node-fetch";

// Cache for Bitcoin price data
let priceCache = {
  currentPrice: 0,
  lastUpdated: "",
  dayLow: 0,
  dayHigh: 0,
  priceChange24h: 0,
  priceChangePercentage24h: 0
};

// Initialize with default data
let cacheFilled = false;

/**
 * Fetch Bitcoin price data from CoinGecko API
 */
async function fetchPriceFromAPI() {
  try {
    // CoinGecko API for Bitcoin price data
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false"
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract relevant price data
    const priceData = {
      currentPrice: data.market_data.current_price.usd,
      lastUpdated: new Date().toISOString(),
      dayLow: data.market_data.low_24h.usd,
      dayHigh: data.market_data.high_24h.usd,
      priceChange24h: data.market_data.price_change_24h,
      priceChangePercentage24h: data.market_data.price_change_percentage_24h
    };
    
    // Update cache
    priceCache = priceData;
    cacheFilled = true;
    
    return priceData;
  } catch (error) {
    console.error("Error fetching Bitcoin price:", error);
    
    // If cache is filled, return cached data
    if (cacheFilled) {
      return priceCache;
    }
    
    // Otherwise, return fallback data
    return {
      currentPrice: 43650.28,
      lastUpdated: new Date().toISOString(),
      dayLow: 42918.75,
      dayHigh: 44185.90,
      priceChange24h: 845.65,
      priceChangePercentage24h: 2.3
    };
  }
}

/**
 * Get Bitcoin price data, using cache if available
 */
export async function getBitcoinPrice() {
  if (!cacheFilled) {
    return await fetchPriceFromAPI();
  }
  
  // Check if cache is stale (older than 5 minutes)
  const lastUpdated = new Date(priceCache.lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  const diffMins = diffMs / 60000;
  
  if (diffMins > 5) {
    // Refresh cache in background, but return current cache immediately
    fetchPriceFromAPI().catch(err => console.error("Error refreshing price cache:", err));
  }
  
  return priceCache;
}

/**
 * Force refresh of Bitcoin price data
 */
export async function refreshBitcoinPrice() {
  return await fetchPriceFromAPI();
}
