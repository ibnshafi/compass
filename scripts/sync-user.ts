import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Sync a user from Clerk to the local database.
 * Call this from your Clerk webhook handler or after authentication.
 */
export async function syncUser(clerkUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email: clerkUser.email,
        firstName: clerkUser.firstName || existingUser.firstName,
        lastName: clerkUser.lastName || existingUser.lastName,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    },
  });
}
