'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTREEToken } from '@/hooks/useTREEToken';
import { TreePine, Trophy, Zap, AlertCircle, CheckCircle } from 'lucide-react';

export default function TREETokenClaim() {
  const [heritagePointsAmount, setHeritagePointsAmount] = useState('');
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    success: boolean;
    message: string;
    transactionHash?: string;
  } | null>(null);

  const {
    balance,
    userStats,
    tokenEconomics,
    isLoading,
    error,
    claimTREETokens,
    canClaimToday,
    isWorldApp
  } = useTREEToken();

  // Calculate TREE tokens from heritage points locally
  const calculateLocalTREEFromHeritagePoints = (heritagePoints: number) => {
    const conversionRate = 100; // 100 heritage points = 1 TREE
    return Math.floor(heritagePoints / conversionRate);
  };

  const handleClaim = async () => {
    if (!heritagePointsAmount || isClaimingInProgress) return;

    const pointsToUse = parseInt(heritagePointsAmount);
    
    if (pointsToUse < 100) {
      setClaimResult({
        success: false,
        message: 'Minimum 100 heritage points required for claiming'
      });
      return;
    }

    setIsClaimingInProgress(true);
    setClaimResult(null);

    try {
      // Mock World ID proof for demo purposes
      const mockWorldIdProof = {
        merkle_root: '0x1234567890abcdef',
        nullifier_hash: '0xabcdef1234567890',
        proof: '0x...',
        verification_level: 'orb'
      };

      // Call the API to process the claim
      const response = await fetch('/api/claim-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: '0x123...', // This would come from wallet connection
          heritagePointsAmount: pointsToUse,
          worldIdProof: mockWorldIdProof
        }),
      });

      const result = await response.json();

      if (result.success) {
        setClaimResult({
          success: true,
          message: `Successfully claimed ${result.tokensToAward} TREE tokens! Transaction processed via World Chain.`,
          transactionHash: result.transactionHash
        });
        setHeritagePointsAmount('');
      } else {
        setClaimResult({
          success: false,
          message: result.error || 'Failed to claim tokens'
        });
      }
    } catch (error) {
      console.error('Claim failed:', error);
      setClaimResult({
        success: false,
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsClaimingInProgress(false);
    }
  };

  const currentHeritagePoints = parseInt(heritagePointsAmount) || 0;
  const estimatedTREE = calculateLocalTREEFromHeritagePoints(currentHeritagePoints);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TreePine className="h-6 w-6 text-green-600" />
          <span>Claim TREE Tokens</span>
          {isWorldApp() && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              World Chain
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800">Current TREE Balance</h3>
              <p className="text-sm text-green-600">Your Heritage Tokens</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-800">
                {balance} TREE
              </div>
              <div className="text-xs text-gray-500">
                Available for use
              </div>
            </div>
          </div>
        </div>

        {/* Claiming Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Heritage Points to Convert
            </label>
            <Input
              type="number"
              placeholder="Enter heritage points (minimum 100)"
              value={heritagePointsAmount}
              onChange={(e) => setHeritagePointsAmount(e.target.value)}
              min="100"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Conversion rate: 100 Heritage Points = 1 TREE Token
            </p>
          </div>

          {/* Preview */}
          {currentHeritagePoints > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    You will receive:
                  </span>
                </div>
                <div className="text-lg font-bold text-blue-800">
                  {estimatedTREE} TREE
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Using {currentHeritagePoints} heritage points
              </div>
            </div>
          )}

          {/* Claim Button */}
          <Button
            onClick={handleClaim}
            disabled={!heritagePointsAmount || currentHeritagePoints < 100 || isClaimingInProgress || !canClaimToday()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isClaimingInProgress ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing Claim...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Claim TREE Tokens
              </>
            )}
          </Button>

          {!canClaimToday() && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Daily claim limit reached. Try again tomorrow.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Result Display */}
        {claimResult && (
          <div className={`p-4 rounded-lg border ${
            claimResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {claimResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  claimResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {claimResult.message}
                </p>
                {claimResult.transactionHash && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction: {claimResult.transactionHash}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Today Claimed</div>
            <div className="text-lg font-bold text-green-600">
              {userStats.dailyClaimed} TREE
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Remaining</div>
            <div className="text-lg font-bold text-blue-600">
              {userStats.dailyRemaining} TREE
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">
            🌍 World Chain Benefits
          </h4>
          <ul className="space-y-1 text-sm text-green-700">
            <li>• Gas-free transactions via World Protocol</li>
            <li>• Instant minting with World Send Transaction</li>
            <li>• Sybil-resistant via World ID verification</li>
            <li>• Earn through genealogy research and family tree building</li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 