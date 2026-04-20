
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeDentalImage = async (base64Image: string): Promise<AnalysisResponse> => {
  if (!API_KEY) {
    // Return mock data if no API key is present for demo stability
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "AI analysis detected standard alignment with minor occlusion in the posterior region.",
          results: [
            { toothId: "11", condition: "healthy", confidence: 0.98, description: "Central incisor: Normal" },
            { toothId: "12", condition: "warning", confidence: 0.85, description: "Lateral incisor: Slight plaque build-up" },
            { toothId: "46", condition: "critical", confidence: 0.92, description: "First molar: Potential caries detected" }
          ]
        });
      }, 2000);
    });
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Act as an expert dental AI. Analyze this dental scan/photo. Identify tooth health conditions. Provide a summary and a list of specific findings for visible teeth. Return ONLY JSON." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                toothId: { type: Type.STRING },
                condition: { type: Type.STRING, enum: ["healthy", "warning", "critical"] },
                confidence: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["toothId", "condition", "confidence", "description"]
            }
          }
        },
        required: ["summary", "results"]
      }
    }
  });

  return JSON.parse(response.text);
};
