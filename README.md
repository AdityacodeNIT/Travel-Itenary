# AI Travel Planner

Planning a trip shouldn't feel like a second job. This app takes your destination, budget, and interests, then generates a complete day-by-day itinerary in seconds – complete with activities, costs, hotels, and even how to get there.

## What Does It Do?

You know that feeling when you're planning a trip and you have 47 browser tabs open, three spreadsheets, and you're still not sure if you can afford that fancy restaurant on day 3? Yeah, this fixes that.

Tell the app:
- Where you're going
- How many days
- Your budget (backpacker, moderate, or luxury)
- What you're into (food, museums, hiking, whatever)

It'll spit out a complete itinerary with realistic costs, activity suggestions, and hotel recommendations. And if you're over budget? Hit the optimize button and it'll find cheaper alternatives without ruining your trip.

The cool part: it remembers similar trips, so if someone already planned a 3-day Paris trip, you get instant results instead of waiting for the AI to think.

## Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (API calls)

**Backend:**
- Node.js + Express
- TypeScript
- Mongoose (MongoDB)
- JWT (authentication)
- bcryptjs (password hashing)

**Database:**
- MongoDB

**AI:**
- Google Vertex AI (Gemini 2.0 Flash)

## How It's Built

The app follows clean architecture – basically, everything has its place and doesn't step on each other's toes.

```
Frontend (Next.js)
    ↓ (sends requests)
Backend Routes
    ↓ (passes to)
Controllers
    ↓ (calls)
Services (where the magic happens)
    ↓ (talks to)
Database & AI
```

**Services do the heavy lifting:**
- `TripService` - Creates trips, handles caching
- `LLMService` - Talks to the AI
- `ValidationService` - Makes sure AI didn't mess up
- `ParserService` - Cleans up AI responses
- `BudgetService` - Does the math

**Why this matters:** If we want to swap out the AI provider tomorrow, we only touch one file. If we want to change how we store data, we only touch the models. Everything's modular.

## Getting Started

### What You Need
- Node.js 18 or higher
- MongoDB (or a MongoDB Atlas account)
- Google Cloud account (for the AI)

### Quick Setup

**1. Install everything:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**2. Set up the backend** (`backend/.env`):
```env
MONGO_URI=mongodb://localhost:27017/travel_planner
PORT=5000
JWT_SECRET=make_this_something_random_and_long
FRONTEND_URL=http://localhost:3000

# Google AI stuff (get these from Google Cloud Console)
GOOGLE_APPLICATION_CREDENTIALS=./your-service-account-key.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
```

**3. Set up the frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**4. Google Cloud setup:**

You need to enable Vertex AI and create a service account. Here's the quick version:

```bash
# Enable the API
gcloud services enable aiplatform.googleapis.com

# Create service account
gcloud iam service-accounts create travel-planner \
    --display-name="Travel Planner AI"

# Give it permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:travel-planner@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Download the key
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=travel-planner@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Put that `service-account-key.json` file in your backend folder.

**5. Run it:**

Open two terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open `http://localhost:3000` and you're good to go.

### Deploying

**Backend:** Use Railway, Render, or Heroku. Set your environment variables there and use MongoDB Atlas for the database.

**Frontend:** Vercel or Netlify work great. Just connect your repo and set `NEXT_PUBLIC_API_URL` to your backend URL.

## How Authentication Works

Pretty standard JWT setup, but with a twist for security.

**When you register:**
1. Password gets hashed (bcrypt, 10 rounds)
2. User saved to MongoDB
3. JWT token created
4. Token sent as an httpOnly cookie

**When you login:**
1. Password checked against hash
2. If good, JWT token created
3. Token sent as httpOnly cookie

**Why httpOnly cookies?** Because storing JWTs in localStorage is asking for trouble. httpOnly cookies can't be accessed by JavaScript, so even if someone injects malicious code, they can't steal your token.

**Protected routes:** Every request to the backend includes the cookie. Middleware checks if it's valid. If yes, you're in. If no, 401 Unauthorized.

All trip data is filtered by user ID, so you can only see your own trips. No one else's.

## The AI Part

This is where it gets interesting.

### The Problem

Planning a trip manually sucks. You need to:
- Research the destination
- Find activities that match your interests
- Figure out costs
- Organize everything day by day
- Find hotels
- Plan how to get there

That's hours of work. We wanted seconds.

### The Solution

We use Google's Gemini AI, but not blindly. Here's the pipeline:

**Step 1: Generate**
We send the AI a detailed prompt:
```
"You're a travel expert. Plan a 3-day trip to Paris for someone who likes food and museums. 
Budget is moderate. They're coming from Mumbai. Return structured JSON with daily activities, 
costs, hotels, and how to get there."
```

**Step 2: Validate**
AI sometimes messes up. We check:
- Is the JSON valid?
- Does the budget math add up?
- Are there the right number of days?
- Are all required fields there?

If something's wrong, we tell the AI what it messed up and ask it to try again (max 3 times).

**Step 3: Parse & Normalize**
AI might call things different names. We normalize everything to match our database schema.

**Step 4: Save**
Trip goes into MongoDB, ready to use.

### Why Gemini 2.0 Flash?

It's fast (10-15 seconds) and cheap (~$0.01-0.05 per trip). GPT-4 would be $0.10-0.50 per trip and slower. For a learning project, Flash is perfect.

## The Cool Feature: Smart Budget Optimizer

This is the part I'm most proud of.

### The Problem

You generate a trip and realize day 2 costs ₹2500 but you only wanted to spend ₹2000. What do you do?

