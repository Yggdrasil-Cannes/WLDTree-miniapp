import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Reset onboarding status for testing
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: false
      }
    });

    console.log('Reset onboarding for user:', user.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding status reset successfully',
      user: { id: user.id, onboardingCompleted: user.onboardingCompleted }
    });
  } catch (error: any) {
    console.error('Error resetting onboarding:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset onboarding', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 