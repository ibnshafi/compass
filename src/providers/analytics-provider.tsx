"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Analytics provider component.
 *
 * To enable PostHog analytics:
 * 1. Set NEXT_PUBLIC_POSTHOG_KEY in your .env file
 * 2. Install posthog-js: npm install posthog-js
 * 3. Import and use PostHogProvider from posthog-js/react
 *
 * PostHog Dashboard: https://posthog.com
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  useEffect(() => {
    if (!posthogKey) return;

    // Page view tracking would go here with posthog-js
    // posthog.capture('$pageview', { path: pathname + searchParams.toString() });
  }, [pathname, searchParams, posthogKey]);

  return <>{children}</>;
}
