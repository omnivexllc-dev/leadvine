import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function getAiModel(modelName = "gemini-2.5-flash") {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return google(modelName);
  }

  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const gateway = createOpenAICompatible({
      name: "lovable-gateway",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": lovableKey },
    });
    return gateway("google/gemini-2.5-flash");
  }

  // Fallback: standard Google provider
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  return google(modelName);
}

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
