import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const careRecipients = await prisma.careRecipient.findMany({
      where: { primaryCaregiverId: user.id, status: "ACTIVE" },
      include: {
        medications: {
          where: { active: true },
        },
        appointments: {
          where: {
            dateTime: { gte: now, lte: weekFromNow },
            completed: false,
          },
          orderBy: { dateTime: "asc" },
          take: 5,
        },
        tasks: {
          where: { status: { not: "COMPLETED" } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    const activeMedications = careRecipients.reduce(
      (sum, cr) => sum + cr.medications.length,
      0
    );

    const allAppointments = careRecipients.flatMap((cr) =>
      cr.appointments.map((apt) => ({
        ...apt,
        careRecipient: { firstName: cr.firstName, lastName: cr.lastName },
      }))
    ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    const allTasks = careRecipients.flatMap((cr) =>
      cr.tasks.map((task) => ({
        ...task,
        careRecipient: { firstName: cr.firstName, lastName: cr.lastName },
      }))
    ).slice(0, 5);

    const medicationsDueToday = careRecipients.flatMap((cr) =>
      cr.medications.map((med) => ({
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        unit: med.unit,
        timeOfDay: med.timeOfDay,
        careRecipient: { firstName: cr.firstName, lastName: cr.lastName },
      }))
    );

    const pendingTasks = allTasks.filter((t) => t.status !== "COMPLETED").length;

    return NextResponse.json({
      careRecipients: careRecipients.length,
      activeMedications,
      upcomingAppointments: allAppointments.length,
      pendingTasks,
      recentTasks: allTasks,
      upcomingAppointmentsList: allAppointments,
      medicationsDueToday,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
