import { LucideStar } from 'lucide-react';

interface HotelProps {
  name: string;
  priceCategory: string;
  rating: number;
}

export function HotelCard({ hotel }: { hotel: HotelProps }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-4 rounded-xl flex justify-between items-center hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition">
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">{hotel.name}</h4>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium px-2.5 py-0.5 rounded-md">{hotel.priceCategory}</span>
          <span className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
            <LucideStar size={14} className="mr-1 text-yellow-500 fill-yellow-500" /> {hotel.rating}
          </span>
        </div>
      </div>
    </div>
  );
}
