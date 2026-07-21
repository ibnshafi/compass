import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const { id } = await params;

    const careRecipient = await prisma.careRecipient.findFirst({
      where: { id, primaryCaregiverId: user.id },
      include: {
        medications: { orderBy: { createdAt: "desc" } },
        appointments: { orderBy: { dateTime: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        carePlans: { where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 1 },
        familyMembers: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    });

    if (!careRecipient) {
      return NextResponse.json({ error: "Care recipient not found" }, { status: 404 });
    }

    return NextResponse.json(careRecipient);
  } catch (error) {
    console.error("Error fetching care recipient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const { id } = await params;
    const body = await request.json();

    const careRecipient = await prisma.careRecipient.updateMany({
      where: { id, primaryCaregiverId: user.id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null }),
        ...(body.age !== undefined && { age: body.age ? parseInt(body.age) : null }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.relationship && { relationship: body.relationship }),
        ...(body.conditions !== undefined && {
          conditions: body.conditions ? body.conditions.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        }),
        ...(body.allergies !== undefined && {
          allergies: body.allergies ? body.allergies.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        }),
        ...(body.medications !== undefined && {
          currentMedications: body.medications ? body.medications.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status && { status: body.status }),
      },
    });

    if (careRecipient.count === 0) {
      return NextResponse.json({ error: "Care recipient not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating care recipient:", error);
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

    const result = await prisma.careRecipient.deleteMany({
      where: { id, primaryCaregiverId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Care recipient not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting care recipient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
