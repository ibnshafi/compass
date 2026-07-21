import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { careRecipientSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const careRecipients = await prisma.careRecipient.findMany({
      where: { primaryCaregiverId: user.id },
      include: {
        medications: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          where: { completed: false, dateTime: { gte: new Date() } },
          orderBy: { dateTime: "asc" },
          take: 3,
        },
        _count: {
          select: {
            tasks: { where: { status: { not: "COMPLETED" } } },
            medications: { where: { active: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(careRecipients);
  } catch (error) {
    console.error("Error fetching care recipients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const parsed = careRecipientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const careRecipient = await prisma.careRecipient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        age: data.age ?? null,
        gender: data.gender || null,
        relationship: data.relationship,
        conditions: data.conditions
          ? data.conditions.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        allergies: data.allergies
          ? data.allergies.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        currentMedications: data.medications
          ? data.medications.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        notes: data.notes || null,
        primaryCaregiverId: user.id,
      },
    });

    return NextResponse.json(careRecipient, { status: 201 });
  } catch (error) {
    console.error("Error creating care recipient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
