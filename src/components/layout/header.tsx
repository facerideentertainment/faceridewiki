
import { Suspense } from "react";
import { AppHeaderClient } from "./header-client";

// This remains a Server Component
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <Suspense fallback={<div className="flex-1" />}>
        <AppHeaderClient />
      </Suspense>
    </header>
  );
}
