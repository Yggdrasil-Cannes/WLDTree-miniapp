import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'
import { prisma } from '@/lib/prisma'

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
  email?: string
  username?: string
}

export const POST = async (req: NextRequest) => {
  try {
    const { payload, nonce, email, username } = (await req.json()) as IRequestPayload
    
    console.log("Received SIWE verification request:", { 
      nonce, 
      address: payload.address,
      email,
      username 
    });
    
    const cookieStore = await cookies()
    const storedNonce = cookieStore.get('siwe')?.value
    if (nonce !== storedNonce) {
      console.error("Nonce mismatch:", { received: nonce, stored: storedNonce });
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid nonce'
      }, { status: 401 })
    }

    // Verify SIWE message first (this is the expensive operation)
    const validMessage = await verifySiweMessage(payload, nonce)
    console.log("SIWE message validation result:", validMessage);
    
    if (!validMessage.isValid) {
      return NextResponse.json({
        status: 'error',
        isValid: false,
        message: 'Invalid signature'
      }, { status: 400 })
    }

    // Clear the nonce cookie after successful verification
    cookieStore.delete('siwe');

    // Create or update user in database with wallet address
    const walletAddress = payload.address.toLowerCase()
    
    // Use simple upsert without timeout (that was causing failures)
    const user = await prisma.user.upsert({
      where: { worldcoinId: walletAddress },
      update: {
        lastActiveAt: new Date(),
        ...(username && username.trim() !== '' ? { name: username, username: username } : {}),
        ...(email && email.trim() !== '' ? { email: email } : {})
      },
      create: {
        worldcoinId: walletAddress,
        name: (username && username.trim() !== '') 
          ? username 
          : (email && email.trim() !== '') 
            ? email 
            : `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        username: (username && username.trim() !== '') 
          ? username 
          : (email && email.trim() !== '') 
            ? email 
            : `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        email: email || walletAddress,
        isVerified: true,
        genealogyExperience: "BEGINNER",
        heritagePoints: 0,
        level: 1,
        onboardingCompleted: false,
      }
    });

    console.log("Wallet user processed:", user.id);

    return NextResponse.json({
      status: 'success',
      isValid: true,
      address: payload.address,
      user: {
        id: user.id,
        name: user.name,
        isVerified: user.isVerified,
        hasCompletedQuiz: user.hasCompletedQuiz,
        onboardingCompleted: user.onboardingCompleted
      }
    })
  } catch (error: any) {
    console.error('SIWE endpoint error:', error)
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
} 