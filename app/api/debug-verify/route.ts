import { NextResponse } from "next/server";
import { verifyCloudProof } from "@worldcoin/minikit-js";

export async function POST(req: Request) {
  try {
    console.log("=== DEBUG VERIFICATION REQUEST ===");
    
    const { payload, action } = await req.json();
    
    console.log("Debug payload:", JSON.stringify(payload, null, 2));
    console.log("Debug action:", action);
    console.log("Debug APP_ID:", process.env.APP_ID);
    
    // Test with a minimal valid payload
    const testPayload = {
      nullifier_hash: "test_hash_123",
      merkle_root: "test_root_123", 
      proof: "test_proof_123",
      verification_level: "orb"
    };
    
    console.log("Testing with payload:", JSON.stringify(testPayload, null, 2));
    
    try {
      const result = await verifyCloudProof(
        testPayload,
        process.env.APP_ID as `app_${string}`,
        action || "test"
      );
      
      console.log("Debug verification result:", JSON.stringify(result, null, 2));
      
      return NextResponse.json({
        success: true,
        testResult: result,
        originalPayload: payload,
        appId: process.env.APP_ID
      });
      
    } catch (verifyError: any) {
      console.error("Debug verification error:", {
        message: verifyError?.message,
        name: verifyError?.name,
        stack: verifyError?.stack
      });
      
      return NextResponse.json({
        success: false,
        error: "Verification failed in debug",
        details: {
          message: verifyError?.message,
          name: verifyError?.name,
          error: JSON.stringify(verifyError)
        }
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Debug endpoint failed",
      details: {
        message: error?.message,
        name: error?.name
      }
    }, { status: 500 });
  }
} 