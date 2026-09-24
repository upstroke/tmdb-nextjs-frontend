'use client';

import { useMemo } from 'react';
import { useLocale } from '@/lib/stores/locale';
import { getLocaleText } from '@/lib/i18n/resolver';

export function useI18n() {
  const locale = useLocale();
  return useMemo(() => getLocaleText(locale), [locale]);
}
