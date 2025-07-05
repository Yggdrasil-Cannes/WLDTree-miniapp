import { NextResponse } from "next/server";
import { verifyCloudProof, IVerifyResponse } from "@worldcoin/minikit-js";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("=== New Verification Request ===");
    
    // Log request headers
    const headers = Object.fromEntries(req.headers.entries());
    console.log("Request headers:", headers);

    const { payload, action, walletAuthPayload, walletUsername } = await req.json();
    console.log("Request body:", {
      payload: JSON.stringify(payload, null, 2),
      action,
      walletAuthPayload: walletAuthPayload ? JSON.stringify(walletAuthPayload, null, 2) : null,
      walletUsername
    });

    // Log environment variables
    console.log("Environment check:", {
      hasAppId: !!process.env.APP_ID,
      appIdValue: process.env.APP_ID,
      hasClientId: !!process.env.WLD_CLIENT_ID,
      hasClientSecret: !!process.env.WLD_CLIENT_SECRET,
      nodeEnv: process.env.NODE_ENV
    });

    if (!process.env.APP_ID) {
      console.error("APP_ID not found in environment variables");
      return NextResponse.json(
        { error: "APP_ID not configured" },
        { status: 500 }
      );
    }

    console.log("Starting verification with:", {
      payloadType: typeof payload,
      payloadKeys: payload ? Object.keys(payload) : null,
      action
    });

    const verifyResult = await verifyCloudProof(
      payload,
      process.env.APP_ID as `app_${string}`,
      action
    );

    console.log("Verification result:", JSON.stringify(verifyResult, null, 2));

    if (!verifyResult.success) {
      console.error("Verification failed:", verifyResult);

      // Handle specific error cases
      if (verifyResult.code === 'max_verifications_reached') {
        return NextResponse.json(
          { 
            success: false, 
            error: "Already verified",
            message: "You have already verified your World ID for this action",
            code: verifyResult.code
          },
          { status: 409 } // Using 409 Conflict for already-verified case
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: "Verification failed",
          details: verifyResult
        },
        { status: 400 }
      );
    }

    console.log("Verification successful! Creating/updating user...");
    
    // Extract nullifier_hash as the unique identifier
    const worldcoinId = payload.nullifier_hash;
    
    if (!worldcoinId) {
      console.error("No nullifier_hash found in payload");
      return NextResponse.json(
        { error: "Invalid World ID payload" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { worldcoinId }
    });

    let user;
    if (!existingUser) {
      // Extract user information from wallet auth if available
      let userName = `User_${worldcoinId.slice(0, 6)}`;
      
      if (walletUsername) {
        // Use the actual username from MiniKit
        userName = walletUsername;
      } else if (walletAuthPayload && walletAuthPayload.status === 'success') {
        // Fallback to wallet address format
        userName = `${walletAuthPayload.address.slice(0, 6)}...${walletAuthPayload.address.slice(-4)}`;
      }
      
      // Create new user with extracted information
      user = await prisma.user.create({
        data: {
          worldcoinId,
          name: userName,
          username: userName,
          isVerified: true,
          genealogyExperience: "BEGINNER",
          heritagePoints: 0,
          level: 1,
          onboardingCompleted: false,
        }
      });
      console.log("User created:", user.id, "with name:", userName);
    } else {
      // Update existing user with new information if available
      let updateData: any = {
        lastActiveAt: new Date(),
      };
      
      if (walletUsername) {
        // Use the actual username from MiniKit
        updateData.name = walletUsername;
        updateData.username = walletUsername;
      } else if (walletAuthPayload && walletAuthPayload.status === 'success') {
        // Fallback to wallet address format
        const walletUsernameFormat = `${walletAuthPayload.address.slice(0, 6)}...${walletAuthPayload.address.slice(-4)}`;
        updateData.name = walletUsernameFormat;
        updateData.username = walletUsernameFormat;
      }
      
      user = await prisma.user.update({
        where: { worldcoinId },
        data: updateData
      });
      console.log("User updated:", user.id);
    }

    return NextResponse.json(
      { 
        status: 200, 
        message: "Verification successful",
        user: {
          id: user.id,
          name: user.name,
          isVerified: user.isVerified
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in verification:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      error: JSON.stringify(error, null, 2)
    });
    
    return NextResponse.json(
      { 
        error: "Failed to verify proof",
        details: {
          message: error?.message,
          type: error?.name,
          error: JSON.stringify(error)
        }
      },
      { status: 500 }
    );
  }
}
