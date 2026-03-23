import { GoogleGenAI } from "@google/genai";

export async function getEtsyRecommendations() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "What are the top 10 actionable recommendations from the Etsy Seller Handbook for optimizing a listing for search and conversion? Provide them in a structured JSON format.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });
  return response.text;
}
