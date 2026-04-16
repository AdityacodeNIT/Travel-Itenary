import { LLMService } from './LLMService';
import { ParserService } from './ParserService';

export class ValidationService {
  static async validateAndCorrect(prompt: string, maxRetries = 3): Promise<any> {
    let attempts = 0;
    let currentPrompt = prompt;

    while (attempts < maxRetries) {
      const rawText = await LLMService.generateTravelPlanRaw(currentPrompt);
      let parsedData;

      try {
        parsedData = ParserService.parseLLMOutput(rawText);
      } catch (e) {
        currentPrompt = prompt + "\n\nCRITICAL FIX: Your previous response was NOT valid JSON. Ensure you return ONLY a raw JSON object string without any markdown wrappers or text around it.";
        attempts++;
        continue;
      }

      // Check specific domain logic (custom validation layer)
      const validationErrors = this.checkDomainLogic(parsedData);
      
      if (validationErrors.length === 0) {
        return parsedData; // Success!
      } else {
        const errorDescriptions = validationErrors.join('; ');
        console.warn(`Validation failed: ${errorDescriptions}. Re-prompting...`);
        currentPrompt = prompt + `\n\nCRITICAL FIX: Your previous response had the following structural/logical errors: ${errorDescriptions}. Please fix these and provide the full JSON again.`;
        attempts++;
      }
    }

    throw new Error('Exceeded maximum LLM retries for valid structure and data constraints.');
  }

  private static checkDomainLogic(data: any): string[] {
    const errors: string[] = [];

    if (!data.days || !Array.isArray(data.days)) {
      errors.push('Missing or invalid "days" array for itinerary');
    }
    if (!data.budget) {
      errors.push('Missing "budget" object');
    }
    if (!data.hotels || !Array.isArray(data.hotels)) {
      errors.push('Missing or invalid "hotels" array');
    }

    // Check budget total matches sum of parts (transport/flights both supported)
    if (data.budget) {
      const transport = data.budget.transport ?? 0;
      const partsSum = transport + (data.budget.accommodation || 0) + (data.budget.food || 0) + (data.budget.activities || 0);
      if (data.budget.total && Math.abs(data.budget.total - partsSum) > 50) {
        errors.push(`Budget total (${data.budget.total}) does not match the sum of its parts (${partsSum}).`);
      }
    }

    return errors;
  }
}
