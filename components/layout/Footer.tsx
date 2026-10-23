'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-400">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        {t.footer.text}
      </div>
    </footer>
  );
}
