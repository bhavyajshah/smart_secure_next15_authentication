import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { verifyTOTP } from '@/lib/2fa';
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in');
        }

        // Check 2FA if enabled
        if (user.twoFactorEnabled) {
          if (!credentials.totpCode) {
            throw new Error('2FA code required');
          }
          const isValidTOTP = verifyTOTP(user.twoFactorSecret!, credentials.totpCode);
          if (!isValidTOTP) {
            throw new Error('Invalid 2FA code');
          }
        }

        // Update user info
        const ip = req.headers?.['x-forwarded-for'] || 'unknown';
        const userAgent = req.headers?.['user-agent'] || 'unknown';
        const deviceInfo = getDeviceInfo(userAgent, ip as string);

        user.lastLogin = new Date();
        user.loginHistory.push({
          timestamp: new Date(),
          ip: deviceInfo.ip,
          userAgent: deviceInfo.browser,
          location: deviceInfo.location,
          success: true
        });

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
          name: user.name || null,
          role: user.role || 'user',
          subscription: user.subscription || 'free',
          emailVerified: user.isVerified,
          devices: user.devices
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email?.toLowerCase() });

        if (existingUser) {
          existingUser.provider = account?.provider;
          existingUser.providerId = account?.providerAccountId;
          if (!existingUser.isVerified) {
            existingUser.isVerified = true;
          }
          await existingUser.save();
        } else {
          await User.create({
            email: user.email?.toLowerCase(),
            name: user.name,
            provider: account?.provider,
            providerId: account?.providerAccountId,
            isVerified: true,
            phone: '',
            role: 'user',
            subscription: 'free'
          });
        }
        return true;
      } catch (error) {
        console.error('OAuth sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscription = user.subscription;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions);