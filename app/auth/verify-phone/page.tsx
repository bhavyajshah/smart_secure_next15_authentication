"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const verifyPhoneSchema = z.object({
    code: z.string().length(6, 'OTP must be 6 digits'),
});

type VerifyPhoneFormData = z.infer<typeof verifyPhoneSchema>;

export default function VerifyPhonePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyPhoneFormData>({
        resolver: zodResolver(verifyPhoneSchema),
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((time) => {
                if (time <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return time - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const onSubmit = async (data: VerifyPhoneFormData) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/verify-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: data.code,
                    token: searchParams.get('token'),
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Phone number verified successfully');
                router.push('/auth/login');
            } else {
                toast.error(result.error || 'Verification failed');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/resend-phone-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: searchParams.get('token'),
                }),
            });

            if (response.ok) {
                toast.success('New verification code sent');
                setTimeLeft(60);
                setCanResend(false);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to resend code');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Verify Your Phone Number</h1>
                    <p className="text-gray-600 mt-2">
                        Enter the 6-digit code sent to your phone
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            {...register('code')}
                            className={errors.code ? 'border-red-500' : ''}
                            placeholder="Enter 6-digit code"
                            disabled={isLoading}
                        />
                        {errors.code && (
                            <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify Phone Number'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {canResend ? (
                            <Button
                                variant="link"
                                onClick={handleResendCode}
                                disabled={isLoading}
                                className="p-0 h-auto font-normal"
                            >
                                Resend verification code
                            </Button>
                        ) : (
                            `Resend code in ${timeLeft} seconds`
                        )}
                    </p>
                </div>
            </Card>
        </div>
    );
}