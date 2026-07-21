import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { getAIAssistantResponse } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getCurrentUser();
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const { message, conversationId, careRecipientId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get context about the care recipient if provided
    let context: Record<string, unknown> | undefined;
    if (careRecipientId) {
      const careRecipient = await prisma.careRecipient.findFirst({
        where: { id: careRecipientId, primaryCaregiverId: user.id },
      });
      if (careRecipient) {
        context = {
          patientName: `${careRecipient.firstName} ${careRecipient.lastName}`,
          conditions: careRecipient.conditions,
          medications: careRecipient.currentMedications,
        };
      }
    }

    // Get conversation history
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId: user.id },
      });
    }

    const messages = conversation
      ? ((conversation.messages as unknown as Array<{ role: "user" | "assistant"; content: string }>) || [])
      : [];

    const updatedMessages = [...messages, { role: "user" as const, content: message }];

    // Get AI response
    let aiResponse;
    try {
      aiResponse = await getAIAssistantResponse(updatedMessages, context as {
        patientName?: string;
        conditions?: string[];
        medications?: string[];
      });
    } catch (aiError) {
      console.error("AI assistant error:", aiError);
      return NextResponse.json(
        { error: "Failed to get AI response. Please check your OpenAI API key." },
        { status: 500 }
      );
    }

    updatedMessages.push({ role: "assistant", content: aiResponse });

    // Save or update conversation
    if (conversation) {
      await prisma.aIConversation.update({
        where: { id: conversation.id },
        data: {
          messages: JSON.parse(JSON.stringify(updatedMessages)),
          title: conversation.title === "Chat" ? message.slice(0, 50) : conversation.title,
        },
      });
    } else {
      conversation = await prisma.aIConversation.create({
        data: {
          title: message.slice(0, 50),
          messages: JSON.parse(JSON.stringify(updatedMessages)),
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      message: aiResponse,
      conversationId: conversation.id,
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("AI assist API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
