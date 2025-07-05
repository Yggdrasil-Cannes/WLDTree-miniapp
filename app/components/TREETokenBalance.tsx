'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTREEToken } from '@/hooks/useTREEToken';
import { TreePine, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface TREETokenBalanceProps {
  className?: string;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export function TREETokenBalance({ 
  className = '', 
  showActions = true,
  variant = 'default'
}: TREETokenBalanceProps) {
  const {
    balance,
    userStats,
    tokenEconomics,
    isLoading,
    error,
    canClaimToday,
    isWorldApp
  } = useTREEToken();

  const [showDetails, setShowDetails] = useState(false);

  // Format numbers for display
  const formatNumber = (num: string | number) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  const renderCompactView = () => (
    <Card className={`border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TreePine className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-green-800">
                {formatNumber(balance)} TREE
              </div>
              <div className="text-xs text-green-600">
                Heritage Tokens
              </div>
            </div>
          </div>
          {showActions && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDefaultView = () => (
    <Card className={`border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-green-800">
          <TreePine className="h-6 w-6 text-green-600" />
          <span>Heritage TREE Tokens</span>
          {isWorldApp() && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              World Chain
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Balance Display */}
        <div className="text-center p-4 bg-white rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-800 mb-1">
            {isLoading ? '...' : formatNumber(balance)}
          </div>
          <div className="text-green-600 font-medium">TREE Tokens</div>
          <div className="text-xs text-gray-500 mt-1">
            Your genealogy heritage rewards
          </div>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-green-100">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-600">Today</span>
            </div>
            <div className="font-semibold text-green-800">
              {formatNumber(userStats.dailyClaimed)}
            </div>
            <div className="text-xs text-gray-500">Claimed</div>
          </div>
          
          <div className="p-3 bg-white rounded-lg border border-green-100">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-600">Remaining</span>
            </div>
            <div className="font-semibold text-green-800">
              {formatNumber(userStats.dailyRemaining)}
            </div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Conversion Rate</span>
          </div>
          <div className="text-lg font-bold text-green-800">
            {tokenEconomics.conversionRate} HP = 1 TREE
          </div>
          <div className="text-xs text-green-600 mt-1">
            Heritage Points to TREE tokens
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        )}

        {/* Detailed Token Economics */}
        {showDetails && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-green-200 space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <TreePine className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Token Economics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-600">Circulating Supply:</span>
                <div className="font-semibold text-green-800">
                  {formatNumber(tokenEconomics.currentSupply)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Max Supply:</span>
                <div className="font-semibold text-green-800">
                  {formatNumber(tokenEconomics.maxSupply)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Daily Limit:</span>
                <div className="font-semibold text-green-800">
                  {formatNumber(tokenEconomics.dailyLimit)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Max Reward:</span>
                <div className="font-semibold text-green-800">
                  {formatNumber(tokenEconomics.maxRewardSize)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-600">{error}</span>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            {canClaimToday() ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Can claim today</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Daily limit reached</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>World Chain</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return variant === 'compact' ? renderCompactView() : renderDefaultView();
}

export default TREETokenBalance; 