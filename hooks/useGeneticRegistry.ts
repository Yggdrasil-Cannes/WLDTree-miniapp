import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

const TREE_ABI = [
  'function addToRegistry(address, bytes32, bytes32)',
  'function updateTreeHash(address, bytes32, bytes32)',
  // Events
  'event HashAddded(address userId, bytes32 genomeHash, bytes32 treeHash)',
  'event TreeHashUpdated(address userId, bytes32 treeHash)'
];

const WORLD_CHAIN_CONFIG = {
  chainId: process.env.NODE_ENV === 'production' ? 480 : 4801,
  chainName: process.env.NODE_ENV === 'production' ? 'World Chain' : 'World Chain Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    process.env.NODE_ENV === 'production' 
      ? 'https://worldchain.g.alchemy.com/public'
      : 'https://worldchain-sepolia.g.alchemy.com/public'
  ],
  blockExplorerUrls: [
    process.env.NODE_ENV === 'production'
      ? 'https://worldchain.explorer.alchemy.com'
      : 'https://worldchain-sepolia.explorer.alchemy.com'
  ]
};
export const useGeneticRegistry = () => {

}
