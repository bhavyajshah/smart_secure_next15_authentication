"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorStatus {
    enabled: boolean;
    qrCode?: string;
    backupCodes?: string[];
}

export function TwoFactorSettings() {
    const { data: session, update } = useSession();
    const [status, setStatus] = useState<TwoFactorStatus | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTwoFactorStatus();
    }, []);

    const fetchTwoFactorStatus = async () => {
        try {
            const response = await fetch('/api/auth/2fa/status');
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error('Failed to fetch 2FA status:', error);
        }
    };

    const setupTwoFactor = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                setStatus({
                    enabled: false,
                    qrCode: data.qrCode,
                    backupCodes: data.backupCodes,
                });
            } else {
                toast.error('Failed to setup 2FA');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAndEnable = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: verificationCode }),
            });

            if (response.ok) {
                toast.success('Two-factor authentication enabled successfully');
                setStatus({ ...status!, enabled: true });
                update(); // Update the session
            } else {
                toast.error('Invalid verification code');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
            setVerificationCode('');
        }
    };

    const disableTwoFactor = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
            });

            if (response.ok) {
                toast.success('Two-factor authentication disabled');
                setStatus({ enabled: false });
                update(); // Update the session
            } else {
                toast.error('Failed to disable 2FA');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Shield className="h-8 w-8" />
                <div>
                    <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                    <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                    </p>
                </div>
            </div>

            {status?.enabled ? (
                <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="ml-2">Two-factor authentication is enabled</span>
                    </Alert>
                    <Button
                        variant="destructive"
                        onClick={disableTwoFactor}
                        disabled={isLoading}
                    >
                        Disable 2FA
                    </Button>
                </div>
            ) : status?.qrCode ? (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm">
                            1. Scan this QR code with your authenticator app (like Google Authenticator or Authy)
                        </p>
                        <div className="flex justify-center bg-white p-4 rounded-lg">
                            <Image
                                src={status.qrCode}
                                alt="2FA QR Code"
                                width={200}
                                height={200}
                                className="rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm">
                            2. Enter the verification code from your authenticator app
                        </p>
                        <div className="flex gap-4">
                            <Input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                className="w-40"
                            />
                            <Button onClick={verifyAndEnable} disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Verify & Enable'}
                            </Button>
                        </div>
                    </div>

                    {status.backupCodes && (
                        <div className="space-y-4">
                            <p className="text-sm font-medium">Backup Codes</p>
                            <Alert>
                                <p className="text-sm">
                                    Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {status.backupCodes.map((code, index) => (
                                        <code key={index} className="text-sm bg-muted p-1 rounded">
                                            {code}
                                        </code>
                                    ))}
                                </div>
                            </Alert>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <Alert>
                        <XCircle className="h-4 w-4 text-yellow-500" />
                        <span className="ml-2">Two-factor authentication is not enabled</span>
                    </Alert>
                    <Button onClick={setupTwoFactor} disabled={isLoading}>
                        {isLoading ? 'Setting up...' : 'Setup 2FA'}
                    </Button>
                </div>
            )}
        </Card>
    );
}