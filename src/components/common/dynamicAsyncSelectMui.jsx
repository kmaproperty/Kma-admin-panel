import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
} from "@mui/material";

const DynamicAsyncAutocomplete = ({
  loadOptions,
  isMulti = false,
  placeholder = "Start typing...",
  onChange,
  value,
  isError = false,
  minHeight = 40,
  enableAddManually = false,
  menualAddItem,
  styles,
  changeStyle = false,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      if (!open || inputValue.trim() === "") {
        setOptions([]);
        return;
      }

      setLoading(true);
      const result = await loadOptions(inputValue);
      if (active) {
        let opts = Array.isArray(result) ? result : [];
        if (enableAddManually && menualAddItem) {
          opts = [...opts, menualAddItem];
        }
        setOptions(opts);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [inputValue, open, loadOptions, enableAddManually, menualAddItem]);

  return (
    <Autocomplete
      multiple={isMulti}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={value || (isMulti ? [] : null)}
      onChange={(e, newValue) => onChange?.(newValue)}
      inputValue={inputValue}
      onInputChange={(e, val) => setInputValue(val)}
      getOptionLabel={(option) => option?.label ?? ""}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      loading={loading}
      filterOptions={(x) => x}
      componentsProps={{
        popupIndicator: { style: { display: "none" } },
      }}
     sx={{
        width: "100%",
        ...(changeStyle
          ? {
              
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                minHeight: "52px",
                paddingX: "12px",
                fontSize: "1rem",
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "#d1d5db",
                },
                "&:hover fieldset": {
                  borderColor: "#c7c7c7",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#c7c7c7", 
                },
              },
              "& .MuiInputBase-input": {
                padding: "0 !important",
                height: "1.75rem",
              },
            }
          : {
              "& .MuiOutlinedInput-root": {
                borderRadius: "9999px",
                minHeight:
                  typeof minHeight === "number"
                    ? `${minHeight}px`
                    : minHeight,
                fontSize: "0.95rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.5rem",
                boxShadow: "none",
                "& fieldset": {
                  borderColor: "var(--color-border)",
                  boxShadow: "none",
                },
                "&:hover fieldset": {
                  borderColor: "var(--color-border)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color-border)",
                },
              },
              "& .MuiInputBase-input": {
                padding: "0 !important",
                paddingLeft: "12px !important",
                height: "1.5rem",
              },
            }),

        "& .MuiAutocomplete-popupIndicator": {
          display: "none",
        },

        ...styles,
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={typeof placeholder === "string" ? placeholder : undefined}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          error={isError}
        />
      )}
    />
  );
};

export default DynamicAsyncAutocomplete;
