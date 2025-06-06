import { OptionParameters, SimulationPoint } from "./types";

/**
 * Standard normal cumulative distribution function
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2.0);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate d1 for Black-Scholes
 */
function d1(S: number, K: number, r: number, sigma: number, T: number): number {
  return (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
}

/**
 * Calculate d2 for Black-Scholes
 */
function d2(S: number, K: number, r: number, sigma: number, T: number): number {
  return d1(S, K, r, sigma, T) - sigma * Math.sqrt(T);
}

/**
 * Calculate premium for a put option using Black-Scholes model
 */
function calculatePutPremium(
  S: number,     // Current price
  K: number,     // Strike price
  r: number,     // Risk-free rate (in percent)
  sigma: number, // Volatility (in percent)
  T: number      // Time to expiration (in years)
): number {
  // Convert percentages to decimals
  r = r / 100;
  sigma = sigma / 100;

  const d1Value = d1(S, K, r, sigma, T);
  const d2Value = d2(S, K, r, sigma, T);

  // Black-Scholes formula for put option
  return K * Math.exp(-r * T) * normalCDF(-d2Value) - S * normalCDF(-d1Value);
}

/**
 * Calculate the delta of a put option
 */
function calculatePutDelta(
  S: number,     // Current price
  K: number,     // Strike price
  r: number,     // Risk-free rate (in percent)
  sigma: number, // Volatility (in percent)
  T: number      // Time to expiration (in years)
): number {
  // Convert percentages to decimals
  r = r / 100;
  sigma = sigma / 100;

  const d1Value = d1(S, K, r, sigma, T);
  return normalCDF(-d1Value) - 1;
}

/**
 * Calculate the gamma of an option (same for puts and calls)
 */
function calculateGamma(
  S: number,     // Current price
  K: number,     // Strike price
  r: number,     // Risk-free rate (in percent)
  sigma: number, // Volatility (in percent)
  T: number      // Time to expiration (in years)
): number {
  // Convert percentages to decimals
  r = r / 100;
  sigma = sigma / 100;

  const d1Value = d1(S, K, r, sigma, T);
  return Math.exp(-d1Value * d1Value / 2) / (S * sigma * Math.sqrt(2 * Math.PI * T));
}

/**
 * Calculate the theta of a put option
 */
function calculatePutTheta(
  S: number,     // Current price
  K: number,     // Strike price
  r: number,     // Risk-free rate (in percent)
  sigma: number, // Volatility (in percent)
  T: number      // Time to expiration (in years)
): number {
  // Convert percentages to decimals
  r = r / 100;
  sigma = sigma / 100;

  const d1Value = d1(S, K, r, sigma, T);
  const d2Value = d2(S, K, r, sigma, T);

  const term1 = -S * Math.exp(-d1Value * d1Value / 2) * sigma / (2 * Math.sqrt(2 * Math.PI * T));
  const term2 = r * K * Math.exp(-r * T) * normalCDF(-d2Value);

  // Return daily theta (divide by 365)
  return (term1 - term2) / 365;
}

/**
 * Calculate the vega of an option (same for puts and calls)
 */
function calculateVega(
  S: number,     // Current price
  K: number,     // Strike price
  r: number,     // Risk-free rate (in percent)
  sigma: number, // Volatility (in percent)
  T: number      // Time to expiration (in years)
): number {
  // Convert percentages to decimals
  r = r / 100;
  sigma = sigma / 100;

  const d1Value = d1(S, K, r, sigma, T);
  // Return vega for 1% change in volatility
  return S * Math.sqrt(T) * Math.exp(-d1Value * d1Value / 2) / Math.sqrt(2 * Math.PI) / 100;
}

/**
 * Calculate the break-even price for a put option
 */
function calculatePutBreakEven(
  K: number,      // Strike price
  premium: number // Option premium
): number {
  return K - premium;
}

/**
 * Calculate the APY equivalent of the option premium
 */
function calculateAPYEquivalent(
  premium: number, // Option premium
  S: number,      // Current price
  T: number       // Time to expiration (in years)
): number {
  const annualRate = premium / S / T;
  return annualRate * 100; // Convert to percentage
}

/**
 * Calculate option premium and related values
 */
export function calculateOptionPremium(params: OptionParameters) {
  const { currentPrice, strikePrice, timeToExpiry, volatility, riskFreeRate, amount } = params;

  // Calculate premium per BTC
  const premiumPerBTC = calculatePutPremium(
    currentPrice,
    strikePrice,
    riskFreeRate,
    volatility,
    timeToExpiry
  );
  
  // Calculate total premium
  const premium = premiumPerBTC * amount;
  
  // Calculate premium in USD
  const premiumUsd = premium * currentPrice;
  
  // Calculate premium as percentage of BTC value
  const premiumRate = (premiumPerBTC / currentPrice) * 100;
  
  // Calculate APY equivalent
  const apyEquivalent = calculateAPYEquivalent(
    premiumPerBTC,
    currentPrice,
    timeToExpiry
  );
  
  // Calculate Greeks
  const delta = calculatePutDelta(currentPrice, strikePrice, riskFreeRate, volatility, timeToExpiry);
  const gamma = calculateGamma(currentPrice, strikePrice, riskFreeRate, volatility, timeToExpiry);
  const theta = calculatePutTheta(currentPrice, strikePrice, riskFreeRate, volatility, timeToExpiry);
  const vega = calculateVega(currentPrice, strikePrice, riskFreeRate, volatility, timeToExpiry);
  
  // Calculate break-even price
  const breakEvenPrice = calculatePutBreakEven(strikePrice, premiumPerBTC);
  
  return {
    premium,
    premiumUsd,
    premiumRate,
    apyEquivalent,
    delta,
    gamma,
    theta,
    vega,
    breakEvenPrice
  };
}

/**
 * Generate simulation points for payoff visualization
 */
export function generateSimulationPoints(params: OptionParameters): SimulationPoint[] {
  const { currentPrice, strikePrice, amount } = params;
  
  // Calculate option premium
  const result = calculateOptionPremium(params);
  const premiumPerBTC = result.premium / amount;
  
  const points: SimulationPoint[] = [];
  const minPrice = currentPrice * 0.7; // 70% of current price
  const maxPrice = currentPrice * 1.3; // 130% of current price
  const step = (maxPrice - minPrice) / 30;
  
  for (let price = minPrice; price <= maxPrice; price += step) {
    const unprotectedValue = price * amount;
    
    // Protected value calculation
    let protectedValue;
    
    if (price < strikePrice) {
      // Below strike price: protected at strike price value
      protectedValue = strikePrice * amount - result.premium;
    } else {
      // Above strike price: normal value minus premium
      protectedValue = price * amount - result.premium;
    }
    
    points.push({
      price,
      unprotectedValue,
      protectedValue
    });
  }
  
  return points;
}