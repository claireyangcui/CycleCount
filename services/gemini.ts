import { GoogleGenAI, Type } from "@google/genai";
import { BikeDetection } from '../types';

// Helper to fetch image and convert to base64
async function urlToBase64(url: string): Promise<string> {
  console.log(`[Gemini Service] Fetching image: ${url}`);
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, { mode: 'cors', signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        console.log(`[Gemini Service] Image converted to base64`);
        const data = base64.split(',')[1];
        resolve(data);
      };
      reader.onerror = (e) => {
        console.error("[Gemini Service] FileReader error", e);
        reject(e);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("[Gemini Service] Image fetch error", error);
    throw new Error(`CORS or Network Error: Could not fetch image. ${error instanceof Error ? error.message : ''}`);
  }
}

export const analyzeImage = async (imageUrl: string): Promise<BikeDetection[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64Image = await urlToBase64(imageUrl);

  console.log("[Gemini Service] Sending request to Gemini...");
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        },
        {
          text: `Analyze this image of parked bikes. 
          The goal is to create a precise inventory count.
          
          Distinguish between:
          1. 'Main': The primary subject bike(s) in the foreground (usually 1 or 2).
          2. 'Background': Any other clearly visible bikes in the rack or background.
          
          For each bike detected, providing the following details is critical:
          - Frame Color: (e.g. Blue, Green, Black, Silver)
          - Fender Color: (Look closely at the mudguards/fenders. If absent, use "No Fender". If unsure/hidden, "Unknown")
          - Category: (Road, Mountain, City, Hybrid)
          - Bounding Box: Return the bounding box [ymin, xmin, ymax, xmax] for the bike.
          `
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bikes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                frameColor: { type: Type.STRING },
                fenderColor: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Main", "Background"] },
                category: { type: Type.STRING, enum: ["Road", "Mountain", "City", "Other"] },
                boundingBox: {
                  type: Type.OBJECT,
                  properties: {
                    ymin: { type: Type.NUMBER },
                    xmin: { type: Type.NUMBER },
                    ymax: { type: Type.NUMBER },
                    xmax: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];

  try {
    const json = JSON.parse(text);
    return json.bikes || [];
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};