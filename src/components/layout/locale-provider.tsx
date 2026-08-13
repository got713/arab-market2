'use client';

import React, { useEffect, useState } from 'react';
import { useLocaleStore } from '@/store/locale-store';

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  // Prevent flash of unstyled content during hydration
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return <>{children}</>;
}
