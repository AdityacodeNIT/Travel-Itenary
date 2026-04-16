

const axios = require('axios');

const API_URL = 'http://localhost:5000';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `jwt=${JWT_TOKEN}`
  }
});

const testTrip = {
  origin: 'Mumbai, India',
  destination: 'Paris, France',
  days: 3,
  budgetType: 'Moderate',
  transportPreference: 'AI Decide',
  interests: ['food', 'museums']
};

async function testCache() {

  try {


    const start1 = Date.now();
    const trip1 = await api.post('/trip/generate', testTrip);
    const time1 = Date.now() - start1;

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Identical trip (should hit cache)

    const start2 = Date.now();
    const trip2 = await api.post('/trip/generate', testTrip);
    const time2 = Date.now() - start2;


    const testTrip3 = { ...testTrip, origin: 'Delhi, India' };
    const start3 = Date.now();
    const trip3 = await api.post('/trip/generate', testTrip3);
    const time3 = Date.now() - start3;


    const testTrip4 = { ...testTrip, interests: ['food'] };
    const start4 = Date.now();
    const trip4 = await api.post('/trip/generate', testTrip4);
    const time4 = Date.now() - start4;

    const cacheHits = [time2, time3, time4].filter(t => t < 2000).length;

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
    }
  }
}

// Run the test
testCache();
