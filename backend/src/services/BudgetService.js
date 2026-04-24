export class BudgetService {
  static estimateTransport(origin, destination, transportPreference) {
    const baseDistanceCost = 200;

    switch (transportPreference) {
      case 'Flight':
        return baseDistanceCost * 2;
      case 'Train':
        return baseDistanceCost * 1.2;
      case 'Bus':
        return baseDistanceCost * 0.8;
      case 'AI Decide':
      default:
        return baseDistanceCost * 1.5;
    }
  }

  static calculateTotalFromItinerary(itinerary, budgetInput) {
    let activitiesCost = 0;

    itinerary.forEach((day) => {
      activitiesCost += day.estimatedCost;
    });

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
