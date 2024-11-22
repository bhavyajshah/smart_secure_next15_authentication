import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Lock, UserCheck, Key } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="text-center space-y-8 max-w-3xl">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Secure Authentication System
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            A robust, secure, and user-friendly authentication system built with Next.js
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/auth/register" passHref>
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/auth/login" passHref>
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 pt-12">
          <div className="flex flex-col items-center space-y-2 p-4">
            <Lock className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Secure by Design</h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Built with security best practices and modern encryption standards
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4">
            <UserCheck className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">User Verification</h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Email verification and secure password recovery system
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4">
            <Key className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Role-Based Access</h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Granular access control with user and admin roles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}