import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { verifyTOTP } from '@/lib/2fa';
import { checkRateLimit } from '@/lib/rate-limit';
import { getDeviceInfo } from '@/lib/utils/security';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const ip = req.headers?.['x-forwarded-for'] || 'unknown';
          const userAgent = req.headers?.['user-agent'] || 'unknown';

          // Check rate limiting
          const canLogin = await checkRateLimit('login', ip);
          if (!canLogin) {
            throw new Error('Too many login attempts. Please try again later.');
          }

          await connectDB();

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            return null;
          }

          // Check if email is verified
          if (!user.isVerified) {
            throw new Error('Please verify your email before logging in.');
          }

          // Check if account is locked
          if (user.isLocked()) {
            throw new Error('Account is temporarily locked. Please try again later.');
          }

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) {
            await user.incrementLoginAttempts();
            return null;
          }

          // Check 2FA if enabled
          if (user.twoFactorEnabled) {
            if (!credentials.totpCode) {
              throw new Error('2FA_REQUIRED');
            }

            const isValidTOTP = verifyTOTP(user.twoFactorSecret!, credentials.totpCode);
            if (!isValidTOTP) {
              throw new Error('Invalid 2FA code');
            }
          }

          // Reset login attempts on successful login
          await user.resetLoginAttempts();

          // Update last login and device info
          const deviceInfo = getDeviceInfo(userAgent, ip as string);
          user.lastLogin = new Date();
          user.loginHistory.push({
            timestamp: new Date(),
            ip: deviceInfo.ip,
            userAgent: deviceInfo.browser,
            location: deviceInfo.location,
            success: true
          });

          // Add or update device information
          const deviceId = `${deviceInfo.browser}-${deviceInfo.os}`.toLowerCase();
          const existingDevice = user.devices.find((d: { id: string; }) => d.id === deviceId);
          if (existingDevice) {
            existingDevice.lastActive = new Date();
            existingDevice.ip = deviceInfo.ip;
            existingDevice.location = deviceInfo.location;
          } else {
            user.devices.push({
              id: deviceId,
              ...deviceInfo,
              lastActive: new Date()
            });
          }

          await user.save();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            subscription: user.subscription
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    }),
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
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      // For OAuth providers
      try {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Update OAuth information
          existingUser.provider = account?.provider;
          existingUser.providerId = account?.providerAccountId;
          if (!existingUser.isVerified) {
            existingUser.isVerified = true;
          }
          await existingUser.save();
        } else {
          // Create new user for OAuth
          await User.create({
            email: user.email,
            name: user.name,
            provider: account?.provider,
            providerId: account?.providerAccountId,
            isVerified: true,
          });
        }
        return true;
      } catch (error) {
        console.error('OAuth sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscription = user.subscription;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as string;
        session.user.provider = token.provider as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };