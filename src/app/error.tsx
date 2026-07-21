"use client";

import { useEffect } from "react";
import { Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-950 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/25">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We encountered an unexpected error. Our team has been notified.
          Please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset}>Try Again</Button>
          <a href="/">
            <Button variant="outline">Return Home</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
