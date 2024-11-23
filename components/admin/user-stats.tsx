"use client";

import { Card } from '@/components/ui/card';
import {
    Users,
    UserCheck,
    UserCog,
    CreditCard,
} from 'lucide-react';

interface UserStatsProps {
    stats: {
        totalUsers: number;
        verifiedUsers: number;
        activeUsers: number;
        usersByRole: Record<string, number>;
        usersBySubscription: Record<string, number>;
    };
}

export function UserStats({ stats }: UserStatsProps) {
    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            description: 'Total registered users',
        },
        {
            title: 'Verified Users',
            value: stats.verifiedUsers,
            icon: UserCheck,
            description: 'Email verified accounts',
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: UserCog,
            description: 'Active in last 24 hours',
        },
        {
            title: 'Premium Users',
            value: stats.usersBySubscription['premium'] || 0,
            icon: CreditCard,
            description: 'Premium subscribers',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statCards.map((stat, index) => (
                <Card key={index} className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </p>
                            <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <stat.icon className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        {stat.description}
                    </p>
                </Card>
            ))}
        </div>
    );
}