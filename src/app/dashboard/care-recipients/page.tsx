"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  Plus,
  Search,
  User,
  Pill,
  AlertTriangle,
  MoreHorizontal,
  Calendar,
  Activity,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

interface CareRecipient {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  gender: string | null;
  relationship: string;
  conditions: string[];
  status: string;
  createdAt: string;
  medications: Array<{ id: string }>;
  appointments: Array<{ id: string }>;
  _count: {
    tasks: number;
    medications: number;
  };
}

export default function CareRecipientsPage() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    relationship: "",
    conditions: "",
    allergies: "",
    medications: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  async function loadRecipients() {
    try {
      const res = await fetch("/api/care-recipients");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRecipients(data);
    } catch (error) {
      console.error("Failed to load care recipients:", error);
      toast.error("Failed to load care recipients");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/care-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Care recipient added successfully");
      setDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        gender: "",
        relationship: "",
        conditions: "",
        allergies: "",
        medications: "",
        notes: "",
      });
      loadRecipients();
    } catch (error) {
      console.error("Failed to create care recipient:", error);
      toast.error("Failed to create care recipient");
    } finally {
      setSaving(false);
    }
  }

  const filteredRecipients = recipients.filter(
    (r) =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      r.conditions.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Care Recipients</h2>
          <p className="text-muted-foreground">Manage the people you care for</p>
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
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Care Recipient</DialogTitle>
                  <DialogDescription>
                    Add someone you&apos;re caring for. You can generate an AI care plan afterward.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="grandmother">Grandmother</SelectItem>
                          <SelectItem value="grandfather">Grandfather</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conditions">Medical Conditions</Label>
                    <Input
                      id="conditions"
                      placeholder="Dementia, Diabetes, Hypertension (comma separated)"
                      value={formData.conditions}
                      onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      placeholder="Penicillin, Latex, Sulfa (comma separated)"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Input
                      id="medications"
                      placeholder="Medication names (comma separated)"
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any other relevant information..."
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

      {filteredRecipients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No care recipients yet</h3>
            <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
              Add someone you&apos;re caring for to start tracking medications, appointments, and generating AI care plans.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Care Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipients.map((recipient) => (
            <Card
              key={recipient.id}
              className="hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => router.push(`/dashboard/care-recipients/${recipient.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {recipient.firstName} {recipient.lastName}
                      </CardTitle>
                      <CardDescription>
                        {recipient.relationship}
                        {recipient.age ? `, ${recipient.age} yrs` : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(recipient.status)}>
                    {recipient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipient.conditions.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {recipient.conditions.slice(0, 3).map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {recipient.conditions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{recipient.conditions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" />
                      <span>{recipient._count.medications} meds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{recipient.appointments.length} upcoming</span>
                    </div>
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
