// components/CustomSelect.tsx
"use client";

import React from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function CustomSelect({
  label,
  options,
  value,
  onChange,
}: CustomSelectProps) {
  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <Listbox
      value={selectedOption}
      onChange={(option: Option) => onChange(option.value)}
    >
      <Label className="block text-sm font-medium text-gray-700">{label}</Label>
      <div className="relative mt-2">
        <ListboxButton className="w-[500px] h-12 rounded-full p-1 pl-4 bg-[#ffffff] border-2 border-transparent shadow-[0_0_5px_rgba(0,0,0,0.1)] text-black hover:border-[#ff8a9c] flex items-center justify-between cursor-default focus:outline-none focus:ring-2 focus:ring-[#ff8a9c]/50">
          <span className="truncate text-gray-800">{selectedOption.label}</span>
          <ChevronUpDownIcon aria-hidden="true" className="size-5 text-black" />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute font-rm z-10 mt-1 w-[500px] h-[150px] rounded-3xl overflow-auto  bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in "
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option}
              className="group relative cursor-default select-none py-2 pl-8 pr-4 text-gray-800 hover:bg-[#ff8a9c] hover:text-white data-[focus]:bg-[#ff8a9c] data-[focus]:text-white"
            >
              <span className="block truncate font-normal group-data-[selected]:font-semibold">
                {option.label}
              </span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-[#ff8a9c] group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
