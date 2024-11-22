"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Laptop, Smartphone, Tablet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Device {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  lastActive: string;
  isCurrentDevice?: boolean;
}

interface DevicesListProps {
  devices: Device[];
  onRefresh: () => void;
}

export function DevicesList({ devices, onRefresh }: DevicesListProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRemoveDevice = async () => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/devices/${selectedDevice.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Device removed successfully');
        setSelectedDevice(null);
        onRefresh();
      } else {
        toast.error('Failed to remove device');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-6 w-6" />;
      case 'tablet':
        return <Tablet className="h-6 w-6" />;
      default:
        return <Laptop className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Active Devices</h3>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`p-4 rounded-lg border ${
              device.isCurrentDevice ? 'bg-primary/5' : 'bg-background'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {getDeviceIcon(device.deviceType)}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {device.browser} on {device.os}
                    </p>
                    {device.isCurrentDevice && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Current device
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {device.location || 'Unknown location'} • Last active{' '}
                    {format(new Date(device.lastActive), 'PPp')}
                  </p>
                </div>
              </div>
              {!device.isCurrentDevice && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDevice(device)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Device</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove access from this device. You'll need to sign in again on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDevice} disabled={loading}>
              {loading ? 'Removing...' : 'Remove Device'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}