import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const { id } = await params;
    const body = await request.json();

    const task = await prisma.careTask.findFirst({
      where: { id, careRecipient: { primaryCaregiverId: user.id } },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.priority) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.completed !== undefined) {
      updateData.status = body.completed ? "COMPLETED" : "PENDING";
      updateData.completedAt = body.completed ? new Date() : null;
    }

    const updated = await prisma.careTask.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating task:", error);
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

    const task = await prisma.careTask.findFirst({
      where: { id, careRecipient: { primaryCaregiverId: user.id } },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.careTask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
