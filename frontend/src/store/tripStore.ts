import { create } from 'zustand';

interface TripStore {
  currentTrip: any | null;
  setCurrentTrip: (trip: any) => void;
  updateDay: (dayData: any) => void;
  currency: string;
  setCurrency: (c: string) => void;
  rates: Record<string, number>;
  fetchRates: () => Promise<void>;
  formatMoney: (baseInrAmount: number) => string;
}

export const useTripStore = create<TripStore>((set, get) => ({
  currentTrip: null,
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  updateDay: (dayData) => set((state) => {
    if (!state.currentTrip) return { currentTrip: null };
    
    // Day replacement or update
    const updatedItinerary = state.currentTrip.itinerary.map((d: any) => 
       d.day === dayData.day ? dayData : d
    );
    
    const newBudgetActivities = updatedItinerary.reduce((acc: number, d: any) => acc + d.estimatedCost, 0);
    const transport = state.currentTrip.budget.transport ?? state.currentTrip.budget.flights ?? 0;
    const updatedBudget = {
      ...state.currentTrip.budget,
      activities: newBudgetActivities,
      total: transport + state.currentTrip.budget.accommodation + state.currentTrip.budget.food + newBudgetActivities
    };

    return {
      currentTrip: {
        ...state.currentTrip,
        itinerary: updatedItinerary,
        budget: updatedBudget
      }
    };
  }),
  currency: 'INR', // Default to INR to match baseline
  setCurrency: (c) => set({ currency: c }),
  rates: { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, RUB: 92.5, CNY: 7.23 },
  fetchRates: async () => {
    try {
       const res = await fetch('https://open.er-api.com/v6/latest/USD');
       const data = await res.json();
       if (data && data.rates) {
         set({ rates: data.rates });
       }
    } catch(e) {
       console.error("Failed to fetch exchange rates", e);
    }
  },
  formatMoney: (baseInrAmount: number) => {
    const { currency, rates } = get();
    
    const inrRate = rates['INR'] || 83.5;
    const targetRate = rates[currency] || 1;
    
    const usdEquivalent = baseInrAmount / inrRate;
    const converted = usdEquivalent * targetRate;

    const formatters: Record<string, Intl.NumberFormat> = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    };

    const formatter = formatters[currency] || formatters['INR'];
    return formatter.format(converted);
  }
}));
