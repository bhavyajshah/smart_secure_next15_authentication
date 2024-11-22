"use client";

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string) => {
        switch (error) {
            case 'CredentialsSignin':
                return 'Invalid email or password';
            case 'EmailNotVerified':
                return 'Please verify your email before logging in';
            default:
                return 'An error occurred during authentication';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                    <XCircle className="h-12 w-12 text-red-500" />
                    <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
                    <p className="text-gray-600">
                        {error ? getErrorMessage(error) : 'An error occurred during authentication'}
                    </p>
                    <div className="space-x-4">
                        <Button asChild variant="default">
                            <Link href="/auth/login">Try Again</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Return Home</Link>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}