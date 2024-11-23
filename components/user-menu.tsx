'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { UserCircle, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
    user: {
        email?: string | null;
        role?: string | null;
    } | null | undefined;
}

export function UserMenu({ user }: UserMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">Open user menu</span>
                    <UserCircle className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex-col items-start">
                    <div className="text-sm font-medium">{user?.email}</div>
                    <div className="text-xs text-muted-foreground">
                        {user?.role}
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full">
                        Dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}