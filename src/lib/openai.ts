import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. " +
        "Please configure it in your .env file to use AI features."
      );
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export const AI_MODEL = "gpt-4o-mini";

export async function generateCarePlanWithAI(patientInfo: {
  firstName: string;
  lastName: string;
  age?: number | null;
  conditions: string[];
  allergies: string[];
  medications: string[];
  notes?: string | null;
}) {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a compassionate care planning assistant. Create a detailed, personalized care plan for an elderly or disabled individual based on their information. 
        
        Return a JSON object with the following structure:
        {
          "summary": "A brief 2-3 sentence summary of the person's care situation",
          "goals": [
            { "category": "health|medication|mobility|nutrition|social|safety|cognitive", "title": "Goal title", "description": "Detailed description of the goal", "targetDate": "optional timeline" }
          ],
          "dailyRoutine": {
            "morning": ["wake up at 8am", "take medications", ...],
            "afternoon": ["lunch at 12pm", "rest period", ...],
            "evening": ["dinner at 6pm", "evening medications", ...],
            "night": ["bedtime routine", ...]
          },
          "recommendations": [
            { "category": "safety|nutrition|exercise|social|medical|home", "title": "Recommendation title", "description": "Detailed recommendation" }
          ],
          "emergencyInfo": {
            "warningSigns": ["sign 1", "sign 2", ...],
            "emergencyContacts": ["contact info"],
            "specialInstructions": "instructions for first responders"
          }
        }
        
        Be specific, practical, and tailored to the individual's conditions and needs. Focus on actionable advice for family caregivers.`,
      },
      {
        role: "user",
        content: `Please create a care plan for:
        Name: ${patientInfo.firstName} ${patientInfo.lastName}
        Age: ${patientInfo.age || "Not specified"}
        Medical Conditions: ${patientInfo.conditions.join(", ") || "None listed"}
        Allergies: ${patientInfo.allergies.join(", ") || "None listed"}
        Current Medications: ${patientInfo.medications.join(", ") || "None listed"}
        Additional Notes: ${patientInfo.notes || "None provided"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content);
}

export async function getAIAssistantResponse(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: {
    patientName?: string;
    conditions?: string[];
    medications?: string[];
  }
) {
  const openai = getOpenAIClient();

  const systemPrompt = `You are an expert caregiving assistant helping family caregivers manage the care of their loved ones. 
  
  You provide:
  - Practical, actionable advice for daily care challenges
  - Explanations of medical terms in plain language
  - Tips for managing medications and appointments
  - Suggestions for finding community resources and support
  - Emotional support and validation for caregivers
  
  ${context ? `Current care context:\n${JSON.stringify(context, null, 2)}` : ""}
  
  Be warm, empathetic, and practical. Keep responses focused and actionable. If you're unsure about medical advice, remind the user to consult with healthcare providers.`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
}

export async function explainMedicalText(text: string) {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a medical liaison who explains medical information to family caregivers in plain language. 
        
        For the given text, provide:
        1. A plain-language summary (2-3 sentences)
        2. Key terms explained simply
        3. What the caregiver should watch for or do next
        4. Questions to ask the doctor
        
        Return as JSON: { "summary": "...", "keyTerms": [{ "term": "...", "explanation": "..." }], "actions": ["..."], "questionsForDoctor": ["..."] }
        
        Always include a disclaimer that this is not medical advice.`,
      },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content);
}

export async function findMatchingResources(
  needs: string,
  resources: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    city?: string | null;
    state?: string | null;
    eligibility?: string | null;
    cost?: string | null;
    tags: string[];
  }>,
  location?: string
) {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a community resource specialist. Given a person's needs and a list of available resources, identify which resources are most relevant and helpful.
        
        Return as JSON: { "matches": [{ "resourceId": "id", "relevanceScore": 0-100, "reason": "why this matches", "nextSteps": "how to apply/contact" }], "summary": "brief summary of findings", "gaps": ["any unmet needs to look for"] }
        
        Only match resources that genuinely fit the person's needs. Be honest if nothing matches well.`,
      },
      {
        role: "user",
        content: `The person needs: ${needs}${location ? `\nLocation: ${location}` : ""}
        
        Available resources:
        ${JSON.stringify(resources, null, 2)}
        
        Which resources are the best matches?`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content);
}
