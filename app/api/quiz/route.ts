import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Return static quiz questions
    const defaultQuestions = [
      {
        id: 'heritage_interests',
        question: 'What aspects of your heritage intrigue you most?',
        type: 'MULTI_SELECT',
        options: ['DNA & Genetics', 'Family Stories', 'Historical Records', 'Geographic Origins', 'Cultural Traditions', 'Military History', 'Other'],
        category: 'HERITAGE',
        order: 1
      },
      {
        id: 'current_location',
        question: 'Where do you currently live?',
        type: 'MULTIPLE_CHOICE',
        options: ['North America', 'Europe', 'Asia', 'Africa', 'South America', 'Australia/Oceania'],
        category: 'DEMOGRAPHIC',
        order: 2
      },
      {
        id: 'age_group',
        question: 'How old are you?',
        type: 'MULTIPLE_CHOICE',
        options: ['13-17', '18-24', '25-34', '35-44', '45-60', '60+'],
        category: 'DEMOGRAPHIC',
        order: 3
      },
      {
        id: 'genealogy_platforms',
        question: 'Which genealogy platforms have you used?',
        type: 'MULTI_SELECT',
        options: ['Ancestry.com', 'MyHeritage', 'FamilySearch', '23andMe', 'AncestryDNA', 'FindMyPast', 'None yet', 'Other'],
        category: 'GENEALOGY',
        order: 4
      },
      {
        id: 'family_tree_goals',
        question: 'What family tree goals do you have?',
        type: 'MULTI_SELECT',
        options: ['Build complete family tree', 'Find living relatives', 'Trace ethnic origins', 'Research family stories', 'DNA analysis & matching', 'Historical record research', 'Preserve family photos', 'Connect with distant cousins', 'Military service research'],
        category: 'GENEALOGY',
        order: 5
      },
      {
        id: 'genealogy_experience',
        question: 'What\'s your genealogy research experience?',
        type: 'MULTIPLE_CHOICE',
        options: ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced', 'DNA Expert'],
        category: 'GENEALOGY',
        order: 6
      },
      {
        id: 'research_budget',
        question: 'What\'s your monthly budget for genealogy research?',
        type: 'MULTIPLE_CHOICE',
        options: ['Free only', '$1-25', '$26-50', '$51-100', '$100+', 'Not sure yet'],
        category: 'GENEALOGY',
        order: 7
      }
    ];

    return NextResponse.json({
      success: true,
      questions: defaultQuestions
    });

  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, answers } = await req.json();
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Mark quiz as completed
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedQuiz: true,
        onboardingCompleted: true,
        lastActiveAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Quiz completed successfully',
      rewards: {
        heritagePoints: 50,
        level: 1
      }
    });

  } catch (error) {
    console.error('Error processing quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz results' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get question text based on step key
function getQuestionText(stepKey: string): string {
  const questionTexts: Record<string, string> = {
    'interests': 'What are your interests?',
    'location': 'What is your location?',
    'city': 'What city are you in?',
    'age': 'How old are you?',
    'platforms': 'Where do you hang out most online?',
    'tasks': 'What do you want AI to help you with?',
    'comfort': 'What\'s your comfort level with AI?',
    'budget': 'What\'s your monthly budget for AI tools?'
  };
  
  return questionTexts[stepKey] || `Question: ${stepKey}`;
}

// Helper function to get question order
function getQuestionOrder(stepKey: string): number {
  const orderMap: Record<string, number> = {
    'heritage_interests': 1,
    'location': 2,
    'age': 3,
    'genealogy_platforms': 4,
    'genealogy_goals': 5,
    'genealogy_experience': 6,
    'genealogy_budget': 7
  };
  
  return orderMap[stepKey] || 0;
} 