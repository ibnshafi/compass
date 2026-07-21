"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Plus, Search, MapPin, Phone, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { formatDate, formatTime, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

interface Appointment {
  id: string;
  title: string;
  type: string;
  dateTime: string;
  location: string | null;
  provider: string | null;
  notes: string | null;
  completed: boolean;
  careRecipient: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface CareRecipient {
  id: string;
  firstName: string;
  lastName: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "checkup",
    dateTime: "",
    endDateTime: "",
    location: "",
    address: "",
    provider: "",
    providerPhone: "",
    notes: "",
    reminderBefore: "60",
    careRecipientId: "",
  });
  const [saving, setSaving] = useState(false);

  async function markCompleted(apt: Appointment) {
    try {
      const res = await fetch(`/api/appointments/${apt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !apt.completed }),
      });
      if (!res.ok) throw new Error();
      setAppointments((prev) =>
        prev.map((a) => (a.id === apt.id ? { ...a, completed: !a.completed } : a))
      );
      toast.success(apt.completed ? "Appointment reopened" : "Appointment completed");
    } catch {
      toast.error("Failed to update appointment");
    }
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Appointment deleted");
    } catch {
      toast.error("Failed to delete appointment");
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [aptsRes, recipientsRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/care-recipients"),
        ]);
        if (aptsRes.ok) setAppointments(await aptsRes.json());
        if (recipientsRes.ok) setRecipients(await recipientsRes.json());
      } catch (error) {
        console.error("Failed to load:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create");
      const newApt = await res.json();
      setAppointments((prev) => [newApt, ...prev]);
      toast.success("Appointment scheduled");
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        type: "checkup",
        dateTime: "",
        endDateTime: "",
        location: "",
        address: "",
        provider: "",
        providerPhone: "",
        notes: "",
        reminderBefore: "60",
        careRecipientId: "",
      });
    } catch (error) {
      console.error("Failed to create appointment:", error);
      toast.error("Failed to schedule appointment");
    } finally {
      setSaving(false);
    }
  }

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.dateTime) > now && !a.completed);
  const past = appointments.filter((a) => new Date(a.dateTime) <= now || a.completed);

  const filteredUpcoming = upcoming.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      `${a.careRecipient.firstName} ${a.careRecipient.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">Manage healthcare appointments</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Schedule Appointment</DialogTitle>
                  <DialogDescription>Add a healthcare appointment for a care recipient.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>For *</Label>
                    <Select
                      value={formData.careRecipientId}
                      onValueChange={(v) => setFormData({ ...formData, careRecipientId: v })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipients.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.firstName} {r.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checkup">Checkup</SelectItem>
                          <SelectItem value="specialist">Specialist</SelectItem>
                          <SelectItem value="followup">Follow-up</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                          <SelectItem value="therapy">Therapy</SelectItem>
                          <SelectItem value="lab">Lab Work</SelectItem>
                          <SelectItem value="imaging">Imaging</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Input
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date & Time *</Label>
                      <Input
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.endDateTime}
                        onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Provider Phone</Label>
                      <Input
                        value={formData.providerPhone}
                        onChange={(e) => setFormData({ ...formData, providerPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Schedule"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <h3 className="font-semibold mb-3">Upcoming Appointments</h3>
        {filteredUpcoming.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUpcoming.map((apt) => (
              <Card key={apt.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => markCompleted(apt)}
                        className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors"
                        title="Mark as completed"
                      >
                        <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </button>
                      <div>
                        <p className="font-medium">{apt.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.careRecipient.firstName} {apt.careRecipient.lastName}
                          {apt.type !== "checkup" ? ` • ${apt.type}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(apt.dateTime)} at {formatTime(apt.dateTime)}
                          </span>
                          {apt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {apt.location}
                            </span>
                          )}
                          {apt.provider && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {apt.provider}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markCompleted(apt)}
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 text-gray-400 hover:text-green-500 transition-colors"
                        title="Mark as completed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAppointment(apt.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Past Appointments</h3>
          <div className="space-y-2">
            {past.slice(0, 5).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{apt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(apt.dateTime)} - {apt.careRecipient.firstName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Completed</Badge>
                      <button
                        onClick={() => markCompleted(apt)}
                        className="p-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 text-gray-400 hover:text-green-500 transition-colors"
                        title="Reopen appointment"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAppointment(apt.id)}
                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
