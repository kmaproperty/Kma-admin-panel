import { InputBase } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';

const TextField = ({
  placeHolder,
  disabled,
  control,
  name,
  label,
  type = "text",
}) => {
  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700 ml-1">
          {label}
        </label>
      )}

      <Controller
        name={name}
        defaultValue=""
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col">
            <div
              className={`
                flex items-center px-3 py-1.5 rounded-lg border transition-all duration-200
                ${error 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
                }
                ${disabled ? 'opacity-60 bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
              `}
            >
              <InputBase
                {...field}
                type={type}
                placeholder={placeHolder}
                disabled={disabled}
                fullWidth
                // Prevent scrolling on number inputs (optional UI preference)
                onWheel={(e) => type === "number" && e.target.blur()}
                onChange={(e) => {
                  const val = e.target.value;
                  // Handle number conversion for Hook Form state
                  if (type === "number") {
                    field.onChange(val === "" ? "" : Number(val));
                  } else {
                    field.onChange(val);
                  }
                }}
                sx={{
                  fontSize: '14px',
                  color: '#1f2937', // text-gray-800
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="mt-1 ml-1 text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
                {error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default TextField;