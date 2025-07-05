/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET: process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET,
    NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET: process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET,
  },
  
  // Allow ngrok origins for development
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['3823-174-160-246-170.ngrok-free.app'],
  }),
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Three.js optimization
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Handle shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });

    // Optimize for 3D performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'three', '@react-three/fiber', '@react-three/drei']
  },
  transpilePackages: ['three'],

  // Development mode optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Skip type checking in development for faster builds
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
};

export default nextConfig;
