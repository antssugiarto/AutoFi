import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://price.jup.ag/v6/price?ids=SOL", {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch from Jupiter: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Price API Error:", error);
    // Return a fallback price if the API is down
    return NextResponse.json({
      data: {
        SOL: {
          price: 73.89
        }
      }
    });
  }
}
