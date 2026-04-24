export class ParserService {
  static parseLLMOutput(rawText) {
    try {
      let jsonString = rawText.trim();
      if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
      if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
      if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);

      const parsed = JSON.parse(jsonString.trim());
      return this.normalize(parsed);
    } catch (error) {
      console.error('JSON Parsing Error:', error);
      throw new Error('Failed to parse LLM raw text into JSON');
    }
  }

  static normalize(data) {
    if (data.budget) {
      if (data.budget.flights !== undefined && data.budget.transport === undefined) {
        data.budget.transport = data.budget.flights;
        delete data.budget.flights;
      }
      if (data.budget.transport === undefined) {
        data.budget.transport = 0;
      }
    }

    if (!data.transportMode || !['Flight', 'Train', 'Bus'].includes(data.transportMode)) {
      data.transportMode = 'Flight';
    }

    const modeMap = {
      flight: 'Flight',
      train: 'Train',
      bus: 'Bus',
      flights: 'Flight',
      trains: 'Train',
      buses: 'Bus',
    };

    const lowerMode = data.transportMode?.toLowerCase?.();
    if (lowerMode && modeMap[lowerMode]) {
      data.transportMode = modeMap[lowerMode];
    }

    return data;
  }
}
