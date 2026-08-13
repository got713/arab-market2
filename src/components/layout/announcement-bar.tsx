'use client';

import React from 'react';
import { useLocaleStore } from '@/store/locale-store';

export default function AnnouncementBar() {
  const t = useLocaleStore((state) => state.t);
  const text = t('header.announcement');

  if (!text) return null;

  return (
    <div className="bg-primary text-cream text-sm text-center py-2 px-4 font-medium tracking-wide">
      {text}
    </div>
  );
}
