# AI Travel Planner: Intelligent Itinerary & Budget Manager

An intelligent, multi-user travel planning application that leverages a Large Language Model (Vertex AI Gemini) to generate personalized day-by-day itineraries, estimate budget breakdowns, suggest culturally appropriate activities, and handle localized price conversions seamlessly.

## 1. Project Overview

The AI Travel Planner is designed to take the friction out of vacation planning. Users can register for an account, input their travel constraints (destination, duration, budget tier, and interests), and instantly receive a highly structured, day-by-day itinerary. 

Beyond simple generation, the platform allows users to **interact** with their itinerary by regenerating specific days or invoking the Smart Budget Optimizer to swap out expensive activities. The app also features a dynamic currency converter that pulls live exchange rates to localize the AI's budget footprints.

## 2. Chosen Tech Stack & Justification

- **Frontend:** Next.js 15 (App Router) + React 19 + Tailwind CSS 4.
  *Justification:* Next.js was chosen for its robust routing and layout ecosystem, while Tailwind CSS allowed for a highly responsive, high-contrast dark mode aesthetic. Zustand is used for state management to handle complex real-time budget calculations without prop-drilling.
- **Backend:** Node.js + Express + TypeScript.
  *Justification:* Express provides a lightweight, unopinionated routing layer. TypeScript ensures strict type safety across the complex JSON schemas shared between the LLM and the database.
- **Database:** MongoDB (Mongoose).
  *Justification:* MongoDB's document-oriented structure is ideal for storing highly nested, dynamic itinerary data (arrays of days, nested activities, dynamic keys) without the rigidity of a SQL schema.
- **AI Agent:** Google Vertex AI (Gemini 2.0 Flash).
  *Justification:* Gemini 2.0 Flash was selected for its extremely low latency and high reliability in generating structured JSON data via strict prompting.

## 3. High-Level Architecture

The application adheres to **Clean Architecture** principles, drastically separating business logic from routing:

**Frontend Layer:**
- **Store (`tripStore.ts`):** Handles global reactivity. Fetches live exchange rates and recalculates display budgets in real-time when the currency toggle is engaged.
- **Components:** Modular UI (e.g., `ItineraryDay`, `BudgetBreakdown`) that automatically re-renders when backend state or local currency state mutates.

**Backend Layer:**
- **Controllers:** Thin wrappers that extract HTTP parameters and return JSON responses.
- **Services:** Heavy business logic resides here.
  - `LLMService`: Interfaces directly with the Google Vertex AI SDK.
  - `ValidationService`: Manages automatic retries if the LLM hallucinates malformed JSON or breaks mathematical budget rules.
  - `TripService`: The main engine orchestrating prompt assembly, database caching (reusing similar trips to save tokens), and saving to MongoDB.

## 4. Authentication & Authorization Approach

The application employs a robust JWT-based authentication system:
- **Registration/Login:** Passwords are mathematically hashed using `bcryptjs` (10 salt rounds) before ever touching the database.
- **Token Delivery:** JWTs are delivered securely to the browser.
- **Data Isolation:** A custom Express middleware (`authMiddleware.ts`) validates the Token on every protected route, appending the authenticated user's ID to the request object. 
- **Ownership Enforcement:** Every MongoDB query (Read, Update, Delete) strictly requires `{ _id: tripId, userId: req.user._id }`. This guarantees horizontal security; a user fundamentally cannot access or modify another user's itinerary.

## 5. AI Agent Design & Purpose

Rather than treating the LLM as a simple text generator, it acts as a structured reasoning engine. 
- **Prompt Engineering:** The prompts explicitly restrict the model to outputting pure, parsable JSON.
- **Contextual Awareness:** The AI is instructed to scale pricing dynamically based on the destination's real-world cost of living, avoiding Western anchoring bias.
- **Self-Correction:** If the model outputs invalid data, the `ValidationService` dynamically catches the JSON error, rebuilds the prompt with the specific error context, and asks the model to correct itself (up to 3 retries).

## 6. Custom Creative Feature: The Smart Budget Optimizer

**The Problem:** Traditional AI travel planners simply dump a list of activities. If a user feels a specific day is too expensive, they have to manually research alternatives, defeating the purpose of an AI planner.
**The Solution:** I implemented a **Smart Budget Optimizer** (`PATCH /trip/:id/day/:day/optimize`).
- **How it works:** Users click "Optimize - 20%" on a specific day they find too costly. The LLM is sent the specific day's activities and told to intellectually identify the high-cost (`$$$`) items and swap them for cheaper, culturally authentic alternatives while maintaining the user's defined interests.
- **Why this showcases engineering judgment:** It moves the AI beyond "generation" and into "reasoning-based modification." The frontend cleanly intercepts the new optimized day, surgically injects it into the global state, and recalculates the grand total of the trip entirely locally, creating a deeply fluid UX.

*Secondary Custom Feature: Natively decoupled real-time live currency toggling via the `er-api` standard.*

## 7. Key Design Decisions & Trade-offs

- **Reactivity vs Backend Truth:** When a user regenerates a day, the backend recalculates the physical budget and saves it. However, the frontend doesn't wait for a heavy document refresh; it recalculates the math locally via Zustand for instant visual feedback. 
- **Caching Over Pure Generative:** An aggressive caching system hashes destinations, days, and interests. If a user asks for a 3-day budget trip to Paris, and someone else already did, the app bypasses the LLM and clones the trip. *Trade-off:* Saves massive API costs and processing time, but trades off unique randomness for identical queries.

## 8. Known Limitations

- **Image Placeholders:** The app currently relies on hardcoded vector icons or standardized text layouts rather than fetching dynamic photography of destinations.
- **Flight Prices:** The travel costs are highly educated LLM estimates combined with distance heuristics; they are not dynamically scraped from live airline APIs (like Skyscanner).

## 9. Setup Instructions

### Environment Variables
Create a `.env` in your `backend/` directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secure_random_string
FRONTEND_URL=http://localhost:3000

# Google Vertex AI configuration
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
```

Create a `.env.local` in your `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Local Execution
1. Open two terminals.
2. Terminal 1 (Backend): `cd backend && npm install && npm run dev`
3. Terminal 2 (Frontend): `cd frontend && npm install && npm run dev`
4. Access the app at `http://localhost:3000`
