/**
 * Sentry configuration for error monitoring.
 *
 * To enable Sentry:
 * 1. Set NEXT_PUBLIC_SENTRY_DSN in your .env file
 * 2. Install @sentry/nextjs: npm install @sentry/nextjs
 * 3. Uncomment the initialization code below
 *
 * Sentry Dashboard: https://sentry.io
 */

// Uncomment to enable Sentry:
// import * as Sentry from "@sentry/nextjs";
//
// if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
//   Sentry.init({
//     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//     tracesSampleRate: 0.1,
//     debug: process.env.NODE_ENV === "development",
//     environment: process.env.NODE_ENV || "development",
//   });
// }
//
// export { Sentry };
// export const captureException = Sentry.captureException;
// export const captureMessage = Sentry.captureMessage;

export const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

export function logError(error: Error, context?: Record<string, unknown>) {
  console.error("[Compass Error]", error.message, context || "");

  // When Sentry is configured, this will send errors to Sentry
  if (sentryEnabled) {
    // Sentry.captureException(error, { extra: context });
  }
}

export function logMessage(message: string, level: "info" | "warning" | "error" = "info") {
  console.log(`[Compass ${level.toUpperCase()}]`, message);
}
