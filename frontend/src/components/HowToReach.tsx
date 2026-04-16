import { Plane, Train, Bus, MapPin, Lightbulb, CheckCircle2 } from 'lucide-react';

const TRANSPORT_ICONS: Record<string, React.ReactNode> = {
  Flight: <Plane size={18} className="text-blue-400" />,
  Train:  <Train size={18} className="text-green-400" />,
  Bus:    <Bus   size={18} className="text-yellow-400" />,
};

interface HowToReachProps {
  origin: string;
  destination: string;
  transportMode: string;
  howToReach: {
    summary: string;
    steps: string[];
    arrivalTip: string;
  };
}

export function HowToReach({ origin, destination, transportMode, howToReach }: HowToReachProps) {
  if (!howToReach?.steps?.length && !howToReach?.summary) return null;

  const icon = TRANSPORT_ICONS[transportMode] ?? <Plane size={18} className="text-blue-400" />;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl p-6 mb-8 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">How to Get There</h2>
          {origin && destination && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              {origin} → {destination} via <span className="text-gray-900 dark:text-white font-bold">{transportMode}</span>
            </p>
          )}
        </div>
      </div>

      {/* Summary sentence */}
      {howToReach.summary && (
        <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">{howToReach.summary}</p>
      )}

      {/* Step-by-step */}
      {howToReach.steps?.length > 0 && (
        <ol className="space-y-3 mb-5">
          {howToReach.steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5 border border-blue-100 dark:border-blue-800">
                {i + 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Arrival tip */}
      {howToReach.arrivalTip && (
        <div className="flex gap-3 items-start bg-amber-50 dark:bg-[#2A1A05] border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 shadow-sm">
          <Lightbulb size={16} className="text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{howToReach.arrivalTip}</p>
        </div>
      )}
    </div>
  );
}
