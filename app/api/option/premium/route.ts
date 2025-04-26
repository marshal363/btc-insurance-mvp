import { NextResponse } from 'next/server';
import { calculateOptionPremium } from '../../../lib/option-pricing';
import { OptionParameters } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    const params: OptionParameters = await request.json();
    
    // Validate required parameters
    if (!params.currentPrice || !params.strikePrice || 
        !params.timeToExpiry || !params.volatility || 
        !params.riskFreeRate || !params.amount) {
      
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const result = calculateOptionPremium(params);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating premium:', error);
    return NextResponse.json(
      { error: 'Failed to calculate option premium' },
      { status: 500 }
    );
  }
}