import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bitcoin price history data
export const bitcoinPrices = pgTable("bitcoin_prices", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  volume: decimal("volume", { precision: 18, scale: 2 }),
  source: text("source").notNull(),
});

export const insertBitcoinPriceSchema = createInsertSchema(bitcoinPrices).omit({
  id: true,
});

export type InsertBitcoinPrice = z.infer<typeof insertBitcoinPriceSchema>;
export type BitcoinPrice = typeof bitcoinPrices.$inferSelect;

// Option premium calculations
export const premiumCalculations = pgTable("premium_calculations", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  currentPrice: decimal("current_price", { precision: 12, scale: 2 }).notNull(),
  strikePrice: decimal("strike_price", { precision: 12, scale: 2 }).notNull(),
  timeToExpiry: decimal("time_to_expiry", { precision: 6, scale: 4 }).notNull(), // in years
  volatility: decimal("volatility", { precision: 6, scale: 2 }).notNull(), // percentage
  riskFreeRate: decimal("risk_free_rate", { precision: 5, scale: 2 }).notNull(), // percentage
  amount: decimal("amount", { precision: 10, scale: 8 }).notNull(), // in BTC
  premium: decimal("premium", { precision: 10, scale: 8 }).notNull(), // in BTC
  premiumUsd: decimal("premium_usd", { precision: 12, scale: 2 }).notNull(), // in USD
  premiumRate: decimal("premium_rate", { precision: 6, scale: 2 }).notNull(), // percentage
  delta: decimal("delta", { precision: 10, scale: 4 }),
  gamma: decimal("gamma", { precision: 10, scale: 6 }),
  theta: decimal("theta", { precision: 10, scale: 4 }),
  vega: decimal("vega", { precision: 10, scale: 4 }),
});

export const insertPremiumCalculationSchema = createInsertSchema(premiumCalculations).omit({
  id: true,
});

export type InsertPremiumCalculation = z.infer<typeof insertPremiumCalculationSchema>;
export type PremiumCalculation = typeof premiumCalculations.$inferSelect;
