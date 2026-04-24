import Trip from '../models/Trip.js';
import { ValidationService } from './ValidationService.js';
import { BudgetService } from './BudgetService.js';

function normalizeTripDoc(trip) {
  if (!trip) return trip;
  if (trip.budget) {
    const budget = trip.budget;
    if (budget.flights !== undefined && budget.transport === undefined) {
      budget.transport = budget.flights;
      delete budget.flights;
    }
    if (budget.transport === undefined) budget.transport = 0;
  }
  if (!trip.transportMode) trip.transportMode = 'Flight';
  if (!trip.origin) trip.origin = '';
  if (!trip.howToReach) trip.howToReach = { summary: '', steps: [], arrivalTip: '' };
  return trip;
}

export class TripService {
  static getBasePrompt(origin, destination, days, budgetType, interests, transportPreference) {
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
      "Take the RER B train from CDG airport to central Paris (~45 mins, ~â‚¬12)",
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

  static async generateTrip(userId, data) {
    const {
      origin,
      destination,
      days,
      budgetType,
      interests,
      transportPreference = 'AI Decide',
    } = data;

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

      if (normalizedTrip.origin !== origin) {
        const newTransportCost = BudgetService.estimateTransport(origin, destination, transportPreference);

        clonedTrip.budget.transport = newTransportCost;
        clonedTrip.budget = BudgetService.calculateTotalFromItinerary(clonedTrip.itinerary, clonedTrip.budget);
        clonedTrip.howToReach = {
          summary: `Travel from ${origin} to ${destination}`,
          steps: [],
          arrivalTip: '',
        };
      }

      const savedTrip = await clonedTrip.save();
      return savedTrip;
    }

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
        arrivalTip: '',
      },
      itinerary: validatedData.days,
      budget: finalBudget,
      hotels: validatedData.hotels,
    });

    const savedTrip = await newTrip.save();
    return savedTrip;
  }

  static async getTripByIdAndUser(id, userId) {
    const trip = await Trip.findOne({ _id: id, userId }).lean();
    return normalizeTripDoc(trip);
  }

  static async getUserTrips(userId) {
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 }).lean();
    return trips.map(normalizeTripDoc);
  }

  static async deleteTrip(id, userId) {
    await Trip.findOneAndDelete({ _id: id, userId });
  }

  static async regenerateDay(id, userId, dayNumber) {
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

    const { LLMService } = await import('./LLMService.js');
    const { ParserService } = await import('./ParserService.js');

    const rawData = await LLMService.generateTravelPlanRaw(prompt);
    const parsedDay = ParserService.parseLLMOutput(rawData);

    if (parsedDay.day === undefined || !parsedDay.activities || parsedDay.estimatedCost === undefined) {
      throw new Error('LLM failed to return structured day format.');
    }

    const dayIndex = trip.itinerary.findIndex((day) => day.day === dayNumber);
    if (dayIndex !== -1) {
      trip.itinerary[dayIndex] = parsedDay;
    } else {
      trip.itinerary.push(parsedDay);
    }

    trip.budget = BudgetService.calculateTotalFromItinerary(trip.itinerary, trip.budget);

    trip.markModified('itinerary');
    return await trip.save();
  }

  static async optimizeDayBudget(id, userId, dayNumber, targetReduction) {
    console.log('[OPTIMIZE] Starting HYBRID day optimization:', {
      tripId: id,
      userId,
      dayNumber,
      targetReduction,
    });

    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) {
      console.error('[OPTIMIZE] Trip not found');
      throw new Error('Trip not found');
    }

    const dayIndex = trip.itinerary.findIndex((day) => day.day === dayNumber);
    if (dayIndex === -1) {
      console.error('[OPTIMIZE] Day not found in itinerary');
      throw new Error('Day not found in itinerary');
    }

    const currentDay = trip.itinerary[dayIndex];
    const currentCost = currentDay.estimatedCost;

    if (currentCost === 0) {
      console.log('[OPTIMIZE] Day cost is already 0, nothing to optimize');
      return trip;
    }

    console.log('[OPTIMIZE] Current day details:', {
      day: dayNumber,
      currentCost,
      activities: currentDay.activities,
    });

    let newCost;
    let reductionPercent;

    if (targetReduction && targetReduction > 0) {
      newCost = Math.max(0, currentCost - targetReduction);
      reductionPercent = Math.round((targetReduction / currentCost) * 100);
    } else {
      reductionPercent = 20;
      newCost = Math.floor(currentCost * (1 - reductionPercent / 100));
    }

    if (newCost >= currentCost) {
      newCost = Math.floor(currentCost * 0.8);
      reductionPercent = 20;
    }

    console.log('[OPTIMIZE] Math-based cost calculation:', {
      before: currentCost,
      after: newCost,
      reduction: currentCost - newCost,
      reductionPercent,
    });

    const prompt = `
  You are an expert AI Travel Planner and Budget Optimizer.

  The user wants to reduce the cost of Day ${dayNumber} of their trip to ${trip.destination}.
  Budget category: ${trip.budgetType}
  User interests: ${trip.interests.join(', ')}

  CURRENT SITUATION:
  Current activities for Day ${dayNumber}:
  ${JSON.stringify(currentDay.activities, null, 2)}
  Current cost: â‚¹${currentCost}

  NEW BUDGET CONSTRAINT:
  The new budget for this day is EXACTLY â‚¹${newCost} (reduced by ${reductionPercent}%)

  YOUR TASK:
  Suggest 3-5 alternative activities that:
  1. Fit within the NEW budget of â‚¹${newCost}
  2. Are cheaper alternatives to the current expensive activities
  3. Match the user's interests: ${trip.interests.join(', ')}
  4. Are realistic and available in ${trip.destination}
  5. Maintain a good travel experience despite the lower cost

  IMPORTANT RULES:
  - Suggest FREE or low-cost activities when possible
  - Replace expensive attractions with free alternatives (parks, walking tours, free museums)
  - Replace expensive dining with local/street food options
  - Keep the activities culturally authentic to ${trip.destination}
  - The total should fit within â‚¹${newCost}

  Return ONLY valid JSON with this exact structure (no markdown, no extra text):
  {
    "day": ${dayNumber},
    "activities": [
      "Free/cheap activity 1 that replaces expensive activity",
      "Budget-friendly activity 2",
      "Low-cost activity 3"
    ],
    "estimatedCost": ${newCost}
  }

  CRITICAL: The estimatedCost MUST be exactly ${newCost}. Do not change it.
  `;

    console.log('[OPTIMIZE] Asking AI for cheaper activity suggestions...');

    try {
      const { LLMService } = await import('./LLMService.js');
      const { ParserService } = await import('./ParserService.js');

      const rawData = await LLMService.generateTravelPlanRaw(prompt);
      const parsedDay = ParserService.parseLLMOutput(rawData);

      console.log('[OPTIMIZE] AI response parsed:', parsedDay);

      if (parsedDay.day === undefined || !parsedDay.activities || !Array.isArray(parsedDay.activities)) {
        throw new Error('Invalid AI response structure');
      }

      parsedDay.estimatedCost = newCost;

      console.log('[OPTIMIZE] Using AI-suggested activities with math-based cost:', {
        activities: parsedDay.activities,
        cost: newCost,
      });

      trip.itinerary[dayIndex] = {
        day: dayNumber,
        activities: parsedDay.activities,
        estimatedCost: newCost,
      };
    } catch (error) {
      console.error('[OPTIMIZE] AI failed, using fallback:', error);

      const optimizedActivities = [...currentDay.activities];
      if (optimizedActivities.length > 0) {
        const firstActivity = optimizedActivities[0];
        if (!firstActivity.includes('(Budget optimized)')) {
          optimizedActivities[0] = `${firstActivity} (Budget optimized -${reductionPercent}%)`;
        }
      }

      trip.itinerary[dayIndex] = {
        day: dayNumber,
        activities: optimizedActivities,
        estimatedCost: newCost,
      };
    }

    trip.budget = BudgetService.calculateTotalFromItinerary(trip.itinerary, trip.budget);

    console.log('[OPTIMIZE] Final result:', {
      day: dayNumber,
      oldCost: currentCost,
      newCost,
      reduction: currentCost - newCost,
      reductionPercent,
      newBudgetTotal: trip.budget.total,
    });

    trip.markModified('itinerary');
    const savedTrip = await trip.save();

    console.log('[OPTIMIZE] âœ… Day optimized successfully (hybrid: math + AI suggestions)');
    return savedTrip;
  }

  static async findSimilarTrip(data) {
    const { origin, destination, days, budgetType, interests = [] } = data;

    let trips = await Trip.find({
      origin: { $regex: new RegExp(`^${origin}`, 'i') },
      destination: { $regex: new RegExp(`^${destination}`, 'i') },
      days,
      budgetType,
    }).lean();

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

    const normalizedInterests = interests.map((interest) => interest.toLowerCase().trim());

    let bestMatch = null;
    let bestScore = -1;

    for (const trip of trips) {
      const tripInterests = (trip.interests || []).map((interest) => interest.toLowerCase().trim());

      const overlap = tripInterests.filter((interest) => normalizedInterests.includes(interest)).length;

      let score = 0;
      if (normalizedInterests.length > 0) {
        score = overlap / normalizedInterests.length;
      } else {
        score = 1.0;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = trip;
      }
    }

    const threshold = 0.3;

    if (bestMatch && bestScore >= threshold) {
      return bestMatch;
    }

    return null;
  }
}
