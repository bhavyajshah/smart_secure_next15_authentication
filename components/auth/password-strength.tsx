"use client";

import { useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const [strength, setStrength] = useState<number>(0);
    const [feedback, setFeedback] = useState<string[]>([]);

    useEffect(() => {
        if (password) {
            const result = zxcvbn(password);
            setStrength((result.score / 4) * 100);
            setFeedback(
                result.feedback.suggestions.length > 0
                    ? result.feedback.suggestions
                    : ['Password is strong']
            );
        } else {
            setStrength(0);
            setFeedback([]);
        }
    }, [password]);

    const getStrengthColor:any = () => {
        if (strength <= 25) return 'bg-red-500';
        if (strength <= 50) return 'bg-orange-500';
        if (strength <= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-2">
            <Progress
                value={strength}
                className="h-2"
                indicatorClassName={getStrengthColor()}
            />
            {feedback.length > 0 && (
                <ul className="text-sm space-y-1">
                    {feedback.map((tip, index) => (
                        <li
                            key={index}
                            className={`text-sm ${strength === 100 ? 'text-green-600' : 'text-gray-600'
                                }`}
                        >
                            {tip}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}