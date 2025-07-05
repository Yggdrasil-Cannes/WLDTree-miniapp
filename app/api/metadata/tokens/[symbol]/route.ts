import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  if (symbol.toLowerCase() !== 'tree') {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const metadata = {
    name: "Heritage Tree Token",
    symbol: "TREE",
    decimals: 18,
    description: "TREE is the native reward of the WorldTree genealogy platform on World Chain — earned by building family trees, uploading DNA data, and discovering your heritage. Every token represents verified genealogy research, not speculation.",
    image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://worldtree.app'}/tokens/tree-token.png`,
    external_url: "https://worldtree.app",
    
    // World Chain specific properties
    network: "World Chain",
    chainId: process.env.NODE_ENV === 'production' ? 480 : 4801,
    contractAddress: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET
      : process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET,
    
    // Economics
    tokenomics: {
      totalSupply: "1000000000000000000000000000", // 1 billion * 10^18
      initialSupply: "100000000000000000000000000", // 100 million * 10^18
      conversionRate: "100 Heritage Points = 1 TREE",
      dailyClaimLimit: "1000 TREE",
      claimCooldown: "24 hours"
    },
    
    utility: [
      "Earned by genealogy research",
      "Reward for heritage contributions", 
      "Access to premium WorldTree features",
      "Governance participation",
      "Free claiming via World Send Transaction"
    ],
    
    attributes: [
      {
        trait_type: "Type",
        value: "Utility Token"
      },
      {
        trait_type: "Network", 
        value: "World Chain"
      },
      {
        trait_type: "Standard",
        value: "ERC-20"
      },
      {
        trait_type: "Gas Model",
        value: "Free via World Send Transaction"
      },
      {
        trait_type: "Use Case",
        value: "Heritage Research Rewards"
      },
      {
        trait_type: "Backing",
        value: "Genealogy Contributions"
      }
    ],
    
    links: {
      website: "https://worldtree.app",
      documentation: "https://docs.worldtree.app/tree-token",
      explorer: process.env.NODE_ENV === 'production'
        ? `https://worldchain.blockscout.com/token/${process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET}`
        : `https://worldchain-sepolia.blockscout.com/token/${process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET}`,
      worldApp: "https://worldcoin.org/apps/worldtree"
    },
    
    tags: ["utility", "reward", "genealogy", "heritage", "Web3", "family-tree", "world-chain"],
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(metadata, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}