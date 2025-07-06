import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("=== DEBUG VERIFICATION REQUEST ===");
    
    const { payload, action } = await req.json();
    
    console.log("Debug payload:", JSON.stringify(payload, null, 2));
    console.log("Debug action:", action);
    console.log("Debug APP_ID:", process.env.APP_ID);
    
    return NextResponse.json({
      success: true,
      message: "Debug endpoint - payload logged",
      originalPayload: payload,
      appId: process.env.APP_ID
    });
    
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