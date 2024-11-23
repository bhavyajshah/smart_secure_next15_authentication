"use client";

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ActivityLogProps {
  recentLogins: Array<{
    email: string;
    timestamp: Date;
    success: boolean;
    location?: string;
  }>;
}

export function ActivityLog({ recentLogins }: ActivityLogProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {recentLogins.map((login, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {login.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{login.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {login.location || 'Unknown location'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(login.timestamp), 'PPp')}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}