import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { findMatchingResources } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const { needs, location } = body;

    if (!needs) {
      return NextResponse.json({ error: "Needs description is required" }, { status: 400 });
    }

    // Get all available resources
    const resources = await prisma.communityResource.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        city: true,
        state: true,
        eligibility: true,
        cost: true,
        tags: true,
      },
    });

    let result;
    try {
      result = await findMatchingResources(needs, resources, location);
    } catch (aiError) {
      console.error("AI resource matching error:", aiError);
      return NextResponse.json(
        { error: "Failed to find matching resources. Please check your OpenAI API key." },
        { status: 500 }
      );
    }

    // Enrich matches with full resource data
    const enrichedMatches = result.matches.map((match: { resourceId: string; relevanceScore: number; reason: string; nextSteps: string }) => {
      const resource = resources.find((r) => r.id === match.resourceId);
      return {
        ...match,
        resource: resource || null,
      };
    }).filter((m: { resource: unknown }) => m.resource);

    return NextResponse.json({
      matches: enrichedMatches,
      summary: result.summary,
      gaps: result.gaps,
    });
  } catch (error) {
    console.error("Resource matching API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
