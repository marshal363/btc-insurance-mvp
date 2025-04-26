import { NextRequest, NextResponse } from 'next/server';
import { generateSimulationPoints } from '../../../lib/option-pricing';
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
    
    const result = generateSimulationPoints(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating simulation points:', error);
    return NextResponse.json(
      { error: 'Failed to generate simulation points' },
      { status: 500 }
    );
  }
}