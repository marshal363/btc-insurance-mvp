import { NextResponse } from 'next/server';
import { getBitcoinPriceData } from '@/lib/bitcoin-api';

export async function GET() {
  try {
    const data = await getBitcoinPriceData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price data' },
      { status: 500 }
    );
  }
}