import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const minimal = searchParams.get('minimal') === 'true';
    
    if (minimal) {
      // Fast minimal profile data for initial load
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          isVerified: true,
          worldcoinId: true,
          region: true,
          genealogyExperience: true,
          heritagePoints: true,
          level: true,
          preferences: true,
          hasCompletedQuiz: true,
          createdAt: true,
          lastActiveAt: true
        }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Quick counts for stats without fetching full data
      const badgeCount = await prisma.badgeMint.count({ where: { userId: id } });
      
      const minimalProfile = {
        ...user,
        profileCompletion: calculateProfileCompletion(user),
        stats: {
          totalBadges: badgeCount,
          quizCompleted: user.hasCompletedQuiz,
          joinDate: user.createdAt,
          lastActive: user.lastActiveAt
        }
      };

      const response = NextResponse.json(minimalProfile);
      // Cache for 30 seconds for minimal profile
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      return response;
    }
    
    // Full profile data for when needed
    const user = await prisma.user.findUnique({
      where: { id },
      include: { 
        badgeMints: {
          select: {
            id: true,
            badgeName: true,
            mintedAt: true,
            transactionId: true,
            status: true
          },
          orderBy: { mintedAt: 'desc' },
          take: 10
        },
        userActivities: {
          select: {
            id: true,
            activityType: true,
            description: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        familyTrees: {
          select: {
            id: true,
            name: true,
            totalMembers: true,
            createdAt: true
          },
          take: 5
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const enhancedProfile = {
      ...user,
      profileCompletion: calculateProfileCompletion(user),
      stats: {
        totalBadges: user.badgeMints.length,
        totalTrees: user.familyTrees.length,
        quizCompleted: user.hasCompletedQuiz,
        joinDate: user.createdAt,
        lastActive: user.lastActiveAt
      }
    };

    const response = NextResponse.json(enhancedProfile);
    // Cache for 60 seconds for full profile
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
} 

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Separate different types of updates
    const { preferences, avatar, bio, ...directFields } = body;
    
    // Prepare update data
    const updateData: any = {
      ...directFields,
      updatedAt: new Date(),
    };

    // Handle preferences update (merge with existing)
    if (preferences) {
      const currentUser = await prisma.user.findUnique({
        where: { id },
        select: { preferences: true }
      });
      
      updateData.preferences = {
        ...(currentUser?.preferences as object || {}),
        ...preferences
      };
    }

    // Handle bio update
    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // Handle avatar update
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    // Update user in database - minimal includes for faster response
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        isVerified: true,
        worldcoinId: true,
        region: true,
        genealogyExperience: true,
        heritagePoints: true,
        level: true,
        preferences: true,
        hasCompletedQuiz: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true
      }
    });

    const response = NextResponse.json(updatedUser);
    // Invalidate cache after update
    response.headers.set('Cache-Control', 'no-cache');
    return response;

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}

function calculateProfileCompletion(user: any) {
  let completed = 0;
  let total = 10;

  if (user.name) completed++;
  if (user.username) completed++;
  if (user.bio) completed++;
  if (user.avatar) completed++;
  if (user.region) completed++;
  if (user.genealogyExperience) completed++;
  if (user.isVerified) completed++;
  if (user.hasCompletedQuiz) completed++;
  if (user.preferences) completed++;
  if (user.heritagePoints > 0) completed++;

  return Math.round((completed / total) * 100);
} 