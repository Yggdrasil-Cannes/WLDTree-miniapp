import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const start = Date.now();
    
    // Simple database ping
    await prisma.$queryRaw`SELECT 1`;
    
    const dbTime = Date.now() - start;
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: `${dbTime}ms`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 