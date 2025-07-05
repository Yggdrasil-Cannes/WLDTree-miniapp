import { NextRequest, NextResponse } from 'next/server';
import { WorldTreeAgent } from '@/lib/services/WorldTreeAgent';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, action' 
      }, { status: 400 });
    }

    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured' 
      }, { status: 500 });
    }

    const agent = new WorldTreeAgent(openAIApiKey, {
      debug: process.env.NODE_ENV === 'development'
    });

    let result;

    switch (action) {
      case 'analyze_tree':
        if (!data.familyData || !data.researchGoals) {
          return NextResponse.json({ 
            error: 'Missing familyData or researchGoals for tree analysis' 
          }, { status: 400 });
        }
        result = await agent.analyzeFamilyTree(userId, data.familyData, data.researchGoals);
        break;

      case 'process_dna':
        if (!data.dnaData || !data.familyTree) {
          return NextResponse.json({ 
            error: 'Missing dnaData or familyTree for DNA processing' 
          }, { status: 400 });
        }
        result = await agent.processDNAData(userId, data.dnaData, data.familyTree);
        break;

      case 'suggest_records':
        if (!data.familyMember || !data.researchContext) {
          return NextResponse.json({ 
            error: 'Missing familyMember or researchContext for record suggestions' 
          }, { status: 400 });
        }
        result = await agent.suggestHistoricalRecords(data.familyMember, data.researchContext);
        break;

      case 'genealogy_chat':
        if (!data.message) {
          return NextResponse.json({ 
            error: 'Missing message for genealogy chat' 
          }, { status: 400 });
        }
        result = await agent.processGenealogyChat(userId, data.message, data.context || {});
        break;

      case 'get_insights':
        if (!data.familyTreeData) {
          return NextResponse.json({ 
            error: 'Missing familyTreeData for insights' 
          }, { status: 400 });
        }
        result = await agent.getFamilyTreeInsights(data.familyTreeData);
        break;

      default:
        return NextResponse.json({ 
          error: `Unknown action: ${action}` 
        }, { status: 400 });
    }

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: userId,
        activityType: action === 'analyze_tree' ? 'TREE_CREATED' : 
                     action === 'process_dna' ? 'DNA_PROCESSED' : 
                     action === 'suggest_records' ? 'RESEARCH_STARTED' : 
                     'RESEARCH_STARTED',
        description: `WorldTree AI: ${action}`,
        heritagePointsEarned: 10,
        metadata: {
          action,
          result: typeof result === 'object' ? JSON.stringify(result) : result
        }
      }
    });

    return NextResponse.json({
      success: true,
      result,
      heritagePointsEarned: 10
    });

  } catch (error) {
    console.error('WorldTree Agent Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET method to retrieve genealogy session history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get genealogy activities as sessions
    const activities = await prisma.userActivity.findMany({
      where: { 
        userId: userId,
        activityType: {
          in: ['TREE_CREATED', 'DNA_PROCESSED', 'RESEARCH_STARTED', 'RESEARCH_COMPLETED']
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
        heritagePointsEarned: activity.heritagePointsEarned,
        metadata: activity.metadata
      }))
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve genealogy sessions' },
      { status: 500 }
    );
  }
} 