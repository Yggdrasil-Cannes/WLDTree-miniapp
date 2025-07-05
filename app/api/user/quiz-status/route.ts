import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fast query to check quiz completion status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasCompletedQuiz: true,
        onboardingCompleted: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        hasCompletedQuiz: false,
        onboardingCompleted: false
      });
    }

    return NextResponse.json({
      hasCompletedQuiz: user.hasCompletedQuiz || false,
      onboardingCompleted: user.onboardingCompleted || false
    });

  } catch (error) {
    console.error('Error checking quiz status:', error);
    return NextResponse.json(
      { error: 'Failed to check quiz status' },
      { status: 500 }
    );
  }
} 