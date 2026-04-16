"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MapPin, Navigation, Plane, Compass, Calculator, Sparkles, Map as MapIcon } from 'lucide-react';

const loadingSteps = [
  { text: "Analyzing destination logistics...", icon: MapIcon },
  { text: "Scouting local experiences & gems...", icon: Compass },
  { text: "Optimizing transport options...", icon: Plane },
  { text: "Calculating budget estimates...", icon: Calculator },
  { text: "Finalizing your perfect itinerary...", icon: Sparkles }
];

const triviaQuestions = [
  { q: "What is the most visited country in the world?", options: ["France", "USA", "Spain"], a: 0 },
  { q: "Which country has the most islands?", options: ["Indonesia", "Sweden", "Philippines"], a: 1 },
  { q: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "Malta"], a: 1 },
  { q: "What city is known as the 'City of a Hundred Spires'?", options: ["Prague", "Rome", "Istanbul"], a: 0 },
  { q: "Which currency is used in Japan?", options: ["Yuan", "Won", "Yen"], a: 2 },
  { q: "Where is the great pyramid of Giza located?", options: ["Cairo", "Luxor", "Alexandria"], a: 0 }
];

export default function CreateTripPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budgetType, setBudgetType] = useState('Moderate');
  const [transportPreference, setTransportPreference] = useState('AI Decide');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      setTriviaIndex(Math.floor(Math.random() * 3)); // Random start
      setSelectedAnswer(null);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500); // Change message every 2.5 seconds
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleTriviaAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setTimeout(() => {
      setTriviaIndex((curr) => (curr + 1) % triviaQuestions.length);
      setSelectedAnswer(null);
    }, 1500); // Wait 1.5s then show next question
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Splitting interests into an array
    const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);

    try {
      const { data } = await api.post('/trip/generate', {
        origin,
        destination,
        days,
        budgetType,
        transportPreference,
        interests: interestsArray
      });
      router.push(`/dashboard/trip/${data._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate trip. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="lg:text-4xl text-2xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">Plan a New Trip</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 rounded-xl shadow-sm relative overflow-hidden transition-colors">
        {loading && (
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-10 flex flex-col items-center justify-center transition-all duration-500 px-6">
            <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-6 tracking-tight">AI is Curating Your Trip...</h3>
            
            {/* Interactive Trivia Section */}
            <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden text-center">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 block">Travel Trivia</span>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-5 transition-all">
                {triviaQuestions[triviaIndex].q}
              </p>
              
              <div className="space-y-3">
                {triviaQuestions[triviaIndex].options.map((opt, idx) => {
                  let btnStateClass = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30";
                  
                  if (selectedAnswer !== null) {
                    if (idx === triviaQuestions[triviaIndex].a) {
                      btnStateClass = "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/40 dark:border-green-500 dark:text-green-300"; // Correct answer
                    } else if (idx === selectedAnswer) {
                      btnStateClass = "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-300"; // Wrong selected
                    } else {
                      btnStateClass = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 opacity-50"; // Unselected
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleTriviaAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${btnStateClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="h-6 flex items-center justify-center mt-8">
              <p 
                key={loadingStep} 
                className="text-gray-500 dark:text-gray-400 font-medium animate-pulse text-center"
              >
                <span className="inline-block mr-2 text-blue-500">
                  {(() => {
                    const CurrentIcon = loadingSteps[loadingStep].icon;
                    return <CurrentIcon size={16} strokeWidth={2} className="inline relative -top-0.5" />;
                  })()}
                </span>
                {loadingSteps[loadingStep].text}
              </p>
            </div>
            
            <div className="w-56 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Origin → Destination row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Navigation size={14} className="text-blue-400" /> Traveling From
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai, India or New York, USA"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-colors"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin size={14} className="text-purple-400" /> Destination
            </label>
            <input
              type="text"
              placeholder="e.g. Kyoto, Japan or Rome, Italy"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-colors"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Days</label>
            <input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-colors"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget Type</label>
            <select
              value={budgetType}
              onChange={e => setBudgetType(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              <option value="Budget">Budget / Backpacker</option>
              <option value="Moderate">Moderate / Standard</option>
              <option value="Luxury">Luxury / Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transport</label>
            <select
              value={transportPreference}
              onChange={e => setTransportPreference(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              <option value="AI Decide">Let Planner Decide</option>
              <option value="Flight">✈️Flight</option>
              <option value="Train">🚂 Train</option>
              <option value="Bus">🚌 Bus</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Interests (Comma separated)</label>
          <input
            type="text"
            placeholder="e.g. food, historical sites, hiking, nightlife"
            value={interests}
            onChange={e => setInterests(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition-colors"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 font-bold text-lg transition disabled:bg-blue-800"
        >
          Generate Trip
        </button>
      </form>
    </div>
  );
}
