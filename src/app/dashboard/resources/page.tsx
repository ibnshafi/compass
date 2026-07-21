"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Sparkles, ExternalLink, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  description: string;
  type: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  eligibility: string | null;
  cost: string | null;
  tags: string[];
}

interface AIMatch {
  resourceId: string;
  relevanceScore: number;
  reason: string;
  nextSteps: string;
  resource: Resource;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [needs, setNeeds] = useState("");
  const [location, setLocation] = useState("");
  const [aiMatches, setAiMatches] = useState<AIMatch[] | null>(null);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources(type?: string) {
    try {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      const res = await fetch(`/api/resources?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setResources(data);
    } catch (error) {
      console.error("Failed to load resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }

  async function handleAIMatch() {
    if (!needs.trim()) {
      toast.error("Please describe what you need");
      return;
    }
    setMatching(true);
    setAiMatches(null);
    try {
      const res = await fetch("/api/ai/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needs, location }),
      });
      if (!res.ok) throw new Error("Failed to match");
      const data = await res.json();
      setAiMatches(data.matches);
    } catch (error) {
      console.error("Failed to find matches:", error);
      toast.error("Failed to find matching resources. Check your OpenAI API key.");
    } finally {
      setMatching(false);
    }
  }

  const filteredResources = resources.filter((r) => {
    if (!search && !filterType) return true;
    const matchesSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const resourceTypes = [
    { value: "", label: "All Types" },
    { value: "FOOD_ASSISTANCE", label: "Food Assistance" },
    { value: "HOUSING", label: "Housing" },
    { value: "HEALTHCARE", label: "Healthcare" },
    { value: "TRANSPORTATION", label: "Transportation" },
    { value: "FINANCIAL_ASSISTANCE", label: "Financial Assistance" },
    { value: "MENTAL_HEALTH", label: "Mental Health" },
    { value: "HOME_CARE", label: "Home Care" },
    { value: "SUPPORT_GROUP", label: "Support Groups" },
    { value: "PRESCRIPTION_ASSISTANCE", label: "Prescription Assistance" },
    { value: "UTILITY_ASSISTANCE", label: "Utility Assistance" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Community Resources</h2>
        <p className="text-muted-foreground">Find local resources and support services</p>
      </div>

      {/* AI Matching */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">AI Resource Matcher</CardTitle>
          </div>
          <CardDescription>
            Describe what you need help with, and AI will find the best matching resources.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What kind of help do you need?
            </label>
            <Textarea
              placeholder="e.g., I need affordable home care for my 78-year-old mother who has dementia..."
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              className="bg-white dark:bg-gray-950"
              rows={3}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="City, State (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white dark:bg-gray-950 max-w-xs"
            />
            <Button onClick={handleAIMatch} disabled={matching} className="group">
              {matching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding matches...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Resources
                </>
              )}
            </Button>
          </div>

          {aiMatches && aiMatches.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold">Best Matches</h4>
              {aiMatches.map((match) => (
                <div key={match.resourceId} className="p-4 rounded-lg bg-white dark:bg-gray-950 border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium">{match.resource.name}</h5>
                      <Badge variant="info" className="mt-1 text-xs">
                        {match.relevanceScore}% match
                      </Badge>
                    </div>
                    {match.resource.website && (
                      <a
                        href={match.resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{match.reason}</p>
                  {match.resource.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {match.resource.phone}
                    </p>
                  )}
                  {match.resource.city && match.resource.state && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {match.resource.city}, {match.resource.state}
                    </p>
                  )}
                  <p className="text-sm mt-2 text-blue-600 dark:text-blue-400">
                    {match.nextSteps}
                  </p>
                </div>
              ))}
              {aiMatches.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matching resources found. Try describing your needs differently.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Browser */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold">All Resources</h3>
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
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                loadResources(e.target.value);
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {resourceTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground text-sm">
                Try using the AI Resource Matcher above to find what you need.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{resource.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {resource.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {resource.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {resource.phone}
                      </p>
                    )}
                    {resource.city && resource.state && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {resource.city}, {resource.state}
                      </p>
                    )}
                    {resource.cost && <p>Cost: {resource.cost}</p>}
                    {resource.eligibility && <p>Eligibility: {resource.eligibility}</p>}
                  </div>
                  {resource.website && (
                    <a
                      href={resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-3"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit website
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
