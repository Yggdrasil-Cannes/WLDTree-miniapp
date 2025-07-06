import { NextResponse } from "next/server";
import { verifyCloudProof, IVerifyResponse } from "@worldcoin/minikit-js";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("=== New Verification Request ===");
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    
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

    // Enhanced environment variable validation
    const requiredEnvVars = {
      APP_ID: process.env.APP_ID,
      WLD_CLIENT_ID: process.env.WLD_CLIENT_ID,
      WLD_CLIENT_SECRET: process.env.WLD_CLIENT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
    };

    console.log("Environment check:", {
      hasAppId: !!requiredEnvVars.APP_ID,
      appIdValue: requiredEnvVars.APP_ID,
      hasClientId: !!requiredEnvVars.WLD_CLIENT_ID,
      hasClientSecret: !!requiredEnvVars.WLD_CLIENT_SECRET,
      hasDatabaseUrl: !!requiredEnvVars.DATABASE_URL,
      hasNextAuthSecret: !!requiredEnvVars.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL
    });

    // Check for missing environment variables
    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      console.error("Missing environment variables:", missingEnvVars);
      
      // If we're in development, provide more helpful error
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { 
            error: "Server configuration incomplete",
            details: `Missing environment variables: ${missingEnvVars.join(', ')}`,
            code: 'CONFIG_ERROR',
            help: "Please check your .env.local file and ensure all required variables are set."
          },
          { status: 500 }
        );
      }
      
      // In production, provide a more generic error
      return NextResponse.json(
        { 
          error: "Service temporarily unavailable",
          details: "Server configuration issue",
          code: 'CONFIG_ERROR'
        },
        { status: 503 }
      );
    }

    if (!process.env.APP_ID) {
      console.error("APP_ID not found in environment variables");
      return NextResponse.json(
        { error: "APP_ID not configured" },
        { status: 500 }
      );
    }

    // Validate payload
    if (!payload || !action) {
      console.error("Missing required payload or action");
      return NextResponse.json(
        { 
          error: "Invalid request",
          details: "Missing payload or action",
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Validate World ID payload structure
    if (!payload.nullifier_hash) {
      console.error("Missing nullifier_hash in payload");
      return NextResponse.json(
        { 
          error: "Invalid World ID payload",
          details: "Missing nullifier_hash",
          code: 'INVALID_PAYLOAD'
        },
        { status: 400 }
      );
    }

    console.log("Starting verification with:", {
      payloadType: typeof payload,
      payloadKeys: payload ? Object.keys(payload) : null,
      action,
      appId: process.env.APP_ID,
      hasNullifierHash: !!payload.nullifier_hash
    });

    try {
      console.log("Calling verifyCloudProof...");
      
      // Prepare the verification payload with required fields
      const verificationPayload = {
        ...payload,
        // Ensure verification_level is present (default to 'orb' if missing)
        verification_level: payload.verification_level || 'orb'
      };

      const verifyResult = await verifyCloudProof(
        verificationPayload,
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

        // Handle validation errors
        if (verifyResult.code === 'validation_error') {
          return NextResponse.json(
            { 
              success: false, 
              error: "Invalid verification data",
              details: verifyResult.detail || verifyResult,
              code: verifyResult.code
            },
            { status: 400 }
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

      console.log("Verification process completed successfully");
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

    } catch (verificationError: any) {
      console.error("World ID verification error:", {
        message: verificationError?.message,
        name: verificationError?.name,
        stack: verificationError?.stack,
        error: JSON.stringify(verificationError, null, 2)
      });

      return NextResponse.json(
        { 
          error: "World ID verification failed",
          details: {
            message: verificationError?.message,
            type: verificationError?.name,
            error: JSON.stringify(verificationError)
          },
          code: 'VERIFICATION_ERROR'
        },
        { status: 500 }
      );
    }

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
        },
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
