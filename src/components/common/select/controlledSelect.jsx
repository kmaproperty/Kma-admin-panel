import React from "react";
import Select from "react-select";
import { Controller } from "react-hook-form";

const DynamicSelectController = ({
  name,
  control,
  label,
  isRequired = false,
  isMulti = false,
  placeholder = "Start typing...",
  options = [],
  minHeight = "43.81px",
  fontwidth,
  styles,
  rules,
  ...rest
}) => {
  const defaultStyles = (hasError) => ({
    control: (base) => ({
      ...base,
      borderRadius: 8,
      boxShadow: "none",
      borderColor: hasError ? "#fb2c36" : "var(--color-border)",
      "&:hover": {
        borderColor: hasError ? "#fb2c36" : "var(--color-border)",
      },
      minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      paddingLeft: "0.5rem",
      fontSize:
        minHeight === "43.81px"
          ? "0.88rem"
          : fontwidth
          ? fontwidth
          : "0.750rem",
    }),
    input: (base) => ({ ...base, paddingLeft: 0 }),
    placeholder: (base) => ({
      ...base,
      color: "var(--color-text-gray)",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      paddingRight: "0.5rem",
      color: "var(--color-text-gray)",
      height: "30px",
      alignItems: "center",
    }),
    menu: (base) => ({
      ...base,
      fontSize: "0.875rem",
      borderRadius: 8,
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--color-blue)"
        : state.isFocused
        ? "var(--color-light-purple)"
        : "white",
      color: state.isSelected ? "var(--color-white)" : "var(--color-blue)",
      cursor: "pointer",
      ":active": {
        backgroundColor: !state.isDisabled
          ? "var(--color-blue)"
          : undefined,
        color: "white",
      },
    }),
  });

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
            <>
              <Select
                inputId={name}
                {...field}
                options={options}
                isMulti={isMulti}
                placeholder={placeholder}
                styles={styles || defaultStyles(hasError)}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                {...rest}
              />

              {hasError && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
            </>
          );
        }}
      />
    </div>
  );
};

export default DynamicSelectController;
