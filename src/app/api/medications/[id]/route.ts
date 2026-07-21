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

    const medication = await prisma.medication.findFirst({
      where: { id, careRecipient: { primaryCaregiverId: user.id } },
    });

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }

    const updated = await prisma.medication.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.dosage && { dosage: body.dosage }),
        ...(body.unit && { unit: body.unit }),
        ...(body.frequency && { frequency: body.frequency }),
        ...(body.timeOfDay !== undefined && {
          timeOfDay: body.timeOfDay.split(",").map((s: string) => s.trim()).filter(Boolean),
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.refillDate !== undefined && { refillDate: body.refillDate ? new Date(body.refillDate) : null }),
        ...(body.refillReminder !== undefined && { refillReminder: body.refillReminder }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating medication:", error);
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

    const medication = await prisma.medication.findFirst({
      where: { id, careRecipient: { primaryCaregiverId: user.id } },
    });

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }

    await prisma.medication.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting medication:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
