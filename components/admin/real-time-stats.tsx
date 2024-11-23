"use client";

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Activity,
    TrendingUp,
    Users,
    Shield,
} from 'lucide-react';

interface RealTimeStatsProps {
    stats: {
        totalUsers: number;
        verifiedUsers: number;
        activeUsers: number;
        usersByRole: Record<string, number>;
        usersBySubscription: Record<string, number>;
    };
}

export function RealTimeStats({ stats }: RealTimeStatsProps) {
    const verificationRate = (stats.verifiedUsers / stats.totalUsers) * 100;
    const activeRate = (stats.activeUsers / stats.totalUsers) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Activity className="h-8 w-8 text-primary" />
                    <div>
                        <h2 className="text-2xl font-bold">Real-Time Overview</h2>
                        <p className="text-muted-foreground">Live system statistics</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Verification Rate</span>
                            <span className="text-sm font-medium">{verificationRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={verificationRate} className="h-2" />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Active Users Rate</span>
                            <span className="text-sm font-medium">{activeRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={activeRate} className="h-2" />
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                        <h2 className="text-2xl font-bold">System Health</h2>
                        <p className="text-muted-foreground">Current system status</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">User Roles</span>
                        </div>
                        <div className="space-y-1">
                            {Object.entries(stats.usersByRole).map(([role, count]) => (
                                <div key={role} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground capitalize">{role}</span>
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">Subscriptions</span>
                        </div>
                        <div className="space-y-1">
                            {Object.entries(stats.usersBySubscription).map(([sub, count]) => (
                                <div key={sub} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground capitalize">{sub}</span>
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}