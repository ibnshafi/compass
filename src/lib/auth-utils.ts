import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Gets the current authenticated user from the database.
 * Creates the user in the local database if they don't exist yet.
 * This handles the case where Clerk webhook hasn't fired yet or isn't set up.
 */
export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: "Unauthorized", status: 401 };
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  // Create user if they don't exist
  if (!user) {
    // We can get the user's email from Clerk if needed
    // For now, create with placeholder that gets updated on next sync
    user = await prisma.user.create({
      data: {
        clerkId,
        email: `user-${clerkId}@placeholder.com`,
        firstName: null,
        lastName: null,
      },
    });
  }

  return { user, error: null, status: 200 };
}

/**
 * Wraps an API handler with authentication and error handling.
 */
export function withAuth(
  handler: (user: { id: string; clerkId: string; email: string; firstName: string | null; lastName: string | null }) => Promise<Response>
): () => Promise<Response> {
  return async () => {
    try {
      const { user, error, status } = await getCurrentUser();
      if (error || !user) {
        return NextResponse.json({ error }, { status });
      }
      return handler(user);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
