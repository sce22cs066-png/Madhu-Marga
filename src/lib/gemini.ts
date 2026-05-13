import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeHiveHealth(params: {
  activityLevel: string;
  pestsSeen: boolean;
  queenPresent: boolean;
  observations: string;
}) {
  const prompt = `
    You are an expert beekeeper assistant. Analyze the following hive inspection data and provide a concise intervention alert or health tip.
    
    Data:
    - Activity Level: ${params.activityLevel}
    - Pests Seen: ${params.pestsSeen ? 'Yes' : 'No'}
    - Queen Present: ${params.queenPresent ? 'Yes' : 'No'}
    - Observations: ${params.observations}
    
    Identify potential issues like Varroa mites, starvation, or queenlessness.
    Provide a clear "Intervention Alert" if the activity is low or pests are present.
    Provide a "Success Tip" if everything looks good.
    Keep it under 60 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Specified in skill for text tasks
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Could not perform AI analysis at this time.";
  }
}

export async function getFloraCalendar() {
    // Generate some interesting flora data if none exists
    const prompt = "Generate a list of 5 bee-friendly flowers common in India with their blooming seasons and benefits for bees in JSON format.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            bloomingSeason: { type: Type.STRING },
                            description: { type: Type.STRING },
                            benefitToBees: { type: Type.STRING }
                        },
                        required: ["name", "bloomingSeason", "description", "benefitToBees"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Gemini Flora Error:", error);
        return [];
    }
}
