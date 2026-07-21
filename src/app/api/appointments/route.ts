import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { appointmentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const appointments = await prisma.appointment.findMany({
      where: {
        careRecipient: { primaryCaregiverId: user.id },
      },
      include: {
        careRecipient: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { dateTime: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();

    // Verify the care recipient belongs to this user
    const careRecipient = await prisma.careRecipient.findFirst({
      where: { id: body.careRecipientId, primaryCaregiverId: user.id },
    });

    if (!careRecipient) {
      return NextResponse.json({ error: "Care recipient not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type || "checkup",
        dateTime: new Date(body.dateTime),
        endDateTime: body.endDateTime ? new Date(body.endDateTime) : null,
        location: body.location || null,
        address: body.address || null,
        provider: body.provider || null,
        providerPhone: body.providerPhone || null,
        notes: body.notes || null,
        reminderBefore: body.reminderBefore ? parseInt(body.reminderBefore) : 60,
        careRecipientId: body.careRecipientId,
        createdById: user.id,
      },
      include: {
        careRecipient: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
