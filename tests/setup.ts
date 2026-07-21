import { vi } from "vitest";

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_key";
process.env.CLERK_SECRET_KEY = "sk_test_key";
process.env.OPENAI_API_KEY = "sk-test-key";
process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/sign-in";
process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = "/sign-up";
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = "/dashboard";
process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = "/dashboard";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// Mock global fetch if needed
// globalThis.fetch = vi.fn();
