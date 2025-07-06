import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { geneticAnalysisService } from '@/lib/services/geneticAnalysisService';

export async function POST(req: NextRequest) {
  try {
    // Get session - for testing, allow without session
    const session = await getServerSession(authOptions);
    // For testing with World Mini App, we might not have a full session

    const { worldId, requestId, method = 'direct', encryptedKey } = await req.json();

    // Validate inputs
    if (!worldId || !requestId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize backend service
    const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.error('Backend wallet private key not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    geneticAnalysisService.initializeBackend(privateKey);

    // Grant consent
    const result = await geneticAnalysisService.grantConsent(
      worldId,
      requestId,
      method,
      encryptedKey
    );

    return NextResponse.json({
      success: true,
      txHash: result.txHash
    });

  } catch (error) {
    console.error('Grant consent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Consent failed' },
      { status: 500 }
    );
  }
}