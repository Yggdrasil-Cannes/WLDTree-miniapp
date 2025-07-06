import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      APP_ID: !!process.env.APP_ID,
      WLD_CLIENT_ID: !!process.env.WLD_CLIENT_ID,
      WLD_CLIENT_SECRET: !!process.env.WLD_CLIENT_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    };
    
    // Check if all required env vars are present
    const missingVars = Object.entries({
      APP_ID: process.env.APP_ID,
      WLD_CLIENT_ID: process.env.WLD_CLIENT_ID,
      WLD_CLIENT_SECRET: process.env.WLD_CLIENT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
    }).filter(([key, value]) => !value).map(([key]) => key);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL
      },
      environmentVariables: envCheck,
      missingVariables: missingVars,
      isConfigured: missingVars.length === 0
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 