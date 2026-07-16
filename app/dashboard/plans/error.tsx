"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlansError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Plan Builder failed to load", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 px-6 py-20 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="h-5 w-5" aria-hidden />
      </span>
      <h1 className="mt-4 text-lg font-semibold tracking-tight">Plans couldn&apos;t load</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Something went wrong on our side. Try again — if it keeps happening, the error has been logged.
      </p>
      <Button size="sm" variant="outline" onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
