# Development Checklist

Use this checklist to verify your development environment and test the application.

## Environment Setup

### Backend
- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] `backend/.env` file created with all required variables
- [ ] Google Cloud project created
- [ ] Vertex AI API enabled
- [ ] Service account created with proper permissions
- [ ] Service account key downloaded and path set in `.env`
- [ ] Backend dependencies installed (`npm install`)

### Frontend
- [ ] Node.js 18+ installed
- [ ] `frontend/.env.local` file created
- [ ] Frontend dependencies installed (`npm install`)

## Startup Verification

### Backend (Port 5000)
- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] Console shows: "Server running on port 5000"
- [ ] No TypeScript compilation errors

### Frontend (Port 3000)
- [ ] Frontend starts without errors
- [ ] Console shows: "Local: http://localhost:3000"
- [ ] No build errors
- [ ] Browser opens automatically

## Feature Testing

### Authentication
- [ ] Can access registration page
- [ ] Can register new user
- [ ] Receives JWT cookie after registration
- [ ] Can login with credentials
- [ ] Can logout (clear cookies)
- [ ] Cannot access protected routes without auth

### Trip Generation
- [ ] Can access trip creation form
- [ ] Form validates required fields
- [ ] Can select origin city
- [ ] Can select destination city
- [ ] Can set number of days (1-14)
- [ ] Can select budget type (Budget/Moderate/Luxury)
- [ ] Can select transport preference
- [ ] Can enter interests (comma-separated)
- [ ] Loading state shows during generation
- [ ] Generation completes successfully (10-30 seconds)
- [ ] Redirects to trip detail page

### Trip Detail View
- [ ] Shows trip destination and origin
- [ ] Shows number of days and budget type
- [ ] Displays "How to Reach" section
- [ ] Shows transport mode chosen by AI
- [ ] Lists all daily activities
- [ ] Shows estimated cost per day
- [ ] Displays budget breakdown
- [ ] Shows recommended hotels
- [ ] Budget total matches sum of parts

### Trip Management
- [ ] Can view list of all trips
- [ ] Can click on trip to view details
- [ ] Can regenerate individual days
- [ ] Day regeneration updates budget
- [ ] Can delete trip
- [ ] Deleted trip removed from list

### Data Isolation
- [ ] User A cannot see User B's trips
- [ ] API returns 404 for unauthorized trip access
- [ ] JWT validation works correctly

## API Endpoint Testing

### Auth Endpoints
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected: 201 Created with user object and JWT cookie

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected: 200 OK with user object and JWT cookie
```

### Trip Endpoints (requires JWT)
```bash
# Generate Trip
curl -X POST http://localhost:5000/trip/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN" \
  -d '{
    "origin": "Mumbai, India",
    "destination": "Paris, France",
    "days": 3,
    "budgetType": "Moderate",
    "transportPreference": "AI Decide",
    "interests": ["food", "museums"]
  }'

# Expected: 201 Created with full trip object

# Get All Trips
curl http://localhost:5000/trip \
  -H "Cookie: jwt=YOUR_JWT_TOKEN"

# Expected: 200 OK with array of trips

# Get Specific Trip
curl http://localhost:5000/trip/TRIP_ID \
  -H "Cookie: jwt=YOUR_JWT_TOKEN"

# Expected: 200 OK with trip object

# Regenerate Day
curl -X PATCH http://localhost:5000/trip/TRIP_ID/regenerate-day \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN" \
  -d '{"day": 2}'

# Expected: 200 OK with updated trip

# Delete Trip
curl -X DELETE http://localhost:5000/trip/TRIP_ID \
  -H "Cookie: jwt=YOUR_JWT_TOKEN"

# Expected: 200 OK with success message
```

## Code Quality Checks

### TypeScript
- [ ] No compilation errors in backend
- [ ] No compilation errors in frontend
- [ ] All types properly defined
- [ ] No `any` types (except where necessary)

### Architecture
- [ ] Controllers separate from routes
- [ ] Business logic in services
- [ ] Models define data structure
- [ ] Middleware handles cross-cutting concerns
- [ ] Clean separation of concerns

### Error Handling
- [ ] All async functions have try-catch
- [ ] Errors return appropriate HTTP status codes
- [ ] Error messages are descriptive
- [ ] Stack traces hidden in production

## Performance Checks

### Backend
- [ ] First trip generation: 30-60 seconds (acceptable)
- [ ] Subsequent generations: 10-30 seconds
- [ ] Cached trip retrieval: < 1 second
- [ ] Day regeneration: 5-15 seconds
- [ ] Database queries optimized

### Frontend
- [ ] Page loads quickly
- [ ] No unnecessary re-renders
- [ ] Loading states show during async operations
- [ ] Smooth transitions between pages

## Security Checks

### Authentication
- [ ] Passwords hashed with bcrypt
- [ ] JWT stored in httpOnly cookies
- [ ] JWT has expiration (30 days)
- [ ] Protected routes require authentication
- [ ] CORS configured correctly

### Data Protection
- [ ] User data isolated by userId
- [ ] No sensitive data in logs
- [ ] Service account credentials secure
- [ ] Environment variables not committed

## Browser Testing

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Cookies set correctly

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Cookies set correctly

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Cookies set correctly

## Edge Cases

### Trip Generation
- [ ] Handles invalid destinations gracefully
- [ ] Validates day count (1-14)
- [ ] Handles AI timeout/errors
- [ ] Retries on validation failure (max 3)
- [ ] Falls back on max retries exceeded

### Caching
- [ ] Finds similar trips correctly
- [ ] Adjusts transport cost when origin changes
- [ ] Updates "How to Reach" for new origin
- [ ] Scores by interest overlap (>50%)

### Budget Calculation
- [ ] Total equals sum of parts
- [ ] Activities cost updates on day regeneration
- [ ] Handles old "flights" field name
- [ ] Normalizes to "transport" field

## Documentation Review

- [ ] README.md is comprehensive
- [ ] QUICKSTART.md is accurate
- [ ] API endpoints documented
- [ ] Architecture explained
- [ ] Setup instructions clear
- [ ] Troubleshooting guide helpful

## Deployment Readiness

### Backend
- [ ] Environment variables documented
- [ ] Build script works (`npm run build`)
- [ ] Production start script works
- [ ] Database connection string secure
- [ ] Service account for production ready

### Frontend
- [ ] Build succeeds (`npm run build`)
- [ ] Production build optimized
- [ ] Environment variables set
- [ ] API URL configurable

## Known Issues

Document any issues found during testing:

1. Issue: _______________
   - Impact: _______________
   - Workaround: _______________
   - Fix planned: [ ] Yes [ ] No

2. Issue: _______________
   - Impact: _______________
   - Workaround: _______________
   - Fix planned: [ ] Yes [ ] No

## Sign-off

- [ ] All critical features tested
- [ ] No blocking bugs found
- [ ] Documentation complete
- [ ] Ready for development/staging deployment

**Tested by:** _______________
**Date:** _______________
**Environment:** [ ] Local [ ] Staging [ ] Production
**Notes:** _______________
