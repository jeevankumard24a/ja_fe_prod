"use client";

import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { StylesConfig, SingleValue } from "react-select";
import { toast } from "react-toastify";

export interface SelectOption {
  value: string;
  label: string;
}

const customStyles: StylesConfig<SelectOption, false> = {
  control: (provided) => ({
    ...provided,
    borderColor: "#e2e8f0",
    borderRadius: "28px",
    height: "50px",
    padding: "8px",
    fontSize: "14px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#cbd5e1",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "8px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#dbeafe" : "#fff",
    color: state.isSelected ? "#1e3a8a" : "#000",
    "&:hover": {
      backgroundColor: "#bfdbfe",
    },
  }),
  input: (provided) => ({
    ...provided,
    fontSize: "14px",
  }),
};

interface DynamicSelectProps {
  label?: string;
  placeholder?: string;
  fetchOptions: (inputValue: string) => Promise<SelectOption[]>;
  onChange: (selectedOption: SingleValue<SelectOption>) => void;
  value: SelectOption | null;
  styles?: StylesConfig<SelectOption, false>;
  className?: string;
  selectClassName?: string;
}

const DynamicSelect: React.FC<DynamicSelectProps> = ({
  label = "Search and Select",
  placeholder = "Start typing to search...",
  fetchOptions,
  onChange,
  value,
  styles = customStyles,
  className = "w-full max-w-lg mx-auto mt-10",
  selectClassName = "text-sm font-kalam",
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const loadOptions = (input: string): Promise<SelectOption[]> => {
    setInputValue(input);
    return fetchOptions(input)
      .then((data) => {
        if (data.length === 0) {
          onChange(null);
        }
        return data;
      })
      .catch((error) => {
        console.error("Failed to load options:", error);
        toast.error(
          "There was a problem with your request. Try Again or Contact Support.",
          {
            className: "font-kalam",
            autoClose: false,
            closeOnClick: true,
          },
        );
        onChange(null);
        return [];
      });
  };

  const handleChange = (option: SingleValue<SelectOption>) => {
    onChange(option);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    return newValue;
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor="async-select"
          className="block text-sm font-kalam font-bold text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <AsyncSelect
        id="async-select"
        cacheOptions
        styles={styles}
        loadOptions={loadOptions}
        onChange={handleChange}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        value={value}
        placeholder={placeholder}
        noOptionsMessage={() => "No options found"}
        className={selectClassName}
      />
    </div>
  );
};

export default DynamicSelect;
