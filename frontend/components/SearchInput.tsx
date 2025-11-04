"use client";

import { Search } from "lucide-react";

type Props = {
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
};

export function SearchInput({ placeholder = "Search", value, onChange }: Props) {
  return (
    <label className="relative flex items-center gap-2">
      <Search className="absolute left-3 h-4 w-4 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  );
}
