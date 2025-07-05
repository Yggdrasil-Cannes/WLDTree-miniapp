import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user's basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mock subscription data (free plan for all users)
    const subscriptionData = {
      plan: 'FREE',
      status: 'FREE',
      billingCycle: 'MONTHLY',
      amount: 0,
      startDate: new Date().toISOString(),
      endDate: null,
      renewalDate: null
    };

    // Empty payment methods for free tier
    const paymentMethods: any[] = [];

    return NextResponse.json({
      subscription: subscriptionData,
      paymentMethods
    });

  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 