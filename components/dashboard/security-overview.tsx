"use client";

import dynamic from 'next/dynamic';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const DynamicProgress = dynamic(() => import('@/components/ui/progress').then(mod => mod.Progress), {
  ssr: false,
});

interface SecurityOverviewProps {
  score: number;
}

export function SecurityOverview({ score }: SecurityOverviewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="h-8 w-8" />
        <div>
          <h2 className="text-2xl font-semibold">Security Score</h2>
          <p className="text-sm text-muted-foreground">
            Your account security status
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Overall Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </span>
        </div>
        <DynamicProgress value={score} className="h-2" />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Security Checklist</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Email verified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Strong password</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm">Two-factor authentication not enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}