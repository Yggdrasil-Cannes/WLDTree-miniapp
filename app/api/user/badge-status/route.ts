import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const worldcoinId = searchParams.get('worldcoinId');

    if (!worldcoinId) {
      return NextResponse.json(
        { error: 'WorldCoin ID is required' },
        { status: 400 }
      );
    }

    // Find user and their badge minting status
    const user = await prisma.user.findUnique({
      where: { worldcoinId },
      include: {
        badgeMints: {
          where: { badgeType: 'EdgeEsmeralda' },
          orderBy: { mintedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const badgeMint = user.badgeMints[0];

    return NextResponse.json({
      hasCompletedQuiz: user.hasCompletedQuiz,
      hasMintedBadge: user.hasMintedBadge,
      badgeDetails: badgeMint ? {
        badgeName: badgeMint.badgeName,
        transactionId: badgeMint.transactionId,
        userAddress: badgeMint.userAddress,
        mintedAt: badgeMint.mintedAt,
        status: badgeMint.status,
        network: badgeMint.network,
        contractAddress: badgeMint.contractAddress,
        tokenId: badgeMint.tokenId
      } : null
    });

  } catch (error) {
    console.error('Error checking badge status:', error);
    return NextResponse.json(
      { error: 'Failed to check badge status' },
      { status: 500 }
    );
  }
} 