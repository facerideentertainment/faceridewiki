
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ErrorDetails from "@/components/error-details";
import { Suspense } from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-8xl font-bold font-headline text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold">Entry Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Sorry, we couldn&apos;t find the entry you&apos;re looking for.
      </p>
       <Suspense fallback={<div></div>}>
        <ErrorDetails />
      </Suspense>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Go back to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

