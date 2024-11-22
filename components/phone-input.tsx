"use client";

import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const countryCodes = [
  { value: '+1', label: 'US (+1)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+91', label: 'IN (+91)' },
  // Add more country codes as needed
];

interface PhoneInputProps {
  control: Control<any>;
  name: string;
}

export function PhoneInput({ control, name }: PhoneInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex gap-2">
          <Select
            value={field?.value?.split(' ')[0] || '+1'}
            onValueChange={(value) => {
              const number = field?.value?.split(' ')[1] || '';
              field.onChange(`${value} ${number}`);
            }}
          >
            {countryCodes.map((code) => (
              <option key={code.value} value={code.value}>
                {code.label}
              </option>
            ))}
          </Select>
          <Input
            type="tel"
            value={field?.value?.split(' ')[1] || ''}
            onChange={(e) => {
              const code = field?.value?.split(' ')[0] || '+1';
              field.onChange(`${code} ${e.target.value}`);
            }}
            placeholder="Phone number"
            className="flex-1"
          />
        </div>
      )}
    />
  );
}