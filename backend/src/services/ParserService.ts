export class ParserService {
  static parseLLMOutput(rawText: string): any {
    try {
      // Strip markdown code fences the LLM wraps around JSON
      let jsonString = rawText.trim();
      if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
      if (jsonString.startsWith('```'))     jsonString = jsonString.slice(3);
      if (jsonString.endsWith('```'))       jsonString = jsonString.slice(0, -3);

      const parsed = JSON.parse(jsonString.trim());
      return this.normalize(parsed);
    } catch (error) {
      console.error('JSON Parsing Error:', error);
      throw new Error('Failed to parse LLM raw text into JSON');
    }
  }

  /**
   * Normalizes the parsed LLM output to ensure consistent field names
   * regardless of what the model decides to call things.
   *
   * Key normalizations:
   *   - budget.flights  → budget.transport  (AI commonly uses "flights" by default)
   *   - transportMode: infer from context if missing
   */
  private static normalize(data: any): any {
    if (data.budget) {
      // If AI returned "flights" but not "transport", rename it
      if (data.budget.flights !== undefined && data.budget.transport === undefined) {
        data.budget.transport = data.budget.flights;
        delete data.budget.flights;
      }
      // Ensure transport is always a number
      if (data.budget.transport === undefined) {
        data.budget.transport = 0;
      }
    }

    // If AI forgot transportMode, make a best-effort inference
    if (!data.transportMode || !['Flight', 'Train', 'Bus'].includes(data.transportMode)) {
      // Default to Flight as the safest fallback
      data.transportMode = 'Flight';
    }

    // Capitalise transportMode correctly in case AI returns lowercase
    const modeMap: Record<string, string> = {
      flight: 'Flight', train: 'Train', bus: 'Bus',
      flights: 'Flight', trains: 'Train', buses: 'Bus',
    };
    if (modeMap[data.transportMode?.toLowerCase?.()]) {
      data.transportMode = modeMap[data.transportMode.toLowerCase()];
    }

    return data;
  }
}

