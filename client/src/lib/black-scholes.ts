/**
 * JavaScript implementation of the Black-Scholes option pricing model.
 * This is a client-side implementation for UI display purposes.
 * Actual calculations should be done server-side for accuracy.
 */

// Standard normal cumulative distribution function
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

// Calculate d1 for Black-Scholes
function d1(S: number, K: number, r: number, sigma: number, T: number): number {
  return (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
}

// Calculate d2 for Black-Scholes
function d2(S: number, K: number, r: number, sigma: number, T: number): number {
  return d1(S, K, r, sigma, T) - sigma * Math.sqrt(T);
}

// Calculate premium for a put option
export function calculatePutPremium(
  S: number,      // Current price
  K: number,      // Strike price
  r: number,      // Risk-free rate (in percent)
  sigma: number,  // Volatility (in percent)
  T: number       // Time to expiration (in years)
): number {
  // Convert percentages to decimals
  r = r / 100;
  sigma = sigma / 100;

  const d1Value = d1(S, K, r, sigma, T);
  const d2Value = d2(S, K, r, sigma, T);

  // Black-Scholes formula for put option
  return K * Math.exp(-r * T) * normalCDF(-d2Value) - S * normalCDF(-d1Value);
}

// Calculate option delta (first derivative of option price with respect to underlying price)
export function calculatePutDelta(
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

// Calculate option gamma (second derivative of option price with respect to underlying price)
export function calculateGamma(
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

// Calculate option theta (derivative of option price with respect to time)
export function calculatePutTheta(
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

// Calculate option vega (derivative of option price with respect to volatility)
export function calculateVega(
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

// Calculate the break-even price for a put option
export function calculatePutBreakEven(
  K: number,      // Strike price
  premium: number // Option premium
): number {
  return K - premium;
}

// Calculate the APY equivalent of the option premium
export function calculateAPYEquivalent(
  premium: number, // Option premium
  S: number,      // Current price
  T: number       // Time to expiration (in years)
): number {
  const annualRate = premium / S / T;
  return annualRate * 100; // Convert to percentage
}

// Generate simulation points for the option payoff chart
export function generateSimulationPoints(
  currentPrice: number,
  strikePrice: number,
  premium: number,
  amount: number
): Array<{ price: number; unprotectedValue: number; protectedValue: number }> {
  const points = [];
  const minPrice = currentPrice * 0.7; // 70% of current price
  const maxPrice = currentPrice * 1.3; // 130% of current price
  const step = (maxPrice - minPrice) / 30;

  for (let price = minPrice; price <= maxPrice; price += step) {
    const unprotectedValue = price * amount;
    
    // Protected value calculation
    let protectedValue;
    
    if (price < strikePrice) {
      // Below strike price: protected at strike price value
      protectedValue = strikePrice * amount - premium;
    } else {
      // Above strike price: normal value minus premium
      protectedValue = price * amount - premium;
    }
    
    points.push({
      price,
      unprotectedValue,
      protectedValue
    });
  }

  return points;
}
