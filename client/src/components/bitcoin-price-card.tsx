import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/bitcoin";
import { BitcoinPriceData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BitcoinPriceCardProps {
  isLoading: boolean;
  isError: boolean;
  data?: BitcoinPriceData;
}

export const BitcoinPriceCard = ({ isLoading, isError, data }: BitcoinPriceCardProps) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSources, setShowSources] = useState(false);
  
  // Format the last updated time
  const getLastUpdatedText = (timestamp: string) => {
    const lastUpdated = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Get the current period if available
      const period = data?.period || 30;
      await apiRequest("GET", `/api/bitcoin/refresh?days=${period}`, undefined);
      toast({
        title: "Price Data Refreshed",
        description: "Bitcoin price data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh Bitcoin price data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Calculate the position in the 24h range (as percentage)
  const getRangePosition = () => {
    if (!data) return 50; // Default to middle
    
    const { currentPrice, dayLow, dayHigh } = data;
    const range = dayHigh - dayLow;
    if (range === 0) return 50;
    
    return ((currentPrice - dayLow) / range) * 100;
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold mr-2">Bitcoin Price Oracle</h2>
              {!isLoading && !isError && data?.exchanges && data.exchanges.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3"></circle>
                  </svg>
                  {data.exchanges.length} Sources Connected
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : isError ? (
                <span className="text-sm font-medium text-destructive">Unavailable</span>
              ) : (
                <span className="text-sm font-medium">{getLastUpdatedText(data!.lastUpdated)}</span>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="text-xs"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Price */}
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32 mt-1" />
                  ) : isError ? (
                    <p className="text-2xl font-semibold text-destructive">Error</p>
                  ) : (
                    <p className="text-2xl font-semibold">{formatCurrency(data!.currentPrice)}</p>
                  )}
                </div>
                <div className="flex items-center">
                  {!isLoading && !isError && data && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      data.priceChangePercentage24h >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d={data.priceChangePercentage24h >= 0 
                            ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                            : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                        />
                      </svg>
                      {formatPercentage(Math.abs(data.priceChangePercentage24h))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 24h Range */}
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">24h Range</p>
              {isLoading ? (
                <Skeleton className="h-10 w-full mt-2" />
              ) : isError ? (
                <div className="text-sm text-destructive mt-3">Data unavailable</div>
              ) : (
                <div className="relative pt-1 mt-2">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary" 
                      style={{width: `${getRangePosition()}%`}}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatCurrency(data!.dayLow)}</span>
                    <span className="text-xs text-primary-700 font-medium">Current</span>
                    <span>{formatCurrency(data!.dayHigh)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Historical Volatility */}
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Historical Volatility {data?.period ? `(${data.period}d)` : "(30d)"}
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : isError ? (
                <p className="text-2xl font-semibold text-destructive">Error</p>
              ) : (
                <p className="text-2xl font-semibold">{formatPercentage(data!.historicalVolatility)}</p>
              )}
              <div className="mt-1 text-xs text-muted-foreground flex justify-between">
                <span>Used for premium calculations</span>
                <button 
                  onClick={() => setShowSources(!showSources)}
                  className="text-primary hover:underline"
                >
                  {showSources ? "Hide Sources" : "View Sources"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Exchange Sources */}
          {showSources && !isLoading && !isError && data?.exchanges && (
            <div className="mt-4 pt-4 border-t border-gray-200" id="volatility-sources">
              <h3 className="text-md font-medium mb-2">Price Oracle Sources</h3>
              <div className="overflow-hidden bg-primary-50 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-primary-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exchange
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Update
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.exchanges.map((exchange, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-primary-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            {exchange.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {formatCurrency(exchange.price)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {getLastUpdatedText(exchange.lastUpdated)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500" 
                                style={{width: `${exchange.confidence}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{exchange.confidence.toFixed(0)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-primary-50 border-t border-gray-200">
                  <p className="text-xs text-muted-foreground">
                    BitHedge combines price data from multiple sources using a confidence-weighted average for reliable price information.
                    Each source receives a confidence score based on reliability and latency.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
