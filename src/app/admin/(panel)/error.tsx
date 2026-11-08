"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid place-items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-muted">{error.message || "An unexpected error occurred."}</p>
      <Button variant="primary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
