"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Trash2, MapPin, Calendar, Wallet, Plus, PlaneTakeoff, Compass } from 'lucide-react';

interface Trip {
  _id: string;
  destination: string;
  days: number;
  budgetType: string;
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await api.get('/trip');
        setTrips(data);
      } catch (err) {
        console.error("Error fetching trips", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.preventDefault(); // Prevent navigating to the link
    if (confirm("Are you sure you want to delete this trip?")) {
      try {
        await api.delete(`/trip/${tripId}`);
        setTrips(current => current.filter(t => t._id !== tripId));
      } catch (err) {
        console.error("Failed to delete trip", err);
        alert("Failed to delete the trip. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-70">
         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="text-gray-500 font-bold animate-pulse">Loading your itineraries...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Your Itineraries 
            <Compass className="text-blue-500 animate-[spin_10s_linear_infinite]" size={32} />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-lg">Manage and explore your generated travel plans.</p>
        </div>
        <Link 
          href="/dashboard/create" 
          className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-[0_4px_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Plan New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-24 px-6 border-2 border-dashed border-gray-200 dark:border-gray-800/60 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/20 shadow-sm transition-colors flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 ring-8 ring-blue-50 dark:ring-blue-900/10">
            <PlaneTakeoff size={36} className="ml-2" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">No itineraries yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium max-w-md text-lg">Your dashboard is looking a little empty. Let the AI plan your first dream vacation!</p>
          <Link href="/dashboard/create" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 font-bold px-8 py-3.5 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all border border-transparent dark:border-gray-200 flex items-center gap-2">
             Start planning <ArrowRightPlaceholder />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map(trip => (
            <Link key={trip._id} href={`/dashboard/trip/${trip._id}`} className="block">
              <div className="relative border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900/50 rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-white/5 hover:-translate-y-1 group backdrop-blur-sm overflow-hidden h-full flex flex-col">
                {/* Decorative background blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>

                <button
                  onClick={(e) => handleDelete(e, trip._id)}
                  className="absolute top-5 right-5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 text-sm rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="Delete Trip"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div className="pt-1 flex-1">
                    <h3 className="text-xl pr-6 font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {trip.destination}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-auto relative z-10 pt-2 border-t border-gray-50 dark:border-gray-800/40">
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-sm font-semibold shadow-sm">
                    <Calendar size={14} className="text-gray-400" /> 
                    {trip.days} Days
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-sm font-semibold shadow-sm">
                    <Wallet size={14} className="text-gray-400" /> 
                    {trip.budgetType}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline component just for the empty state link arrow
function ArrowRightPlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}
