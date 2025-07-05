import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // For now, store genealogy sessions in user activities
    const activity = await prisma.userActivity.create({ 
      data: {
        userId: data.userId,
        activityType: 'RESEARCH_STARTED',
        description: data.description || 'Genealogy research session started',
        heritagePointsEarned: 5,
        metadata: {
          sessionType: 'genealogy',
          researchFocus: data.researchFocus || 'family_tree',
          ...data
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      sessionId: activity.id,
      heritagePointsEarned: 5
    });
  } catch (error) {
    console.error('Error creating genealogy session:', error);
    return NextResponse.json(
      { error: 'Failed to create genealogy session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    // Get genealogy activities as sessions
    const activities = await prisma.userActivity.findMany({
      where: { 
        userId: userId,
        activityType: {
          in: ['RESEARCH_STARTED', 'RESEARCH_COMPLETED', 'DNA_PROCESSED', 'TREE_CREATED']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    return NextResponse.json({ 
      sessions: activities.map(activity => ({
        id: activity.id,
        userId: activity.userId,
        type: activity.activityType,
        description: activity.description,
        createdAt: activity.createdAt,
        metadata: activity.metadata
      }))
    });
  } catch (error) {
    console.error('Error fetching genealogy sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genealogy sessions' },
      { status: 500 }
    );
  }
} 