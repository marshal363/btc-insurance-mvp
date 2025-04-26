import { NextResponse } from 'next/server';
import { calculateHistoricalVolatility } from '@/lib/volatility-calculator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    
    // Default to 30 days if not specified
    const days = daysParam ? parseInt(daysParam) : 30;
    
    if (isNaN(days) || days <= 0) {
      return NextResponse.json(
        { error: 'Invalid days parameter' },
        { status: 400 }
      );
    }
    
    const volatility = await calculateHistoricalVolatility(days);
    
    return NextResponse.json({ volatility });
  } catch (error) {
    console.error('Error calculating volatility:', error);
    return NextResponse.json(
      { error: 'Failed to calculate volatility' },
      { status: 500 }
    );
  }
}