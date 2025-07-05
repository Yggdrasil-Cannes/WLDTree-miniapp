import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get all users to debug
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        worldcoinId: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({ 
      success: true, 
      users,
      count: users.length,
      message: 'Debug: Recent users in database'
    });
  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch debug data', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 