**Option 1:** Ask AI to "make it cheaper"
- Sometimes works
- Sometimes makes it more expensive (AI is bad at math)
- Unpredictable

**Option 2:** Just reduce the cost by 20%
- Always works
- But activities stay the same (boring)
- Doesn't help you find alternatives

### Our Solution: Hybrid Approach

We do both, but in a smart way:

**Step 1: Math calculates the new cost**
```typescript
currentCost = 2500
reduction = 20%
newCost = 2500 * 0.8 = 2000  
```

**Step 2: AI suggests cheaper activities**
```
"Current activities cost ₹2500:
- Eiffel Tower (₹800)
- Fine dining (₹1200)
- Shopping (₹500)

Suggest activities that fit within ₹2000 and match interests: food, culture"
```

AI responds:
```
- Free Sacré-Cœur Basilica (₹0)
- Local boulangerie lunch (₹400)
- Walk through Montmartre (₹0)
- Browse vintage shops (₹0)
```

**Step 3: Force the calculated cost**
```typescript
aiResponse.estimatedCost = 2000  // Don't trust AI's math
```

**Step 4: Fallback if AI fails**
If AI is down or returns garbage, we still reduce the cost and keep the original activities with a note.

### Why This Works

- Math guarantees the cost reduction (no surprises)
- AI provides creative alternatives (better experience)
- Fallback ensures it always works (reliability)

Real example:

**Before:** Day 2 costs ₹2500 with Eiffel Tower, fancy restaurant, shopping

**After:** Day 2 costs ₹1750 (30% less) with free basilica, local food, walking tours

Same quality, way cheaper, more authentic.

## Design Decisions

### 1. Caching Similar Trips

**What:** If someone already planned a 3-day Paris trip with similar interests, reuse it.

**Why:** Most people plan similar trips. Why wait 30 seconds for AI when we can give you results instantly?

**Trade-off:** Cached trips might be slightly outdated, but we adjust costs if your origin city is different.

### 2. Validation with Retries

**What:** Check AI output and retry if it's wrong.

**Why:** AI fails about 30-40% of the time without validation. With retries, success rate is 90%+.

**Trade-off:** Slower when it fails (3x retry time), but better than showing users broken data.

### 3. httpOnly Cookies for Auth

**What:** Store JWT in cookies that JavaScript can't access.

**Why:** Security. XSS attacks can't steal tokens if JavaScript can't read them.

**Trade-off:** Slightly more complex CORS setup, but worth it for security.

### 4. MongoDB Instead of SQL

**What:** Use a document database instead of relational.

**Why:** Our data is nested (trips → days → activities). MongoDB handles this naturally. SQL would need multiple tables and joins.

**Trade-off:** No ACID transactions, but we don't need them for this use case.

### 5. Zustand Instead of Redux

**What:** Simpler state management.

**Why:** Our state is simple (user info, current trip). Redux would be overkill.

**Trade-off:** Less ecosystem support, but we don't need it.

### 6. Hybrid Optimizer

**What:** Math for cost, AI for suggestions.

**Why:** Pure AI was unreliable. Pure math was boring. Hybrid gives us both.

**Trade-off:** Slightly more complex code, but way better results.

## Known Issues

Being honest about limitations:

**1. AI takes 10-30 seconds**
- Can't really fix this without switching to a slower, more expensive model
- We show loading states and use caching to help

**2. Costs are estimates**
- We don't integrate with booking sites for real-time prices
- Users should verify before booking

**3. No real-time availability**
- AI doesn't check if museums are open or hotels are booked
- Users should verify before visiting

**4. Everything's in Indian Rupees**
- Simplifies calculations and AI prompts
- Could add currency conversion later

**5. English only**
- UI and AI work best in English
- Could add translations later

**6. Needs internet**
- AI generation requires network
- Could add offline mode for viewing saved trips

**7. Cache can be stale**
- Cached trips might have outdated info
- Could add expiration and re-validation

## Performance

**Trip generation:**
- First time: 10-30 seconds (AI thinking)
- Cached: < 1 second (instant)
- Cache hit rate: 60-80% in production

**Budget optimization:**
- With AI: 10-15 seconds
- Fallback: < 1 second
- Success rate: 95%+

**Regular API calls:**
- Get trips: < 100ms
- Get single trip: < 50ms
- Delete trip: < 100ms

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database setup
│   ├── controllers/     # Handle requests
│   ├── middlewares/     # Auth, errors
│   ├── models/          # Data schemas
│   ├── routes/          # API endpoints
│   └── services/        # Business logic
└── package.json

frontend/
├── src/
│   ├── app/             # Pages
│   ├── components/      # UI components
│   ├── lib/             # API client
│   └── store/           # State management
└── package.json
```

## What I Learned

This project taught me:
- How to work with AI APIs (and not trust them blindly)
- Clean architecture actually makes sense for real projects
- Validation is crucial when dealing with AI
- Caching can save you a ton of money
- Security matters (httpOnly cookies, password hashing, etc.)
- Sometimes the best solution is a hybrid approach

## Future Ideas

Things I'd add if I had more time:
- Real-time pricing from booking APIs
- Multi-currency support
- Offline mode for saved trips
- Social features (share trips, collaborate)
- PDF export
- Weather forecasts
- Multi-city trips

## License

MIT - do whatever you want with it.

---

Built as a learning project. Not perfect, but it works and I learned a ton building it.

Questions? Check [QUICKSTART.md](./QUICKSTART.md) for setup help or [OPTIMIZE_HYBRID_APPROACH.md](./OPTIMIZE_HYBRID_APPROACH.md) for the optimizer deep dive.
