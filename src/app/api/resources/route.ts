import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const resources = await prisma.communityResource.findMany({
      where,
      orderBy: { name: "asc" },
      take: 50,
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const resource = await prisma.communityResource.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        phone: body.phone || null,
        website: body.website || null,
        email: body.email || null,
        hours: body.hours || null,
        eligibility: body.eligibility || null,
        cost: body.cost || null,
        languages: body.languages || [],
        tags: body.tags || [],
        verified: false,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
