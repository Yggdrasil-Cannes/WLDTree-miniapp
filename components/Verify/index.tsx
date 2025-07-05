"use client";
import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
  MiniAppVerifyActionErrorPayload,
  IVerifyResponse,
} from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel; // Default: Orb
};

interface VerifyBlockProps {
  action?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export const VerifyBlock = ({ 
  action = "verify", 
  onSuccess, 
  onError 
}: VerifyBlockProps = {}) => {
  const [handleVerifyResponse, setHandleVerifyResponse] = useState<
    MiniAppVerifyActionErrorPayload | IVerifyResponse | { error: string } | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifyPayload: VerifyCommandInput = {
    action: action,
    signal: "",
    verification_level: VerificationLevel.Orb,
  };

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.warn("Tried to invoke 'verify', but MiniKit is not installed.");
      const error = { error: "MiniKit not installed" };
      setHandleVerifyResponse(error);
      onError?.(error);
      return null;
    }

    setIsLoading(true);

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      // no need to verify if command errored
      if (finalPayload.status === "error") {
        console.log("Command error");
        console.log(finalPayload);
        setHandleVerifyResponse(finalPayload);
        onError?.(finalPayload);
        setIsLoading(false);
        return finalPayload;
      }

      // Verify the proof in the backend
      const verifyResponse = await fetch(`/api/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: verifyPayload.action,
          signal: verifyPayload.signal,
        }),
      });

      const verifyResponseJson = await verifyResponse.json();

      if (verifyResponseJson.status === 200 || verifyResponse.ok) {
        console.log("Verification success!");
        console.log(finalPayload);
        setHandleVerifyResponse(verifyResponseJson);
        onSuccess?.(finalPayload);
      } else {
        console.error("Verification failed:", verifyResponseJson);
        setHandleVerifyResponse(verifyResponseJson);
        onError?.(verifyResponseJson);
      }

      setIsLoading(false);
      return verifyResponseJson;
    } catch (error) {
      console.error("Verification error:", error);
      const errorObj = { error: error instanceof Error ? error.message : 'Verification failed' };
      setHandleVerifyResponse(errorObj);
      onError?.(errorObj);
      setIsLoading(false);
      return errorObj;
    }
  }, [verifyPayload.action, onSuccess, onError]);

  return (
    <div className="w-full">
      <button 
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verifying...
          </>
        ) : (
          <>
            🌍 Verify with World ID
          </>
        )}
      </button>
      
      {handleVerifyResponse && process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-gray-500">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-800 text-gray-300 rounded text-xs overflow-auto">
            {JSON.stringify(handleVerifyResponse, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
