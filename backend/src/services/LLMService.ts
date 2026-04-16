import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({}); 

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
