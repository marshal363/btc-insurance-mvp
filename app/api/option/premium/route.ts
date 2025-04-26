import { NextRequest, NextResponse } from 'next/server';
import { calculateOptionPremium } from '../../../lib/option-pricing';
import { OptionParameters } from '../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input parameters
    const requiredFields = ['currentPrice', 'strikePrice', 'timeToExpiry', 'volatility', 'riskFreeRate', 'amount'];
    for (const field of requiredFields) {
      if (!(field in body) || body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required parameter: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Type casting to ensure proper parameter types
    const params: OptionParameters = {
      currentPrice: Number(body.currentPrice),
      strikePrice: Number(body.strikePrice),
      timeToExpiry: Number(body.timeToExpiry),
      volatility: Number(body.volatility),
      riskFreeRate: Number(body.riskFreeRate),
      amount: Number(body.amount)
    };
    
    const result = calculateOptionPremium(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating option premium:', error);
    return NextResponse.json(
      { error: 'Failed to calculate option premium' },
      { status: 500 }
    );
  }
}