import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { geneticAnalysisService } from '@/lib/services/geneticAnalysisService';

export async function POST(req: NextRequest) {
  try {
    // Get session - for testing, allow without session
    const session = await getServerSession(authOptions);
    // For testing with World Mini App, we might not have a full session
    // but we have worldId which is the important identifier

    const { worldId, worldIdProof, snpDataHash } = await req.json();

    // Validate inputs
    if (!worldId || !worldIdProof || !snpDataHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize backend service with private key from environment
    const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.error('Backend wallet private key not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Initialize the service
    geneticAnalysisService.initializeBackend(privateKey);

    // Register the user
    const result = await geneticAnalysisService.registerUser(worldId, snpDataHash);

    return NextResponse.json({
      success: true,
      derivedAddress: result.derivedAddress,
      txHash: result.txHash
    });

  } catch (error) {
    console.error('Genetic registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}