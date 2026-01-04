// app/api/market-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = 'https://satsofbitcoin-backend.onrender.com/api/market-data';
    const response = await fetch(backendUrl);

    if (!response.ok) {
      // Forward the error from the backend if possible
      const errorData = await response.json();
      return NextResponse.json({ message: 'Failed to fetch from backend', error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Internal API route error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}