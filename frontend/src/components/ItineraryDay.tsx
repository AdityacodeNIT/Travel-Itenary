import { useState } from 'react';
import { api } from '@/lib/api';
import { useTripStore } from '@/store/tripStore';
import { RefreshCw } from 'lucide-react';

interface DayProps {
  tripId: string;
  dayData: {
    day: number;
    activities: string[];
    estimatedCost: number;
  };
}

export function ItineraryDay({ tripId, dayData }: DayProps) {
  const [loading, setLoading] = useState(false);
  const [reducePct, setReducePct] = useState(20);
  const setTrip = useTripStore(state => state.setCurrentTrip);
  const formatMoney = useTripStore(state => state.formatMoney);
  useTripStore(state => state.currency); // trigger re-render
  useTripStore(state => state.rates); // trigger re-render

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/trip/${tripId}/regenerate-day`, { day: dayData.day });
      // Trust the backend and replace the global trip state entirely
      setTrip(data);
    } catch (e) {
      console.error(e);
      alert('Failed to regenerate this day.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const targetReduction = Math.round(dayData.estimatedCost * (reducePct / 100));
      const { data } = await api.patch(`/trip/${tripId}/day/${dayData.day}/optimize`, { targetReduction });
      // Update global trip state so total budget card perfectly mirrors the backend
      setTrip(data);
    } catch (e) {
      console.error(e);
      alert('Failed to optimize this day.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full p-6 rounded-2xl border transition-all duration-300 hover:shadow-md ${loading ? 'opacity-60 border-blue-300 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/30' : 'bg-white dark:bg-gray-900/80 border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-sm'}`}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-lg shadow-sm border border-blue-100 dark:border-blue-800/50">
            {dayData.day}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Day Itinerary</h3>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-end">
          <button 
            onClick={handleRegenerate}
            disabled={loading}
            className="text-xs flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Wait...' : 'Regenerate'}</span>
          </button>
          
          <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg overflow-hidden transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 focus-within:ring-2 ring-emerald-500/20">
            <button 
              onClick={handleOptimize}
              disabled={loading || dayData.estimatedCost === 0}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/40 px-3 py-1.5 transition-colors disabled:opacity-50 font-medium flex items-center"
              title="Smart Budget Optimizer"
            >
              Optimize
            </button>
            <div className="w-px h-4 bg-emerald-200 dark:bg-emerald-800"></div>
            <select
              title="Reduction Percentage"
              value={reducePct}
              onChange={(e) => setReducePct(Number(e.target.value))}
              disabled={loading || dayData.estimatedCost === 0}
              className="bg-transparent text-xs text-emerald-700 dark:text-emerald-400 font-medium outline-none cursor-pointer py-1.5 px-2 appearance-none text-center hover:bg-emerald-100/50 dark:hover:bg-emerald-800/40 transition-colors"
            >
              <option value={10} className="dark:bg-gray-800 text-black dark:text-white">-10%</option>
              <option value={20} className="dark:bg-gray-800 text-black dark:text-white">-20%</option>
              <option value={30} className="dark:bg-gray-800 text-black dark:text-white">-30%</option>
              <option value={40} className="dark:bg-gray-800 text-black dark:text-white">-40%</option>
              <option value={50} className="dark:bg-gray-800 text-black dark:text-white">-50%</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-0 flex-1 mb-2 mt-2 ml-2">
        {dayData.activities.map((activity, idx) => (
          <div key={idx} className="relative pl-6 pb-6 last:pb-2 group">
            {idx !== dayData.activities.length - 1 && (
              <div className="absolute left-[4.5px] top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-800 group-hover:bg-blue-300 dark:group-hover:bg-blue-800/60 transition-colors"></div>
            )}
            <div className="absolute left-0 top-1.5 h-[10px] w-[10px] rounded-full bg-white dark:bg-gray-900 border-[2px] border-blue-500 dark:border-blue-400 z-10 group-hover:scale-125 transition-transform shadow-sm"></div>
            <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium -mt-1">{activity}</p>
          </div>
        ))}
      </div>
      
      <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800/60 flex justify-between items-end bg-gray-50/50 dark:bg-gray-900/50 -mx-6 -mb-6 px-6 pb-5 rounded-b-2xl">
        <div>
          <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1 mt-4">Day Cost est.</span>
        </div>
        <div className="text-lg font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight bg-blue-50 dark:bg-blue-900/20 px-3 py-1 mt-4 rounded-md border border-blue-100 dark:border-blue-800/50 shadow-sm">
          {formatMoney(dayData.estimatedCost)}
        </div>
      </div>
    </div>
  );
}
