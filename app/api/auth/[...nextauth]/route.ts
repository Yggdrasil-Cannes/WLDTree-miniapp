import NextAuth, { NextAuthOptions } from "next-auth";
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  // Optimize session strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Optimize JWT settings
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) return false;
      const existing = await prisma.user.findUnique({ where: { id: user.id } });
      if (!existing) {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
          }
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // Include user info in JWT to avoid database calls on each request
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Get user info from token instead of database
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  
  // Completely disable debug mode for production-like performance
  debug: process.env.NODE_ENV === "development",
  
  // Add pages configuration for better performance
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
