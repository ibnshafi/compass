import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { medicationSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const medications = await prisma.medication.findMany({
      where: {
        careRecipient: { primaryCaregiverId: user.id },
      },
      include: {
        careRecipient: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const parsed = medicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify the care recipient belongs to this user
    const careRecipient = await prisma.careRecipient.findFirst({
      where: { id: body.careRecipientId, primaryCaregiverId: user.id },
    });

    if (!careRecipient) {
      return NextResponse.json({ error: "Care recipient not found" }, { status: 404 });
    }

    const medication = await prisma.medication.create({
      data: {
        name: data.name,
        dosage: data.dosage,
        unit: data.unit as any || "MG",
        frequency: data.frequency,
        timeOfDay: data.timeOfDay ? data.timeOfDay.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        notes: data.notes || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        prescribedBy: data.prescribedBy || null,
        pharmacy: data.pharmacy || null,
        refillDate: data.refillDate ? new Date(data.refillDate) : null,
        refillReminder: data.refillReminder || false,
        careRecipientId: body.careRecipientId,
      },
      include: {
        careRecipient: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(medication, { status: 201 });
  } catch (error) {
    console.error("Error creating medication:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
