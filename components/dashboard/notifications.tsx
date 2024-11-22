"use client";

import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'security' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  onRefresh: () => void;
}

export function NotificationsList({ notifications, onRefresh }: NotificationsListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string) => {
    try {
      setLoading(id);
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Notification marked as read');
        onRefresh();
      }
    } catch (error) {
      toast.error('Failed to update notification');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(id);
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Notification deleted');
        onRefresh();
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    } finally {
      setLoading(null);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No notifications</h3>
        <p className="text-muted-foreground">
          You're all caught up! We'll notify you when something new happens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border ${
            notification.read ? 'bg-muted/50' : 'bg-background'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={loading === notification.id}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(notification.id)}
                disabled={loading === notification.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}