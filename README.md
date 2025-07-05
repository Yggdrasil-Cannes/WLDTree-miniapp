# WorldTree - Genealogy & Heritage Research Platform

> A comprehensive genealogy platform built as a World App mini app on World Chain, enabling users to build family trees, upload DNA data, and discover their heritage onchain.

## 🌳 About WorldTree

WorldTree is a **genealogy and heritage research platform** that helps users discover their family history through:

**Core Features:**
- **Token System** → TREE (Heritage Tree Tokens) for incentivizing research contributions
- **Smart Contracts** → Heritage Tree Token on World Chain for decentralized rewards
- **Component System** → Genealogy-focused UI components for family tree building
- **Service Layer** → Genealogy services for DNA analysis and family matching
- **React Hooks** → useWorldTree, useTREEToken for genealogy data management
- **Type System** → Genealogy types (family trees, DNA matches, heritage records)

## 🔧 Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **Blockchain**: World Chain, Hardhat, Ethers.js
- **Authentication**: NextAuth.js with SIWE (Sign-In with Ethereum)
- **File Storage**: Genealogy documents and DNA data management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- World ID account
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd worldtree

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Set up the database
pnpm db:setup

# Run database migrations
pnpm db:migrate

# Seed with sample genealogy data
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# World ID
NEXT_PUBLIC_WLD_APP_ID="your-world-app-id"
NEXT_PUBLIC_WLD_ACTION="worldtree-heritage-research"

# Heritage Tree Token Contracts
NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET="0x..."
NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET="0x..."

# Backend Wallet (for minting rewards)
BACKEND_WALLET_PRIVATE_KEY="your-backend-private-key"

# External APIs
OPENAI_API_KEY="your-openai-key" # For genealogy AI assistance
```

## 📁 Project Structure

```
worldtree/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes for genealogy services
│   ├── components/        # Page-specific components
│   ├── dashboard/         # User dashboard
│   ├── tree/              # Family tree builder
│   ├── dna/               # DNA analysis page
│   └── records/           # Historical records search
├── components/            # Shared React components
│   ├── navigation/        # Navigation components
│   ├── settings/          # Settings and profile
│   └── ui/                # Base UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
│   └── services/          # Genealogy service layer
├── prisma/                # Database schema and migrations
├── contracts/             # Smart contracts
│   └── HeritageTreeToken.sol
├── test/                  # Contract and service tests
└── scripts/               # Deployment and utility scripts
```

## 🧬 Core Features

### Family Tree Building
- Interactive family tree visualization
- Add/edit family members
- Photo and document uploads
- Relationship mapping

### DNA Analysis
- Upload DNA data files
- Match with potential relatives
- Ethnicity and heritage insights
- Migration pattern analysis

### Heritage Points & TREE Tokens
- Earn Heritage Points for research contributions
- Convert Heritage Points to TREE tokens (100 HP = 1 TREE)
- Onchain rewards for genealogy milestones
- Decentralized incentive system

### Historical Records
- Search historical databases
- Document preservation
- Family story collection
- Cultural heritage documentation

## 🏗️ Smart Contract Architecture

### Heritage Tree Token (TREE)
- **Contract**: `HeritageTreeToken.sol`
- **Network**: World Chain
- **Token Standard**: ERC-20
- **Max Supply**: 1 billion TREE tokens
- **Conversion Rate**: 100 Heritage Points = 1 TREE token

#### Key Functions:
- `claimHeritageReward()` - Convert Heritage Points to TREE
- `mintGenealogyReward()` - Backend rewards for milestones
- `updateConversionRate()` - Adjust economic parameters

### Badge System
- **Contract**: `EdgeEsmeraldaBadge.sol`
- **Achievement tracking for genealogy milestones**
- **NFT badges for family tree completion**

## 📊 Database Schema

Key entities for genealogy platform:
- **Users** - Genealogy researchers
- **FamilyMembers** - Family tree nodes
- **DNAMatches** - Genetic connections
- **HistoricalRecords** - Archived documents
- **HeritageCollections** - Organized family data
- **Challenges** - Genealogy research tasks

## 🛠️ Development Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed genealogy data
pnpm db:studio        # Open Prisma Studio

# Smart Contracts
pnpm contract:compile # Compile contracts
pnpm contract:test    # Run contract tests
pnpm contract:deploy  # Deploy to testnet

# Testing
pnpm test             # Run all tests
pnpm test:contracts   # Contract tests only
pnpm test:integration # Integration tests
```

## 🔧 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod

# Environment variables required:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET
# - World ID credentials
```

### Smart Contracts (World Chain)
```bash
# Deploy Heritage Tree Token
npx hardhat run scripts/deployTREE.js --network worldchain

# Authorize backend minter
npx hardhat run scripts/authorize-backend-minter.js --network worldchain

# Verify deployment
npx hardhat run scripts/test-tree-integration.js --network worldchain
```

## 🧪 Testing

### Unit Tests
```bash
pnpm test:contracts   # Smart contract tests
pnpm test:services    # Service layer tests
```

### Integration Tests
```bash
pnpm test:integration # Full stack tests
pnpm test:api         # API endpoint tests
```

### Manual Testing
- Family tree building workflow
- DNA upload and matching
- Heritage Points earning
- TREE token claiming
- Badge minting process

## 📈 Monitoring & Analytics

- **Onchain Analytics**: Track TREE token distribution
- **User Analytics**: Genealogy research patterns
- **Performance**: Database query optimization
- **Error Tracking**: Smart contract interaction monitoring

## 🔐 Security

- **Wallet Connection**: SIWE authentication
- **Smart Contract**: Audited Heritage Tree Token
- **Rate Limiting**: Heritage Points earning limits
- **Data Privacy**: Encrypted genealogy data storage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/genealogy-feature`)
3. Commit changes (`git commit -am 'Add genealogy feature'`)
4. Push to branch (`git push origin feature/genealogy-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **World Chain Team** - For the blockchain infrastructure
- **Genealogy Community** - For research methodology guidance
- **Open Source Libraries** - For the foundational tools
