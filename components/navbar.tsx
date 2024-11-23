"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="font-bold">SecureAuth</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />

          {session ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/auth/login" passHref>
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}