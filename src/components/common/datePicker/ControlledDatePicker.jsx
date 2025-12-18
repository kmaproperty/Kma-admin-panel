import React from "react";
import { Controller } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const ControlledDatePicker = ({
    name,
    control,
    label,
    isRequired = false,
    rules,
    minDate,
    maxDate,
    disableFuture = false,
    disablePast = false,
    ...rest
}) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    {label}
                    {isRequired && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState }) => {
                    const hasError = Boolean(fieldState.error);

                    return (
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            {/* Tailwind Wrapper Div */}
                            <div
                                className={`
              flex items-center w-full h-[44px] bg-white border rounded-[0.5rem] px-2 transition-colors
              ${hasError ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500'}
            `}
                            >
                                <DatePicker
                                    {...field}
                                    value={field.value || null}
                                    onChange={(date) => field.onChange(date)}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    disableFuture={disableFuture}
                                    disablePast={disablePast}
                                    slotProps={{
                                        textField: {
                                            id: name,
                                            fullWidth: true,
                                            variant: "standard", // Using 'standard' removes the default box/border
                                            InputProps: {
                                                disableUnderline: true, // Removes the bottom line of the standard variant
                                            },
                                            sx: {
                                                "& .MuiInputBase-root": {
                                                    height: "100%",
                                                    fontSize: "0.75rem", // text-sm
                                                },
                                                "& .MuiInputBase-input": {
                                                    padding: "0 8px",
                                                    fontSize: "0.75rem"
                                                },
                                            },
                                        },
                                    }}
                                    {...rest}
                                />
                            </div>
                            {/* Error Message outside the wrapper */}
                            {hasError && (
                                <p className="mt-1 text-xs text-red-500">{fieldState.error.message}</p>
                            )}
                        </LocalizationProvider>
                    );
                }}
            />
        </div>
    );
};

export default ControlledDatePicker;