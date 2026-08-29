'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

export type SelectOption = string | { label: string; value: string };

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select option...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Select Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl flex items-center justify-between transition-all duration-200 ${
          isOpen
            ? 'border-[#1B2A72] bg-white ring-2 ring-indigo-100/80 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
        }`}
      >
        <span className={`font-semibold ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown
          size={16}
          className={`text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#1B2A72]' : ''
          }`}
        />
      </button>

      {/* Floating Custom Options Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-slate-200/90 rounded-xl shadow-xl p-1.5 space-y-0.5 max-h-60 overflow-y-auto animate-fade-in backdrop-blur-md">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs text-left rounded-lg flex items-center justify-between transition-colors font-medium ${
                  isSelected
                    ? 'bg-[#1B2A72] text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} className="text-amber-400 shrink-0" weight="bold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
