import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PremiumCalculator } from "@/components/premium-calculator";
import { BitcoinPriceData, CalculatorTab } from "@/lib/types";
import { Shield, LineChart } from "lucide-react";

interface PremiumCalculatorTabsProps {
  activeTab: CalculatorTab;
  setActiveTab: (tab: CalculatorTab) => void;
  bitcoinData?: BitcoinPriceData;
  isLoading: boolean;
  isError: boolean;
}

export const PremiumCalculatorTabs = ({ 
  activeTab, 
  setActiveTab, 
  bitcoinData,
  isLoading,
  isError
}: PremiumCalculatorTabsProps) => {
  return (
    <div className="ios-card mb-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CalculatorTab)}
        className="w-full"
      >
        <div className="px-6 pt-6 pb-4">
          <TabsList className="bg-secondary/50 border-0 p-1 rounded-full w-full grid grid-cols-2 h-14">
            <TabsTrigger
              value="buyer"
              className="rounded-full h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="mr-2 bg-primary/10 p-1.5 rounded-full">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Protection Buyer</span>
                  <span className="text-xs text-muted-foreground">Buy insurance for your BTC</span>
                </div>
              </div>
            </TabsTrigger>
            
            <TabsTrigger
              value="seller"
              className="rounded-full h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center">
                <div className="mr-2 bg-primary/10 p-1.5 rounded-full">
                  <LineChart className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Liquidity Provider</span>
                  <span className="text-xs text-muted-foreground">Earn income on your BTC</span>
                </div>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="buyer" className="p-0 m-0 animate-in fade-in-50 duration-300">
          <PremiumCalculator 
            type="buyer" 
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </TabsContent>
        
        <TabsContent value="seller" className="p-0 m-0 animate-in fade-in-50 duration-300">
          <PremiumCalculator 
            type="seller" 
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
