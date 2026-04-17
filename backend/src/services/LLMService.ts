import { GoogleGenAI } from '@google/genai';

const credentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string
);

const ai = new GoogleGenAI({
  vertexai: true,
  project: credentials.project_id,
  location: 'us-central1',
  googleAuthOptions: {
    credentials,
  },
});

export class LLMService {
  static async generateTravelPlanRaw(prompt: string): Promise<string> {
    try {
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
      throw new Error('Failed to generate from Vertex AI');
    }
  }
}