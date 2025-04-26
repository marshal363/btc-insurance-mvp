import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PremiumCalculator } from "@/components/premium-calculator";
import { BitcoinPriceData, CalculatorTab } from "@/lib/types";

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
    <Card className="shadow-md">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CalculatorTab)}
        className="w-full"
      >
        <div className="border-b border-gray-200">
          <TabsList className="w-full rounded-none bg-transparent border-b">
            <TabsTrigger
              value="buyer"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent w-1/2 rounded-none py-4"
            >
              Protection Buyer (Long PUT)
            </TabsTrigger>
            <TabsTrigger
              value="seller"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent w-1/2 rounded-none py-4"
            >
              Income Provider (Short PUT)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="buyer" className="p-0 m-0">
          <PremiumCalculator 
            type="buyer" 
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </TabsContent>
        
        <TabsContent value="seller" className="p-0 m-0">
          <PremiumCalculator 
            type="seller" 
            bitcoinData={bitcoinData}
            isLoading={isLoading}
            isError={isError}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
