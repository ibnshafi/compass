import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { taskSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const tasks = await prisma.careTask.findMany({
      where: {
        careRecipient: { primaryCaregiverId: user.id },
      },
      include: {
        careRecipient: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();

    const careRecipient = await prisma.careRecipient.findFirst({
      where: { id: body.careRecipientId, primaryCaregiverId: user.id },
    });

    if (!careRecipient) {
      return NextResponse.json({ error: "Care recipient not found" }, { status: 404 });
    }

    const task = await prisma.careTask.create({
      data: {
        title: body.title,
        description: body.description || null,
        priority: body.priority || "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        category: body.category || "general",
        careRecipientId: body.careRecipientId,
        assignedToId: body.assignedToId || null,
      },
      include: {
        careRecipient: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
