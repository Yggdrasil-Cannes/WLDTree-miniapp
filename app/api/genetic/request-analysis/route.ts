import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { geneticAnalysisService } from '@/lib/services/geneticAnalysisService';

export async function POST(req: NextRequest) {
  try {
    // Get session - for testing, allow without session
    const session = await getServerSession(authOptions);
    // For testing with World Mini App, we might not have a full session

    const { worldId, targetWorldId, targetAddress } = await req.json();

    // Validate inputs
    if (!worldId || (!targetWorldId && !targetAddress)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If targetWorldId is provided, derive the address
    let finalTargetAddress = targetAddress;
    if (targetWorldId) {
      finalTargetAddress = geneticAnalysisService.deriveUserAddress(targetWorldId);
    }

    // Initialize backend service
    const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.error('Backend wallet private key not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    geneticAnalysisService.initializeBackend(privateKey);

    // Request analysis
    const result = await geneticAnalysisService.requestAnalysis(worldId, finalTargetAddress);

    return NextResponse.json({
      success: true,
      requestId: result.requestId,
      txHash: result.txHash
    });

  } catch (error) {
    console.error('Analysis request error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}