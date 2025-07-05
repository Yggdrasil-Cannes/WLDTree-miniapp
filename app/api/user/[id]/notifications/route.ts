import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET notification preferences
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user preferences from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract notification preferences from the user's preferences JSON
    const notificationPreferences = user.preferences ? 
      (user.preferences as any).notifications || {} : {};

    // Set default values for missing preferences
    const defaultPreferences = {
      emailNotifications: true,
      pushNotifications: false,
      productUpdates: true,
      challengeUpdates: true,
      rewardNotifications: true,
      socialNotifications: false,
      levelUpNotifications: true,
      trophyNotifications: true,
      weeklyDigest: true,
      marketingEmails: false,
      proofRewards: true,
      upcomingMissions: true,
      aiTips: true,
      newToolAlerts: true,
      communityUpdates: false
    };

    const preferences = { ...defaultPreferences, ...notificationPreferences };

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT/UPDATE notification preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { preferences: notificationPreferences } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!notificationPreferences) {
      return NextResponse.json({ error: 'Preferences data is required' }, { status: 400 });
    }

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge notification preferences with existing preferences
    const currentPreferences = (user.preferences as any) || {};
    const updatedPreferences = {
      ...currentPreferences,
      notifications: notificationPreferences
    };

    // Update user preferences in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: updatedPreferences
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Notification preferences updated successfully' 
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 