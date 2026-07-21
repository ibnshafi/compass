"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAssistant } from "@/components/ai/ai-assistant";
import {
  ArrowLeft,
  Heart,
  User,
  Pill,
  Calendar,
  Activity,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

interface CareRecipientDetail {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  gender: string | null;
  relationship: string;
  conditions: string[];
  allergies: string[];
  currentMedications: string[];
  notes: string | null;
  status: string;
  createdAt: string;
  carePlans: Array<{
    id: string;
    title: string;
    summary: string | null;
    goals: Array<Record<string, unknown>>;
    dailyRoutine: Record<string, string[]> | null;
    recommendations: Array<Record<string, string>>;
    emergencyInfo: Record<string, unknown> | null;
    isAIGenerated: boolean;
    createdAt: string;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    active: boolean;
  }>;
  appointments: Array<{
    id: string;
    title: string;
    dateTime: string;
    provider: string | null;
    completed: boolean;
  }>;
}

export default function CareRecipientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipient, setRecipient] = useState<CareRecipientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    loadRecipient();
  }, [params.id]);

  async function loadRecipient() {
    try {
      const res = await fetch(`/api/care-recipients/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setRecipient(data);
    } catch (error) {
      console.error("Failed to load recipient:", error);
      toast.error("Failed to load care recipient");
      router.push("/dashboard/care-recipients");
    } finally {
      setLoading(false);
    }
  }

  async function generateCarePlan() {
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/ai/care-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careRecipientId: params.id }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setRecipient((prev) =>
        prev ? { ...prev, carePlans: [data, ...prev.carePlans] } : prev
      );
      toast.success("Care plan generated successfully!");
    } catch (error) {
      console.error("Failed to generate care plan:", error);
      toast.error("Failed to generate care plan. Check your OpenAI API key.");
    } finally {
      setGeneratingPlan(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-48 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!recipient) return null;

  const activePlan = recipient.carePlans[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {recipient.firstName} {recipient.lastName}
              </h2>
              <p className="text-muted-foreground">
                {recipient.relationship}
                {recipient.age ? `, ${recipient.age} years old` : ""}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(recipient.status)}>{recipient.status}</Badge>
        </div>
        <Button
          onClick={generateCarePlan}
          disabled={generatingPlan}
          className="group"
        >
          {generatingPlan ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Care Plan
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recipient.conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recipient.conditions.map((cond) => (
                      <Badge key={cond} variant="secondary">
                        {cond}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None listed</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recipient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recipient.allergies.map((allergy) => (
                      <Badge key={allergy} variant="warning">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None listed</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>                {recipient.currentMedications.length > 0 ? (
                      <div className="space-y-2">
                        {recipient.currentMedications.slice(0, 5).map((med, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Pill className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{med}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {recipient.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{recipient.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="care-plan" className="space-y-4">
          {activePlan ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{activePlan.title}</CardTitle>
                      <CardDescription>
                        Generated {formatDate(activePlan.createdAt)}
                        {activePlan.isAIGenerated ? " by AI" : ""}
                      </CardDescription>
                    </div>
                    <Badge variant="success">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {activePlan.summary && (
                    <div>
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{activePlan.summary}</p>
                    </div>
                  )}

                  {activePlan.goals && (activePlan.goals as Array<Record<string, unknown>>).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Goals</h4>
                      <div className="space-y-3">
                        {(activePlan.goals as Array<{ category: string; title: string; description: string }>).map((goal, i) => (
                          <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={goal.category === "health" || goal.category === "medical" ? "info" : "secondary"} className="text-xs capitalize">
                                {goal.category}
                              </Badge>
                              <span className="font-medium text-sm">{goal.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePlan.dailyRoutine && (
                    <div>
                      <h4 className="font-semibold mb-3">Daily Routine</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(activePlan.dailyRoutine as Record<string, string[]>).map(([time, activities]) => (
                          <div key={time} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <h5 className="text-sm font-medium capitalize mb-2 text-blue-600 dark:text-blue-400">
                              {time}
                            </h5>
                            <ul className="space-y-1">
                              {(activities as string[]).map((activity, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activePlan.recommendations && (activePlan.recommendations as Array<Record<string, string>>).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {(activePlan.recommendations as Array<{ category: string; title: string; description: string }>).map((rec, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{rec.title}</p>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="w-16 h-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No care plan yet</h3>
                <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
                  Generate an AI-powered care plan tailored to {recipient.firstName}&apos;s conditions and needs.
                </p>
                <Button onClick={generateCarePlan} disabled={generatingPlan}>
                  {generatingPlan ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Care Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-assistant">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Ask questions about {recipient.firstName}&apos;s care, get advice, or clarify medical information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIAssistant careRecipientId={recipient.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
