/**
 * Sub0 API Client
 *
 * Thin client for calling Sub0 backend endpoints from the Next.js frontend.
 * Sub0 is the declarative backend engine that handles all database operations,
 * AI integrations, and business logic for the Compass platform.
 *
 * Architecture:
 * - Next.js frontend (deployed on LingoQL) calls Sub0 REST API endpoints
 * - Sub0 handles PostgreSQL queries, OpenAI API calls, JWT auth
 * - Clerk handles frontend authentication; Sub0 JWT for backend auth
 *
 * Environment variables:
 * - NEXT_PUBLIC_SUB0_API_URL: The Sub0 backend service URL
 * - SUB0_API_KEY: Server-side API key for Sub0 authentication
 */

type Sub0Response<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

const SUB0_API_URL =
  process.env.NEXT_PUBLIC_SUB0_API_URL || "http://localhost:8080";

/**
 * Get the Sub0 JWT token.
 * In production, this is obtained by exchanging the Clerk session token
 * for a Sub0 JWT via the auth/sign-in or auth/sync-clerk endpoint.
 */
async function getSub0Token(): Promise<string | null> {
  if (typeof window === "undefined") {
    // Server-side: use API key
    return process.env.SUB0_API_KEY || null;
  }
  // Client-side: token is stored after auth flow
  return localStorage.getItem("sub0_token");
}

/**
 * Set the Sub0 token after successful auth
 */
export function setSub0Token(token: string): void {
  localStorage.setItem("sub0_token", token);
}

/**
 * Clear the Sub0 token on logout
 */
export function clearSub0Token(): void {
  localStorage.removeItem("sub0_token");
}

/**
 * Make a request to a Sub0 endpoint
 */
async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<Sub0Response<T>> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${SUB0_API_URL}/${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Add auth headers
  const headers = new Headers(fetchOptions.headers);
  headers.set("Content-Type", "application/json");

  const token = await getSub0Token();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `Sub0 API error (${response.status}): ${errorBody}`,
      };
    }

    const data = await response.json();
    return { success: true, data: data as T };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error calling Sub0 API",
    };
  }
}

/**
 * Sub0 API client with typed methods for all backend endpoints.
 *
 * Usage:
 * ```ts
 * import { sub0 } from "@/lib/sub0-client";
 *
 * // List care recipients
 * const { data, error } = await sub0.careRecipients.list();
 *
 * // Create a medication
 * const result = await sub0.medications.create({ name: "Aspirin", dosage: "100mg", ... });
 * ```
 */
export const sub0 = {
  // ── Auth ──────────────────────────────────────────────
  auth: {
    signUp: (payload: {
      clerkId: string;
      email: string;
      firstName?: string;
      lastName?: string;
    }) => request("auth/sign-up", { method: "POST", body: JSON.stringify(payload) }),

    signIn: (payload: { email: string }) =>
      request("auth/sign-in", { method: "POST", body: JSON.stringify(payload) }),

    profile: () => request("auth/profile", { method: "GET" }),
  },

  // ── Care Recipients ───────────────────────────────────
  careRecipients: {
    list: () => request("care-recipients", { method: "GET" }),

    get: (id: string) =>
      request(`care-recipients/${id}`, { method: "GET" }),

    create: (payload: Record<string, unknown>) =>
      request("care-recipients/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (id: string, payload: Record<string, unknown>) =>
      request(`care-recipients/${id}/update`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request(`care-recipients/${id}/delete`, { method: "DELETE" }),
  },

  // ── Medications ───────────────────────────────────────
  medications: {
    list: () => request("medications", { method: "GET" }),

    create: (payload: Record<string, unknown>) =>
      request("medications/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (id: string, payload: Record<string, unknown>) =>
      request(`medications/${id}/update`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request(`medications/${id}/delete`, { method: "DELETE" }),
  },

  // ── Appointments ──────────────────────────────────────
  appointments: {
    list: () => request("appointments", { method: "GET" }),

    create: (payload: Record<string, unknown>) =>
      request("appointments/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    update: (id: string, payload: Record<string, unknown>) =>
      request(`appointments/${id}/update`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request(`appointments/${id}/delete`, { method: "DELETE" }),
  },

  // ── Tasks ─────────────────────────────────────────────
  tasks: {
    list: () => request("tasks", { method: "GET" }),

    create: (payload: Record<string, unknown>) =>
      request("tasks/create", { method: "POST", body: JSON.stringify(payload) }),

    update: (id: string, payload: Record<string, unknown>) =>
      request(`tasks/${id}/update`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request(`tasks/${id}/delete`, { method: "DELETE" }),
  },

  // ── Resources ─────────────────────────────────────────
  resources: {
    list: () => request("resources", { method: "GET" }),

    create: (payload: Record<string, unknown>) =>
      request("resources/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    delete: (id: string) =>
      request(`resources/${id}/delete`, { method: "DELETE" }),
  },

  // ── Care Plans ────────────────────────────────────────
  carePlans: {
    list: (careRecipientId: string) =>
      request(`care-plans?careRecipientId=${careRecipientId}`, { method: "GET" }),

    create: (payload: Record<string, unknown>) =>
      request("care-plans/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // ── AI Features ───────────────────────────────────────
  ai: {
    generateCarePlan: (careRecipientId: string) =>
      request("ai/care-plan", {
        method: "POST",
        body: JSON.stringify({ careRecipientId }),
      }),

    assist: (payload: { message: string; conversationId?: string; careRecipientId?: string }) =>
      request("ai/assist", { method: "POST", body: JSON.stringify(payload) }),

    explain: (text: string) =>
      request("ai/explain", { method: "POST", body: JSON.stringify({ text }) }),

    matchResources: (needs: string, location?: string) =>
      request("ai/resources", {
        method: "POST",
        body: JSON.stringify({ needs, location }),
      }),

    conversations: {
      list: () => request("ai/conversations", { method: "GET" }),
      create: (title: string) =>
        request("ai/conversations/create", {
          method: "POST",
          body: JSON.stringify({ title, messages: [] }),
        }),
    },
  },

  // ── Dashboard ─────────────────────────────────────────
  dashboard: {
    stats: () => request("dashboard", { method: "GET" }),
  },

  // ── Family ────────────────────────────────────────────
  family: {
    list: (careRecipientId: string) =>
      request(`family/list?careRecipientId=${careRecipientId}`, { method: "GET" }),

    invite: (payload: {
      userId: string;
      careRecipientId: string;
      role: string;
      permissions: string;
    }) => request("family/invite", { method: "POST", body: JSON.stringify(payload) }),
  },
};

export default sub0;
