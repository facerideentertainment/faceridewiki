'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logEvent } from 'firebase/analytics';
import { useFirebase } from '@/firebase/provider';

export function Analytics() {
  const { analytics } = useFirebase();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (analytics) {
      const url = pathname + searchParams.toString();
      logEvent(analytics, 'page_view', {
        page_location: url,
        page_path: pathname,
      });
    }
  }, [pathname, searchParams, analytics]);

  return null;
}
