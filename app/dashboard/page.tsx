"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { RealTimeStats } from '@/components/admin/real-time-stats';
import { UserStats } from '@/components/admin/user-stats';
import { ActivityLog } from '@/components/admin/activity-log';
import { UserDetailsDialog } from '@/components/admin/user-details-dialog';
import { DashboardHeader } from '@/components/dashboard/header';

interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
  isVerified: boolean;
  subscription: string;
  lastLogin?: Date;
}

interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  usersBySubscription: Record<string, number>;
  recentLogins: Array<{
    email: string;
    timestamp: Date;
    success: boolean;
    location?: string;
  }>;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchUsers(), fetchStats()]);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        toast.success('User role updated successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update user role');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const updateSubscription = async (userId: string, subscription: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        toast.success('Subscription updated successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update subscription');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <DashboardHeader user={session?.user} />
      {stats && <RealTimeStats stats={stats} />}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={fetchData}>Refresh</Button>
          </div>
        </div>

        <Tabs default Value="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {stats && <UserStats stats={stats} />}
          </TabsContent>

          <TabsContent value="users">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user._id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.subscription}
                          onValueChange={(value) => updateSubscription(user._id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? format(new Date(user.lastLogin), 'PPp')
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user._id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            {stats && <ActivityLog recentLogins={stats.recentLogins} />}
          </TabsContent>
        </Tabs>
      </Card>

      <UserDetailsDialog
        userId={selectedUser || ''}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}