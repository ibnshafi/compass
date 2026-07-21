"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  AlertCircle,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  category: string;
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    category: "general",
    careRecipientId: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [tasksRes, recipientsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/care-recipients"),
        ]);
        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (recipientsRes.ok) setRecipients(await recipientsRes.json());
      } catch {
        toast.error("Failed to load tasks");
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
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task created");
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: "",
        category: "general",
        careRecipientId: "",
      });
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  async function toggleComplete(task: Task) {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newStatus === "COMPLETED" }),
      });
      if (!res.ok) throw new Error();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: newStatus,
                completedAt: newStatus === "COMPLETED" ? new Date().toISOString() : null,
              }
            : t
        )
      );
    } catch {
      toast.error("Failed to update task");
    }
  }

  async function deleteTask(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && t.status !== "COMPLETED") ||
      (filter === "completed" && t.status === "COMPLETED");
    return matchesSearch && matchesFilter;
  });

  const sortedTasks = [
    ...filteredTasks.filter((t) => t.status !== "COMPLETED"),
    ...filteredTasks.filter((t) => t.status === "COMPLETED"),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Track care activities and to-dos</p>
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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                  <DialogDescription>
                    Add a new task for a care recipient.
                  </DialogDescription>
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
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => setFormData({ ...formData, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
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

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : sortedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {filter !== "all"
                ? "Try changing your filter."
                : "Create your first task to start tracking care activities."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <Card
              key={task.id}
              className={`transition-all duration-200 hover:shadow-sm ${
                task.status === "COMPLETED" ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleComplete(task)}
                    className="shrink-0 hover:scale-110 transition-transform"
                  >
                    {task.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge className={getStatusColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>
                        {task.careRecipient.firstName} {task.careRecipient.lastName}
                      </span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
