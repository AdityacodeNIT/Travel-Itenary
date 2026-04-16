import { IBudget, IDay } from '../models/Trip';

export class BudgetService {
  static estimateTransport(origin: string, destination: string, transportPreference: string): number {
    // Simple estimation based on transport mode
    // In production, you'd use distance APIs or real pricing data
    const baseDistanceCost = 200; // baseline for medium distance
    
    switch (transportPreference) {
      case 'Flight':
        return baseDistanceCost * 2; // flights are typically more expensive
      case 'Train':
        return baseDistanceCost * 1.2;
      case 'Bus':
        return baseDistanceCost * 0.8;
      case 'AI Decide':
      default:
        return baseDistanceCost * 1.5; // average estimate
    }
  }

  static calculateTotalFromItinerary(itinerary: IDay[], budgetInput: IBudget): IBudget {
    let activitiesCost = 0;

    itinerary.forEach((day) => {
      activitiesCost += day.estimatedCost;
    });

    // Recalculate total as sum of all parts for consistency
    const total = activitiesCost + budgetInput.transport + budgetInput.accommodation + budgetInput.food;

    return {
      transport: budgetInput.transport,
      accommodation: budgetInput.accommodation,
      food: budgetInput.food,
      activities: activitiesCost,
      total,
    };
  }
}
