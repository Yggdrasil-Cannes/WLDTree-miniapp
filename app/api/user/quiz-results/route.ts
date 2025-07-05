import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user has completed quiz
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasCompletedQuiz: true,
        onboardingCompleted: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return simplified quiz results
    const quizResults = user.hasCompletedQuiz ? [
      {
        id: 'heritage_quiz',
        question: 'Heritage Journey Quiz',
        answer: 'Completed',
        score: 100,
        answeredAt: new Date().toISOString()
      }
    ] : [];

    return NextResponse.json({
      success: true,
      results: quizResults,
      hasCompletedQuiz: user.hasCompletedQuiz,
      onboardingCompleted: user.onboardingCompleted
    });

  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz results' },
      { status: 500 }
    );
  }
} 