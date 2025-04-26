import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getBitcoinPrice, refreshBitcoinPrice } from "./bitcoin-api";
import { calculateHistoricalVolatility } from "./volatility-calculator";
import { calculateOptionPremium, generateSimulationPoints } from "./option-pricing";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bitcoin price data route
  app.get("/api/bitcoin/price", async (req, res) => {
    try {
      const bitcoinData = await getBitcoinPrice();
      
      // Get historical volatility
      const volatility = await calculateHistoricalVolatility();
      
      // Return combined data
      res.json({
        ...bitcoinData,
        historicalVolatility: volatility
      });
    } catch (error) {
      console.error("Error fetching Bitcoin price:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin price data" });
    }
  });
  
  // Refresh Bitcoin price data route
  app.get("/api/bitcoin/refresh", async (req, res) => {
    try {
      const bitcoinData = await refreshBitcoinPrice();
      
      // Get historical volatility
      const volatility = await calculateHistoricalVolatility();
      
      // Return combined data
      res.json({
        ...bitcoinData,
        historicalVolatility: volatility
      });
    } catch (error) {
      console.error("Error refreshing Bitcoin price:", error);
      res.status(500).json({ message: "Failed to refresh Bitcoin price data" });
    }
  });
  
  // Option premium calculation route
  app.post("/api/option/premium", async (req, res) => {
    try {
      const {
        currentPrice,
        strikePrice,
        timeToExpiry,
        volatility,
        riskFreeRate,
        amount
      } = req.body;
      
      // Validate required parameters
      if (!currentPrice || !strikePrice || !timeToExpiry || !volatility || riskFreeRate === undefined || !amount) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Calculate premium
      const premiumResult = calculateOptionPremium({
        currentPrice,
        strikePrice,
        timeToExpiry,
        volatility,
        riskFreeRate,
        amount
      });
      
      res.json(premiumResult);
    } catch (error) {
      console.error("Error calculating option premium:", error);
      res.status(500).json({ message: "Failed to calculate option premium" });
    }
  });
  
  // Option simulation route
  app.post("/api/option/simulation", async (req, res) => {
    try {
      const {
        currentPrice,
        strikePrice,
        timeToExpiry,
        volatility,
        riskFreeRate,
        amount
      } = req.body;
      
      // Validate required parameters
      if (!currentPrice || !strikePrice || !amount) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Generate simulation points
      const simulationPoints = generateSimulationPoints({
        currentPrice,
        strikePrice,
        timeToExpiry,
        volatility,
        riskFreeRate,
        amount
      });
      
      res.json(simulationPoints);
    } catch (error) {
      console.error("Error generating simulation:", error);
      res.status(500).json({ message: "Failed to generate simulation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
