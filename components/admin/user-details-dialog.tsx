"use client";

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
    Shield,
    Smartphone,
    Activity,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface UserDetailsDialogProps {
    userId: string;
    open: boolean;
    onClose: () => void;
}

interface UserDetails {
    user: {
        id: string;
        email: string;
        name?: string;
        role: string;
        subscription: string;
        createdAt: string;
        updatedAt: string;
    };
    stats: {
        login: {
            totalLogins: number;
            successfulLogins: number;
            failedLogins: number;
            lastLoginAttempt?: string;
        };
        devices: {
            totalDevices: number;
            activeDevices: number;
            deviceTypes: Record<string, number>;
        };
        security: {
            isVerified: boolean;
            isPhoneVerified: boolean;
            twoFactorEnabled: boolean;
            failedLoginAttempts: number;
            isLocked: boolean;
        };
    };
}

export function UserDetailsDialog({ userId, open, onClose }: UserDetailsDialogProps) {
    const [details, setDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && userId) {
            fetchUserDetails();
        }
    }, [userId, open]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/users/${userId}/details`);
            if (response.ok) {
                const data = await response.json();
                setDetails(data);
            }
        } catch (error) {
            console.error('Failed to fetch user details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!details || loading) {
        return null;
    }

    const loginChartData = {
        labels: ['Successful', 'Failed'],
        datasets: [
            {
                data: [details.stats.login.successfulLogins, details.stats.login.failedLogins],
                backgroundColor: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'],
            },
        ],
    };

    const deviceChartData = {
        labels: Object.keys(details.stats.devices.deviceTypes),
        datasets: [
            {
                data: Object.values(details.stats.devices.deviceTypes),
                backgroundColor: [
                    'hsl(var(--chart-1))',
                    'hsl(var(--chart-2))',
                    'hsl(var(--chart-3))',
                ],
            },
        ],
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[calc(90vh-8rem)]">
                    <div className="space-y-6 p-6">
                        <Card className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                            <dd>{details.user.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                                            <dd>{details.user.name || 'Not set'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                                            <dd className="capitalize">{details.user.role}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-muted-foreground">Subscription</dt>
                                            <dd className="capitalize">{details.user.subscription}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {details.stats.security.isVerified ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            <span>Email verification</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {details.stats.security.isPhoneVerified ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            <span>Phone verification</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {details.stats.security.twoFactorEnabled ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            <span>Two-factor authentication</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Tabs defaultValue="activity">
                            <TabsList>
                                <TabsTrigger value="activity">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Activity
                                </TabsTrigger>
                                <TabsTrigger value="devices">
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    Devices
                                </TabsTrigger>
                                <TabsTrigger value="security">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Security
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="activity" className="space-y-4">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Login Statistics</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <dl className="space-y-2">
                                                <div>
                                                    <dt className="text-sm font-medium text-muted-foreground">Total Logins</dt>
                                                    <dd className="text-2xl font-bold">{details.stats.login.totalLogins}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-muted-foreground">Last Login</dt>
                                                    <dd>
                                                        {details.stats.login.lastLoginAttempt
                                                            ? format(new Date(details.stats.login.lastLoginAttempt), 'PPp')
                                                            : 'Never'}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                        <div className="h-[200px]">
                                            <Line
                                                data={loginChartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: true,
                                                            position: 'bottom',
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="devices" className="space-y-4">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Device Usage</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <dl className="space-y-2">
                                                <div>
                                                    <dt className="text-sm font-medium text-muted-foreground">Total Devices</dt>
                                                    <dd className="text-2xl font-bold">{details.stats.devices.totalDevices}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-muted-foreground">Active Devices</dt>
                                                    <dd className="text-2xl font-bold">{details.stats.devices.activeDevices}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                        <div className="h-[200px]">
                                            <Line
                                                data={deviceChartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: true,
                                                            position: 'bottom',
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security" className="space-y-4">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Security Status</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Account Protection</h4>
                                                <dl className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-muted-foreground">Failed Login Attempts</dt>
                                                        <dd className="font-medium">{details.stats.security.failedLoginAttempts}</dd>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-muted-foreground">Account Locked</dt>
                                                        <dd>
                                                            {details.stats.security.isLocked ? (
                                                                <span className="text-red-500">Yes</span>
                                                            ) : (
                                                                <span className="text-green-500">No</span>
                                                            )}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">Security Features</h4>
                                                <dl className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-muted-foreground">Email Verification</dt>
                                                        <dd>
                                                            {details.stats.security.isVerified ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </dd>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-muted-foreground">Phone Verification</dt>
                                                        <dd>
                                                            {details.stats.security.isPhoneVerified ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </dd>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-sm text-muted-foreground">Two-Factor Auth</dt>
                                                        <dd>
                                                            {details.stats.security.twoFactorEnabled ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}