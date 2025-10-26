// src/components/filters/FilterDropdown.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface FilterDropdownProps {
  options: { value: string; label: string }[];
  placeholder: string;
  paramName: string;
}

export default function FilterDropdown({ options, placeholder, paramName }: FilterDropdownProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="peer block w-full rounded-md border border-gray-700 bg-gray-800 py-2 px-3 text-sm outline-2 placeholder:text-gray-400"
      onChange={(e) => handleFilter(e.target.value)}
      defaultValue={searchParams.get(paramName)?.toString() || ''}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
