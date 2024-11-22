"use client";

import { Control, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
  control: Control<any>;
  name: string;
}

export function PhoneInputField({ control, name }: PhoneInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <PhoneInput
          country={'us'}
          value={value}
          onChange={phone => onChange(phone)}
          inputClass="!w-full !h-10 !text-base !border-input"
          containerClass="!w-full"
          buttonClass="!h-10 !border-input"
          enableSearch
          searchClass="!text-base"
          dropdownClass="!text-base"
        />
      )}
    />
  );
}