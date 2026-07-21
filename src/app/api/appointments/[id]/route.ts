import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const { id } = await params;
    const body = await request.json();

    const appointment = await prisma.appointment.findFirst({
      where: { id, careRecipient: { primaryCaregiverId: user.id } },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.dateTime && { dateTime: new Date(body.dateTime) }),
        ...(body.endDateTime !== undefined && { endDateTime: body.endDateTime ? new Date(body.endDateTime) : null }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.provider !== undefined && { provider: body.provider }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.completed !== undefined && { completed: body.completed }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, careRecipient: { primaryCaregiverId: user.id } },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
