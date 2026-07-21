"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Pill,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatDate, getStatusColor, getTimeAgo } from "@/lib/utils";
import { toast } from "sonner";

interface DashboardData {
  careRecipients: number;
  activeMedications: number;
  upcomingAppointments: number;
  pendingTasks: number;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    careRecipient: { firstName: string; lastName: string };
  }>;
  upcomingAppointmentsList: Array<{
    id: string;
    title: string;
    dateTime: string;
    provider: string | null;
    careRecipient: { firstName: string; lastName: string };
  }>;
  medicationsDueToday: Array<{
    id: string;
    name: string;
    dosage: string;
    timeOfDay: string[];
    careRecipient: { firstName: string; lastName: string };
  }>;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  const statsCards = [
    {
      title: "Care Recipients",
      value: data?.careRecipients ?? 0,
      description: "People you care for",
      icon: Heart,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
      link: "/dashboard/care-recipients",
    },
    {
      title: "Active Medications",
      value: data?.activeMedications ?? 0,
      description: "Being tracked",
      icon: Pill,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      link: "/dashboard/medications",
    },
    {
      title: "Upcoming Appointments",
      value: data?.upcomingAppointments ?? 0,
      description: "Next 7 days",
      icon: Calendar,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/50",
      link: "/dashboard/appointments",
    },
    {
      title: "Pending Tasks",
      value: data?.pendingTasks ?? 0,
      description: "Need attention",
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      link: "/dashboard/tasks",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Medications Due Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Medications Due Today</CardTitle>
              <CardDescription>Next scheduled doses</CardDescription>
            </div>
            <Link href="/dashboard/medications">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.medicationsDueToday && data.medicationsDueToday.length > 0 ? (
              <div className="space-y-3">
                {data.medicationsDueToday.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} - {med.careRecipient.firstName} {med.careRecipient.lastName}
                      </p>
                    </div>
                    <Badge variant="success" className="text-xs">
                      {med.timeOfDay.length > 0 ? med.timeOfDay.join(", ") : "As needed"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No medications due today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </div>
            <Link href="/dashboard/appointments">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.upcomingAppointmentsList && data.upcomingAppointmentsList.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAppointmentsList.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                      <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{apt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(apt.dateTime)}
                        {apt.provider ? ` - ${apt.provider}` : ""}
                      </p>
                    </div>
                    <Badge variant="info" className="text-xs">
                      {apt.careRecipient.firstName}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Tasks</CardTitle>
              <CardDescription>Track care activities and to-dos</CardDescription>
            </div>
            <Link href="/dashboard/tasks">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Task
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentTasks && data.recentTasks.length > 0 ? (
              <div className="space-y-2">
                {data.recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div
                      className={`p-1 rounded-full ${
                        task.status === "COMPLETED"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.careRecipient.firstName} {task.careRecipient.lastName}
                        {task.dueDate ? ` • Due ${formatDate(task.dueDate)}` : ""}
                      </p>
                    </div>
                    <Badge className={getStatusColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No tasks yet. Create your first task!</p>
                <Link href="/dashboard/tasks">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Task
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/care-recipients/new">
          <Card className="hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all duration-200 group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Add Care Recipient</p>
                <p className="text-xs text-muted-foreground">Start coordinating care for someone</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/medications/new">
          <Card className="hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 cursor-pointer transition-all duration-200 group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 group-hover:scale-110 transition-transform">
                <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Log Medication</p>
                <p className="text-xs text-muted-foreground">Add a new medication to track</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/appointments/new">
          <Card className="hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 cursor-pointer transition-all duration-200 group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/50 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-medium">Schedule Appointment</p>
                <p className="text-xs text-muted-foreground">Add a healthcare appointment</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
