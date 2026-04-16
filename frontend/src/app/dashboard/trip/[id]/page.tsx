"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useTripStore } from '@/store/tripStore';
import { useParams, useRouter } from 'next/navigation';
import { ItineraryDay } from '@/components/ItineraryDay';
import { Trash2 } from 'lucide-react';
import { BudgetBreakdown } from '@/components/BudgetBreakdown';
import { HotelCard } from '@/components/HotelCard';
import { HowToReach } from '@/components/HowToReach';

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const trip = useTripStore(state => state.currentTrip);
  const setTrip = useTripStore(state => state.setCurrentTrip);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await api.get(`/trip/${id}`);
        setTrip(data);
      } catch (err) {
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();

    // Cleanup on unmount
    return () => setTrip(null);
  }, [id, setTrip]);


  if (loading) return <div className="text-center py-20 text-gray-400 font-medium animate-pulse">Loading itinerary details...</div>;
  if (error || !trip) return <div className="text-center py-20 text-red-500">{error || 'Trip not found'}</div>;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      try {
        await api.delete(`/trip/${id}`);
        router.push('/dashboard');
      } catch (err) {
        console.error("Failed to delete trip", err);
        alert("Failed to delete the trip. Please try again.");
      }
    }
  };

  return (
    <div className="pb-20">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white tracking-tight">{trip.destination}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">From <span className="text-gray-900 dark:text-white font-bold">{trip.origin}</span></p>
          <div className="flex gap-3 text-sm font-medium">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">{trip.days} Days</span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">{trip.budgetType} Budget</span>
          </div>
        </div>
        <button 
          onClick={handleDelete}
          className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition-colors border border-red-100 dark:border-red-900/50"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Delete Itinerary</span>
        </button>
      </div>

      {/* How to Reach — appears BEFORE the daily itinerary, outside the grid */}
      {trip.howToReach && (
        <HowToReach
          origin={trip.origin}
          destination={trip.destination}
          transportMode={trip.transportMode}
          howToReach={trip.howToReach}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Activities & Itinerary</h2>
          <div className="grid gap-4">
            {trip.itinerary.map((day: any) => (
              <ItineraryDay key={day.day} tripId={trip._id} dayData={day} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <BudgetBreakdown
            budget={trip.budget}
            transportMode={trip.transportMode}
            transportPreference={trip.transportPreference}
          />

          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recommended Hotels</h3>
            <div className="space-y-3">
              {trip.hotels.map((hotel: any, idx: number) => (
                <HotelCard key={idx} hotel={hotel} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
