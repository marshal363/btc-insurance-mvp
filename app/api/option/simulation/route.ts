import { NextResponse } from 'next/server';
import { generateSimulationPoints } from '@/lib/option-pricing';
import { OptionParameters } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const params: OptionParameters = await request.json();
    
    // Validate required parameters
    if (!params.currentPrice || !params.strikePrice || 
        !params.amount) {
      
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
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