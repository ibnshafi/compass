import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import prisma from "@/lib/prisma";

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    image_url?: string | null;
    phone_numbers?: Array<{ phone_number: string }>;
    created_at?: number;
    updated_at?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("svix-signature") || "";
    const svixId = req.headers.get("svix-id") || "";
    const svixTimestamp = req.headers.get("svix-timestamp") || "";

    const secret = process.env.CLERK_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === "production";

    // In production, webhook verification is mandatory
    if (isProduction && (!secret || !signature || !svixId || !svixTimestamp)) {
      console.error(
        "Missing webhook secret or headers in production. Set CLERK_WEBHOOK_SECRET in .env."
      );
      return NextResponse.json({ error: "Missing webhook configuration" }, { status: 401 });
    }

    // Verify webhook signature if secret is configured
    if (secret && signature && svixId && svixTimestamp) {
      try {
        const wh = new Webhook(secret);
        wh.verify(body, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": signature,
        });
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else if (isProduction) {
      return NextResponse.json({ error: "Webhook verification not configured" }, { status: 401 });
    }

    const event: WebhookEvent = JSON.parse(body);

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const email =
          event.data.email_addresses?.[0]?.email_address || `user-${event.data.id}@placeholder.com`;

        const existingUser = await prisma.user.findUnique({
          where: { clerkId: event.data.id },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              email,
              firstName: event.data.first_name || existingUser.firstName,
              lastName: event.data.last_name || existingUser.lastName,
              avatarUrl: event.data.image_url || existingUser.avatarUrl,
              phoneNumber:
                event.data.phone_numbers?.[0]?.phone_number || existingUser.phoneNumber,
            },
          });
        } else {
          await prisma.user.create({
            data: {
              clerkId: event.data.id,
              email,
              firstName: event.data.first_name,
              lastName: event.data.last_name,
              avatarUrl: event.data.image_url,
              phoneNumber: event.data.phone_numbers?.[0]?.phone_number,
            },
          });
        }
        break;
      }

      case "user.deleted": {
        await prisma.user.deleteMany({
          where: { clerkId: event.data.id },
        });
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional GET endpoint to verify webhook setup
export async function GET() {
  return NextResponse.json({ message: "Clerk webhook endpoint ready" });
}
