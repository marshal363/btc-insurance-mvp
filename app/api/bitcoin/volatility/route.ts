import { NextRequest, NextResponse } from 'next/server';
import { calculateHistoricalVolatility } from '../../../lib/volatility-calculator';

export async function GET(request: NextRequest) {
  try {
    // Get days parameter from query
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    // Only allow specific period options
    if (![30, 60, 90, 180, 360].includes(days)) {
      return NextResponse.json(
        { error: 'Invalid period. Allowed values are: 30, 60, 90, 180, 360 days' },
        { status: 400 }
      );
    }
    
    const volatility = await calculateHistoricalVolatility(days);
    return NextResponse.json({ volatility });
  } catch (error) {
    console.error('Error calculating volatility:', error);
    return NextResponse.json(
      { error: 'Failed to calculate historical volatility' },
      { status: 500 }
    );
  }
}