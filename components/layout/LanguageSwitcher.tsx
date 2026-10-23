'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/types/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentOption = SUPPORTED_LANGUAGES.find((lang) => lang.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t.common.selectLanguage}
        className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 hover:bg-slate-800 hover:border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-slate-200 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      >
        <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
        <span className="font-medium">{currentOption.shortLabel}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t.common.selectLanguage}
          className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-800 bg-slate-950/95 p-1 shadow-xl backdrop-blur-xl z-50 animate-entrance"
        >
          {SUPPORTED_LANGUAGES.map((option) => {
            const isSelected = language === option.code;
            return (
              <button
                key={option.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.code)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-emerald-950/50 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex flex-col">
                  <span>{option.nativeLabel}</span>
                  {option.code !== 'en' && (
                    <span className="text-[10px] text-slate-400">{option.label}</span>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
