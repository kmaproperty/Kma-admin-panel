import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Controller } from "react-hook-form";


const DynamicAsyncAutocompleteController = ({
 name,
control,
  loadOptions,
  isMulti = false,
  placeholder = "Start typing...",
  isError = false,
  enableAddManually = false,
  menualAddItem,
  styles,
  rules,
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

    <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={"Ahmedabad"}
        render={({ field, fieldState }) => {
          const hasError = Boolean(fieldState.error);
            console.log('field', field)
          return (
            <>
              <Autocomplete
                multiple={isMulti}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                options={options}
                value={Array.isArray(field.value) ? field.value : []}
                onChange={(e, newValue) => {
                    console.log('newvluae', newValue)
                    if(newValue){
                        const updatedData = newValue?.map(item => ({label: item.label, value: item.label}))
                        field.onChange(updatedData)
                    }else{
                        field.onChange([])
                    }
                }}
                inputValue={inputValue}
                onInputChange={(e, val) => {
                    setInputValue(val)
                }}
                getOptionLabel={(option) => option?.label ?? ""}
                isOptionEqualToValue={(opt, val) => opt.value == val.value}
                loading={loading}
                filterOptions={(x) => x}
                componentsProps={{
                    popupIndicator: { style: { display: "none" } },
                }}
                sx={{
                    width: "100%", 
                        
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            minHeight: "34px",
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

              {hasError && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
            </>
          );
        }}
      />
  );
};

export default DynamicAsyncAutocompleteController;
