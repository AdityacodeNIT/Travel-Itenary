import Trip, { ITrip } from '../models/Trip';
import { ValidationService } from './ValidationService';
import { BudgetService } from './BudgetService';

function normalizeTripDoc(trip: any): any {
  if (!trip) return trip;
  if (trip.budget) {
    const b = trip.budget;
    if (b.flights !== undefined && b.transport === undefined) {
      b.transport = b.flights;
      delete b.flights;
    }
    if (b.transport === undefined) b.transport = 0;
  }
  if (!trip.transportMode) trip.transportMode = 'Flight';
  if (!trip.origin)        trip.origin = '';
  if (!trip.howToReach)    trip.howToReach = { summary: '', steps: [], arrivalTip: '' };
  return trip;
}

export class TripService {
  static getBasePrompt(
    origin: string,
    destination: string,
    days: number,
    budgetType: string,
    interests: string[],
    transportPreference: string
  ): string {
    const transportInstruction =
      transportPreference === 'AI Decide'
        ? `Determine the BEST transport mode from ${origin} to ${destination}. Consider distance, practicality, and cost. If a train or bus is a realistic and more affordable option, prefer that over flying. Choose ONE of: Flight, Train, Bus.`
        : `The user prefers to travel by: ${transportPreference}. Use this mode and estimate realistic costs accordingly.`;

    return `
You are an expert AI Travel Planner. Generate a detailed, realistic structured itinerary.
Traveling FROM: ${origin}
Destination: ${destination}
Number of days: ${days}
Budget Category: ${budgetType}
Interests: ${interests.join(', ')}

TRANSPORT DECISION:
${transportInstruction}

IMPORTANT RULES:
- Set "transportMode" to exactly one of: "Flight", "Train", or "Bus"
- ALL estimated costs MUST be calculated deeply realistically in Indian Rupees (INR).
- Return ALL cost values purely as integers representing Indian Rupees (INR), with NO currency symbols.
- CRUCIAL PRICING LOGIC: Scale your pricing dynamically to the DESTINATION'S specific cost of living, economy, and GDP per capita. What is considered "cheap" or "expensive" MUST be strictly accurate for ${destination} context (e.g., "Budget" in the USA has entirely different baseline costs than "Budget" in India).
- If the Budget Category is "Budget", you MUST be extremely economical relative to ${destination}'s standard baseline. Choose the absolute cheapest local street food/eateries, affordable hostels/guesthouses, and free/cheap activities appropriate for that country. Do not artificially inflate or deflate prices beyond local reality!
- Set "budget.transport" to the realistic round-trip cost using the chosen mode in INR
- Make sure 'days' array length is EXACTLY ${days}
- Ensure 'budget.total' strictly equals: transport + accommodation + food + activities
- Give culturally relevant activity recommendations for ${destination}
- The "howToReach" section describes HOW to travel from ${origin} to ${destination} BEFORE the trip days start. It is NOT part of the daily activities.

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "transportMode": "Flight",
  "howToReach": {
    "summary": "Fly from Mumbai to Paris with a layover in Dubai (~10 hrs total)",
    "steps": [
      "Book a flight from Mumbai (BOM) to Paris Charles de Gaulle (CDG)",
      "Take the RER B train from CDG airport to central Paris (~45 mins, ~€12)",
      "From Gare du Nord, take Metro Line 4 to your hotel area"
    ],
    "arrivalTip": "Book your train/bus tickets to the city center in advance. Paris Metro day passes save money."
  },
  "days": [
    {
      "day": 1,
      "activities": ["Visit the Eiffel Tower", "Dinner at a local bistro"],
      "estimatedCost": 80
    }
  ],
  "budget": {
    "transport": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 160,
    "total": 1010
  },
  "hotels": [
    {
      "name": "Example Hotel",
      "priceCategory": "Moderate",
      "rating": 4.2
    }
  ]
}
`;
  }

