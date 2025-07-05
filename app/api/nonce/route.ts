import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Generate nonce more efficiently
    const nonce = crypto.randomUUID().replace(/-/g, "");

    // Get cookies once
    const cookieStore = await cookies()
    
    // Set cookie with optimal settings
    cookieStore.set("siwe", nonce, { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 15 // 15 minutes expiration
    });

    // Return immediately
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
  }
} 