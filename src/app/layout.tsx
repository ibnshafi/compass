import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compass - AI-Powered Care Coordination",
  description:
    "Compass helps family caregivers coordinate care for aging loved ones. Track medications, appointments, and tasks with AI-powered assistance.",
  keywords: ["caregiver", "elderly care", "care coordination", "family caregiver", "healthcare"],
  openGraph: {
    title: "Compass - AI-Powered Care Coordination",
    description:
      "The all-in-one platform for family caregivers. Manage medications, appointments, and care plans with AI assistance.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#2563eb",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