  static async generateTrip(userId: string, data: any): Promise<ITrip> {
    const {
      origin,
      destination,
      days,
      budgetType,
      interests,
      transportPreference = 'AI Decide'
    } = data;

  

    // STEP 1: Try to find similar trip
    const cachedTrip = await this.findSimilarTrip(data);

    if (cachedTrip) {
      const normalizedTrip = normalizeTripDoc(cachedTrip);

      const clonedTrip = new Trip({
        userId,
        origin,
        destination: normalizedTrip.destination,
        days: normalizedTrip.days,
        budgetType: normalizedTrip.budgetType,
        interests,
        transportPreference,
        transportMode: normalizedTrip.transportMode,
        howToReach: JSON.parse(JSON.stringify(normalizedTrip.howToReach)),
        itinerary: JSON.parse(JSON.stringify(normalizedTrip.itinerary)),
        budget: JSON.parse(JSON.stringify(normalizedTrip.budget)),
        hotels: JSON.parse(JSON.stringify(normalizedTrip.hotels)),
      });

      // Fix transport + route if origin changed
      if (normalizedTrip.origin !== origin) {
  
        
        const newTransportCost = BudgetService.estimateTransport(
          origin,
          destination,
          transportPreference
        );

        clonedTrip.budget.transport = newTransportCost;

        clonedTrip.budget = BudgetService.calculateTotalFromItinerary(
          clonedTrip.itinerary,
          clonedTrip.budget
        );

        // update route info
        clonedTrip.howToReach = {
          summary: `Travel from ${origin} to ${destination}`,
          steps: [],
          arrivalTip: ''
        };
      }

      const savedTrip = await clonedTrip.save();
      return savedTrip;
    }

    // STEP 2: Generate using LLM
 
    
    const prompt = this.getBasePrompt(
      origin,
      destination,
      days,
      budgetType,
      interests,
      transportPreference
    );

    const validatedData = await ValidationService.validateAndCorrect(prompt);

    const finalBudget = BudgetService.calculateTotalFromItinerary(
      validatedData.days,
      validatedData.budget
    );


    const newTrip = new Trip({
      userId,
      origin,
      destination,
      days,
      budgetType,
      interests,
      transportPreference,
      transportMode: validatedData.transportMode || 'Flight',
      howToReach: validatedData.howToReach || {
        summary: '',
        steps: [],
        arrivalTip: ''
      },
      itinerary: validatedData.days,
      budget: finalBudget,
      hotels: validatedData.hotels,
    });

    const savedTrip = await newTrip.save();
    return savedTrip;
  }

  static async getTripByIdAndUser(id: string, userId: string): Promise<any | null> {
    const trip = await Trip.findOne({ _id: id, userId }).lean();
    return normalizeTripDoc(trip);
  }

