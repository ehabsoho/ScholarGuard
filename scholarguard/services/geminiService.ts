import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlagiarismResult, AIDetectionResult, HumanizeResult, HumanizeTone } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select an API Key.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for retries with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      const isInternal = e.message?.includes('500') || e.status === 500 || e.code === 500 || e.message?.includes('Internal error');
      const isOverloaded = e.message?.includes('503') || e.status === 503 || e.message?.includes('429');
      
      if (isInternal || isOverloaded) {
        const delay = 1000 * Math.pow(2, i);
        console.warn(`API Error (Attempt ${i+1}/${retries}): ${e.message}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

// --- Plagiarism Checker ---

export const checkPlagiarism = async (text: string): Promise<PlagiarismResult> => {
  const ai = getClient();
  const safeText = text.slice(0, 12000); // Prevent context overload

  return withRetry(async () => {
    // Note: We use the Google Search tool for grounding to get REAL URLs.
    // When using tools, we cannot strict responseSchema in the config easily. 
    // We must prompt for JSON output and parse it manually.

    const prompt = `
      You are an expert scientific plagiarism detector. 
      Analyze the following text. Use Google Search to find if any sentences or phrases match existing published content online.
      
      Text to analyze:
      """${safeText}"""

      Instructions:
      1. Identify sentences that strongly resemble existing works.
      2. You MUST use the Google Search tool to verify sources and get REAL URLs.
      3. Return the result strictly as a RAW JSON string. Do not use Markdown code blocks.
      
      The JSON structure must be:
      {
        "score": number, // Overall plagiarism percentage (0-100)
        "summary": "string", // Brief executive summary
        "matches": [
          {
            "sentence": "string", // The sentence from input
            "source": "string", // Title of the source
            "sourceType": "Journal" | "Book" | "Conference" | "Website",
            "similarity": number, // 0-100
            "url": "string" // The REAL URL found via search
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable grounding
        temperature: 0.1,
      }
    });

    let jsonString = response.text || "{}";
    
    // Cleanup potential markdown formatting
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
    
    // Find the JSON object within the text if there's extra conversational text
    const start = jsonString.indexOf('{');
    const end = jsonString.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      jsonString = jsonString.substring(start, end + 1);
    }

    try {
      const result = JSON.parse(jsonString);
      return result as PlagiarismResult;
    } catch (e) {
      console.error("Failed to parse plagiarism result JSON:", e);
      throw new Error("Failed to parse analysis results.");
    }
  });
};

// --- AI Detector ---

export const detectAIContent = async (text: string): Promise<AIDetectionResult> => {
  const ai = getClient();
  const safeText = text.slice(0, 12000);

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Probability that the text is AI generated (0-100)." },
      overallAnalysis: { type: Type.STRING, description: "Explanation of why the text seems AI or Human written." },
      segments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "A sentence or phrase analyzed." },
            isAI: { type: Type.BOOLEAN, description: "True if this specific segment exhibits AI patterns." },
            reason: { type: Type.STRING, description: "Why this segment is flagged (e.g. repetition, lack of perplexity)." }
          },
          required: ['text', 'isAI', 'reason']
        }
      }
    },
    required: ['score', 'overallAnalysis', 'segments']
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following academic text for AI-generation patterns (e.g., lack of burstiness, repetitive structure, overly generic phrasing).
      Break down the analysis by key segments or sentences that seem suspicious.
      
      Text:
      """${safeText}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json as AIDetectionResult;
  });
};

// --- Humanizer ---

export const humanizeContent = async (text: string, tone: HumanizeTone): Promise<HumanizeResult> => {
  const ai = getClient();
  const safeText = text.slice(0, 12000);

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      originalText: { type: Type.STRING },
      humanizedText: { type: Type.STRING, description: "The rewritten text." },
      changesNote: { type: Type.STRING, description: "A summary of the stylistic changes made." }
    },
    required: ['originalText', 'humanizedText', 'changesNote']
  };

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following text to make it sound more human, less robotic, and fit for a high-quality academic submission.
      Target Tone: ${tone}
      Maintain scientific accuracy strictly. Vary sentence structure.
      
      Text:
      """${safeText}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Higher temperature for creativity
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json as HumanizeResult;
  });
};