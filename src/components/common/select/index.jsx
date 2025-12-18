import React from "react";
import Select from "react-select";

const DynamicSelect = ({
  isMulti = false,
  placeholder = "Start typing...",
  onChange,
  styles,
  value,
  isError,
  minHeight = '47.81px',
  options = [],
  fontwidth,
  changeStyle=false,
  ...rest
}) => {
  const defaultStyles = {
    control: (base) => ({
      ...base,
      borderRadius: changeStyle ? '8px' : 9999,
      boxShadow: "none",
      borderColor: isError ? "#fb2c36" : "var(--color-border)",
      "&:hover": {
        borderColor: isError ? "#fb2c36" : "var(--color-border)",
      },
      minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      paddingLeft: "0.5rem",
      fontSize: minHeight == '47.81px' ? '1rem' : (fontwidth ? fontwidth : '0.750rem'),
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
      height: '30px',
      alignItems: 'center'
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
        ...base[":active"],
        backgroundColor: !state.isDisabled
          ? "var(--color-blue)"
          : undefined,
        color: "white",
      },
    }),
  };

  return (
    <div className="w-full">
      <Select
        isMulti={isMulti}
        placeholder={placeholder}
        options={options}
        styles={styles || defaultStyles}
        onChange={onChange}
        value={value}
        {...rest}
      />
    </div>
  );
};

export default DynamicSelect;