  static async getUserTrips(userId: string): Promise<any[]> {
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 }).lean();
    return trips.map(normalizeTripDoc);
  }

  static async deleteTrip(id: string, userId: string): Promise<void> {
    await Trip.findOneAndDelete({ _id: id, userId });
  }

  static async regenerateDay(id: string, userId: string, dayNumber: number): Promise<ITrip | null> {
    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) throw new Error('Trip not found');

    const prompt = `
Regenerate a single day itinerary for a trip to ${trip.destination}.
Traveling from: ${trip.origin} by ${trip.transportMode}.
Interests: ${trip.interests.join(', ')}
Budget Category: ${trip.budgetType}
This is for Day ${dayNumber}. Create brand new, fresh activities different from what was planned before.

Return ONLY valid JSON with this exact structure:
{
  "day": ${dayNumber},
  "activities": ["new activity 1", "new activity 2"],
  "estimatedCost": 75
}
`;

    const { LLMService } = await import('./LLMService');
    const { ParserService } = await import('./ParserService');

    const rawData = await LLMService.generateTravelPlanRaw(prompt);
    const parsedDay = ParserService.parseLLMOutput(rawData);

    if (parsedDay.day === undefined || !parsedDay.activities || parsedDay.estimatedCost === undefined) {
      throw new Error('LLM failed to return structured day format.');
    }

    const dayIndex = trip.itinerary.findIndex(d => d.day === dayNumber);
    if (dayIndex !== -1) {
      trip.itinerary[dayIndex] = parsedDay;
    } else {
      trip.itinerary.push(parsedDay);
    }

    trip.budget = BudgetService.calculateTotalFromItinerary(trip.itinerary, trip.budget);

    trip.markModified('itinerary');
    return await trip.save();
  }

  static async optimizeDayBudget(id: string, userId: string, dayNumber: number, targetReduction?: number): Promise<ITrip | null> {
    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) throw new Error('Trip not found');

    const dayIndex = trip.itinerary.findIndex((d) => d.day === dayNumber);
    if (dayIndex === -1) throw new Error('Day not found in itinerary');
    
    const currentDay = trip.itinerary[dayIndex];
    const currentCost = currentDay.estimatedCost;
    const reductionGoalStr = targetReduction ? ` Try to reduce the cost by approximately $${targetReduction} or more.` : ` Reduce the cost significantly while maintaining a good experience.`;

    const prompt = `
You are an expert AI Travel Planner and Smart Budget Optimizer.
The user wants to reduce the cost of Day ${dayNumber} of their trip to ${trip.destination}.
Their overall budget category is ${trip.budgetType}.

Current activities for Day ${dayNumber}:
${JSON.stringify(currentDay.activities, null, 2)}
Current Estimated Cost: $${currentCost}

YOUR TASK:
1. Tag each current activity mentally with a cost level (Free, $, $$, $$$).
2. Identify the most expensive activities (the $$$ ones).
3. Replace those expensive activities with practical, cheaper (or free) alternatives that still fit their interests: ${trip.interests.join(', ')}.
4.${reductionGoalStr} 
CRITICAL PRICING: All estimated costs MUST be calculated purely in Indian Rupees (INR) as plain integers.

Return ONLY valid JSON representing the new optimized day, with this exact structure:
{
  "day": ${dayNumber},
  "activities": [
    "Cheaper alternative activity 1",
    "Cheaper alternative activity 2",
    "Retained affordable activity 3"
  ],
  "estimatedCost": <new_lower_estimated_cost>
}
`;

    const { LLMService } = await import('./LLMService');
    const { ParserService } = await import('./ParserService');

    const rawData = await LLMService.generateTravelPlanRaw(prompt);
    const parsedDay = ParserService.parseLLMOutput(rawData);

    if (parsedDay.day === undefined || !parsedDay.activities || parsedDay.estimatedCost === undefined) {
      throw new Error('LLM failed to return structured day format.');
    }

    // Apply the new day
    trip.itinerary[dayIndex] = parsedDay;

    // Recalculate total budget
    trip.budget = BudgetService.calculateTotalFromItinerary(trip.itinerary, trip.budget);

    trip.markModified('itinerary');
    return await trip.save();
  }

  static async findSimilarTrip(data: any): Promise<any | null> {
    const { origin, destination, days, budgetType, interests = [] } = data;



    // 1. Try strict match (including origin)
    let trips = await Trip.find({
      origin: { $regex: new RegExp(`^${origin}`, 'i') },
      destination: { $regex: new RegExp(`^${destination}`, 'i') },
      days,
      budgetType,
    }).lean();

   

    // 2. If nothing found → fallback (ignore origin)
    if (!trips.length) {
      trips = await Trip.find({
        destination: { $regex: new RegExp(`^${destination}`, 'i') },
        days,
        budgetType,
      }).lean();
      
  
    }

    if (!trips.length) {
    
      return null;
    }

    // Normalize interests for case-insensitive comparison
    const normalizedInterests = interests.map((i: string) => i.toLowerCase().trim());

    // scoring with interests
    let bestMatch = null;
    let bestScore = -1;

    for (const trip of trips) {
      // Normalize trip interests
      const tripInterests = (trip.interests || []).map((i: string) => i.toLowerCase().trim());
      
      // Calculate overlap
      const overlap = tripInterests.filter((i: string) =>
        normalizedInterests.includes(i)
      ).length;

      // Calculate score (handle empty interests array)
      let score = 0;
      if (normalizedInterests.length > 0) {
        score = overlap / normalizedInterests.length;
      } else {
        // If no interests provided, any trip is a perfect match
        score = 1.0;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = trip;
      }
    }

    // Lower threshold to 30% for better cache hit rate
    const threshold = 0.3;
    
    if (bestMatch && bestScore >= threshold) {
  
      return bestMatch;
    } else {
      return null;
    }
  }
}
