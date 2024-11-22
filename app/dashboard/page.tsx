"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Settings, Shield, Activity, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardHeader } from '@/components/dashboard/header';
import { NotificationsList } from '@/components/dashboard/notifications';
import { DevicesList } from '@/components/dashboard/devices';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { SecurityOverview } from '@/components/dashboard/security-overview';

interface DashboardData {
  notifications: any[];
  devices: any[];
  loginHistory: any[];
  securityScore: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <DashboardHeader user={session?.user} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Activity Overview</h2>
            <Badge variant="secondary">Last 30 days</Badge>
          </div>
          <ActivityChart data={data?.loginHistory || []} />
        </Card>

        <Card className="p-6">
          <SecurityOverview score={data?.securityScore || 0} />
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Smartphone className="h-4 w-4 mr-2" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <ScrollArea className="h-[400px]">
              <NotificationsList 
                notifications={data?.notifications || []} 
                onRefresh={fetchDashboardData}
              />
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card className="p-6">
            <DevicesList 
              devices={data?.devices || []} 
              onRefresh={fetchDashboardData}
            />
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Recent Activity</h3>
              <div className="space-y-4">
                {data?.loginHistory?.slice(0, 10).map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {activity.success ? 'Successful login' : 'Failed login attempt'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.location || 'Unknown location'} • {activity.browser}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.timestamp), 'PPp')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}