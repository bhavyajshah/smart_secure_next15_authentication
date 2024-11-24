//@ts-nocheck
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { verifyTOTP } from '@/lib/2fa';
import { AuthOptions } from 'next-auth';

export  const authOptions: AuthOptions  = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        if (user.twoFactorEnabled) {
          if (!credentials.totpCode) {
            throw new Error('2FA_REQUIRED');
          }

          const isValidTOTP = verifyTOTP(user.twoFactorSecret!, credentials.totpCode);
          if (!isValidTOTP) {
            throw new Error('Invalid 2FA code');
          }
        }

        // Update login history
        const loginInfo = {
          timestamp: new Date(),
          ip: req.headers['x-forwarded-for'] || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
        };

        user.lastLogin = loginInfo.timestamp;
        user.loginHistory.push(loginInfo);
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          subscription: user.subscription,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      await connectDB();

      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        if (account?.provider) {
          existingUser.provider = account.provider;
          existingUser.providerId = account.providerAccountId;
          await existingUser.save();
        }
        return true;
      }

      await User.create({
        email: user.email,
        name: user.name,
        image: user.image,
        provider: account?.provider,
        providerId: account?.providerAccountId,
        isVerified: true,
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
};