import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { verifyTOTP } from '@/lib/2fa';
import { getDeviceInfo } from '@/lib/utils/security';
import { createNotification } from '@/lib/utils/notifications';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials');
}

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error('Missing GitHub OAuth credentials');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
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

        if (user.isLocked()) {
          throw new Error('Account is temporarily locked. Please try again later.');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          await user.incrementLoginAttempts();
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

        // Get device info
        const deviceInfo = getDeviceInfo(
          req.headers['user-agent'] || '',
          req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown'
        );

        // Update device list
        const deviceId = Math.random().toString(36).substr(2, 9);
        const newDevice = {
          id: deviceId,
          ...deviceInfo,
          lastActive: new Date(),
          isCurrentDevice: true,
        };

        // Update existing devices
        user.devices = user.devices.map(device => ({
          ...device,
          isCurrentDevice: false,
        }));
        user.devices.push(newDevice);

        // Update login history
        const loginInfo = {
          timestamp: new Date(),
          ip: deviceInfo.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          location: deviceInfo.location,
          success: true,
        };

        user.lastLogin = loginInfo.timestamp;
        user.loginHistory.push(loginInfo);
        await user.resetLoginAttempts();
        await user.save();

        // Create notification for new device login
        if (user.preferences.loginAlerts) {
          await createNotification(
            user,
            'security',
            'New Device Login',
            `New login detected from ${deviceInfo.browser} on ${deviceInfo.os}`
          );
        }

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
    async signIn({ user, account, profile }) {
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

      // Create new user for social login
      await User.create({
        email: user.email,
        name: user.name,
        image: user.image,
        provider: account?.provider,
        providerId: account?.providerAccountId,
        isVerified: true, // Social logins are pre-verified
        preferences: {
          emailNotifications: true,
          loginAlerts: true,
          newsletter: false,
          theme: 'system',
        },
      });

      return true;
    },
    async jwt({ token, user, account }) {
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };