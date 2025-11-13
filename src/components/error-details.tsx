
'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorDetails() {
  const searchParams = useSearchParams();
  const path = searchParams.get('path');

  if (!path) {
    return null;
  }

  return (
    <div className="mt-4 text-xs text-muted-foreground bg-muted p-2 rounded-md">
      <p>
        No entry found for path: <strong>{path}</strong>
      </p>
    </div>
  );
}
