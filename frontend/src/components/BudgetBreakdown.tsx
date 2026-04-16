const TRANSPORT_ICONS: Record<string, string> = {
  Flight: '✈️',
  Train: '🚂',
  Bus: '🚌',
};

interface BudgetProps {
  budget: {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    total: number;
  };
  transportMode?: string;
  transportPreference?: string;
}

import { useTripStore } from '@/store/tripStore';

export function BudgetBreakdown({ budget, transportMode, transportPreference }: BudgetProps) {
  const icon = TRANSPORT_ICONS[transportMode || ''] || '🚀';
  const label = transportMode ? `${icon} ${transportMode}` : 'Transport';
  const formatMoney = useTripStore(state => state.formatMoney);
  useTripStore(state => state.currency); 
  useTripStore(state => state.rates); 

  const transportCost = budget.transport ?? (budget as any).flights ?? 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6 rounded-xl transition-colors">
      <h3 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 text-gray-900 dark:text-white tracking-tight">Budget Breakdown</h3>

      {transportMode && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 px-3 py-2 rounded-lg font-medium">
          <span>{icon}</span>
          <span>
            AI chose <span className="text-gray-900 dark:text-white font-bold">{transportMode}</span>
            {transportPreference && transportPreference !== 'AI Decide' && (
              <span className="text-gray-400 dark:text-gray-500 font-medium"> (you requested: {transportPreference})</span>
            )}
          </span>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 font-medium">
          <span>{label}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatMoney(transportCost)}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 font-medium">
          <span>🏨 Accommodation</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatMoney(budget.accommodation)}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 font-medium">
          <span>🍽️ Food</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatMoney(budget.food)}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 font-medium">
          <span>🎯 Activities</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatMoney(budget.activities)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800 text-lg font-bold text-gray-900 dark:text-white">
        <span>Total Estimated</span>
        <span className="text-blue-600 dark:text-blue-400">{formatMoney(budget.total)}</span>
      </div>
    </div>
  );
}
