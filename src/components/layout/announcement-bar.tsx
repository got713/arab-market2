'use client';

import React from 'react';
import { useLocaleStore } from '@/store/locale-store';

export default function AnnouncementBar() {
  const t = useLocaleStore((state) => state.t);

  return (
    <div className="bg-primary text-cream text-sm text-center py-2 px-4 font-medium tracking-wide">
      {t('header.announcement')}
    </div>
  );
}
