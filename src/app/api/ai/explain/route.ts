import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { explainMedicalText } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Medical text is required" }, { status: 400 });
    }

    let explanation;
    try {
      explanation = await explainMedicalText(text);
    } catch (aiError) {
      console.error("AI explain error:", aiError);
      return NextResponse.json(
        { error: "Failed to explain medical text. Please check your OpenAI API key." },
        { status: 500 }
      );
    }

    return NextResponse.json(explanation);
  } catch (error) {
    console.error("Medical explain API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
