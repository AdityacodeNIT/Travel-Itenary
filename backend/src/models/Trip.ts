import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity {
  time?: string;
  description: string;
}

export interface IDay {
  day: number;
  activities: string[];
  estimatedCost: number;
}

export interface IBudget {
  transport: number;       // cost of chosen transport mode (flight/train/bus)
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IHotel {
  name: string;
  priceCategory: string;
  rating: number;
}

export interface IHowToReach {
  summary: string;           // e.g. "Fly from Mumbai to Delhi (~2 hrs)"
  steps: string[];           // step-by-step instructions
  arrivalTip: string;        // tip once landed/arrived
}

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  origin: string;
  destination: string;
  days: number;
  interests: string[];
  budgetType: string;
  transportPreference: string;   // user's preference: 'AI Decide' | 'Flight' | 'Train' | 'Bus'
  transportMode: string;         // what the AI actually chose
  howToReach: IHowToReach;
  itinerary: IDay[];
  budget: IBudget;
  hotels: IHotel[];
}

const TripSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    interests: [{ type: String }],
    budgetType: { type: String, required: true },
    transportPreference: { type: String, required: true, default: 'AI Decide' },
    transportMode: { type: String, required: true, default: 'Flight' },
    howToReach: {
      summary:    { type: String, default: '' },
      steps:      [{ type: String }],
      arrivalTip: { type: String, default: '' },
    },
    itinerary: [
      {
        day: { type: Number, required: true },
        activities: [{ type: String }],
        estimatedCost: { type: Number, required: true },
      },
    ],
    budget: {
      transport: { type: Number, required: true },
      accommodation: { type: Number, required: true },
      food: { type: Number, required: true },
      activities: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    hotels: [
      {
        name: { type: String, required: true },
        priceCategory: { type: String, required: true },
        rating: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>('Trip', TripSchema);
