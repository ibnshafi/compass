"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, Plus, Search, Clock, AlertCircle, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  timeOfDay: string[];
  notes: string | null;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  prescribedBy: string | null;
  pharmacy: string | null;
  refillDate: string | null;
  refillReminder: boolean;
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

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    unit: "MG",
    frequency: "",
    timeOfDay: "",
    notes: "",
    startDate: "",
    endDate: "",
    prescribedBy: "",
    pharmacy: "",
    refillDate: "",
    refillReminder: false,
    careRecipientId: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [medsRes, recipientsRes] = await Promise.all([
          fetch("/api/medications"),
          fetch("/api/care-recipients"),
        ]);
        if (medsRes.ok) setMedications(await medsRes.json());
        if (recipientsRes.ok) setRecipients(await recipientsRes.json());
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load medications");
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
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create");
      const newMed = await res.json();
      setMedications((prev) => [newMed, ...prev]);
      toast.success("Medication added successfully");
      setDialogOpen(false);
      setFormData({
        name: "",
        dosage: "",
        unit: "MG",
        frequency: "",
        timeOfDay: "",
        notes: "",
        startDate: "",
        endDate: "",
        prescribedBy: "",
        pharmacy: "",
        refillDate: "",
        refillReminder: false,
        careRecipientId: "",
      });
    } catch (error) {
      console.error("Failed to create medication:", error);
      toast.error("Failed to add medication");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(med: Medication) {
    try {
      const res = await fetch(`/api/medications/${med.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !med.active }),
      });
      if (!res.ok) throw new Error();
      setMedications((prev) =>
        prev.map((m) => (m.id === med.id ? { ...m, active: !m.active } : m))
      );
      toast.success(med.active ? "Medication deactivated" : "Medication activated");
    } catch {
      toast.error("Failed to update medication");
    }
  }

  async function deleteMedication(id: string) {
    if (!confirm("Are you sure you want to delete this medication?")) return;
    try {
      const res = await fetch(`/api/medications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMedications((prev) => prev.filter((m) => m.id !== id));
      toast.success("Medication deleted");
    } catch {
      toast.error("Failed to delete medication");
    }
  }

  const filtered = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      `${m.careRecipient.firstName} ${m.careRecipient.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medications</h2>
          <p className="text-muted-foreground">Track medications and set refill reminders</p>
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
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Medication</DialogTitle>
                  <DialogDescription>Log a new medication to track.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cr">For *</Label>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Dosage *</Label>
                        <Input
                          value={formData.dosage}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MG">mg</SelectItem>
                            <SelectItem value="MCG">mcg</SelectItem>
                            <SelectItem value="G">g</SelectItem>
                            <SelectItem value="ML">ml</SelectItem>
                            <SelectItem value="TABLET">tablet(s)</SelectItem>
                            <SelectItem value="CAPSULE">capsule(s)</SelectItem>
                            <SelectItem value="DROPS">drops</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency *</Label>
                      <Input
                        placeholder="e.g., Twice daily, Once a week"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time of Day</Label>
                      <Input
                        placeholder="Morning, Afternoon, Evening (comma separated)"
                        value={formData.timeOfDay}
                        onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prescribed By</Label>
                      <Input
                        value={formData.prescribedBy}
                        onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pharmacy</Label>
                      <Input
                        value={formData.pharmacy}
                        onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Refill Date</Label>
                      <Input
                        type="date"
                        value={formData.refillDate}
                        onChange={(e) => setFormData({ ...formData, refillDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="refillReminder"
                      checked={formData.refillReminder}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, refillReminder: checked as boolean })
                      }
                    />
                    <Label htmlFor="refillReminder">Set refill reminder</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
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
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medications tracked</h3>
            <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
              Start tracking medications for your care recipients. Never miss a dose or refill again.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((med) => (
            <Card key={med.id} className="hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${med.active ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                      <Pill className={`w-5 h-5 ${med.active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{med.name}</CardTitle>
                      <CardDescription>
                        {med.dosage} {med.unit} - {med.frequency}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={med.active ? "success" : "secondary"}>
                    {med.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {med.timeOfDay.length > 0 ? med.timeOfDay.join(", ") : "As needed"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    For: {med.careRecipient.firstName} {med.careRecipient.lastName}
                    {med.prescribedBy && ` • Dr. ${med.prescribedBy}`}
                  </div>
                  {med.refillDate && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>Refill by {formatDate(med.refillDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <button
                      onClick={() => toggleActive(med)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      title={med.active ? "Deactivate" : "Activate"}
                    >
                      {med.active ? (
                        <ToggleRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      {med.active ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
