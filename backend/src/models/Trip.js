import mongoose from 'mongoose';

const { Schema } = mongoose;

const TripSchema = new Schema(
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
      summary: { type: String, default: '' },
      steps: [{ type: String }],
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

export default mongoose.model('Trip', TripSchema);
