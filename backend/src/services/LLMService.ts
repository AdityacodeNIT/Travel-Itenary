import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const keyString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyString) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is missing from environment variables.');
    }
    
    let credentials;
    try {
      credentials = JSON.parse(keyString);
    } catch (e) {
      throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY as JSON. Make sure it is valid JSON string.');
    }

    aiInstance = new GoogleGenAI({
      vertexai: true,
      project: credentials.project_id,
      location: 'us-central1',
      googleAuthOptions: {
        credentials,
      },
    });
  }
  return aiInstance;
}

export class LLMService {
  static async generateTravelPlanRaw(prompt: string): Promise<string> {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (!response.text) {
        throw new Error('No text generated from Vertex AI');
      }

      return response.text;
    } catch (error) {
      console.error('LLM Generation Error:', error);
      throw new Error('Failed to generate from Vertex AI: ' + ((error as Error).message || String(error)));
    }
  }
}