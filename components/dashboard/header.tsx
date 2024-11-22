"use client";

import { User } from 'next-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, Shield } from 'lucide-react';

interface DashboardHeaderProps {
  user?: User & {
    role?: string;
    subscription?: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          {user?.role === 'admin' && (
            <Button asChild>
              <Link href="/admin/dashboard">
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}